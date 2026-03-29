"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Shield,
  Heart,
  Briefcase,
  Layers,
  DollarSign,
  TrendingUp,
  Users,
  Globe,
  Scale,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Seeded PRNG ─────────────────────────────────────────────────────────────
let s = 991;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _pregenerated = Array.from({ length: 500 }, () => rand());
let _vi = 0;
const sv = () => _pregenerated[_vi++ % _pregenerated.length];
void sv;

// ── Format helpers ───────────────────────────────────────────────────────────
const fmtM = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}B` : `$${n}M`;
const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");

// ── Asset Allocation Data ────────────────────────────────────────────────────
interface AssetClass {
  name: string;
  pct: number;
  aum: number;
  color: string;
  ytd: number;
}

const ASSET_CLASSES: AssetClass[] = [
  { name: "Public Equity", pct: 22, aum: 110, color: "#6366f1", ytd: 14.2 },
  { name: "Private Equity", pct: 18, aum: 90, color: "#8b5cf6", ytd: 18.7 },
  { name: "Hedge Funds", pct: 12, aum: 60, color: "#a78bfa", ytd: 7.4 },
  { name: "Real Estate", pct: 10, aum: 50, color: "#22c55e", ytd: 9.1 },
  { name: "Infrastructure", pct: 8, aum: 40, color: "#16a34a", ytd: 11.3 },
  { name: "Direct Lending", pct: 7, aum: 35, color: "#f59e0b", ytd: 8.9 },
  { name: "Venture Capital", pct: 6, aum: 30, color: "#ef4444", ytd: 22.5 },
  { name: "Fixed Income", pct: 6, aum: 30, color: "#3b82f6", ytd: 4.2 },
  { name: "Art & Collectibles", pct: 4, aum: 20, color: "#ec4899", ytd: 6.8 },
  { name: "Commodities", pct: 3, aum: 15, color: "#f97316", ytd: 3.1 },
  { name: "Crypto / Digital", pct: 2, aum: 10, color: "#fbbf24", ytd: 41.2 },
  { name: "Cash & Equivalents", pct: 2, aum: 10, color: "#6b7280", ytd: 5.1 },
];

// ── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ data }: { data: AssetClass[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = data.reduce((a, b) => a + b.pct, 0);
  const cx = 150;
  const cy = 150;
  const r = 110;
  const innerR = 65;

  let cumAngle = -90;
  const slices = data.map((d) => {
    const angle = (d.pct / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    return { ...d, startAngle, endAngle: cumAngle };
  });

  const polarToCart = (pcx: number, pcy: number, pr: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: pcx + pr * Math.cos(rad), y: pcy + pr * Math.sin(rad) };
  };

  const arcPath = (
    startDeg: number,
    endDeg: number,
    outerR: number,
    iR: number
  ) => {
    const s1 = polarToCart(cx, cy, outerR, startDeg);
    const e1 = polarToCart(cx, cy, outerR, endDeg);
    const s2 = polarToCart(cx, cy, iR, endDeg);
    const e2 = polarToCart(cx, cy, iR, startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${iR} ${iR} 0 ${largeArc} 0 ${e2.x} ${e2.y}`,
      "Z",
    ].join(" ");
  };

  const hoveredSlice = slices.find((sl) => sl.name === hovered);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 300 300" className="w-64 h-64">
        {slices.map((slice) => {
          const isHov = hovered === slice.name;
          const expandedR = isHov ? r + 8 : r;
          return (
            <path
              key={slice.name}
              d={arcPath(slice.startAngle, slice.endAngle, expandedR, innerR)}
              fill={slice.color}
              opacity={hovered && !isHov ? 0.4 : 1}
              style={{ cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={() => setHovered(slice.name)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {hoveredSlice ? (
          <>
            <text
              x={cx}
              y={cy - 14}
              textAnchor="middle"
              fill="#f1f5f9"
              fontSize={11}
              fontWeight={600}
            >
              {hoveredSlice.name}
            </text>
            <text
              x={cx}
              y={cy + 6}
              textAnchor="middle"
              fill="#f1f5f9"
              fontSize={16}
              fontWeight={700}
            >
              {hoveredSlice.pct}%
            </text>
            <text
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={10}
            >
              {fmtM(hoveredSlice.aum)}
            </text>
          </>
        ) : (
          <>
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={11}
            >
              Total AUM
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fill="#f1f5f9"
              fontSize={18}
              fontWeight={700}
            >
              $500M
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

// ── Family Office Structure Section ─────────────────────────────────────────
interface FoType {
  id: string;
  label: string;
  aumMin: string;
  cost: string;
  staff: string;
  pros: string[];
  cons: string[];
  color: string;
}

const FO_TYPES: FoType[] = [
  {
    id: "sfo",
    label: "Single Family Office",
    aumMin: "$250M+",
    cost: "~1.0–2.5% AUM/yr",
    staff: "10–30 FTEs",
    pros: [
      "Complete privacy & confidentiality",
      "Fully bespoke strategy",
      "Deep family alignment",
      "Control of entire operation",
    ],
    cons: [
      "High fixed costs ($2–5M/yr)",
      "Talent concentration risk",
      "Governance complexity",
      "Operational overhead",
    ],
    color: "#6366f1",
  },
  {
    id: "mfo",
    label: "Multi-Family Office",
    aumMin: "$50M–$250M",
    cost: "~0.5–1.2% AUM/yr",
    staff: "Shared (20–200)",
    pros: [
      "Economies of scale",
      "Access to top talent",
      "Peer learning across families",
      "Lower break-even AUM",
    ],
    cons: [
      "Less customization",
      "Potential conflicts of interest",
      "Shared attention",
      "Some loss of privacy",
    ],
    color: "#8b5cf6",
  },
  {
    id: "ocio",
    label: "Outsourced CIO",
    aumMin: "$10M–$100M",
    cost: "~0.2–0.6% AUM/yr",
    staff: "External provider",
    pros: [
      "Lowest cost structure",
      "Institutional-quality process",
      "Scalable engagement",
      "Flexibility to change providers",
    ],
    cons: [
      "Limited bespoke customization",
      "Less direct family involvement",
      "Provider dependency",
      "Potential misaligned incentives",
    ],
    color: "#22c55e",
  },
];

function FoStructureTab() {
  const [selected, setSelected] = useState<string>("sfo");
  const sel = FO_TYPES.find((f) => f.id === selected)!;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {FO_TYPES.map((fo) => (
          <button
            key={fo.id}
            onClick={() => setSelected(fo.id)}
            className={`rounded-xl border p-4 text-left transition-all ${
              selected === fo.id
                ? "border-white/30 bg-white/10"
                : "border-white/10 bg-white/5 hover:bg-white/8"
            }`}
          >
            <div
              className="mb-2 h-2 w-8 rounded-full"
              style={{ backgroundColor: fo.color }}
            />
            <div className="font-semibold text-sm text-foreground">{fo.label}</div>
            <div className="text-xs text-muted-foreground mt-1">Min: {fo.aumMin}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min AUM</span>
              <span className="font-semibold text-foreground">{sel.aumMin}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annual Cost</span>
              <span className="font-semibold text-foreground">{sel.cost}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Staffing</span>
              <span className="font-semibold text-foreground">{sel.staff}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-400">Advantages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sel.pros.map((p) => (
              <div key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                {p}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400">Disadvantages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sel.cons.map((c) => (
              <div key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                {c}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Typical SFO Services Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Investment Mgmt", cost: "40%", icon: TrendingUp },
              { label: "Tax & Accounting", cost: "20%", icon: Scale },
              { label: "Legal & Estate", cost: "15%", icon: Shield },
              { label: "Family Governance", cost: "10%", icon: Users },
              { label: "Philanthropy", cost: "8%", icon: Heart },
              { label: "Concierge/Admin", cost: "5%", icon: Globe },
              { label: "Technology", cost: "2%", icon: Layers },
            ].map(({ label, cost, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 p-3 text-center"
              >
                <Icon className="mb-1.5 h-5 w-5 text-indigo-400" />
                <div className="text-xs font-semibold text-foreground">{cost}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Asset Allocation Tab ─────────────────────────────────────────────────────
function AllocationTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Portfolio Allocation — $500M AUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={ASSET_CLASSES} />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Asset Class Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ASSET_CLASSES.map((ac) => (
              <div key={ac.name} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: ac.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{ac.name}</span>
                    <div className="flex items-center gap-3 ml-2">
                      <span className="text-xs font-mono text-muted-foreground">{fmtM(ac.aum)}</span>
                      <span className="text-xs font-mono text-foreground w-8 text-right">
                        {ac.pct}%
                      </span>
                      <span
                        className={`text-xs font-mono w-14 text-right ${posColor(ac.ytd)}`}
                      >
                        +{fmtPct(ac.ytd)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-0.5 h-1 w-full rounded-full bg-white/10">
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${ac.pct * 4}%`, backgroundColor: ac.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Weighted YTD Return", value: "+12.4%", sub: "vs 60/40: +8.1%", positive: true },
          { label: "Illiquidity Premium", value: "+3.8%", sub: "vs liquid-only portfolio", positive: true },
          { label: "Sharpe Ratio", value: "1.42", sub: "3-year trailing", positive: true },
          { label: "Max Drawdown (3yr)", value: "-8.2%", sub: "COVID stress: -22%", positive: false },
        ].map(({ label, value, sub, positive }) => (
          <Card key={label} className="border-white/10 bg-white/5">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div
                className={`mt-1 text-lg font-bold ${
                  positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {value}
              </div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Estate Planning Tab ──────────────────────────────────────────────────────
interface EstateTool {
  name: string;
  desc: string;
  taxBenefit: string;
  minAum: string;
  complexity: "Low" | "Medium" | "High";
}

const ESTATE_TOOLS: EstateTool[] = [
  {
    name: "Dynasty Trust (GST)",
    desc: "Multi-generational trust that skips estate tax at each generation transfer using the GST exemption.",
    taxBenefit: "Avoid 40% estate tax across 3+ generations",
    minAum: "$10M+",
    complexity: "High",
  },
  {
    name: "GRAT (Grantor Retained Annuity Trust)",
    desc: "Transfers appreciation above IRS hurdle rate (7520 rate) to heirs gift-tax free over a 2–10 year term.",
    taxBenefit: "Transfer appreciation tax-free",
    minAum: "$5M+",
    complexity: "Medium",
  },
  {
    name: "Donor-Advised Fund (DAF)",
    desc: "Immediate charitable deduction on contribution; invest assets tax-free and recommend grants over time.",
    taxBenefit: "Full deduction in year of contribution",
    minAum: "$250K+",
    complexity: "Low",
  },
  {
    name: "Charitable Lead Trust (CLT)",
    desc: "Charity receives income stream for a set term; remainder passes to heirs with gift tax savings.",
    taxBenefit: "Reduce taxable estate by PV of lead interest",
    minAum: "$2M+",
    complexity: "High",
  },
  {
    name: "Charitable Remainder Trust (CRT)",
    desc: "Donor receives income stream; remainder to charity. Avoids capital gains on appreciated assets.",
    taxBenefit: "Defer/eliminate cap gains + income stream",
    minAum: "$1M+",
    complexity: "Medium",
  },
  {
    name: "IDGT (Intentionally Defective Grantor Trust)",
    desc: "Sell assets to trust in exchange for note. Grantor pays income tax (additional gift), trust grows tax-free.",
    taxBenefit: "Freeze estate + income tax as additional gift",
    minAum: "$5M+",
    complexity: "High",
  },
];

function EstateTab() {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [estateValue, setEstateValue] = useState(50);

  const federalExemption = 13.61;
  const taxableEstate = Math.max(0, estateValue - federalExemption);
  const estateTaxOwed = taxableEstate * 0.4;
  const afterTaxEstate = estateValue - estateTaxOwed;

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Estate Tax Calculator (2024)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">
                Taxable Estate Value: ${estateValue}M
              </label>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={estateValue}
                onChange={(e) => setEstateValue(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross Estate</span>
                  <span className="text-foreground font-semibold">{fmtM(estateValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Federal Exemption (2024)</span>
                  <span className="text-emerald-400 font-semibold">
                    -${Math.min(federalExemption, estateValue).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                  <span className="text-muted-foreground">Taxable Amount</span>
                  <span className="text-foreground font-semibold">{fmtM(taxableEstate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estate Tax (40%)</span>
                  <span className="text-red-400 font-bold">{fmtM(estateTaxOwed)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                  <span className="text-muted-foreground font-semibold">Heirs Receive</span>
                  <span className="text-emerald-400 font-bold">{fmtM(afterTaxEstate)}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2">Visual Breakdown</div>
              <svg viewBox="0 0 200 120" className="w-full">
                <rect x={10} y={10} width={180} height={30} rx={4} fill="#1e293b" />
                <rect
                  x={10}
                  y={10}
                  width={Math.min(180, (afterTaxEstate / estateValue) * 180)}
                  height={30}
                  rx={4}
                  fill="#22c55e"
                />
                <text
                  x={100}
                  y={30}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize={10}
                  fontWeight={600}
                >
                  Heirs: {fmtM(afterTaxEstate)} (
                  {((afterTaxEstate / estateValue) * 100).toFixed(0)}%)
                </text>
                <rect x={10} y={55} width={180} height={30} rx={4} fill="#1e293b" />
                <rect
                  x={10}
                  y={55}
                  width={Math.min(180, (estateTaxOwed / estateValue) * 180)}
                  height={30}
                  rx={4}
                  fill="#ef4444"
                />
                <text
                  x={100}
                  y={75}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize={10}
                  fontWeight={600}
                >
                  Tax: {fmtM(estateTaxOwed)} (
                  {((estateTaxOwed / estateValue) * 100).toFixed(0)}%)
                </text>
                <text x={10} y={110} fill="#94a3b8" fontSize={9}>
                  * State taxes excluded. 2026 sunset halves exemption to ~$7M.
                </text>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground mb-3">
          Estate Planning Vehicles
        </div>
        {ESTATE_TOOLS.map((tool) => {
          const isOpen = expandedTool === tool.name;
          const complexityColor =
            tool.complexity === "Low"
              ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
              : tool.complexity === "Medium"
              ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
              : "text-red-400 border-red-400/30 bg-red-400/10";

          return (
            <div
              key={tool.name}
              className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpandedTool(isOpen ? null : tool.name)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{tool.name}</span>
                  <Badge className={`text-xs border ${complexityColor}`}>
                    {tool.complexity}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    Min: {tool.minAum}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-white/10 px-4 py-3 space-y-2">
                  <p className="text-sm text-muted-foreground">{tool.desc}</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">
                      {tool.taxBenefit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Philanthropy Tab ─────────────────────────────────────────────────────────
const PHILANTHROPY_LEVELS = [
  { label: "Family Wealth ($500M)", value: 500, color: "#6366f1", width: 100 },
  { label: "Philanthropic Allocation (10%)", value: 50, color: "#8b5cf6", width: 80 },
  { label: "DAF Contributions ($20M)", value: 20, color: "#a78bfa", width: 60 },
  { label: "Private Foundation ($15M)", value: 15, color: "#22c55e", width: 45 },
  { label: "Direct Giving ($8M)", value: 8, color: "#16a34a", width: 30 },
  { label: "Impact Investing ($7M)", value: 7, color: "#4ade80", width: 20 },
];

const GRANTS = [
  { org: "Climate Action Fund", area: "Environment", amount: 2.5, yr: 2024 },
  { org: "Global Health Initiative", area: "Healthcare", amount: 3.0, yr: 2024 },
  { org: "Education Equity Alliance", area: "Education", amount: 1.8, yr: 2024 },
  { org: "Arts & Culture Endowment", area: "Arts", amount: 0.9, yr: 2024 },
  { org: "Economic Mobility Lab", area: "Social", amount: 1.5, yr: 2023 },
  { org: "Clean Water Coalition", area: "Environment", amount: 1.2, yr: 2023 },
];

function PhilanthropyTab() {
  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Philanthropic Capital Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 500 295" className="w-full max-w-lg mx-auto">
            {PHILANTHROPY_LEVELS.map((level, i) => {
              const yStep = 45;
              const y = 10 + i * yStep;
              const xOffset = ((100 - level.width) / 2) * 2.5;
              const barWidth = level.width * 2.5;
              const nextLevel = PHILANTHROPY_LEVELS[i + 1];
              const nextXOffset = nextLevel
                ? ((100 - nextLevel.width) / 2) * 2.5
                : 0;
              const nextBarWidth = nextLevel ? nextLevel.width * 2.5 : 0;
              return (
                <g key={level.label}>
                  <rect
                    x={10 + xOffset}
                    y={y}
                    width={barWidth}
                    height={30}
                    rx={6}
                    fill={level.color}
                    opacity={0.85}
                  />
                  <text
                    x={10 + xOffset + barWidth / 2}
                    y={y + 19}
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {level.label}
                  </text>
                  {nextLevel && (
                    <line
                      x1={10 + xOffset + barWidth / 2}
                      y1={y + 30}
                      x2={10 + nextXOffset + nextBarWidth / 2}
                      y2={y + yStep}
                      stroke="#475569"
                      strokeWidth={1.5}
                      strokeDasharray="4,2"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Vehicle Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                name: "DAF",
                deduction: "Immediate (60% AGI)",
                control: "Donor recommends",
                payout: "None required",
                setup: "Simple",
              },
              {
                name: "Private Foundation",
                deduction: "Year given (30% AGI)",
                control: "Family controls",
                payout: "5% AUM/yr required",
                setup: "Complex",
              },
              {
                name: "CLT",
                deduction: "PV of lead interest",
                control: "Trustee controls",
                payout: "Fixed to charity",
                setup: "High",
              },
              {
                name: "CRT",
                deduction: "PV of remainder",
                control: "Trustee controls",
                payout: "Income to donor",
                setup: "Medium",
              },
            ].map((v) => (
              <div key={v.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-3.5 w-3.5 text-pink-400" />
                  <span className="text-sm font-semibold text-foreground">{v.name}</span>
                  <Badge className="ml-auto text-xs border border-slate-600 bg-muted/50 text-muted-foreground">
                    Setup: {v.setup}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-muted-foreground">Deduction:</span>
                  <span className="text-muted-foreground">{v.deduction}</span>
                  <span className="text-muted-foreground">Control:</span>
                  <span className="text-muted-foreground">{v.control}</span>
                  <span className="text-muted-foreground">Payout:</span>
                  <span className="text-muted-foreground">{v.payout}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Foundation Grant-Making 2023–2024
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {GRANTS.map((g) => (
              <div
                key={g.org}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{g.org}</div>
                  <div className="text-xs text-muted-foreground">
                    {g.area} · {g.yr}
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-400">${g.amount}M</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Direct Investing Tab ─────────────────────────────────────────────────────
interface CoInvestment {
  deal: string;
  type: string;
  sponsor: string;
  check: number;
  irr: number;
  status: "Active" | "Exited" | "Pipeline";
  vintage: number;
}

const CO_INVESTMENTS: CoInvestment[] = [
  {
    deal: "MedTech Platform Co.",
    type: "Private Equity",
    sponsor: "KKR",
    check: 15,
    irr: 28.4,
    status: "Active",
    vintage: 2022,
  },
  {
    deal: "Industrial Logistics REIT",
    type: "Real Estate",
    sponsor: "Blackstone",
    check: 20,
    irr: 14.1,
    status: "Active",
    vintage: 2021,
  },
  {
    deal: "SaaS Roll-Up (Series C)",
    type: "Venture",
    sponsor: "Sequoia",
    check: 8,
    irr: 62.3,
    status: "Exited",
    vintage: 2019,
  },
  {
    deal: "Renewable Energy Dev.",
    type: "Infrastructure",
    sponsor: "EQT",
    check: 25,
    irr: 11.8,
    status: "Active",
    vintage: 2023,
  },
  {
    deal: "Consumer Retail Brand",
    type: "Growth Equity",
    sponsor: "General Atlantic",
    check: 10,
    irr: 0,
    status: "Pipeline",
    vintage: 2025,
  },
  {
    deal: "Data Center Portfolio",
    type: "Real Estate",
    sponsor: "Carlyle",
    check: 30,
    irr: 16.7,
    status: "Active",
    vintage: 2020,
  },
];

function DirectInvestingTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Co-Investment Deployed", value: "$108M", sub: "6 active deals" },
          { label: "Blended Net IRR", value: "22.1%", sub: "All active + exited" },
          { label: "Deal Flow (YTD)", value: "47 deals", sub: "4 converted" },
          { label: "Avg Check Size", value: "$18M", sub: "Range: $8–30M" },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="border-white/10 bg-white/5">
            <CardContent className="pt-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 text-lg font-bold text-indigo-400">{value}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Co-Investment Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Deal</th>
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-left font-medium">Sponsor</th>
                  <th className="pb-2 text-right font-medium">Check</th>
                  <th className="pb-2 text-right font-medium">Net IRR</th>
                  <th className="pb-2 text-center font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Vintage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {CO_INVESTMENTS.map((ci) => {
                  const statusColor =
                    ci.status === "Active"
                      ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                      : ci.status === "Exited"
                      ? "text-primary border-border bg-primary/10"
                      : "text-amber-400 border-amber-400/30 bg-amber-400/10";
                  return (
                    <tr key={ci.deal} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 pr-3 font-medium text-foreground">{ci.deal}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{ci.type}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{ci.sponsor}</td>
                      <td className="py-2 text-right text-foreground">${ci.check}M</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          ci.status === "Pipeline" ? "text-muted-foreground" : posColor(ci.irr)
                        }`}
                      >
                        {ci.status === "Pipeline" ? "—" : `+${ci.irr.toFixed(1)}%`}
                      </td>
                      <td className="py-2 text-center">
                        <Badge className={`text-xs border ${statusColor}`}>
                          {ci.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-right text-muted-foreground">{ci.vintage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Deal Flow Sourcing Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { channel: "GP Relationships", pct: 40, deals: 19, color: "#6366f1" },
              { channel: "Investment Banks", pct: 22, deals: 10, color: "#8b5cf6" },
              { channel: "Direct Proprietary", pct: 18, deals: 8, color: "#22c55e" },
              { channel: "Family Office Network", pct: 12, deals: 6, color: "#f59e0b" },
              { channel: "Advisors / Lawyers", pct: 5, deals: 3, color: "#3b82f6" },
              { channel: "Other", pct: 3, deals: 1, color: "#6b7280" },
            ].map(({ channel, pct, deals, color }) => (
              <div
                key={channel}
                className="rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium text-foreground">{channel}</span>
                </div>
                <div className="text-lg font-bold" style={{ color }}>
                  {pct}%
                </div>
                <div className="text-xs text-muted-foreground">{deals} deals YTD</div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-white/10">
                  <div
                    className="h-1 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Liquidity Management Tab ─────────────────────────────────────────────────
interface LiquidityBucket {
  tier: string;
  label: string;
  horizon: string;
  amount: number;
  instruments: string[];
  targetYield: string;
  color: string;
}

const LIQUIDITY_LADDER: LiquidityBucket[] = [
  {
    tier: "T1",
    label: "Immediate",
    horizon: "0–30 days",
    amount: 10,
    instruments: ["Money Market", "T-Bills", "Bank Deposits"],
    targetYield: "5.2%",
    color: "#22c55e",
  },
  {
    tier: "T2",
    label: "Short-Term",
    horizon: "1–12 months",
    amount: 30,
    instruments: ["Short Gov't Bonds", "IG Credit", "Liquid Alt Funds"],
    targetYield: "5.8%",
    color: "#3b82f6",
  },
  {
    tier: "T3",
    label: "Medium-Term",
    horizon: "1–5 years",
    amount: 100,
    instruments: ["HY Bonds", "Hedge Funds", "REITs", "Infrastructure"],
    targetYield: "8.4%",
    color: "#f59e0b",
  },
  {
    tier: "T4",
    label: "Illiquid",
    horizon: "5–15+ years",
    amount: 360,
    instruments: ["Private Equity", "Direct Real Estate", "VC", "Art"],
    targetYield: "15–25%",
    color: "#8b5cf6",
  },
];

function LiquidityTab() {
  const total = LIQUIDITY_LADDER.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Liquidity Ladder — $500M Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 500 180" className="w-full">
            {LIQUIDITY_LADDER.map((bucket, i) => {
              const barW = (bucket.amount / total) * 440;
              const x = 30;
              const y = 15 + i * 40;
              return (
                <g key={bucket.tier}>
                  <text
                    x={25}
                    y={y + 19}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize={9}
                    fontWeight={600}
                  >
                    {bucket.tier}
                  </text>
                  <rect x={x} y={y} width={440} height={28} rx={4} fill="#1e293b" />
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={28}
                    rx={4}
                    fill={bucket.color}
                    opacity={0.85}
                  />
                  <text x={x + 8} y={y + 18} fill="#f1f5f9" fontSize={10} fontWeight={700}>
                    {bucket.label} ({bucket.horizon})
                  </text>
                  <text
                    x={x + barW - 4}
                    y={y + 18}
                    textAnchor="end"
                    fill="#f1f5f9"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {fmtM(bucket.amount)}
                  </text>
                </g>
              );
            })}
          </svg>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIQUIDITY_LADDER.map((bucket) => (
          <Card key={bucket.tier} className="border-white/10 bg-white/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: bucket.color }}
                />
                <span className="font-semibold text-foreground text-sm">
                  {bucket.label} — {bucket.tier}
                </span>
                <Badge className="ml-auto text-xs border border-white/20 bg-white/10 text-muted-foreground">
                  {bucket.horizon}
                </Badge>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Allocation</span>
                <span className="font-bold text-foreground">
                  {fmtM(bucket.amount)} (
                  {((bucket.amount / total) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Target Yield</span>
                <span className="font-bold text-emerald-400">{bucket.targetYield}</span>
              </div>
              <div className="space-y-1">
                {bucket.instruments.map((inst) => (
                  <div
                    key={inst}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <div
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: bucket.color }}
                    />
                    {inst}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            Credit Facilities & Cash Flow Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Capital Call Line",
                amount: "$50M",
                rate: "SOFR + 1.25%",
                use: "Fund capital calls without forced liquidations",
                icon: Briefcase,
              },
              {
                label: "Securities-Based LOC",
                amount: "$75M",
                rate: "SOFR + 0.75%",
                use: "Liquidity against marketable portfolio, non-recourse",
                icon: DollarSign,
              },
              {
                label: "Real Estate LOC",
                amount: "$30M",
                rate: "SOFR + 1.50%",
                use: "Bridge financing against real estate portfolio equity",
                icon: Building2,
              },
            ].map(({ label, amount, rate, use, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                </div>
                <div className="text-lg font-bold text-emerald-400 mb-1">{amount}</div>
                <div className="text-xs text-muted-foreground mb-1">
                  Rate: <span className="text-amber-400">{rate}</span>
                </div>
                <div className="text-xs text-muted-foreground">{use}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function FamilyOfficePage() {
  const tabs = [
    { id: "structure", label: "FO Structure", icon: Building2 },
    { id: "allocation", label: "Allocation", icon: Layers },
    { id: "estate", label: "Estate Planning", icon: Shield },
    { id: "philanthropy", label: "Philanthropy", icon: Heart },
    { id: "direct", label: "Direct Investing", icon: Briefcase },
    { id: "liquidity", label: "Liquidity", icon: DollarSign },
  ];

  return (
    <motion.div
      className="min-h-screen bg-background p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20">
            <Building2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Family Office & UHNW Wealth Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Structuring, allocating, and preserving generational wealth at scale
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Portfolio AUM", value: "$500M", icon: DollarSign, color: "text-indigo-400" },
            { label: "Family Generation", value: "3rd Gen", icon: Users, color: "text-emerald-400" },
            { label: "YTD Return", value: "+12.4%", icon: TrendingUp, color: "text-emerald-400" },
            { label: "Office Type", value: "SFO", icon: Globe, color: "text-amber-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-white/10 bg-white/5">
              <CardContent className="flex items-center gap-3 pt-3 pb-3">
                <Icon className={`h-4 w-4 ${color}`} />
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className={`text-sm font-bold ${color}`}>{value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structure">
        <TabsList className="mb-4 flex flex-wrap gap-1 h-auto bg-white/5 p-1 rounded-xl">
          {tabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white/15 data-[state=active]:text-white text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="structure" className="data-[state=inactive]:hidden">
          <FoStructureTab />
        </TabsContent>
        <TabsContent value="allocation" className="data-[state=inactive]:hidden">
          <AllocationTab />
        </TabsContent>
        <TabsContent value="estate" className="data-[state=inactive]:hidden">
          <EstateTab />
        </TabsContent>
        <TabsContent value="philanthropy" className="data-[state=inactive]:hidden">
          <PhilanthropyTab />
        </TabsContent>
        <TabsContent value="direct" className="data-[state=inactive]:hidden">
          <DirectInvestingTab />
        </TabsContent>
        <TabsContent value="liquidity" className="data-[state=inactive]:hidden">
          <LiquidityTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
