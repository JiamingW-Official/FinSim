"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Zap,
  Shield,
  ArrowRight,
  ArrowLeftRight,
  CreditCard,
  Clock,
  DollarSign,
  BarChart2,
  Lock,
  Layers,
  Network,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  RefreshCw,
  Wifi,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 920;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaymentRail {
  name: string;
  region: string;
  operator: string;
  settlementTime: string;
  settlementDays: number;
  volumeBillion: number;
  valueTrillion: number;
  type: "gross" | "net";
  maxTx: string;
  color: string;
}

interface CardNetwork {
  name: string;
  type: "4-party" | "3-party";
  marketShare: number;
  issuerPct: number;
  networkPct: number;
  acquirerPct: number;
  interchangeAvg: number;
  color: string;
}

interface RTPSystem {
  name: string;
  country: string;
  launched: number;
  monthlyTxBillion: number;
  maxAmount: string;
  availability: string;
  iso20022: boolean;
  requestToPay: boolean;
  color: string;
}

interface Corridor {
  from: string;
  to: string;
  annualBillion: number;
  bankCostPct: number;
  fintechCostPct: number;
  cryptoCostPct: number;
  avgDays: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const RAILS: PaymentRail[] = [
  {
    name: "ACH",
    region: "USA",
    operator: "NACHA",
    settlementTime: "Same-day / T+2",
    settlementDays: 2,
    volumeBillion: 29.1,
    valueTrillion: 72.6,
    type: "net",
    maxTx: "$1M",
    color: "#3b82f6",
  },
  {
    name: "Fedwire",
    region: "USA",
    operator: "Federal Reserve",
    settlementTime: "Same-day (RTGS)",
    settlementDays: 0,
    volumeBillion: 0.2,
    valueTrillion: 1040,
    type: "gross",
    maxTx: "Unlimited",
    color: "#10b981",
  },
  {
    name: "CHIPS",
    region: "USA",
    operator: "The Clearing House",
    settlementTime: "Same-day",
    settlementDays: 0,
    volumeBillion: 0.1,
    valueTrillion: 420,
    type: "net",
    maxTx: "Unlimited",
    color: "#8b5cf6",
  },
  {
    name: "SWIFT",
    region: "Global",
    operator: "SWIFT Coop",
    settlementTime: "1–5 days",
    settlementDays: 3,
    volumeBillion: 0.04,
    valueTrillion: 150,
    type: "net",
    maxTx: "Unlimited",
    color: "#f59e0b",
  },
  {
    name: "SEPA CT",
    region: "Europe",
    operator: "EPC",
    settlementTime: "T+1 / Instant",
    settlementDays: 1,
    volumeBillion: 21.9,
    valueTrillion: 55.4,
    type: "net",
    maxTx: "€999,999,999",
    color: "#06b6d4",
  },
  {
    name: "RTP",
    region: "USA",
    operator: "The Clearing House",
    settlementTime: "Instant (24/7)",
    settlementDays: 0,
    volumeBillion: 2.5,
    valueTrillion: 1.8,
    type: "gross",
    maxTx: "$1M",
    color: "#ec4899",
  },
  {
    name: "FedNow",
    region: "USA",
    operator: "Federal Reserve",
    settlementTime: "Instant (24/7)",
    settlementDays: 0,
    volumeBillion: 1.1,
    valueTrillion: 0.9,
    type: "gross",
    maxTx: "$500K",
    color: "#f97316",
  },
];

const CARD_NETWORKS: CardNetwork[] = [
  {
    name: "Visa",
    type: "4-party",
    marketShare: 52,
    issuerPct: 70,
    networkPct: 10,
    acquirerPct: 20,
    interchangeAvg: 1.8,
    color: "#1a1aff",
  },
  {
    name: "Mastercard",
    type: "4-party",
    marketShare: 25,
    issuerPct: 70,
    networkPct: 10,
    acquirerPct: 20,
    interchangeAvg: 1.9,
    color: "#eb001b",
  },
  {
    name: "Amex",
    type: "3-party",
    marketShare: 13,
    issuerPct: 85,
    networkPct: 15,
    acquirerPct: 0,
    interchangeAvg: 2.5,
    color: "#2e77bc",
  },
  {
    name: "Discover",
    type: "3-party",
    marketShare: 5,
    issuerPct: 80,
    networkPct: 20,
    acquirerPct: 0,
    interchangeAvg: 1.7,
    color: "#ff6600",
  },
  {
    name: "Others",
    type: "4-party",
    marketShare: 5,
    issuerPct: 70,
    networkPct: 10,
    acquirerPct: 20,
    interchangeAvg: 1.5,
    color: "#6b7280",
  },
];

const RTP_SYSTEMS: RTPSystem[] = [
  {
    name: "UPI",
    country: "India",
    launched: 2016,
    monthlyTxBillion: 10.4,
    maxAmount: "₹1,00,000",
    availability: "24/7/365",
    iso20022: false,
    requestToPay: true,
    color: "#f59e0b",
  },
  {
    name: "PIX",
    country: "Brazil",
    launched: 2020,
    monthlyTxBillion: 4.1,
    maxAmount: "R$1M",
    availability: "24/7/365",
    iso20022: true,
    requestToPay: true,
    color: "#10b981",
  },
  {
    name: "Faster Payments",
    country: "United Kingdom",
    launched: 2008,
    monthlyTxBillion: 0.37,
    maxAmount: "£1M",
    availability: "24/7/365",
    iso20022: false,
    requestToPay: true,
    color: "#3b82f6",
  },
  {
    name: "RTP (US)",
    country: "United States",
    launched: 2017,
    monthlyTxBillion: 0.21,
    maxAmount: "$1M",
    availability: "24/7/365",
    iso20022: true,
    requestToPay: true,
    color: "#8b5cf6",
  },
  {
    name: "FedNow",
    country: "United States",
    launched: 2023,
    monthlyTxBillion: 0.09,
    maxAmount: "$500K",
    availability: "24/7/365",
    iso20022: true,
    requestToPay: false,
    color: "#f97316",
  },
  {
    name: "PayNow",
    country: "Singapore",
    launched: 2017,
    monthlyTxBillion: 0.08,
    maxAmount: "S$200K",
    availability: "24/7/365",
    iso20022: true,
    requestToPay: true,
    color: "#ec4899",
  },
  {
    name: "PromptPay",
    country: "Thailand",
    launched: 2017,
    monthlyTxBillion: 0.14,
    maxAmount: "฿2M",
    availability: "24/7/365",
    iso20022: false,
    requestToPay: false,
    color: "#06b6d4",
  },
  {
    name: "SEPA Instant",
    country: "EU",
    launched: 2017,
    monthlyTxBillion: 0.28,
    maxAmount: "€100K",
    availability: "24/7/365",
    iso20022: true,
    requestToPay: true,
    color: "#0ea5e9",
  },
];

const CORRIDORS: Corridor[] = [
  {
    from: "USA",
    to: "Mexico",
    annualBillion: 63,
    bankCostPct: 6.2,
    fintechCostPct: 2.1,
    cryptoCostPct: 0.5,
    avgDays: 2,
  },
  {
    from: "UAE",
    to: "India",
    annualBillion: 43,
    bankCostPct: 5.8,
    fintechCostPct: 1.8,
    cryptoCostPct: 0.4,
    avgDays: 1,
  },
  {
    from: "USA",
    to: "Philippines",
    annualBillion: 38,
    bankCostPct: 7.1,
    fintechCostPct: 2.4,
    cryptoCostPct: 0.6,
    avgDays: 2,
  },
  {
    from: "UK",
    to: "Nigeria",
    annualBillion: 21,
    bankCostPct: 8.3,
    fintechCostPct: 2.9,
    cryptoCostPct: 0.7,
    avgDays: 3,
  },
];

// Keep rand() calls so PRNG advances (deterministic page renders)
const _unused = [rand(), rand(), rand()];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  sub,
  color = "text-primary",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-zinc-800/60 rounded-lg p-3 flex flex-col gap-0.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={cn("text-lg font-bold", color)}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

// ── Settlement Lag Bar Chart (SVG) ────────────────────────────────────────────

function SettlementLagChart() {
  const data = RAILS.map((r) => ({
    name: r.name,
    days: r.settlementDays,
    color: r.color,
  }));
  const maxDays = 3;
  const w = 520;
  const h = 200;
  const marginL = 80;
  const marginB = 30;
  const barH = 22;
  const gap = 8;
  const chartW = w - marginL - 20;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {data.map((d, i) => {
        const barW = Math.max(4, (d.days / maxDays) * chartW);
        const y = i * (barH + gap) + 10;
        return (
          <g key={d.name}>
            <text x={marginL - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={11} fill="#a1a1aa">
              {d.name}
            </text>
            <rect
              x={marginL}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={d.color}
              opacity={0.85}
            />
            <text x={marginL + barW + 6} y={y + barH / 2 + 4} fontSize={10} fill="#e4e4e7">
              {d.days === 0 ? "Instant" : `T+${d.days}`}
            </text>
          </g>
        );
      })}
      {/* X-axis labels */}
      {[0, 1, 2, 3].map((v) => (
        <text
          key={v}
          x={marginL + (v / maxDays) * chartW}
          y={h - 6}
          textAnchor="middle"
          fontSize={9}
          fill="#71717a"
        >
          {v === 0 ? "Instant" : `T+${v}`}
        </text>
      ))}
    </svg>
  );
}

// ── Volume vs Value Scatter (SVG) ─────────────────────────────────────────────

function VolumeValueChart() {
  const w = 520;
  const h = 240;
  const mL = 60;
  const mB = 40;
  const mR = 20;
  const mT = 20;
  const cW = w - mL - mR;
  const cH = h - mT - mB;

  const maxVol = 32;
  const maxVal = 1100;

  const points = RAILS.map((r) => ({
    name: r.name,
    x: mL + (r.volumeBillion / maxVol) * cW,
    y: mT + cH - (r.valueTrillion / maxVal) * cH,
    color: r.color,
    vol: r.volumeBillion,
    val: r.valueTrillion,
  }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={mL}
          y1={mT + cH * (1 - t)}
          x2={w - mR}
          y2={mT + cH * (1 - t)}
          stroke="#27272a"
          strokeWidth={1}
        />
      ))}
      {/* Axes */}
      <line x1={mL} y1={mT} x2={mL} y2={mT + cH} stroke="#52525b" strokeWidth={1} />
      <line x1={mL} y1={mT + cH} x2={w - mR} y2={mT + cH} stroke="#52525b" strokeWidth={1} />
      {/* Axis labels */}
      <text x={mL + cW / 2} y={h - 4} textAnchor="middle" fontSize={10} fill="#71717a">
        Volume (B transactions/yr)
      </text>
      <text
        x={14}
        y={mT + cH / 2}
        textAnchor="middle"
        fontSize={10}
        fill="#71717a"
        transform={`rotate(-90, 14, ${mT + cH / 2})`}
      >
        Value ($T/yr)
      </text>
      {/* Y ticks */}
      {[0, 250, 500, 750, 1000].map((v) => (
        <text
          key={v}
          x={mL - 4}
          y={mT + cH - (v / maxVal) * cH + 4}
          textAnchor="end"
          fontSize={9}
          fill="#71717a"
        >
          ${v}T
        </text>
      ))}
      {/* Points */}
      {points.map((p) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r={6} fill={p.color} opacity={0.85} />
          <text x={p.x + 9} y={p.y + 4} fontSize={10} fill="#e4e4e7">
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── SWIFT Correspondent Banking Chain (SVG) ────────────────────────────────────

function SWIFTChainSVG() {
  const nodes = [
    { label: "Sender\n(US Bank)", sub: "NYC", x: 40, color: "#3b82f6" },
    { label: "Correspondent\nBank A", sub: "New York", x: 160, color: "#8b5cf6" },
    { label: "Correspondent\nBank B", sub: "London", x: 280, color: "#f59e0b" },
    { label: "Correspondent\nBank C", sub: "Dubai", x: 400, color: "#10b981" },
    { label: "Beneficiary\nBank", sub: "Mumbai", x: 520, color: "#ec4899" },
  ];
  const h = 120;
  const nodeY = 50;
  const nodeR = 28;

  return (
    <svg viewBox="0 0 580 120" className="w-full">
      {/* Arrows */}
      {nodes.slice(0, -1).map((n, i) => (
        <g key={i}>
          <line
            x1={n.x + nodeR}
            y1={nodeY}
            x2={nodes[i + 1].x - nodeR}
            y2={nodeY}
            stroke="#52525b"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <polygon
            points={`${nodes[i + 1].x - nodeR - 6},${nodeY - 4} ${nodes[i + 1].x - nodeR},${nodeY} ${nodes[i + 1].x - nodeR - 6},${nodeY + 4}`}
            fill="#52525b"
          />
          <text
            x={(n.x + nodes[i + 1].x) / 2}
            y={nodeY - 14}
            textAnchor="middle"
            fontSize={8}
            fill="#71717a"
          >
            SWIFT MT
          </text>
        </g>
      ))}
      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={nodeY} r={nodeR} fill={n.color} opacity={0.2} />
          <circle cx={n.x} cy={nodeY} r={nodeR} fill="none" stroke={n.color} strokeWidth={1.5} />
          {n.label.split("\n").map((line, li) => (
            <text
              key={li}
              x={n.x}
              y={nodeY - 4 + li * 12}
              textAnchor="middle"
              fontSize={8.5}
              fill="#e4e4e7"
            >
              {line}
            </text>
          ))}
          <text x={n.x} y={nodeY + 22} textAnchor="middle" fontSize={8} fill="#71717a">
            {n.sub}
          </text>
        </g>
      ))}
      {/* Nostro/Vostro labels */}
      <text x={220} y={h - 6} textAnchor="middle" fontSize={9} fill="#f59e0b">
        Nostro accounts pre-funded at each hop
      </text>
    </svg>
  );
}

// ── Card Market Share Pie (SVG) ────────────────────────────────────────────────

function CardPieChart() {
  const cx = 100;
  const cy = 100;
  const r = 80;
  let cumAngle = -Math.PI / 2;
  const slices = CARD_NETWORKS.map((n) => {
    const angle = (n.marketShare / 100) * 2 * Math.PI;
    const start = cumAngle;
    const end = cumAngle + angle;
    cumAngle = end;
    const lMid = start + angle / 2;
    return { ...n, start, end, lMid };
  });

  const arcPath = (start: number, end: number, outer: number) => {
    const x1 = cx + outer * Math.cos(start);
    const y1 = cy + outer * Math.sin(start);
    const x2 = cx + outer * Math.cos(end);
    const y2 = cy + outer * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${outer} ${outer} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <svg viewBox="0 0 320 200" className="w-full max-w-xs mx-auto">
      {slices.map((sl) => (
        <path
          key={sl.name}
          d={arcPath(sl.start, sl.end, r)}
          fill={sl.color}
          opacity={0.85}
          stroke="#18181b"
          strokeWidth={1.5}
        />
      ))}
      {slices.map((sl) => {
        const lx = cx + (r * 0.65) * Math.cos(sl.lMid);
        const ly = cy + (r * 0.65) * Math.sin(sl.lMid);
        return (
          <text key={sl.name} x={lx} y={ly} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="600">
            {sl.marketShare}%
          </text>
        );
      })}
      {/* Legend */}
      {CARD_NETWORKS.map((n, i) => (
        <g key={n.name}>
          <rect x={210} y={30 + i * 28} width={12} height={12} rx={2} fill={n.color} />
          <text x={228} y={41 + i * 28} fontSize={11} fill="#e4e4e7">
            {n.name}
          </text>
          <text x={310} y={41 + i * 28} textAnchor="end" fontSize={10} fill="#71717a">
            {n.marketShare}%
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── 4-Party Model SVG ──────────────────────────────────────────────────────────

function FourPartyModelSVG() {
  return (
    <svg viewBox="0 0 520 200" className="w-full">
      {/* Boxes */}
      {[
        { label: "Cardholder", sub: "Consumer", x: 30, y: 70, color: "#3b82f6" },
        { label: "Issuing Bank", sub: "Consumer's Bank", x: 160, y: 20, color: "#8b5cf6" },
        { label: "Card Network", sub: "Visa/MC Rules", x: 280, y: 70, color: "#f59e0b" },
        { label: "Acquiring Bank", sub: "Merchant's Bank", x: 390, y: 20, color: "#10b981" },
        { label: "Merchant", sub: "Seller", x: 420, y: 120, color: "#ec4899" },
      ].map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={90} height={44} rx={6} fill={b.color} opacity={0.15} stroke={b.color} strokeWidth={1} />
          <text x={b.x + 45} y={b.y + 17} textAnchor="middle" fontSize={9.5} fill="#e4e4e7" fontWeight="600">
            {b.label}
          </text>
          <text x={b.x + 45} y={b.y + 32} textAnchor="middle" fontSize={8} fill="#a1a1aa">
            {b.sub}
          </text>
        </g>
      ))}
      {/* Flow arrows */}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#52525b" />
        </marker>
      </defs>
      {/* Cardholder → Merchant */}
      <line x1={120} y1={108} x2={420} y2={136} stroke="#3b82f6" strokeWidth={1.2} markerEnd="url(#arr)" strokeDasharray="5 3" />
      <text x={270} y={118} textAnchor="middle" fontSize={8} fill="#3b82f6">Purchase</text>
      {/* Merchant → Acquirer */}
      <line x1={430} y1={120} x2={445} y2={64} stroke="#ec4899" strokeWidth={1.2} markerEnd="url(#arr)" />
      {/* Acquirer → Network */}
      <line x1={390} y1={42} x2={370} y2={88} stroke="#10b981" strokeWidth={1.2} markerEnd="url(#arr)" />
      {/* Network → Issuer */}
      <line x1={280} y1={88} x2={250} y2={42} stroke="#f59e0b" strokeWidth={1.2} markerEnd="url(#arr)" />
      {/* Issuer → Cardholder */}
      <line x1={160} y1={56} x2={105} y2={88} stroke="#8b5cf6" strokeWidth={1.2} markerEnd="url(#arr)" />
      {/* Labels */}
      <text x={360} y={110} fontSize={8} fill="#71717a">Auth req.</text>
      <text x={195} y={76} fontSize={8} fill="#71717a">Auth resp.</text>
    </svg>
  );
}

// ── Interchange Breakdown Bar (SVG) ───────────────────────────────────────────

function InterchangeBar() {
  const segments = [
    { label: "Issuer", pct: 70, color: "#8b5cf6" },
    { label: "Network", pct: 10, color: "#f59e0b" },
    { label: "Acquirer", pct: 20, color: "#10b981" },
  ];
  const w = 460;
  const h = 60;
  const barH = 30;
  let x = 0;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {segments.map((seg) => {
        const bw = (seg.pct / 100) * w;
        const cx = x + bw / 2;
        const gx = x;
        x += bw;
        return (
          <g key={seg.label}>
            <rect x={gx} y={0} width={bw} height={barH} fill={seg.color} opacity={0.8} />
            <text x={cx} y={barH / 2 - 2} textAnchor="middle" fontSize={11} fill="#fff" fontWeight="600">
              {seg.label}
            </text>
            <text x={cx} y={barH / 2 + 11} textAnchor="middle" fontSize={10} fill="#fff">
              {seg.pct}%
            </text>
          </g>
        );
      })}
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize={9} fill="#71717a">
        Of every 100 basis points merchant discount rate
      </text>
    </svg>
  );
}

// ── Auth-Clear-Settle Flow (SVG) ──────────────────────────────────────────────

function AuthClearSettleFlow() {
  const steps = [
    {
      step: "1. Authorization",
      time: "~2 seconds",
      desc: "Issuer approves/declines transaction. Funds reserved.",
      color: "#3b82f6",
    },
    {
      step: "2. Clearing",
      time: "End of day",
      desc: "Merchant batches transactions, sends to acquirer for reconciliation.",
      color: "#f59e0b",
    },
    {
      step: "3. Settlement",
      time: "T+1 to T+2",
      desc: "Funds moved from issuer to acquirer net of fees. Merchant funded.",
      color: "#10b981",
    },
  ];
  const w = 500;
  const boxW = 140;
  const boxH = 80;
  const gap = (w - 3 * boxW) / 4;

  return (
    <svg viewBox={`0 0 ${w} 120`} className="w-full">
      {steps.map((s, i) => {
        const bx = gap + i * (boxW + gap);
        return (
          <g key={s.step}>
            <rect x={bx} y={10} width={boxW} height={boxH} rx={8} fill={s.color} opacity={0.15} stroke={s.color} strokeWidth={1} />
            <text x={bx + boxW / 2} y={32} textAnchor="middle" fontSize={9.5} fill={s.color} fontWeight="700">
              {s.step}
            </text>
            <text x={bx + boxW / 2} y={46} textAnchor="middle" fontSize={8.5} fill="#a1a1aa">
              {s.time}
            </text>
            {s.desc.split(",").map((line, li) => (
              <text key={li} x={bx + boxW / 2} y={60 + li * 11} textAnchor="middle" fontSize={7.5} fill="#71717a">
                {line.trim()}
              </text>
            ))}
            {i < 2 && (
              <path
                d={`M ${bx + boxW + 4} 50 L ${bx + boxW + gap - 4} 50`}
                stroke="#52525b"
                strokeWidth={1.5}
                markerEnd="url(#arr)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── RTP Monthly Volume Bar (SVG) ──────────────────────────────────────────────

function RTPVolumeChart() {
  const data = RTP_SYSTEMS.sort((a, b) => b.monthlyTxBillion - a.monthlyTxBillion);
  const max = 11;
  const w = 540;
  const h = 200;
  const mL = 120;
  const mB = 30;
  const barH = 18;
  const gap = 6;
  const cW = w - mL - 20;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {data.map((d, i) => {
        const bw = (d.monthlyTxBillion / max) * cW;
        const y = 10 + i * (barH + gap);
        return (
          <g key={d.name}>
            <text x={mL - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#a1a1aa">
              {d.name} ({d.country})
            </text>
            <rect x={mL} y={y} width={bw} height={barH} rx={3} fill={d.color} opacity={0.85} />
            <text x={mL + bw + 5} y={y + barH / 2 + 4} fontSize={10} fill="#e4e4e7">
              {d.monthlyTxBillion}B/mo
            </text>
          </g>
        );
      })}
      <text x={mL + cW / 2} y={h - 4} textAnchor="middle" fontSize={9} fill="#71717a">
        Monthly transactions (Billions)
      </text>
    </svg>
  );
}

// ── Remittance Cost Comparison (SVG) ─────────────────────────────────────────

function RemittanceCostChart() {
  const channels = [
    { name: "Traditional Bank", cost: 6.0, color: "#ef4444", time: "3–5 days" },
    { name: "Money Transfer Op.", cost: 4.2, color: "#f59e0b", time: "1–2 days" },
    { name: "Fintech (Wise/Remitly)", cost: 2.0, color: "#3b82f6", time: "Minutes–1 day" },
    { name: "Mobile Wallet", cost: 1.4, color: "#10b981", time: "Instant" },
    { name: "Crypto/Stablecoin", cost: 0.5, color: "#8b5cf6", time: "Minutes" },
  ];
  const max = 7;
  const w = 500;
  const h = 190;
  const mL = 170;
  const barH = 22;
  const gap = 8;
  const cW = w - mL - 40;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {channels.map((c, i) => {
        const bw = (c.cost / max) * cW;
        const y = 10 + i * (barH + gap);
        return (
          <g key={c.name}>
            <text x={mL - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={10} fill="#a1a1aa">
              {c.name}
            </text>
            <rect x={mL} y={y} width={bw} height={barH} rx={4} fill={c.color} opacity={0.85} />
            <text x={mL + bw + 6} y={y + barH / 2 + 4} fontSize={10} fill="#e4e4e7">
              {c.cost}%
            </text>
            <text x={mL + bw + 44} y={y + barH / 2 + 4} fontSize={9} fill="#71717a">
              {c.time}
            </text>
          </g>
        );
      })}
      {/* World Bank target line at 3% */}
      <line
        x1={mL + (3 / max) * cW}
        y1={8}
        x2={mL + (3 / max) * cW}
        y2={h - 20}
        stroke="#22c55e"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <text x={mL + (3 / max) * cW + 3} y={15} fontSize={8} fill="#22c55e">
        SDG target 3%
      </text>
      <text x={mL + cW / 2} y={h - 4} textAnchor="middle" fontSize={9} fill="#71717a">
        Average cost as % of $200 transfer
      </text>
    </svg>
  );
}

// ── FX Cost SVG ────────────────────────────────────────────────────────────────

function FXCostWaterfallSVG() {
  const items = [
    { label: "Nominal Amount", value: 1000, base: 0, color: "#3b82f6", cumulative: 1000 },
    { label: "FX Spread (1.2%)", value: -12, base: 988, color: "#ef4444", cumulative: 988 },
    { label: "SWIFT Fee", value: -25, base: 963, color: "#ef4444", cumulative: 963 },
    { label: "Intermediary Fee", value: -15, base: 948, color: "#f59e0b", cumulative: 948 },
    { label: "Lifting Charges", value: -8, base: 940, color: "#f59e0b", cumulative: 940 },
    { label: "Beneficiary Receives", value: 940, base: 0, color: "#10b981", cumulative: 940 },
  ];
  const w = 500;
  const h = 200;
  const mL = 150;
  const barH = 20;
  const gap = 6;
  const max = 1050;
  const cW = w - mL - 30;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {items.map((item, i) => {
        const isNeg = item.value < 0;
        const bw = (Math.abs(item.value) / max) * cW;
        const bx = isNeg
          ? mL + (item.base / max) * cW
          : mL;
        const y = 10 + i * (barH + gap);
        return (
          <g key={item.label}>
            <text x={mL - 6} y={y + barH / 2 + 4} textAnchor="end" fontSize={9.5} fill="#a1a1aa">
              {item.label}
            </text>
            <rect x={bx} y={y} width={bw} height={barH} rx={3} fill={item.color} opacity={0.85} />
            <text
              x={isNeg ? bx + bw + 5 : mL + (item.cumulative / max) * cW + 5}
              y={y + barH / 2 + 4}
              fontSize={10}
              fill="#e4e4e7"
            >
              {isNeg ? `−$${Math.abs(item.value)}` : `$${item.value}`}
            </text>
          </g>
        );
      })}
      <text x={mL + cW / 2} y={h - 4} textAnchor="middle" fontSize={9} fill="#71717a">
        $1,000 cross-border transfer cost breakdown
      </text>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PaymentSystemsPage() {
  const [activeTab, setActiveTab] = useState("rails");

  const totalRailVolume = useMemo(
    () => RAILS.reduce((sum, r) => sum + r.volumeBillion, 0).toFixed(1),
    []
  );
  const totalRailValue = useMemo(
    () => RAILS.reduce((sum, r) => sum + r.valueTrillion, 0).toFixed(0),
    []
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start gap-4"
      >
        <div className="p-3 rounded-xl bg-primary/10 border border-border">
          <Network className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Payment Systems &amp; Infrastructure</h1>
          <p className="text-sm text-zinc-400 mt-1">
            How global payments work — clearing &amp; settlement, card networks, real-time payments,
            cross-border flows, and fintech disruption
          </p>
        </div>
      </motion.div>

      {/* Top KPI row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatChip label="Global Non-Cash Txns" value="1.3T+" sub="transactions/year" color="text-primary" />
        <StatChip label="SWIFT Messages/day" value="44M+" sub="across 200+ countries" color="text-primary" />
        <StatChip label="Card Spend (Global)" value="$45T" sub="annual card volume" color="text-green-400" />
        <StatChip label="Remittance Flows" value="$860B" sub="annual cross-border" color="text-yellow-400" />
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800 w-full grid grid-cols-4">
          <TabsTrigger value="rails" className="text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary">
            Payment Rails
          </TabsTrigger>
          <TabsTrigger value="cards" className="text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary">
            Card Networks
          </TabsTrigger>
          <TabsTrigger value="rtp" className="text-xs data-[state=active]:bg-green-600/30 data-[state=active]:text-green-300">
            Real-Time Payments
          </TabsTrigger>
          <TabsTrigger value="crossborder" className="text-xs data-[state=active]:bg-yellow-600/30 data-[state=active]:text-yellow-300">
            Cross-Border &amp; CBDC
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Payment Rails ─────────────────────────────────────────── */}
        <TabsContent value="rails" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Rails table */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Global Payment Rails Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {["Rail", "Region", "Settlement", "Type", "Max Tx"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-zinc-500 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RAILS.map((r, i) => (
                        <motion.tr
                          key={r.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                        >
                          <td className="px-3 py-2 font-semibold" style={{ color: r.color }}>
                            {r.name}
                          </td>
                          <td className="px-3 py-2 text-zinc-400">{r.region}</td>
                          <td className="px-3 py-2 text-zinc-300">{r.settlementTime}</td>
                          <td className="px-3 py-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                r.type === "gross"
                                  ? "border-green-500/40 text-green-400"
                                  : "border-yellow-500/40 text-yellow-400"
                              )}
                            >
                              {r.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-zinc-400">{r.maxTx}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Settlement Lag Chart */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  Settlement Lag by Rail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SettlementLagChart />
                <p className="text-xs text-zinc-500 mt-2">
                  RTGS (Real-Time Gross Settlement) provides instant finality vs deferred net settlement for batch rails.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Volume vs Value Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                Volume vs. Value by Rail — High Value, Low Volume vs. High Volume, Low Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VolumeValueChart />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-zinc-800/50 rounded p-2 text-xs text-zinc-400">
                  <span className="text-primary font-semibold">Fedwire &amp; CHIPS</span> settle trillions
                  daily in wholesale interbank payments despite low transaction counts.
                </div>
                <div className="bg-zinc-800/50 rounded p-2 text-xs text-zinc-400">
                  <span className="text-primary font-semibold">ACH &amp; SEPA</span> process billions of
                  retail transactions at much lower average values per transaction.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SWIFT Correspondent Banking Chain */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-400" />
                SWIFT Correspondent Banking — 5-Hop Chain Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SWIFTChainSVG />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                <div className="bg-zinc-800/50 rounded p-2">
                  <div className="text-yellow-400 font-semibold mb-1">Nostro Account</div>
                  <div className="text-zinc-400">
                    &quot;Our money at your bank&quot; — Bank A holds a pre-funded account at Bank B in the
                    destination currency.
                  </div>
                </div>
                <div className="bg-zinc-800/50 rounded p-2">
                  <div className="text-green-400 font-semibold mb-1">Vostro Account</div>
                  <div className="text-zinc-400">
                    &quot;Your money at our bank&quot; — mirror view. Bank B holds Bank A&apos;s funds and
                    records them as a vostro liability.
                  </div>
                </div>
                <div className="bg-zinc-800/50 rounded p-2">
                  <div className="text-red-400 font-semibold mb-1">Pain Points</div>
                  <div className="text-zinc-400">
                    Each hop adds 1–2 days, $10–25 in fees, and opacity. A 5-hop transfer costs $50–125 and
                    takes 3–5 business days.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net vs Gross Settlement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Net Settlement (DNS)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-2">
                <p>
                  All transactions are batched and obligations are offset. Only the net position
                  is settled at end-of-day. Used by ACH, SEPA.
                </p>
                <div className="bg-primary/10 border border-border rounded p-2">
                  <div className="text-primary font-medium mb-1">Example</div>
                  Bank A owes Bank B $10M, Bank B owes Bank A $8M. Net settlement: Bank A pays $2M only.
                  Reduces liquidity needs by 90%+.
                </div>
                <div className="flex gap-3">
                  <div className="text-green-400">Pro: Lower liquidity required</div>
                  <div className="text-red-400">Con: Intraday settlement risk</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  Gross Settlement (RTGS)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-2">
                <p>
                  Each transaction is settled individually and immediately in central bank money.
                  No netting. Used by Fedwire, CHIPS (hybrid), TARGET2.
                </p>
                <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                  <div className="text-green-400 font-medium mb-1">Example</div>
                  Bank A sends $500M to Bank B at 9:05am. Fed debits A&apos;s reserve account and
                  credits B&apos;s immediately. Irrevocable finality.
                </div>
                <div className="flex gap-3">
                  <div className="text-green-400">Pro: Zero settlement risk</div>
                  <div className="text-red-400">Con: High intraday liquidity</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: Card Networks ─────────────────────────────────────────── */}
        <TabsContent value="cards" className="data-[state=inactive]:hidden space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Global Card Market Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardPieChart />
              </CardContent>
            </Card>

            {/* 4-Party Model */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  4-Party vs 3-Party Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FourPartyModelSVG />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-primary/10 border border-border rounded p-2">
                    <div className="text-primary font-semibold mb-1">4-Party (Visa/MC)</div>
                    <div className="text-zinc-400">
                      Cardholder, Issuing Bank, Acquiring Bank, Merchant. Network sets rules but
                      doesn&apos;t issue cards or acquire merchants directly.
                    </div>
                  </div>
                  <div className="bg-primary/10 border border-border rounded p-2">
                    <div className="text-primary font-semibold mb-1">3-Party (Amex/Discover)</div>
                    <div className="text-zinc-400">
                      Network acts as both issuer and acquirer. Direct relationship with cardholder
                      and merchant. Higher control but smaller acceptance.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interchange Breakdown */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                Merchant Discount Rate — Interchange Fee Anatomy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InterchangeBar />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    label: "Issuer (70%)",
                    desc: "Funds rewards programs, fraud losses, credit risk. Consumer bank keeps the lion's share.",
                    color: "text-primary",
                    bg: "bg-primary/10 border-border",
                  },
                  {
                    label: "Network (10%)",
                    desc: "Visa/MC brand fee for rules, auth routing, dispute resolution, network infrastructure.",
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10 border-yellow-500/20",
                  },
                  {
                    label: "Acquirer (20%)",
                    desc: "Merchant's processor margin. Includes POS hardware, gateway, chargeback management.",
                    color: "text-green-400",
                    bg: "bg-green-500/10 border-green-500/20",
                  },
                ].map((item) => (
                  <div key={item.label} className={cn("border rounded p-2", item.bg)}>
                    <div className={cn("font-semibold mb-1", item.color)}>{item.label}</div>
                    <div className="text-zinc-400">{item.desc}</div>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-800/50 rounded p-3 text-xs text-zinc-400">
                <span className="text-zinc-300 font-medium">Typical MDR examples: </span>
                Debit card 0.5–1.2% | Consumer credit 1.5–2.2% | Premium rewards card 2.0–3.5% |
                Amex corporate 2.5–3.8% | Cross-border +1.0–1.5% surcharge
              </div>
            </CardContent>
          </Card>

          {/* Auth-Clear-Settle */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Authorization → Clearing → Settlement 3-Step Flow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AuthClearSettleFlow />
              <p className="text-xs text-zinc-500">
                Note: Authorization and settlement are separate events. A hotel pre-auth reserves funds
                but doesn&apos;t capture until checkout — creating a "hold" that can last 3–7 days.
              </p>
            </CardContent>
          </Card>

          {/* Security Layers */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Security Layers — Contactless, Tokenization, 3DS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    icon: Wifi,
                    title: "Contactless / NFC",
                    color: "text-primary",
                    bg: "bg-primary/10 border-border",
                    points: [
                      "ISO/IEC 14443 standard, 13.56 MHz",
                      "Cryptogram generated per-tap",
                      "No static PAN transmitted",
                      "Offline mode up to $200 (PIN fallback above)",
                      "EMV chip equivalent security",
                    ],
                  },
                  {
                    icon: Lock,
                    title: "Tokenization",
                    color: "text-primary",
                    bg: "bg-primary/10 border-border",
                    points: [
                      "PAN replaced with device-specific token",
                      "Token useless if intercepted",
                      "Visa Token Service / MC MDES",
                      "Apple Pay/Google Pay store tokens",
                      "Merchant never sees real card number",
                    ],
                  },
                  {
                    icon: Shield,
                    title: "3D Secure (3DS2)",
                    color: "text-green-400",
                    bg: "bg-green-500/10 border-green-500/20",
                    points: [
                      "Issuer authenticates cardholder",
                      "Risk-based frictionless flow",
                      "100+ data points analyzed",
                      "Biometric challenge if needed",
                      "Liability shifts to issuer on success",
                    ],
                  },
                ].map((sec) => (
                  <div key={sec.title} className={cn("border rounded p-3", sec.bg)}>
                    <div className={cn("flex items-center gap-2 font-semibold mb-2", sec.color)}>
                      <sec.icon className="w-3.5 h-3.5" />
                      {sec.title}
                    </div>
                    <ul className="space-y-1 text-zinc-400">
                      {sec.points.map((p) => (
                        <li key={p} className="flex items-start gap-1">
                          <span className={cn("mt-0.5 text-xs", sec.color)}>•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Real-Time Payments ────────────────────────────────────── */}
        <TabsContent value="rtp" className="data-[state=inactive]:hidden space-y-4 mt-4">
          {/* Global adoption volume */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                Global RTP Adoption — Monthly Transaction Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RTPVolumeChart />
              <p className="text-xs text-zinc-500 mt-2">
                India&apos;s UPI processes more real-time payments than the rest of the world combined,
                reaching 10B+ monthly transactions in 2024.
              </p>
            </CardContent>
          </Card>

          {/* Feature Comparison Table */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-primary" />
                RTP vs FedNow Feature Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="px-3 py-2 text-left text-zinc-500">Feature</th>
                      <th className="px-3 py-2 text-center text-primary">RTP (TCH)</th>
                      <th className="px-3 py-2 text-center text-orange-400">FedNow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Operator", "The Clearing House", "Federal Reserve"],
                      ["Launched", "2017", "2023"],
                      ["Max Transaction", "$1,000,000", "$500,000"],
                      ["Availability", "24/7/365", "24/7/365"],
                      ["ISO 20022", "Yes", "Yes"],
                      ["Request-to-Pay", "Yes", "In development"],
                      ["Participants", "~400 FIs", "~800+ FIs"],
                      ["Finality", "Irrevocable", "Irrevocable"],
                      ["Settlement", "Real-time gross", "Real-time gross"],
                      ["Target market", "Commercial/retail", "Community banks/CUs"],
                    ].map(([feat, rtp, fednow], i) => (
                      <tr key={feat} className={cn("border-b border-zinc-800/50", i % 2 === 0 && "bg-zinc-800/20")}>
                        <td className="px-3 py-2 text-zinc-400 font-medium">{feat}</td>
                        <td className="px-3 py-2 text-center text-zinc-300">{rtp}</td>
                        <td className="px-3 py-2 text-center text-zinc-300">{fednow}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* System Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                name: "UPI (India)",
                color: "#f59e0b",
                stat: "10.4B/mo",
                year: 2016,
                note: "Interoperable across 300+ banks. QR codes drive merchant adoption. Built on IMPS rails.",
              },
              {
                name: "PIX (Brazil)",
                color: "#10b981",
                stat: "4.1B/mo",
                year: 2020,
                note: "Central bank mandated. Launched Nov 2020, hit 1B transactions in 6 months. Free for individuals.",
              },
              {
                name: "Faster Payments (UK)",
                color: "#3b82f6",
                stat: "370M/mo",
                year: 2008,
                note: "World's first major RTP scheme. Enabled Open Banking wave. ISO 20022 migration underway (NPA).",
              },
              {
                name: "PayNow (SG)",
                color: "#ec4899",
                stat: "80M/mo",
                year: 2017,
                note: "Linked to NRIC/mobile number. Cross-border link with PromptPay Thailand enables instant bilateral.",
              },
            ].map((sys) => (
              <Card key={sys.name} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: sys.color }}>
                      {sys.name}
                    </span>
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {sys.year}
                    </Badge>
                  </div>
                  <div className="text-xl font-bold text-zinc-100">{sys.stat}</div>
                  <p className="text-xs text-zinc-500">{sys.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ISO 20022 & Fraud */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  ISO 20022 Migration Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-2">
                {[
                  ["Richer Data", "Purpose codes, LEIs, full address, remittance info (up to 140 chars vs 35)"],
                  ["Straight-Through Processing", "Machine-readable structured data eliminates manual repair"],
                  ["Compliance", "Better AML/sanctions screening with structured beneficiary data"],
                  ["Request-to-Pay", "New message types enable R2P, returns, confirmation of payee"],
                  ["Interoperability", "Common global standard — SWIFT, SEPA, Fed, RTP all migrating"],
                ].map(([title, desc]) => (
                  <div key={title as string} className="flex gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-zinc-300 font-medium">{title}: </span>
                      {desc}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Fraud Challenges in Instant Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-2">
                {[
                  ["Irrevocability", "Once sent, funds cannot be recalled — authorized push payment (APP) fraud exploded"],
                  ["Speed vs. Screening", "Sub-second settlement leaves little time for AML/fraud checks"],
                  ["APP Fraud (UK)", "£459M lost in 2023; PSR mandated reimbursement rules from Oct 2024"],
                  ["Account Takeover", "Credential theft → instant drain → mules → cash out in minutes"],
                  ["Overlay Services", "Zelle/Venmo operate over RTP — 'pay friend' UX exploited for scams"],
                ].map(([title, desc]) => (
                  <div key={title as string} className="flex gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-zinc-300 font-medium">{title}: </span>
                      {desc}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Open Banking & Overlay Services */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Open Banking API Integration &amp; Overlay Services
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-400">
              <div className="space-y-2">
                <div className="text-zinc-300 font-semibold">Open Banking Layer</div>
                <p>
                  Regulated API access (PSD2 in EU, CDR in AU, open banking in UK) lets licensed Third
                  Party Providers (TPPs) initiate payments and access account data on behalf of consumers.
                </p>
                <div className="bg-zinc-800/50 rounded p-2 space-y-1">
                  <div><span className="text-primary">AISP:</span> Account Information Service Provider — read-only data aggregation</div>
                  <div><span className="text-primary">PISP:</span> Payment Initiation Service Provider — trigger bank transfers</div>
                  <div><span className="text-primary">CBPII:</span> Card-Based Payment Instrument Issuer — confirmation of funds</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-zinc-300 font-semibold">Overlay Services (Zelle / Venmo Layer)</div>
                <p>
                  Consumer-facing apps built on top of underlying RTP rails. Zelle runs on RTP/FedNow;
                  Venmo settles via ACH (instant option via debit push).
                </p>
                <div className="bg-zinc-800/50 rounded p-2 space-y-1">
                  <div><span className="text-green-400">Zelle:</span> 2.9B transactions, $806B in 2023 — bank-owned consortium</div>
                  <div><span className="text-green-400">Venmo:</span> 900M+ transactions — PayPal subsidiary, social layer</div>
                  <div><span className="text-green-400">Cash App:</span> Square/Block — integrated investing + banking super-app</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: Cross-Border & CBDC ───────────────────────────────────── */}
        <TabsContent value="crossborder" className="data-[state=inactive]:hidden space-y-4 mt-4">
          {/* Remittance Cost Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-400" />
                Remittance Cost Comparison — Average % of $200 Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RemittanceCostChart />
              <p className="text-xs text-zinc-500 mt-2">
                World Bank SDG 10c target: reduce remittance costs to under 3% by 2030. Traditional banks
                charge ~6%, disproportionately impacting migrants sending money home.
              </p>
            </CardContent>
          </Card>

          {/* FX Cost Breakdown */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                FX Conversion Cost Waterfall — $1,000 Cross-Border Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FXCostWaterfallSVG />
            </CardContent>
          </Card>

          {/* Corridors */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Top Cross-Border Remittance Corridors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      {["Corridor", "Annual Flow", "Bank Cost", "Fintech Cost", "Crypto Cost", "Avg Days"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-zinc-500 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CORRIDORS.map((c, i) => (
                      <motion.tr
                        key={`${c.from}-${c.to}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                      >
                        <td className="px-3 py-2 font-semibold text-zinc-200">
                          {c.from} → {c.to}
                        </td>
                        <td className="px-3 py-2 text-primary">${c.annualBillion}B</td>
                        <td className="px-3 py-2 text-red-400">{c.bankCostPct}%</td>
                        <td className="px-3 py-2 text-green-400">{c.fintechCostPct}%</td>
                        <td className="px-3 py-2 text-primary">{c.cryptoCostPct}%</td>
                        <td className="px-3 py-2 text-zinc-400">T+{c.avgDays}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* SWIFT GPI */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-yellow-400" />
                SWIFT GPI — Global Payments Innovation Improvements
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Same-day settlement", value: "50%", sub: "of GPI payments", color: "text-green-400" },
                { label: "Within 30 min", value: "40%", sub: "end-to-end", color: "text-primary" },
                { label: "Payment tracking", value: "100%", sub: "UETR tracker", color: "text-primary" },
                { label: "Fee transparency", value: "Full", sub: "upfront disclosure", color: "text-yellow-400" },
              ].map((m) => (
                <div key={m.label} className="bg-zinc-800/60 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">{m.label}</div>
                  <div className={cn("text-xl font-bold", m.color)}>{m.value}</div>
                  <div className="text-xs text-zinc-500">{m.sub}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Blockchain Alternatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  Blockchain Alternatives — Ripple / Stellar
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-3">
                <div className="bg-primary/10 border border-border rounded p-2">
                  <div className="text-primary font-semibold mb-1">Ripple (XRP Ledger)</div>
                  <ul className="space-y-1">
                    <li>• 3–5 second settlement vs 3–5 day SWIFT</li>
                    <li>• ODL (On-Demand Liquidity) — XRP as bridge currency</li>
                    <li>• Partners: Santander, SBI Holdings, MoneyGram (terminated)</li>
                    <li>• SEC lawsuit: XRP ruled not a security for retail sales</li>
                    <li>• Cost: $0.0001/tx vs $25–45 SWIFT correspondent fee</li>
                  </ul>
                </div>
                <div className="bg-primary/10 border border-border rounded p-2">
                  <div className="text-primary font-semibold mb-1">Stellar (XLM)</div>
                  <ul className="space-y-1">
                    <li>• Non-profit, open-source protocol</li>
                    <li>• 3–5 second finality, Stellar Consensus Protocol</li>
                    <li>• Focus: emerging markets, financial inclusion</li>
                    <li>• IBM World Wire used Stellar for cross-border</li>
                    <li>• Anchors issue stablecoins on-ledger (USDC support)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-green-400" />
                  CBDC — Retail vs Wholesale Designs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-zinc-400 space-y-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                  <div className="text-green-400 font-semibold mb-1">Retail CBDC (General Public)</div>
                  <ul className="space-y-1">
                    <li>• Direct central bank liability to citizens</li>
                    <li>• Digital cash equivalent — no bank intermediary</li>
                    <li>• Programmable (smart contracts for welfare, tax)</li>
                    <li>• Privacy concerns vs financial inclusion benefits</li>
                    <li>• Live: e-CNY (China), e-Naira (Nigeria), DCash (E.Caribbean)</li>
                  </ul>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                  <div className="text-yellow-400 font-semibold mb-1">Wholesale CBDC (Interbank)</div>
                  <ul className="space-y-1">
                    <li>• Restricted to financial institutions</li>
                    <li>• Tokenized central bank reserves</li>
                    <li>• Atomic settlement of securities + cash (DvP)</li>
                    <li>• Cross-border: BIS mBridge (4 CBs), Project Dunbar</li>
                    <li>• Project Nexus: interlinking domestic RTP systems</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BIS Projects & CBDC Interoperability */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                BIS Innovation Hub — Cross-Border CBDC Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                {
                  name: "mBridge",
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10 border-yellow-500/20",
                  participants: "PBOC, HKMA, BOT, CBUAE",
                  status: "MVP reached 2024",
                  desc: "Multi-CBDC platform on distributed ledger. $22M+ pilot transactions across 4 central banks.",
                },
                {
                  name: "Project Dunbar",
                  color: "text-primary",
                  bg: "bg-primary/10 border-border",
                  participants: "BIS, MAS, RBA, SARB, BNM",
                  status: "Completed 2022",
                  desc: "Tested shared multi-CBDC platform. Showed feasibility of direct CBDC settlement between banks.",
                },
                {
                  name: "Project Nexus",
                  color: "text-primary",
                  bg: "bg-primary/10 border-border",
                  participants: "BIS, ASEAN central banks",
                  status: "Pilot phase",
                  desc: "Interlinking domestic instant payment systems (UPI, PromptPay, PayNow) via standardized gateway.",
                },
                {
                  name: "Project Jura",
                  color: "text-green-400",
                  bg: "bg-green-500/10 border-green-500/20",
                  participants: "BIS, BdF, SNB",
                  status: "Completed 2021",
                  desc: "Cross-border w-CBDC settlement. EUR and CHF CBDC exchange on tokenized platform with DvP.",
                },
              ].map((p) => (
                <div key={p.name} className={cn("border rounded p-3 space-y-1.5", p.bg)}>
                  <div className={cn("font-bold text-sm", p.color)}>{p.name}</div>
                  <Badge variant="outline" className={cn("text-xs border-zinc-700", p.color)}>
                    {p.status}
                  </Badge>
                  <div className="text-zinc-500">{p.participants}</div>
                  <p className="text-zinc-400">{p.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Interoperability Challenges */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                CBDC Interoperability Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                {
                  title: "Technical Standards",
                  color: "text-red-400",
                  desc: "Different DLT platforms (Ethereum, Corda, Hyperledger, bespoke) create fragmentation. ISO 20022 + token standards needed.",
                },
                {
                  title: "Legal & Regulatory",
                  color: "text-orange-400",
                  desc: "Each jurisdiction has different AML/KYC requirements. Privacy laws (GDPR) conflict with blockchain transparency.",
                },
                {
                  title: "Monetary Sovereignty",
                  color: "text-yellow-400",
                  desc: "Central banks fear capital flight, dollarization risk, and loss of monetary policy transmission.",
                },
                {
                  title: "Access Governance",
                  color: "text-primary",
                  desc: "Which foreign institutions can hold domestic CBDC? Tiered access raises geopolitical questions.",
                },
                {
                  title: "FX Conversion",
                  color: "text-primary",
                  desc: "Atomic FX swap requires simultaneous CBDC exchange across ledgers — liquidity provision and pricing mechanics unsolved.",
                },
                {
                  title: "Retail Privacy",
                  color: "text-green-400",
                  desc: "Programmable money enables state surveillance. Design choices between privacy-preserving (token-based) vs account-based CBDC are contested.",
                },
              ].map((ch) => (
                <div key={ch.title} className="bg-zinc-800/50 rounded p-2.5">
                  <div className={cn("font-semibold mb-1", ch.color)}>{ch.title}</div>
                  <p className="text-zinc-400">{ch.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
