"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Clock,
  Info,
  BarChart3,
  Smartphone,
  Lock,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 712001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const NOISE = Array.from({ length: 300 }, () => rand());

// ── Interfaces ────────────────────────────────────────────────────────────────

interface PaymentRail {
  name: string;
  speed: string;
  costRange: string;
  maxAmount: string;
  settlementType: string;
  useCases: string[];
  volume: number;
  color: string;
}

interface CardTier {
  cardType: string;
  issuerPct: number;
  networkPct: number;
  acquirerPct: number;
  total: number;
}

interface WalletShare {
  name: string;
  share: number;
  color: string;
  users: string;
  founded: number;
  model: string;
}

interface CBDCProject {
  country: string;
  name: string;
  status: string;
  statusColor: string;
  launched: string;
  technology: string;
  retailWholesale: string;
  note: string;
}

interface PaymentStock {
  ticker: string;
  name: string;
  peRatio: number;
  revenueGrowth: number;
  takeRate: number;
  volume: string;
  marketCap: string;
  color: string;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const PAYMENT_RAILS: PaymentRail[] = [
  {
    name: "ACH",
    speed: "1–3 days",
    costRange: "$0.20–$1.50",
    maxAmount: "$25M",
    settlementType: "Batch",
    useCases: ["Payroll", "Direct debit", "B2B payments"],
    volume: 80,
    color: "#6366f1",
  },
  {
    name: "Same-Day ACH",
    speed: "Same day",
    costRange: "$0.50–$2.00",
    maxAmount: "$1M",
    settlementType: "Batch (3x/day)",
    useCases: ["Urgent payroll", "Insurance claims", "Gig economy"],
    volume: 30,
    color: "#8b5cf6",
  },
  {
    name: "Fedwire",
    speed: "Minutes",
    costRange: "$10–$50",
    maxAmount: "No limit",
    settlementType: "RTGS",
    useCases: ["Large B2B", "Real estate", "Interbank"],
    volume: 95,
    color: "#0ea5e9",
  },
  {
    name: "SWIFT",
    speed: "1–5 days",
    costRange: "$15–$50+",
    maxAmount: "No limit",
    settlementType: "Correspondent",
    useCases: ["Cross-border", "Trade finance", "FX settlement"],
    volume: 55,
    color: "#14b8a6",
  },
  {
    name: "RTP (Real-Time Payments)",
    speed: "Seconds",
    costRange: "$0.01–$0.04",
    maxAmount: "$1M",
    settlementType: "Instant",
    useCases: ["Consumer P2P", "Merchant", "Insurance"],
    volume: 45,
    color: "#f59e0b",
  },
  {
    name: "Visa / Mastercard",
    speed: "2–3 days (settlement)",
    costRange: "1.5%–3.5%",
    maxAmount: "Varies",
    settlementType: "Net settlement",
    useCases: ["Retail POS", "E-commerce", "Travel"],
    volume: 100,
    color: "#ef4444",
  },
  {
    name: "American Express",
    speed: "2–3 days",
    costRange: "2.5%–3.5%",
    maxAmount: "Varies",
    settlementType: "Net settlement",
    useCases: ["Premium retail", "Corporate cards", "Travel"],
    volume: 35,
    color: "#f97316",
  },
];

const INTERCHANGE_TIERS: CardTier[] = [
  { cardType: "Debit (basic)", issuerPct: 0.05, networkPct: 0.13, acquirerPct: 0.22, total: 0.40 },
  { cardType: "Debit (rewards)", issuerPct: 0.15, networkPct: 0.13, acquirerPct: 0.22, total: 0.50 },
  { cardType: "Credit (standard)", issuerPct: 1.51, networkPct: 0.13, acquirerPct: 0.25, total: 1.89 },
  { cardType: "Credit (rewards)", issuerPct: 1.95, networkPct: 0.13, acquirerPct: 0.25, total: 2.33 },
  { cardType: "Credit (signature)", issuerPct: 2.10, networkPct: 0.15, acquirerPct: 0.25, total: 2.50 },
  { cardType: "Corporate card", issuerPct: 2.20, networkPct: 0.15, acquirerPct: 0.30, total: 2.65 },
  { cardType: "Amex (OptBlue)", issuerPct: 1.80, networkPct: 0.35, acquirerPct: 0.30, total: 2.45 },
];

const WALLET_SHARES: WalletShare[] = [
  { name: "Apple Pay", share: 28, color: "#6366f1", users: "583M", founded: 2014, model: "Device-based NFC" },
  { name: "Google Pay", share: 19, color: "#0ea5e9", users: "421M", founded: 2015, model: "Cloud token" },
  { name: "PayPal", share: 22, color: "#3b82f6", users: "435M", founded: 1998, model: "Account-based" },
  { name: "Venmo", share: 8, color: "#8b5cf6", users: "78M", founded: 2009, model: "Social P2P" },
  { name: "Cash App", share: 9, color: "#10b981", users: "55M", founded: 2013, model: "P2P + investing" },
  { name: "Zelle", share: 7, color: "#f59e0b", users: "119M", founded: 2017, model: "Bank-embedded" },
  { name: "Other", share: 7, color: "#6b7280", users: "200M+", founded: 0, model: "Various" },
];

const CBDC_PROJECTS: CBDCProject[] = [
  { country: "China", name: "Digital Yuan (e-CNY)", status: "Live", statusColor: "#10b981", launched: "2020", technology: "Two-tier, permissioned", retailWholesale: "Retail", note: "750M+ wallets, $250B+ txns" },
  { country: "Bahamas", name: "Sand Dollar", status: "Live", statusColor: "#10b981", launched: "2020", technology: "Blockchain hybrid", retailWholesale: "Retail", note: "First national CBDC globally" },
  { country: "Nigeria", name: "eNaira", status: "Live", statusColor: "#10b981", launched: "2021", technology: "Hyperledger Fabric", retailWholesale: "Retail", note: "Financial inclusion focus" },
  { country: "Jamaica", name: "JAM-DEX", status: "Live", statusColor: "#10b981", launched: "2022", technology: "eCurrency Mint", retailWholesale: "Retail", note: "10% bonus on adoption" },
  { country: "EU", name: "Digital Euro", status: "Pilot", statusColor: "#f59e0b", launched: "2023", technology: "ECB-designed", retailWholesale: "Retail", note: "Privacy by design, €3K limit" },
  { country: "UK", name: "Digital Pound", status: "Research", statusColor: "#6366f1", launched: "TBD", technology: "Core ledger model", retailWholesale: "Retail", note: "£10K–£20K wallet limit proposal" },
  { country: "USA", name: "Digital Dollar", status: "Research", statusColor: "#6366f1", launched: "TBD", technology: "Fed evaluation", retailWholesale: "Retail/Wholesale", note: "FedNow fills near-term gap" },
  { country: "USA", name: "FedNow", status: "Live", statusColor: "#10b981", launched: "2023", technology: "Fed-operated rails", retailWholesale: "Wholesale", note: "Not CBDC — instant settlement" },
  { country: "India", name: "Digital Rupee (e₹)", status: "Pilot", statusColor: "#f59e0b", launched: "2022", technology: "RBI-managed", retailWholesale: "Both", note: "Programmable vouchers tested" },
  { country: "Brazil", name: "DREX", status: "Pilot", statusColor: "#f59e0b", launched: "2023", technology: "Ethereum-compatible", retailWholesale: "Wholesale", note: "DeFi integration explored" },
  { country: "Singapore", name: "Project Orchid", status: "Pilot", statusColor: "#f59e0b", launched: "2022", technology: "Purpose-bound money", retailWholesale: "Wholesale", note: "Programmable restrictions" },
  { country: "Canada", name: "Project Jasper", status: "Research", statusColor: "#6366f1", launched: "TBD", technology: "Corda/Ethereum tested", retailWholesale: "Wholesale", note: "Interoperability focus" },
];

const PAYMENT_STOCKS: PaymentStock[] = [
  { ticker: "V", name: "Visa", peRatio: 31.2, revenueGrowth: 10.2, takeRate: 0.11, volume: "14.8T", marketCap: "$560B", color: "#1a1fe8" },
  { ticker: "MA", name: "Mastercard", peRatio: 37.5, revenueGrowth: 12.4, takeRate: 0.12, volume: "9.0T", marketCap: "$440B", color: "#eb001b" },
  { ticker: "PYPL", name: "PayPal", peRatio: 16.8, revenueGrowth: 7.1, takeRate: 1.74, volume: "1.5T", marketCap: "$70B", color: "#003087" },
  { ticker: "SQ", name: "Block (Square)", peRatio: 38.1, revenueGrowth: 14.3, takeRate: 1.20, volume: "0.2T", marketCap: "$42B", color: "#00d64f" },
  { ticker: "ADYEN", name: "Adyen", peRatio: 52.3, revenueGrowth: 21.5, takeRate: 0.18, volume: "0.9T", marketCap: "$38B", color: "#0f2027" },
  { ticker: "FIS", name: "FIS", peRatio: 14.2, revenueGrowth: 3.8, takeRate: 0.05, volume: "0.4T", marketCap: "$35B", color: "#ff6900" },
];

// ── Tab 1: Payment Rails ──────────────────────────────────────────────────────

function PaymentRailsTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRail = useMemo(() => PAYMENT_RAILS.find(r => r.name === selected), [selected]);

  const flowNodes = [
    { label: "Customer", x: 40, y: 100 },
    { label: "Issuing Bank", x: 160, y: 40 },
    { label: "Card Network", x: 280, y: 100 },
    { label: "Acquiring Bank", x: 400, y: 40 },
    { label: "Merchant", x: 520, y: 100 },
  ];

  const flowEdges = [
    { from: 0, to: 1, label: "Auth request" },
    { from: 1, to: 2, label: "Route txn" },
    { from: 2, to: 3, label: "Approve/Decline" },
    { from: 3, to: 4, label: "Settlement" },
  ];

  return (
    <div className="space-y-6">
      {/* SVG Flow Diagram */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Card Transaction Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 580 160" className="w-full" style={{ height: 160 }}>
            {/* Edges */}
            {flowEdges.map((edge, i) => {
              const from = flowNodes[edge.from];
              const to = flowNodes[edge.to];
              const mx = (from.x + to.x) / 2;
              const my = Math.min(from.y, to.y) - 20;
              return (
                <g key={i}>
                  <path
                    d={`M${from.x + 40},${from.y + 16} Q${mx},${my} ${to.x},${to.y + 16}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                  <text
                    x={mx}
                    y={my - 4}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize={8}
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
            {/* Nodes */}
            {flowNodes.map((node, i) => (
              <g key={i} transform={`translate(${node.x}, ${node.y})`}>
                <rect
                  x={0}
                  y={0}
                  width={80}
                  height={32}
                  rx={6}
                  fill="#18181b"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                />
                <text
                  x={40}
                  y={20}
                  textAnchor="middle"
                  fill="#e4e4e7"
                  fontSize={9}
                  fontWeight="600"
                >
                  {node.label}
                </text>
              </g>
            ))}
            {/* Fee labels */}
            <text x={290} y={150} textAnchor="middle" fill="#71717a" fontSize={8}>
              Interchange: ~1.5–3% | Assessment: ~0.13% | Acquirer markup: ~0.25%
            </text>
          </svg>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Payment Rail Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Rail</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Speed</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Cost</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Max Amount</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Settlement</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Volume Score</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_RAILS.map((rail) => (
                  <tr
                    key={rail.name}
                    className={`border-b border-zinc-800/50 cursor-pointer transition-colors ${selected === rail.name ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"}`}
                    onClick={() => setSelected(selected === rail.name ? null : rail.name)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: rail.color }} />
                        <span className="text-zinc-200 font-medium">{rail.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{rail.speed}</td>
                    <td className="py-3 px-3 text-zinc-300">{rail.costRange}</td>
                    <td className="py-3 px-3 text-zinc-300">{rail.maxAmount}</td>
                    <td className="py-3 px-3 text-zinc-400">{rail.settlementType}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-zinc-700 rounded h-1.5">
                          <div
                            className="h-1.5 rounded"
                            style={{ width: `${rail.volume}%`, background: rail.color }}
                          />
                        </div>
                        <span className="text-zinc-400 w-8">{rail.volume}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Rail Detail */}
      {selectedRail && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                {selectedRail.name} — Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedRail.useCases.map((uc) => (
                  <Badge key={uc} variant="outline" className="border-indigo-500/40 text-indigo-300 text-xs">
                    {uc}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Zap className="w-4 h-4 text-yellow-400" />, title: "RTP Growth", body: "Real-Time Payments volume grew 40%+ YoY in 2024. FedNow added 900+ institutions in its first year.", color: "yellow" },
          { icon: <Globe className="w-4 h-4 text-emerald-400" />, title: "SWIFT gpi", body: "SWIFT's global payments initiative enables same-day cross-border transfers for 50%+ of transactions.", color: "teal" },
          { icon: <Shield className="w-4 h-4 text-primary" />, title: "Fedwire RTGS", body: "Fedwire settles $4+ trillion daily — the backbone of US large-value payments since 1918.", color: "blue" },
        ].map((card) => (
          <Card key={card.title} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {card.icon}
                <span className="text-sm font-semibold text-zinc-200">{card.title}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 2: Card Economics ─────────────────────────────────────────────────────

function CardEconomicsTab() {
  const [activeCard, setActiveCard] = useState<CardTier>(INTERCHANGE_TIERS[2]);

  const waterfallData = useMemo(() => {
    const saleAmount = 100;
    const mdr = activeCard.total;
    const issuerAmount = (activeCard.issuerPct / mdr) * mdr;
    const networkAmount = activeCard.networkPct;
    const acquirerAmount = activeCard.acquirerPct;
    const merchantReceives = saleAmount - mdr;
    return { saleAmount, issuerAmount, networkAmount, acquirerAmount, merchantReceives, mdr };
  }, [activeCard]);

  const maxBarH = 120;
  const barW = 60;
  const barGap = 20;
  const svgW = (barW + barGap) * 5 + 40;
  const svgH = maxBarH + 60;

  const bars = [
    { label: "Sale", value: waterfallData.saleAmount, color: "#6366f1", isTotal: true },
    { label: "Issuer Fee", value: -activeCard.issuerPct, color: "#ef4444", isTotal: false },
    { label: "Network Fee", value: -activeCard.networkPct, color: "#f59e0b", isTotal: false },
    { label: "Acquirer Fee", value: -activeCard.acquirerPct, color: "#f97316", isTotal: false },
    { label: "Merchant Gets", value: waterfallData.merchantReceives, color: "#10b981", isTotal: true },
  ];

  let runningY = maxBarH;

  return (
    <div className="space-y-6">
      {/* Card Type Selector */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            Select Card Type — Interchange Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INTERCHANGE_TIERS.map((tier) => (
              <button
                key={tier.cardType}
                onClick={() => setActiveCard(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeCard.cardType === tier.cardType
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {tier.cardType}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waterfall SVG */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Fee Waterfall — {activeCard.cardType} (% of $100 sale)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
            {bars.map((bar, i) => {
              const absVal = Math.abs(bar.value);
              const barH = (absVal / 100) * maxBarH;
              let yStart: number;
              if (bar.isTotal) {
                yStart = maxBarH - barH;
              } else {
                yStart = runningY - barH;
              }
              if (!bar.isTotal) {
                runningY -= barH;
              }
              const x = 20 + i * (barW + barGap);
              return (
                <g key={bar.label}>
                  <rect
                    x={x}
                    y={yStart}
                    width={barW}
                    height={barH}
                    rx={4}
                    fill={bar.color}
                    opacity={0.85}
                  />
                  <text
                    x={x + barW / 2}
                    y={yStart - 6}
                    textAnchor="middle"
                    fill="#e4e4e7"
                    fontSize={9}
                    fontWeight="600"
                  >
                    {bar.isTotal ? `$${bar.value.toFixed(2)}` : `-${Math.abs(bar.value).toFixed(2)}%`}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={svgH - 8}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize={8}
                  >
                    {bar.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Fee Breakdown Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300">Fee Breakdown — Who Gets What</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { party: "Card Issuer (bank)", pct: activeCard.issuerPct, color: "#ef4444", desc: "Rewards, fraud losses, credit risk" },
              { party: "Card Network (Visa/MC)", pct: activeCard.networkPct, color: "#f59e0b", desc: "Infrastructure, authorization, brand" },
              { party: "Acquirer / Processor", pct: activeCard.acquirerPct, color: "#f97316", desc: "Terminal support, settlement, risk mgmt" },
              { party: "Merchant Discount Rate", pct: activeCard.total, color: "#6366f1", desc: "Total cost to merchant" },
            ].map((item) => (
              <div key={item.party} className="flex items-center gap-4">
                <div className="w-40 text-xs text-zinc-300 font-medium shrink-0">{item.party}</div>
                <div className="flex-1 bg-zinc-800 rounded h-2">
                  <div
                    className="h-2 rounded"
                    style={{ width: `${(item.pct / 4) * 100}%`, background: item.color }}
                  />
                </div>
                <div className="w-16 text-right text-xs font-mono" style={{ color: item.color }}>
                  {item.pct.toFixed(2)}%
                </div>
                <div className="hidden md:block w-56 text-xs text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MDR Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <DollarSign className="w-4 h-4" />
              Durbin Amendment Impact
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The Durbin Amendment (2010) capped debit interchange at ~$0.21 + 0.05% for large banks, cutting issuer revenue ~70%. Small banks are exempt, creating a two-tier system.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              Interchange Economics
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              US merchants paid $172B in card fees in 2023. Visa and Mastercard combined earned ~$50B in revenue. Rewards cards cost merchants ~0.5% more than basic cards.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 3: Digital Wallets ────────────────────────────────────────────────────

function DigitalWalletsTab() {
  const [hovered, setHovered] = useState<string | null>(null);

  const total = WALLET_SHARES.reduce((sum, w) => sum + w.share, 0);
  const cx = 130;
  const cy = 130;
  const r = 110;

  // Build pie slices
  let cumAngle = -Math.PI / 2;
  const slices = WALLET_SHARES.map((w) => {
    const angle = (w.share / total) * Math.PI * 2;
    const startAngle = cumAngle;
    cumAngle += angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = startAngle + angle / 2;
    const lx = cx + (r + 18) * Math.cos(midAngle);
    const ly = cy + (r + 18) * Math.sin(midAngle);
    return { ...w, startAngle, endAngle: cumAngle, x1, y1, x2, y2, largeArc, midAngle, lx, ly };
  });

  const networkEffectsData = [
    { name: "PayPal", score: 9.2, color: "#3b82f6" },
    { name: "Apple Pay", score: 8.8, color: "#6366f1" },
    { name: "Zelle", score: 8.5, color: "#f59e0b" },
    { name: "Venmo", score: 7.9, color: "#8b5cf6" },
    { name: "Cash App", score: 7.5, color: "#10b981" },
    { name: "Google Pay", score: 7.1, color: "#0ea5e9" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              Global Digital Wallet Market Share (2024)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox="0 0 260 260" className="w-full" style={{ height: 260 }}>
              {slices.map((slice) => {
                const isHovered = hovered === slice.name;
                const scaledR = isHovered ? r + 8 : r;
                const x1 = cx + scaledR * Math.cos(slice.startAngle);
                const y1 = cy + scaledR * Math.sin(slice.startAngle);
                const x2 = cx + scaledR * Math.cos(slice.endAngle);
                const y2 = cy + scaledR * Math.sin(slice.endAngle);
                const largeArc = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;
                return (
                  <path
                    key={slice.name}
                    d={`M${cx},${cy} L${x1},${y1} A${scaledR},${scaledR} 0 ${largeArc},1 ${x2},${y2} Z`}
                    fill={slice.color}
                    opacity={hovered && hovered !== slice.name ? 0.45 : 0.9}
                    stroke="#18181b"
                    strokeWidth={2}
                    style={{ cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={() => setHovered(slice.name)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
              {hovered && (() => {
                const sl = slices.find(s => s.name === hovered);
                if (!sl) return null;
                return (
                  <text x={cx} y={cy} textAnchor="middle" fill="#e4e4e7" fontSize={11} fontWeight="700">
                    <tspan x={cx} dy="-6">{sl.name}</tspan>
                    <tspan x={cx} dy="16" fill="#a1a1aa" fontSize={9}>{sl.share}%</tspan>
                  </text>
                );
              })()}
              {!hovered && (
                <text x={cx} y={cy} textAnchor="middle" fill="#71717a" fontSize={9}>
                  <tspan x={cx} dy="-6">Hover to</tspan>
                  <tspan x={cx} dy="14">explore</tspan>
                </text>
              )}
            </svg>
          </CardContent>
        </Card>

        {/* Wallet Legend + Details */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Wallet Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {WALLET_SHARES.filter(w => w.name !== "Other").map((w) => (
                <div
                  key={w.name}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${hovered === w.name ? "bg-zinc-800" : "hover:bg-zinc-800/40"}`}
                  onMouseEnter={() => setHovered(w.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: w.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">{w.name}</span>
                      <span className="text-xs text-zinc-400">{w.share}%</span>
                    </div>
                    <div className="text-xs text-zinc-500">{w.users} users · {w.model}</div>
                  </div>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400 shrink-0">
                    {w.founded > 0 ? w.founded : "—"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Effects Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Network Effects Score (1–10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {networkEffectsData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-20 text-xs text-zinc-300">{item.name}</div>
                <div className="flex-1 bg-zinc-800 rounded h-3">
                  <motion.div
                    className="h-3 rounded"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.score / 10) * 100}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                <div className="w-8 text-right text-xs font-mono" style={{ color: item.color }}>
                  {item.score}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            Network effects score combines: user base size, merchant acceptance, cross-border reach, and integration density.
          </p>
        </CardContent>
      </Card>

      {/* Key Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Zap className="w-4 h-4 text-yellow-400" />, title: "Super App Race", body: "Cash App and PayPal are adding investing, crypto, BNPL, and banking features to increase stickiness and ARPU." },
          { icon: <Lock className="w-4 h-4 text-indigo-400" />, title: "Tokenization", body: "Apple Pay and Google Pay use device tokens so merchants never see the real card number — reducing fraud by ~80%." },
          { icon: <Globe className="w-4 h-4 text-emerald-400" />, title: "BNPL Integration", body: "Buy Now Pay Later volume reached $400B globally in 2024. Wallets that offer BNPL see 23% higher transaction rates." },
        ].map((card) => (
          <Card key={card.title} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {card.icon}
                <span className="text-sm font-semibold text-zinc-200">{card.title}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 4: CBDC & Stablecoins ─────────────────────────────────────────────────

function CBDCTab() {
  const [filter, setFilter] = useState<"All" | "Live" | "Pilot" | "Research">("All");

  const filtered = useMemo(
    () => filter === "All" ? CBDC_PROJECTS : CBDC_PROJECTS.filter(p => p.status === filter),
    [filter]
  );

  const statusCounts = useMemo(() => ({
    Live: CBDC_PROJECTS.filter(p => p.status === "Live").length,
    Pilot: CBDC_PROJECTS.filter(p => p.status === "Pilot").length,
    Research: CBDC_PROJECTS.filter(p => p.status === "Research").length,
  }), []);

  const stablecoins = [
    { name: "USDT (Tether)", supply: "$120B", backing: "USD + T-Bills", issuer: "Tether Ltd", trust: 6 },
    { name: "USDC (Circle)", supply: "$43B", backing: "USD + T-Bills", issuer: "Circle", trust: 9 },
    { name: "DAI", supply: "$5B", backing: "Crypto collateral", issuer: "MakerDAO", trust: 7 },
    { name: "FDUSD", supply: "$4B", backing: "USD deposits", issuer: "First Digital", trust: 7 },
    { name: "PYUSD (PayPal)", supply: "$0.7B", backing: "USD deposits", issuer: "PayPal / Paxos", trust: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        {(["Live", "Pilot", "Research"] as const).map((st) => {
          const colors = { Live: "emerald", Pilot: "yellow", Research: "indigo" };
          const hexMap = { Live: "#10b981", Pilot: "#f59e0b", Research: "#6366f1" };
          return (
            <Card key={st} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: hexMap[st] }}>
                  {statusCounts[st]}
                </div>
                <div className="text-xs text-zinc-400">{st}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["All", "Live", "Pilot", "Research"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter === f
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* CBDC Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            CBDC Projects Worldwide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Country</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Name</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Status</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Since</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Type</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium hidden md:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proj) => (
                  <tr key={proj.name} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 text-zinc-200 font-medium">{proj.country}</td>
                    <td className="py-3 px-3 text-zinc-300">{proj.name}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: proj.statusColor, color: proj.statusColor }}
                      >
                        {proj.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">{proj.launched}</td>
                    <td className="py-3 px-3 text-zinc-400">{proj.retailWholesale}</td>
                    <td className="py-3 px-3 text-zinc-500 hidden md:table-cell">{proj.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FedNow vs Digital Dollar */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-indigo-400" />
            FedNow vs. Digital Dollar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "FedNow (Launched 2023)",
                color: "#10b981",
                points: [
                  "Instant settlement, 24/7/365",
                  "Bank-to-bank infrastructure (not consumer-facing)",
                  "No new form of money — uses existing USD deposits",
                  "900+ participating institutions",
                  "$500K transaction limit",
                  "Fills gap without CBDC privacy concerns",
                ],
              },
              {
                title: "Digital Dollar (Proposed)",
                color: "#6366f1",
                points: [
                  "Direct Fed liability — like digital cash",
                  "Could bypass commercial banks",
                  "Programmable: expiry dates, spending restrictions possible",
                  "Major privacy concerns from Congress",
                  "Financial inclusion for unbanked 5.9M US households",
                  "No legislation passed as of 2025",
                ],
              },
            ].map((item) => (
              <div key={item.title} className="space-y-2">
                <div className="text-sm font-semibold" style={{ color: item.color }}>{item.title}</div>
                <ul className="space-y-1">
                  {item.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                      <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: item.color }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stablecoins */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            Major Stablecoins — Private Digital Dollars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stablecoins.map((sc) => (
              <div key={sc.name} className="flex items-center gap-4">
                <div className="w-36 text-xs text-zinc-200 font-medium shrink-0">{sc.name}</div>
                <div className="w-16 text-xs text-zinc-400 shrink-0">{sc.supply}</div>
                <div className="w-36 text-xs text-zinc-500 hidden md:block shrink-0">{sc.backing}</div>
                <div className="flex-1 bg-zinc-800 rounded h-2">
                  <div
                    className="h-2 rounded bg-indigo-500"
                    style={{ width: `${sc.trust * 10}%` }}
                  />
                </div>
                <div className="w-16 text-right text-xs text-zinc-400">Trust {sc.trust}/10</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            Stablecoins processed $27T in transactions in 2024 — exceeding Visa's annual volume. USDT alone handles $50B+ daily.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 5: Payment Stocks ─────────────────────────────────────────────────────

function PaymentStocksTab() {
  const noiseIdx = { base: 200 };
  const getN = () => NOISE[noiseIdx.base++ % NOISE.length];

  const revenueHistory = useMemo(() => {
    return PAYMENT_STOCKS.map((stock) => {
      const bars: number[] = [];
      let val = 100;
      for (let i = 0; i < 8; i++) {
        val = val * (1 + (stock.revenueGrowth / 100) * (0.7 + getN() * 0.6));
        bars.push(val);
      }
      return { ticker: stock.ticker, color: stock.color, bars, name: stock.name };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxRevVal = Math.max(...revenueHistory.flatMap(s => s.bars));
  const chartW = 480;
  const chartH = 180;
  const padL = 40;
  const padB = 30;
  const innerW = chartW - padL - 20;
  const innerH = chartH - padB - 10;
  const years = ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Payment Company Fundamentals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Ticker</th>
                  <th className="text-left py-3 px-3 text-zinc-400 font-medium">Company</th>
                  <th className="text-right py-3 px-3 text-zinc-400 font-medium">P/E</th>
                  <th className="text-right py-3 px-3 text-zinc-400 font-medium">Rev Growth</th>
                  <th className="text-right py-3 px-3 text-zinc-400 font-medium">Take Rate</th>
                  <th className="text-right py-3 px-3 text-zinc-400 font-medium">Volume</th>
                  <th className="text-right py-3 px-3 text-zinc-400 font-medium hidden md:table-cell">Mkt Cap</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_STOCKS.map((stock) => (
                  <tr key={stock.ticker} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: stock.color }} />
                        <span className="font-mono font-bold text-zinc-200">{stock.ticker}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{stock.name}</td>
                    <td className="py-3 px-3 text-right text-zinc-300">{stock.peRatio}x</td>
                    <td className="py-3 px-3 text-right">
                      <span className={stock.revenueGrowth >= 10 ? "text-emerald-400" : "text-zinc-300"}>
                        +{stock.revenueGrowth}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-300">{stock.takeRate.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right text-zinc-300">{stock.volume}</td>
                    <td className="py-3 px-3 text-right text-zinc-300 hidden md:table-cell">{stock.marketCap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Growth Chart */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Indexed Revenue Growth (2017 = 100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: chartH }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const y = padB / 2 + innerH * (1 - pct);
              const val = Math.round(maxRevVal * pct);
              return (
                <g key={pct}>
                  <line x1={padL} y1={y} x2={chartW - 20} y2={y} stroke="#3f3f46" strokeWidth={0.5} />
                  <text x={padL - 4} y={y + 4} textAnchor="end" fill="#71717a" fontSize={8}>
                    {val}
                  </text>
                </g>
              );
            })}
            {/* Lines */}
            {revenueHistory.map((series) => {
              const pts = series.bars.map((v, i) => {
                const x = padL + (i / (series.bars.length - 1)) * innerW;
                const y = padB / 2 + innerH * (1 - v / maxRevVal);
                return `${x},${y}`;
              });
              return (
                <polyline
                  key={series.ticker}
                  points={pts.join(" ")}
                  fill="none"
                  stroke={series.color}
                  strokeWidth={2}
                  opacity={0.85}
                />
              );
            })}
            {/* X-axis labels */}
            {years.map((yr, i) => {
              const x = padL + (i / (years.length - 1)) * innerW;
              return (
                <text key={yr} x={x} y={chartH - 6} textAnchor="middle" fill="#71717a" fontSize={8}>
                  {yr}
                </text>
              );
            })}
            {/* Legend */}
            {revenueHistory.map((series, i) => (
              <g key={series.ticker} transform={`translate(${padL + i * 72}, ${chartH - padB + 10})`}>
                <line x1={0} y1={4} x2={12} y2={4} stroke={series.color} strokeWidth={2} />
                <text x={15} y={8} fill="#a1a1aa" fontSize={8}>{series.ticker}</text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Business Model Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <Shield className="w-4 h-4 text-primary" />,
            title: "Visa / Mastercard",
            subtitle: "Pure networks",
            body: "Asset-light model. Don't take credit risk — just pass transactions between banks. ~80%+ operating margins. Volume-driven revenue.",
            color: "#3b82f6",
          },
          {
            icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
            title: "PayPal / Block",
            subtitle: "Merchant/consumer platforms",
            body: "Take more risk — offer credit, hold funds, manage fraud. Lower margins but higher revenue per transaction (1–2% take rates vs 0.1%).",
            color: "#10b981",
          },
          {
            icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
            title: "FIS / Fiserv",
            subtitle: "Backend processors",
            body: "B2B infrastructure — core banking, card processing, ATM networks. Sticky, recurring revenue but slower growth. P/E discounts vs networks.",
            color: "#f59e0b",
          },
        ].map((card) => (
          <Card key={card.title} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1">
                {card.icon}
                <span className="text-sm font-semibold text-zinc-200">{card.title}</span>
              </div>
              <div className="text-xs mb-2" style={{ color: card.color }}>{card.subtitle}</div>
              <p className="text-xs text-zinc-400 leading-relaxed">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Payment Systems</h1>
              <p className="text-sm text-zinc-400">Fintech infrastructure, digital payments, and the future of money</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { icon: <Clock className="w-3 h-3" />, label: "RTP: &lt;5 seconds" },
              { icon: <DollarSign className="w-3 h-3" />, label: "$172B merchant fees (2023)" },
              { icon: <Globe className="w-3 h-3" />, label: "130+ CBDC projects globally" },
              { icon: <TrendingUp className="w-3 h-3" />, label: "Stablecoins: $27T volume (2024)" },
            ].map((chip) => (
              <div
                key={chip.label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-300"
              >
                <span className="text-indigo-400">{chip.icon}</span>
                <span dangerouslySetInnerHTML={{ __html: chip.label }} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="rails">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="rails" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Payment Rails
            </TabsTrigger>
            <TabsTrigger value="card" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Card Economics
            </TabsTrigger>
            <TabsTrigger value="wallets" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Digital Wallets
            </TabsTrigger>
            <TabsTrigger value="cbdc" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              CBDC & Stablecoins
            </TabsTrigger>
            <TabsTrigger value="stocks" className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Payment Stocks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rails" className="data-[state=inactive]:hidden">
            <PaymentRailsTab />
          </TabsContent>
          <TabsContent value="card" className="data-[state=inactive]:hidden">
            <CardEconomicsTab />
          </TabsContent>
          <TabsContent value="wallets" className="data-[state=inactive]:hidden">
            <DigitalWalletsTab />
          </TabsContent>
          <TabsContent value="cbdc" className="data-[state=inactive]:hidden">
            <CBDCTab />
          </TabsContent>
          <TabsContent value="stocks" className="data-[state=inactive]:hidden">
            <PaymentStocksTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
