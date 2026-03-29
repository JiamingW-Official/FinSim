"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ShieldCheck,
  Globe,
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  XCircle,
  Scale,
  Building2,
  Landmark,
  ArrowRightLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 852;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 852;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Prohibition {
  arabic: string;
  english: string;
  description: string;
  example: string;
  icon: string;
}

interface SukukStructure {
  id: string;
  name: string;
  arabic: string;
  description: string;
  mechanism: string;
  pros: string[];
  cons: string[];
  marketShare: number;
  color: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "entity" | "asset" | "payment";
}

interface FlowEdge {
  from: string;
  to: string;
  label: string;
  dashed?: boolean;
}

interface IssuingCountry {
  country: string;
  flag: string;
  outstanding: number;
  share: number;
  primaryCurrency: string;
  yieldRange: string;
  rating: string;
}

interface ComparisonRow {
  feature: string;
  sukuk: string;
  bond: string;
  sukukFav?: boolean | null;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const PROHIBITIONS: Prohibition[] = [
  {
    arabic: "Riba",
    english: "Interest / Usury",
    description:
      "Any guaranteed, predetermined return on money lent or deposited. The Quran explicitly prohibits riba in multiple verses. Money has no intrinsic time value in Islamic economics.",
    example:
      "A conventional bank loan charging 5% annual interest. Treasury bonds paying fixed coupon irrespective of underlying asset performance.",
    icon: "💰",
  },
  {
    arabic: "Gharar",
    english: "Excessive Uncertainty",
    description:
      "Contracts with excessive ambiguity in terms, price, or subject matter. Minor uncertainty is tolerated, but transactions where key elements are unknowable at contract formation are void.",
    example:
      "Short-selling borrowed securities, derivatives with highly speculative payoffs, insurance where payout is entirely uncertain.",
    icon: "🎲",
  },
  {
    arabic: "Maysir",
    english: "Gambling / Speculation",
    description:
      "Transactions whose outcome depends purely on chance, creating wealth through zero-sum speculation rather than productive economic activity. Linked to gharar.",
    example:
      "Binary options, lottery bonds, highly leveraged speculative positions without underlying economic activity.",
    icon: "🎰",
  },
  {
    arabic: "Haram Sectors",
    english: "Forbidden Industries",
    description:
      "Investment in businesses whose primary activity is prohibited under Islamic law. Even if the instrument is structured correctly, the underlying business must be halal.",
    example:
      "Alcohol producers, pork-related businesses, conventional banking, tobacco companies, weapons manufacturing, adult entertainment.",
    icon: "🚫",
  },
  {
    arabic: "Jahala",
    english: "Ignorance / Opacity",
    description:
      "Contracts where one party is unaware of essential terms. Requires full disclosure and transparency in all Islamic finance transactions. Related to but distinct from gharar.",
    example:
      "Hidden fees in structured products, undisclosed conflicts of interest, opaque pricing mechanisms that disadvantage one party.",
    icon: "🔍",
  },
];

const SUKUK_STRUCTURES: SukukStructure[] = [
  {
    id: "ijara",
    name: "Ijara Sukuk",
    arabic: "صكوك الإجارة",
    description:
      "Based on a sale-and-leaseback arrangement. The SPV purchases an asset from the originator, then leases it back. Investors receive rental income from the lease as their return.",
    mechanism:
      "Originator sells asset → SPV issues sukuk certificates → Proceeds fund purchase → SPV leases asset back to originator → Rental payments flow to investors → Asset returned at maturity",
    pros: [
      "Closest to conventional bonds in cash flow structure",
      "Widely accepted by Shariah scholars globally",
      "Fixed rental payments provide predictable returns",
      "Backed by tangible real assets",
    ],
    cons: [
      "Requires identifiable, tangible underlying asset",
      "Asset must remain Shariah-compliant throughout tenor",
      "Higher structuring costs than conventional bonds",
      "Asset transfer may trigger stamp duty or taxes",
    ],
    marketShare: 32,
    color: "#3b82f6",
    nodes: [
      { id: "orig", label: "Originator", x: 80, y: 90, type: "entity" },
      { id: "spv", label: "SPV / Trustee", x: 240, y: 90, type: "entity" },
      { id: "inv", label: "Investors", x: 400, y: 90, type: "entity" },
      { id: "asset", label: "Asset", x: 160, y: 200, type: "asset" },
    ],
    edges: [
      { from: "orig", to: "spv", label: "Sells asset" },
      { from: "spv", to: "inv", label: "Issues certificates" },
      { from: "inv", to: "spv", label: "Proceeds", dashed: true },
      { from: "spv", to: "orig", label: "Leases back" },
      { from: "orig", to: "inv", label: "Rental income", dashed: true },
    ],
  },
  {
    id: "murabaha",
    name: "Murabaha Sukuk",
    arabic: "صكوك المرابحة",
    description:
      "Cost-plus financing structure. SPV purchases a commodity or asset at cost price, then sells it to the obligor at a marked-up deferred price. The markup is the investor return.",
    mechanism:
      "SPV buys commodity at cost → Sells to obligor at cost+markup on deferred basis → Obligor makes installment payments → Payments distributed to certificate holders",
    pros: [
      "Suitable for short-term and working capital financing",
      "Widely used for corporate and sovereign borrowing",
      "Simple structure well understood by issuers",
      "Markup known upfront, providing certainty",
    ],
    cons: [
      "Non-tradeable in secondary market (debt instrument)",
      "Commodity must be Shariah-compliant and deliverable",
      "Limited to single transaction, not revolving",
      "Cannot be used for refinancing existing debt",
    ],
    marketShare: 18,
    color: "#8b5cf6",
    nodes: [
      { id: "inv", label: "Investors", x: 80, y: 90, type: "entity" },
      { id: "spv", label: "SPV", x: 240, y: 90, type: "entity" },
      { id: "seller", label: "Commodity Seller", x: 240, y: 200, type: "entity" },
      { id: "oblig", label: "Obligor", x: 400, y: 90, type: "entity" },
    ],
    edges: [
      { from: "inv", to: "spv", label: "Subscribe" },
      { from: "spv", to: "seller", label: "Purchases commodity" },
      { from: "spv", to: "oblig", label: "Sells at cost+markup" },
      { from: "oblig", to: "inv", label: "Deferred payments", dashed: true },
    ],
  },
  {
    id: "musharakah",
    name: "Musharakah Sukuk",
    arabic: "صكوك المشاركة",
    description:
      "Joint venture partnership structure. Investors and issuer co-own a venture or asset. Returns are profit/loss sharing based on pre-agreed ratios. Closest to equity in nature.",
    mechanism:
      "SPV and originator form joint venture → Investors fund SPV share → Venture generates profits → Profits distributed per agreed ratio → Principal returned through buy-out",
    pros: [
      "True profit-sharing aligns interests of all parties",
      "Tradeable in secondary market as equity-like instrument",
      "Suitable for large infrastructure and project finance",
      "Widely accepted among Islamic scholars",
    ],
    cons: [
      "Returns variable and uncertain (not fixed)",
      "Complex documentation and governance",
      "Losses also shared, increasing investor risk",
      "Requires transparent accounting of joint venture",
    ],
    marketShare: 22,
    color: "#10b981",
    nodes: [
      { id: "inv", label: "Investors", x: 80, y: 90, type: "entity" },
      { id: "spv", label: "SPV", x: 240, y: 90, type: "entity" },
      { id: "jv", label: "Joint Venture", x: 320, y: 200, type: "asset" },
      { id: "orig", label: "Originator", x: 400, y: 90, type: "entity" },
    ],
    edges: [
      { from: "inv", to: "spv", label: "Invest funds" },
      { from: "spv", to: "jv", label: "Contribute capital" },
      { from: "orig", to: "jv", label: "Contribute capital/assets" },
      { from: "jv", to: "inv", label: "Profit distributions", dashed: true },
    ],
  },
  {
    id: "mudarabah",
    name: "Mudarabah Sukuk",
    arabic: "صكوك المضاربة",
    description:
      "Silent partnership structure. Investors provide capital (rab al-mal) while the issuer manages the business (mudarib). Profits split per agreement; losses borne by investors unless negligence.",
    mechanism:
      "Investors provide 100% capital → Issuer manages business as mudarib → Profits split per agreed ratio (e.g., 80/20) → Investors bear capital losses → Mudarib bears time/effort losses",
    pros: [
      "No requirement for tangible underlying asset",
      "Flexible for business financing",
      "Manager incentivized by profit share",
      "Widely used for Islamic banks' own sukuk",
    ],
    cons: [
      "Investors bear full capital loss risk",
      "Difficult to monitor manager actions",
      "Returns are variable, not guaranteed",
      "Limited control rights for investors",
    ],
    marketShare: 15,
    color: "#f59e0b",
    nodes: [
      { id: "inv", label: "Investors (Rab al-Mal)", x: 60, y: 90, type: "entity" },
      { id: "spv", label: "SPV", x: 240, y: 90, type: "entity" },
      { id: "mudarib", label: "Mudarib (Manager)", x: 400, y: 90, type: "entity" },
      { id: "biz", label: "Business Activity", x: 240, y: 200, type: "asset" },
    ],
    edges: [
      { from: "inv", to: "spv", label: "100% capital" },
      { from: "spv", to: "mudarib", label: "Entrusts capital" },
      { from: "mudarib", to: "biz", label: "Manages" },
      { from: "biz", to: "inv", label: "Profit share", dashed: true },
    ],
  },
  {
    id: "wakala",
    name: "Wakala Sukuk",
    arabic: "صكوك الوكالة",
    description:
      "Agency-based structure. SPV appoints the originator as agent (wakeel) to manage a pool of Shariah-compliant assets. Agent earns performance fee; investors receive returns from asset pool.",
    mechanism:
      "SPV issues certificates → Appoints originator as wakeel → Wakeel invests in Shariah-compliant assets → Asset pool returns distributed to investors → Performance fee paid to agent",
    pros: [
      "Flexible asset pool composition",
      "Can use diverse underlying assets",
      "Increasingly popular for sovereign sukuk",
      "Clean structure widely approved by scholars",
    ],
    cons: [
      "Agent performance risk concentrated in originator",
      "Asset pool quality monitoring required",
      "Complexity in defining eligible assets",
      "Performance incentives must be Shariah-compliant",
    ],
    marketShare: 13,
    color: "#ef4444",
    nodes: [
      { id: "inv", label: "Investors", x: 80, y: 90, type: "entity" },
      { id: "spv", label: "SPV / Trustee", x: 240, y: 90, type: "entity" },
      { id: "wakeel", label: "Wakeel (Agent)", x: 400, y: 90, type: "entity" },
      { id: "pool", label: "Asset Pool", x: 320, y: 200, type: "asset" },
    ],
    edges: [
      { from: "inv", to: "spv", label: "Subscribe" },
      { from: "spv", to: "wakeel", label: "Appoints agent" },
      { from: "wakeel", to: "pool", label: "Manages assets" },
      { from: "pool", to: "inv", label: "Returns + principal", dashed: true },
    ],
  },
];

const COUNTRIES: IssuingCountry[] = [
  { country: "Malaysia", flag: "🇲🇾", outstanding: 312, share: 38.2, primaryCurrency: "MYR / USD", yieldRange: "3.2–5.8%", rating: "A3 / A-" },
  { country: "Saudi Arabia", flag: "🇸🇦", outstanding: 198, share: 24.3, primaryCurrency: "SAR / USD", yieldRange: "4.1–6.2%", rating: "A1 / A+" },
  { country: "UAE", flag: "🇦🇪", outstanding: 124, share: 15.2, primaryCurrency: "AED / USD", yieldRange: "3.8–5.5%", rating: "Aa2 / AA" },
  { country: "Indonesia", flag: "🇮🇩", outstanding: 89, share: 10.9, primaryCurrency: "IDR / USD", yieldRange: "5.5–8.3%", rating: "Baa2 / BBB" },
  { country: "Turkey", flag: "🇹🇷", outstanding: 42, share: 5.2, primaryCurrency: "TRY / USD", yieldRange: "8.5–14.2%", rating: "B3 / B+" },
  { country: "Others", flag: "🌍", outstanding: 51, share: 6.2, primaryCurrency: "Various", yieldRange: "Varies", rating: "Various" },
];

const ISSUANCE_BY_YEAR: { year: number; sovereign: number; corporate: number }[] = [
  { year: 2015, sovereign: 68, corporate: 48 },
  { year: 2016, sovereign: 74, corporate: 53 },
  { year: 2017, sovereign: 91, corporate: 61 },
  { year: 2018, sovereign: 87, corporate: 57 },
  { year: 2019, sovereign: 105, corporate: 70 },
  { year: 2020, sovereign: 138, corporate: 74 },
  { year: 2021, sovereign: 148, corporate: 86 },
  { year: 2022, sovereign: 132, corporate: 79 },
  { year: 2023, sovereign: 156, corporate: 95 },
  { year: 2024, sovereign: 172, corporate: 108 },
];

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "Ownership of underlying asset", sukuk: "Yes — certificate holders co-own asset/pool", bond: "No — pure debt obligation of issuer", sukukFav: true },
  { feature: "Interest / Riba", sukuk: "Prohibited — returns tied to asset performance", bond: "Fixed or floating coupon (interest)", sukukFav: true },
  { feature: "Asset backing", sukuk: "Required — tangible asset or business activity", bond: "Not required — may be unsecured", sukukFav: true },
  { feature: "Shariah compliance", sukuk: "Mandated — Shariah board approval required", bond: "Not applicable", sukukFav: null },
  { feature: "Secondary market trading", sukuk: "Varies — equity-based tradeable; debt-based not", bond: "Fully tradeable in most markets", sukukFav: false },
  { feature: "Investor base", sukuk: "Islamic + conventional investors (crossover)", bond: "Conventional investors primarily", sukukFav: null },
  { feature: "Return structure", sukuk: "Profit share, rental income, or markup", bond: "Coupon payments (interest)", sukukFav: null },
  { feature: "Principal repayment", sukuk: "Asset sale proceeds or purchase undertaking", bond: "Full face value at maturity", sukukFav: null },
  { feature: "Documentation", sukuk: "More complex — additional SPV/trust layer", bond: "Relatively standardized", sukukFav: false },
  { feature: "Rating penetration", sukuk: "Growing — most large issues rated", bond: "Well-established ratings ecosystem", sukukFav: false },
  { feature: "Issuance cost", sukuk: "Higher — Shariah structuring, legal, SPV costs", bond: "Lower direct issuance cost", sukukFav: false },
  { feature: "Default resolution", sukuk: "More complex — asset recovery involved", bond: "Creditor hierarchy well-defined", sukukFav: false },
  { feature: "Innovation / ESG", sukuk: "Green sukuk rapidly growing (sovereign + corporate)", bond: "Green bonds well-established", sukukFav: null },
  { feature: "Regulatory framework", sukuk: "Developing globally; strong in GCC/SEA", bond: "Mature in most jurisdictions", sukukFav: false },
  { feature: "Market size (2024)", sukuk: "~$816bn outstanding globally", bond: "~$130 trillion global bond market", sukukFav: null },
];

const HALAL_SECTORS = [
  { sector: "Technology (non-weaponry)", halal: true, note: "Software, hardware, telecoms" },
  { sector: "Healthcare & Pharmaceuticals", halal: true, note: "Excluding non-halal ingredients" },
  { sector: "Real Estate (non-REIT)", halal: true, note: "Avoid hotels with alcohol sales" },
  { sector: "Manufacturing (halal goods)", halal: true, note: "Halal food, consumer products" },
  { sector: "Renewable Energy", halal: true, note: "Solar, wind, hydro" },
  { sector: "Education", halal: true, note: "Broadly permissible" },
  { sector: "Conventional Banking", halal: false, note: "Interest-based business model" },
  { sector: "Alcohol & Beverages", halal: false, note: "Production and distribution" },
  { sector: "Tobacco", halal: false, note: "Prohibited as harmful" },
  { sector: "Pork & Pork Products", halal: false, note: "Explicitly haram in Quran" },
  { sector: "Weapons (offensive)", halal: false, note: "Controversial; many scholars prohibit" },
  { sector: "Adult Entertainment", halal: false, note: "Prohibited under Islamic law" },
];

// ── SVG Components ─────────────────────────────────────────────────────────────

function FlowDiagram({ structure }: { structure: SukukStructure }) {
  const nodeMap = useMemo(() => {
    const m: Record<string, FlowNode> = {};
    for (const n of structure.nodes) m[n.id] = n;
    return m;
  }, [structure]);

  return (
    <svg viewBox="0 0 500 270" className="w-full h-48" style={{ overflow: "visible" }}>
      {/* Edges */}
      {structure.edges.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return null;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 - 18;
        return (
          <g key={i}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={edge.dashed ? "#6b7280" : structure.color}
              strokeWidth={1.5}
              strokeDasharray={edge.dashed ? "5,3" : undefined}
              strokeOpacity={0.7}
              markerEnd="url(#arrow)"
            />
            <text x={mx} y={my} textAnchor="middle" fill="#9ca3af" fontSize={8.5}>
              {edge.label}
            </text>
          </g>
        );
      })}
      {/* Arrow marker */}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
        </marker>
      </defs>
      {/* Nodes */}
      {structure.nodes.map((node) => {
        const fill =
          node.type === "entity"
            ? "#1f2937"
            : node.type === "asset"
            ? "#111827"
            : "#1a1f2e";
        const stroke =
          node.type === "entity" ? structure.color : "#4b5563";
        return (
          <g key={node.id}>
            <rect
              x={node.x - 52}
              y={node.y - 18}
              width={104}
              height={36}
              rx={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={1.5}
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fill="#e5e7eb"
              fontSize={9.5}
              fontWeight="500"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ structures }: { structures: SukukStructure[] }) {
  const total = structures.reduce((a, s) => a + s.marketShare, 0);
  let cumAngle = -Math.PI / 2;
  const cx = 120;
  const cy = 120;
  const r = 80;
  const ir = 48;

  const slices = structures.map((s) => {
    const angle = (s.marketShare / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(endAngle);
    const iy2 = cy + ir * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = startAngle + angle / 2;
    const labelR = r + 22;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    return { s, x1, y1, x2, y2, ix1, iy1, ix2, iy2, largeArc, lx, ly, midAngle };
  });

  return (
    <svg viewBox="0 0 380 240" className="w-full h-52">
      {slices.map(({ s, x1, y1, x2, y2, ix1, iy1, ix2, iy2, largeArc, lx, ly }) => (
        <g key={s.id}>
          <path
            d={`M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${largeArc} 0 ${ix1} ${iy1} Z`}
            fill={s.color}
            fillOpacity={0.8}
            stroke="#111827"
            strokeWidth={1.5}
          />
          {s.marketShare >= 10 && (
            <text x={lx} y={ly} textAnchor="middle" fill="#e5e7eb" fontSize={9} dominantBaseline="middle">
              {s.name.split(" ")[0]}
            </text>
          )}
        </g>
      ))}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#e5e7eb" fontSize={13} fontWeight="700">
        $816B
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize={9}>
        Outstanding
      </text>
      {/* Legend */}
      {structures.map((s, i) => (
        <g key={s.id}>
          <rect x={264} y={32 + i * 38} width={10} height={10} rx={2} fill={s.color} />
          <text x={280} y={41 + i * 38} fill="#e5e7eb" fontSize={9.5}>
            {s.name.split(" ")[0]} {s.marketShare}%
          </text>
        </g>
      ))}
    </svg>
  );
}

function IssuanceBarChart() {
  const maxVal = Math.max(...ISSUANCE_BY_YEAR.map((d) => d.sovereign + d.corporate));
  const width = 540;
  const height = 200;
  const padL = 44;
  const padR = 12;
  const padT = 16;
  const padB = 36;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const barW = (plotW / ISSUANCE_BY_YEAR.length) * 0.72;
  const gap = (plotW / ISSUANCE_BY_YEAR.length) * 0.28;

  const yTicks = [0, 50, 100, 150, 200, 250, 300];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52">
      {/* Grid */}
      {yTicks.map((tick) => {
        const y = padT + plotH - (tick / maxVal) * plotH;
        return (
          <g key={tick}>
            <line x1={padL} x2={padL + plotW} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fill="#6b7280" fontSize={9}>
              {tick}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {ISSUANCE_BY_YEAR.map((d, i) => {
        const x = padL + i * (barW + gap) + gap / 2;
        const totalH = ((d.sovereign + d.corporate) / maxVal) * plotH;
        const corpH = (d.corporate / maxVal) * plotH;
        const sovH = (d.sovereign / maxVal) * plotH;
        return (
          <g key={d.year}>
            {/* Corporate (top) */}
            <rect
              x={x}
              y={padT + plotH - totalH}
              width={barW}
              height={corpH}
              fill="#8b5cf6"
              fillOpacity={0.75}
              rx={1}
            />
            {/* Sovereign (bottom) */}
            <rect
              x={x}
              y={padT + plotH - sovH}
              width={barW}
              height={sovH}
              fill="#3b82f6"
              fillOpacity={0.75}
              rx={1}
            />
            <text
              x={x + barW / 2}
              y={height - padB + 14}
              textAnchor="middle"
              fill="#6b7280"
              fontSize={8.5}
            >
              {d.year}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={padL} y={padT} width={10} height={8} fill="#3b82f6" fillOpacity={0.75} rx={1} />
      <text x={padL + 14} y={padT + 7} fill="#9ca3af" fontSize={9}>Sovereign</text>
      <rect x={padL + 80} y={padT} width={10} height={8} fill="#8b5cf6" fillOpacity={0.75} rx={1} />
      <text x={padL + 94} y={padT + 7} fill="#9ca3af" fontSize={9}>Corporate</text>
      {/* Axis label */}
      <text x={14} y={height / 2} textAnchor="middle" fill="#6b7280" fontSize={9} transform={`rotate(-90,14,${height / 2})`}>
        USD Billion
      </text>
    </svg>
  );
}

function YieldSpreadChart() {
  resetSeed();
  const points: { year: number; sukukSpread: number; bondYield: number }[] = [];
  let bondBase = 3.8;
  let sukukSpread = 0.35;
  for (let y = 2015; y <= 2024; y++) {
    bondBase += (rand() - 0.5) * 0.5;
    sukukSpread += (rand() - 0.5) * 0.12;
    if (y >= 2022) bondBase += 0.6; // rate hike cycle
    if (y === 2023) bondBase -= 0.2;
    points.push({
      year: y,
      sukukSpread: Math.max(0.1, Math.min(0.7, sukukSpread)),
      bondYield: Math.max(1.5, Math.min(6.5, bondBase)),
    });
  }

  const w = 540;
  const h = 200;
  const pL = 44;
  const pR = 12;
  const pT = 16;
  const pB = 36;
  const pW = w - pL - pR;
  const pH = h - pT - pB;

  const yieldMin = 1;
  const yieldMax = 7;
  const spreadMin = 0;
  const spreadMax = 0.8;

  const yieldPath = points
    .map((p, i) => {
      const x = pL + (i / (points.length - 1)) * pW;
      const y = pT + pH - ((p.bondYield - yieldMin) / (yieldMax - yieldMin)) * pH;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const spreadPath = points
    .map((p, i) => {
      const x = pL + (i / (points.length - 1)) * pW;
      const y = pT + pH - ((p.sukukSpread - spreadMin) / (spreadMax - spreadMin)) * pH;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const yTicks = [2, 3, 4, 5, 6];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52">
      {yTicks.map((tick) => {
        const y = pT + pH - ((tick - yieldMin) / (yieldMax - yieldMin)) * pH;
        return (
          <g key={tick}>
            <line x1={pL} x2={pL + pW} y1={y} y2={y} stroke="#374151" strokeWidth={0.5} />
            <text x={pL - 6} y={y + 4} textAnchor="end" fill="#6b7280" fontSize={9}>{tick}%</text>
          </g>
        );
      })}
      <path d={yieldPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
      <path d={spreadPath} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
      {points.map((p, i) => {
        const x = pL + (i / (points.length - 1)) * pW;
        const y1 = pT + pH - ((p.bondYield - yieldMin) / (yieldMax - yieldMin)) * pH;
        const y2 = pT + pH - ((p.sukukSpread - spreadMin) / (spreadMax - spreadMin)) * pH;
        return (
          <g key={p.year}>
            <circle cx={x} cy={y1} r={3} fill="#3b82f6" />
            <circle cx={x} cy={y2} r={2.5} fill="#f59e0b" />
            <text x={x} y={h - pB + 14} textAnchor="middle" fill="#6b7280" fontSize={8.5}>{p.year}</text>
          </g>
        );
      })}
      <rect x={pL} y={pT} width={10} height={4} fill="#3b82f6" />
      <text x={pL + 14} y={pT + 7} fill="#9ca3af" fontSize={9}>5yr USD Sovereign Yield</text>
      <rect x={pL + 140} y={pT} width={10} height={4} fill="#f59e0b" />
      <text x={pL + 154} y={pT + 7} fill="#9ca3af" fontSize={9}>Sukuk Spread vs Bond</text>
    </svg>
  );
}

// ── Tab 1: Shariah Principles ─────────────────────────────────────────────────

function ShariahTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">The Five Core Prohibitions</h2>
        <p className="text-sm text-muted-foreground">Islamic finance is built around avoiding specific categories of harm. These prohibitions shape every sukuk structure.</p>
      </div>

      <div className="space-y-3">
        {PROHIBITIONS.map((p) => {
          const isOpen = expanded === p.arabic;
          return (
            <motion.div
              key={p.arabic}
              className="rounded-xl border border-border bg-muted/50 overflow-hidden"
              layout
            >
              <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : p.arabic)}
              >
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{p.arabic}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{p.english}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                      <div className="bg-card/60 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Practical Examples</p>
                        <p className="text-sm text-muted-foreground">{p.example}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Halal vs Haram sector table */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">Halal vs. Haram Sector Screening</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2.5">Sector</th>
                <th className="text-center px-3 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5">Note</th>
              </tr>
            </thead>
            <tbody>
              {HALAL_SECTORS.map((row, i) => (
                <tr
                  key={row.sector}
                  className={cn("border-t border-border/50", i % 2 === 0 ? "bg-muted/20" : "bg-muted/5")}
                >
                  <td className="px-4 py-2.5 text-foreground">{row.sector}</td>
                  <td className="px-3 py-2.5 text-center">
                    {row.halal ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 inline" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AAOIFI + Shariah Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-primary" />
            <span className="font-semibold text-white text-sm">Shariah Board Role</span>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Approve all product structures before issuance</li>
            <li>• Review underlying assets for compliance</li>
            <li>• Issue fatwa (religious ruling) on each transaction</li>
            <li>• Monitor ongoing compliance throughout tenor</li>
            <li>• Typically 3–7 scholars; internationally recognized</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-semibold text-white text-sm">AAOIFI Standards</span>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Accounting &amp; Auditing Organization for Islamic Financial Institutions</li>
            <li>• 100+ Shariah standards since 1991</li>
            <li>• Standard 17 specifically governs investment sukuk</li>
            <li>• Adopted by Bahrain, UAE, Sudan, Jordan</li>
            <li>• Purification: haram income portion donated to charity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Sukuk Structures ────────────────────────────────────────────────────

function StructuresTab() {
  const [selected, setSelected] = useState<string>("ijara");
  const structure = SUKUK_STRUCTURES.find((s) => s.id === selected)!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Sukuk Structure Types</h2>
        <p className="text-sm text-muted-foreground">Different underlying contracts produce different sukuk structures. Each has distinct Shariah requirements, risk profiles, and market uses.</p>
      </div>

      {/* Structure selector */}
      <div className="flex flex-wrap gap-2">
        {SUKUK_STRUCTURES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              selected === s.id
                ? "text-white border-transparent"
                : "bg-muted text-muted-foreground border-border hover:border-muted-foreground"
            )}
            style={selected === s.id ? { backgroundColor: s.color, borderColor: s.color } : {}}
          >
            {s.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="rounded-xl border p-4 bg-muted/40" style={{ borderColor: structure.color + "40" }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-white text-base">{structure.name}</h3>
                <p className="text-xs text-muted-foreground">{structure.arabic}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: structure.color + "25", color: structure.color }}>
                {structure.marketShare}% market share
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{structure.description}</p>
          </div>

          {/* Flow Diagram */}
          <div className="rounded-xl border border-border bg-card/50 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Transaction Flow</p>
            <FlowDiagram structure={structure} />
            <div className="mt-2 bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{structure.mechanism}</p>
            </div>
          </div>

          {/* Pros / Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-800/40 bg-emerald-900/10 p-4">
              <p className="text-xs text-emerald-400 uppercase tracking-wide font-semibold mb-2">Advantages</p>
              <ul className="space-y-1.5">
                {structure.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-red-800/40 bg-red-900/10 p-4">
              <p className="text-xs text-red-400 uppercase tracking-wide font-semibold mb-2">Limitations</p>
              <ul className="space-y-1.5">
                {structure.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Donut + sovereign vs corporate comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Market Issuance by Structure</p>
          <DonutChart structures={SUKUK_STRUCTURES} />
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Sovereign vs. Corporate Sukuk</p>
          <div className="space-y-3 text-sm">
            {[
              { feat: "Issuer", sov: "National governments, quasi-sovereigns", corp: "Banks, corporates, SPVs" },
              { feat: "Tenor", sov: "5–30 years", corp: "3–7 years typical" },
              { feat: "Rating", sov: "Sovereign ceiling", corp: "Often below sovereign" },
              { feat: "Structure", sov: "Wakala / Ijara most common", corp: "Murabaha / Musharakah" },
              { feat: "Yield", sov: "Reference benchmark", corp: "Spread over sovereign" },
              { feat: "Liquidity", sov: "Higher — benchmark issues", corp: "Lower — buy-and-hold" },
            ].map((row) => (
              <div key={row.feat} className="grid grid-cols-3 gap-2 text-xs border-b border-border/40 pb-2 last:border-0">
                <span className="text-muted-foreground font-medium">{row.feat}</span>
                <span className="text-primary">{row.sov}</span>
                <span className="text-primary">{row.corp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Market Overview ────────────────────────────────────────────────────

function MarketTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Global Sukuk Market Overview</h2>
        <p className="text-sm text-muted-foreground">The global sukuk market has grown from ~$116B in 2015 to ~$816B outstanding in 2024, driven by GCC sovereign issuance and Southeast Asian corporate demand.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Outstanding", value: "$816B", sub: "2024 estimate", color: "text-primary" },
          { label: "New Issuance 2024", value: "$280B", sub: "+12% YoY", color: "text-emerald-400" },
          { label: "Avg Tenor", value: "7.4 yrs", sub: "Global weighted avg", color: "text-primary" },
          { label: "ESG / Green Sukuk", value: "$38B", sub: "4.7% of total", color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
            <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            <div className="text-xs text-muted-foreground">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Global Sukuk Issuance 2015–2024 (USD Billion)</p>
        <IssuanceBarChart />
      </div>

      {/* Country table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Country</th>
              <th className="text-right px-3 py-2.5">Outstanding ($B)</th>
              <th className="text-right px-3 py-2.5">Share</th>
              <th className="text-left px-3 py-2.5">Currency</th>
              <th className="text-left px-3 py-2.5">Yield Range</th>
              <th className="text-left px-3 py-2.5">Sovereign Rating</th>
            </tr>
          </thead>
          <tbody>
            {COUNTRIES.map((c, i) => (
              <tr key={c.country} className={cn("border-t border-border/50", i % 2 === 0 ? "bg-muted/20" : "bg-muted/5")}>
                <td className="px-4 py-2.5">
                  <span className="mr-2">{c.flag}</span>
                  <span className="text-foreground">{c.country}</span>
                </td>
                <td className="px-3 py-2.5 text-right text-primary font-medium">{c.outstanding}</td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-muted rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${c.share * 2.5}%` }} />
                    </div>
                    <span className="text-muted-foreground text-xs w-10 text-right">{c.share}%</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.primaryCurrency}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.yieldRange}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Currency + maturity + rating breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Currency Breakdown</p>
          <div className="space-y-2">
            {[
              { label: "USD", pct: 42, color: "bg-primary" },
              { label: "MYR", pct: 28, color: "bg-emerald-500" },
              { label: "SAR", pct: 15, color: "bg-amber-500" },
              { label: "IDR", pct: 8, color: "bg-primary" },
              { label: "Other", pct: 7, color: "bg-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-8">{item.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className={cn("h-2 rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Maturity Profile</p>
          <div className="space-y-2">
            {[
              { label: "1–3 yr", pct: 22, color: "bg-cyan-500" },
              { label: "3–5 yr", pct: 31, color: "bg-primary" },
              { label: "5–10 yr", pct: 34, color: "bg-indigo-500" },
              { label: "10–30 yr", pct: 11, color: "bg-primary" },
              { label: "30+ yr", pct: 2, color: "bg-primary" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10">{item.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className={cn("h-2 rounded-full", item.color)} style={{ width: `${item.pct * 3}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Rating Distribution</p>
          <div className="space-y-2">
            {[
              { label: "AAA–AA", pct: 18, color: "bg-emerald-500" },
              { label: "A+–A-", pct: 34, color: "bg-green-500" },
              { label: "BBB+–BBB-", pct: 26, color: "bg-yellow-500" },
              { label: "BB–B", pct: 14, color: "bg-orange-500" },
              { label: "NR", pct: 8, color: "bg-muted-foreground" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">{item.label}</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div className={cn("h-2 rounded-full", item.color)} style={{ width: `${item.pct * 2.8}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 4: vs Conventional Bonds ──────────────────────────────────────────────

function ComparisonTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Sukuk vs. Conventional Bonds</h2>
        <p className="text-sm text-muted-foreground">While sukuk and bonds may appear similar as fixed-income instruments, fundamental differences in structure, ownership, and return mechanics distinguish them.</p>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 w-1/3">Feature</th>
              <th className="px-3 py-3 text-center text-emerald-400">Sukuk</th>
              <th className="px-3 py-3 text-center text-primary">Conventional Bond</th>
              <th className="px-3 py-3 text-center w-16"></th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={row.feature}
                className={cn("border-t border-border/50", i % 2 === 0 ? "bg-muted/20" : "bg-muted/5")}
              >
                <td className="px-4 py-2.5 text-muted-foreground font-medium">{row.feature}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{row.sukuk}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{row.bond}</td>
                <td className="px-3 py-2.5 text-center">
                  {row.sukukFav === true && <TrendingUp className="h-3.5 w-3.5 text-emerald-400 inline" />}
                  {row.sukukFav === false && <TrendingDown className="h-3.5 w-3.5 text-red-400 inline" />}
                  {row.sukukFav === null && <span className="text-muted-foreground text-xs">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-muted/60 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-400" /> Sukuk advantage</span>
          <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-400" /> Bond advantage</span>
          <span>— Comparable / neutral</span>
        </div>
      </div>

      {/* Yield spread chart */}
      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Yield & Spread History (2015–2024)</p>
        <p className="text-xs text-muted-foreground mb-3">Sukuk traditionally trade at a modest spread to equivalent-rated conventional bonds due to lower liquidity and smaller investor base</p>
        <YieldSpreadChart />
      </div>

      {/* Liquidity + crossover investors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-white">Liquidity Differences</span>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span>Avg bid-ask spread (IG)</span>
              <span className="text-amber-300">25–50 bps (sukuk) vs 5–15 bps (bond)</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span>Daily turnover</span>
              <span className="text-amber-300">~3% of outstanding vs ~15% for UST</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span>Buy-and-hold investors</span>
              <span className="text-muted-foreground">~65% of sukuk held to maturity</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span>Exchange-listed share</span>
              <span className="text-muted-foreground">~45% listed on Nasdaq Dubai / LSE</span>
            </div>
            <div className="flex justify-between">
              <span>Repo market development</span>
              <span className="text-red-300">Limited — improving with IIFM standards</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-white">Crossover Investor Flow</span>
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="bg-card/50 rounded-lg p-3">
              <p className="text-muted-foreground font-medium mb-1">Who buys both?</p>
              <p>GEM (global emerging market) fund managers, MENA sovereign wealth funds, and international banks with Islamic finance divisions actively participate in both markets.</p>
            </div>
            <div className="bg-card/50 rounded-lg p-3">
              <p className="text-muted-foreground font-medium mb-1">Dual-listed securities</p>
              <p>Major sukuk (Saudi Aramco, UAE sovereign) are dual-listed, allowing both Islamic and conventional investors to buy same instrument under their respective frameworks.</p>
            </div>
            <div className="bg-card/50 rounded-lg p-3">
              <p className="text-muted-foreground font-medium mb-1">Spread compression drivers</p>
              <p>Crossover demand narrows sukuk spreads vs conventional bonds when GCC sovereigns issue in size, as both investor bases compete for the same paper.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex gap-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">Key insight: </span>
          From a cash flow perspective, investment-grade ijara sukuk often look nearly identical to conventional bonds — predictable periodic payments and a bullet redemption. The critical distinction is structural: sukuk holders legally co-own an underlying asset, while bondholders are unsecured creditors of the issuer. This difference has material implications in default scenarios.
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SukukPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-900/30 border border-emerald-700/40">
              <Landmark className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Islamic Finance &amp; Sukuk</h1>
              <p className="text-sm text-muted-foreground">Shariah-compliant capital markets — structures, principles &amp; global market</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Riba-Free", color: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40" },
              { label: "Asset-Backed", color: "bg-muted/60 text-primary border-border" },
              { label: "$816B Market", color: "bg-muted/60 text-primary border-border" },
              { label: "AAOIFI Regulated", color: "bg-amber-900/40 text-amber-300 border-amber-700/40" },
            ].map((tag) => (
              <span key={tag.label} className={cn("text-xs px-2.5 py-1 rounded-full border", tag.color)}>
                {tag.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="shariah">
          <TabsList className="grid grid-cols-4 w-full bg-muted/60 mb-6">
            <TabsTrigger value="shariah" className="text-xs flex items-center gap-1.5 data-[state=inactive]:hidden md:data-[state=inactive]:flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Shariah Principles</span>
              <span className="sm:hidden">Shariah</span>
            </TabsTrigger>
            <TabsTrigger value="structures" className="text-xs flex items-center gap-1.5 data-[state=inactive]:hidden md:data-[state=inactive]:flex">
              <Building2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sukuk Structures</span>
              <span className="sm:hidden">Structures</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs flex items-center gap-1.5 data-[state=inactive]:hidden md:data-[state=inactive]:flex">
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Market Overview</span>
              <span className="sm:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs flex items-center gap-1.5 data-[state=inactive]:hidden md:data-[state=inactive]:flex">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">vs Conventional</span>
              <span className="sm:hidden">vs Bonds</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shariah" className="focus-visible:outline-none">
            <ShariahTab />
          </TabsContent>
          <TabsContent value="structures" className="focus-visible:outline-none">
            <StructuresTab />
          </TabsContent>
          <TabsContent value="market" className="focus-visible:outline-none">
            <MarketTab />
          </TabsContent>
          <TabsContent value="comparison" className="focus-visible:outline-none">
            <ComparisonTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
