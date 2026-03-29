"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Globe,
  BarChart2,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Droplets,
  Building2,
  Wind,
  Sun,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

let s = 842;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function rb(lo: number, hi: number) {
  return lo + rand() * (hi - lo);
}
function ri(lo: number, hi: number) {
  return Math.floor(rb(lo, hi + 1));
}

// ── Data ───────────────────────────────────────────────────────────────────────

interface IssuanceYear {
  year: number;
  green: number;
  social: number;
  sustainability: number;
  linked: number;
}

const ISSUANCE_DATA: IssuanceYear[] = [
  { year: 2015, green: 42, social: 4, sustainability: 2, linked: 0 },
  { year: 2016, green: 81, social: 7, sustainability: 5, linked: 0 },
  { year: 2017, green: 155, social: 12, sustainability: 11, linked: 0 },
  { year: 2018, green: 167, social: 18, sustainability: 21, linked: 0 },
  { year: 2019, green: 258, social: 31, sustainability: 47, linked: 4 },
  { year: 2020, green: 269, social: 147, sustainability: 89, linked: 11 },
  { year: 2021, green: 517, social: 213, sustainability: 164, linked: 94 },
  { year: 2022, green: 488, social: 178, sustainability: 145, linked: 87 },
  { year: 2023, green: 575, social: 162, sustainability: 153, linked: 79 },
  { year: 2024, green: 631, social: 171, sustainability: 168, linked: 91 },
];

interface Issuer {
  name: string;
  type: "Sovereign" | "Corporate" | "Financial";
  country: string;
  totalIssuance: number;
  latestSize: number;
  currency: string;
  rating: string;
  framework: string;
  verified: boolean;
}

const TOP_ISSUERS: Issuer[] = [
  {
    name: "European Union",
    type: "Sovereign",
    country: "EU",
    totalIssuance: 68.3,
    latestSize: 12.0,
    currency: "EUR",
    rating: "AAA",
    framework: "EU Green Bond Standard",
    verified: true,
  },
  {
    name: "Germany",
    type: "Sovereign",
    country: "DE",
    totalIssuance: 62.1,
    latestSize: 8.0,
    currency: "EUR",
    rating: "AAA",
    framework: "Federal Green Bond Framework",
    verified: true,
  },
  {
    name: "France",
    type: "Sovereign",
    country: "FR",
    totalIssuance: 58.4,
    latestSize: 7.5,
    currency: "EUR",
    rating: "AA-",
    framework: "OAT Verte Framework",
    verified: true,
  },
  {
    name: "Apple Inc.",
    type: "Corporate",
    country: "US",
    totalIssuance: 14.8,
    latestSize: 2.2,
    currency: "USD",
    rating: "AAA",
    framework: "Apple Green Bond Framework",
    verified: true,
  },
  {
    name: "Enel SpA",
    type: "Corporate",
    country: "IT",
    totalIssuance: 22.6,
    latestSize: 3.5,
    currency: "EUR",
    rating: "BBB+",
    framework: "Sustainability-Linked Bond Framework",
    verified: true,
  },
  {
    name: "Bank of America",
    type: "Financial",
    country: "US",
    totalIssuance: 27.1,
    latestSize: 4.0,
    currency: "USD",
    rating: "A-",
    framework: "Environmental & Social Bond Framework",
    verified: true,
  },
  {
    name: "HSBC Holdings",
    type: "Financial",
    country: "UK",
    totalIssuance: 18.9,
    latestSize: 3.0,
    currency: "USD",
    rating: "A+",
    framework: "Sustainable Finance Framework",
    verified: true,
  },
  {
    name: "Netherlands",
    type: "Sovereign",
    country: "NL",
    totalIssuance: 31.2,
    latestSize: 5.5,
    currency: "EUR",
    rating: "AAA",
    framework: "Dutch State Green Bond Framework",
    verified: true,
  },
];

interface RegionData {
  region: string;
  share: number;
  color: string;
}

const REGION_DATA: RegionData[] = [
  { region: "Europe", share: 47, color: "#22c55e" },
  { region: "North America", share: 22, color: "#3b82f6" },
  { region: "Asia-Pacific", share: 18, color: "#a855f7" },
  { region: "Supranational", share: 9, color: "#f59e0b" },
  { region: "Other", share: 4, color: "#6b7280" },
];

interface GssBond {
  issuer: string;
  type: "Green" | "Social" | "Sustainability" | "SLB";
  size: number;
  currency: string;
  greenium: number;
  rating: string;
  maturity: number;
  coupon: number;
  useOfProceeds: string;
  spo: string;
  spoColor: string;
}

const GSS_BONDS: GssBond[] = [
  {
    issuer: "Germany (Bund)",
    type: "Green",
    size: 8.0,
    currency: "EUR",
    greenium: -0.045,
    rating: "AAA",
    maturity: 10,
    coupon: 2.1,
    useOfProceeds: "Renewable energy, transport, R&D",
    spo: "CICERO",
    spoColor: "#22c55e",
  },
  {
    issuer: "Apple Inc.",
    type: "Green",
    size: 2.2,
    currency: "USD",
    greenium: -0.031,
    rating: "AAA",
    maturity: 7,
    coupon: 3.85,
    useOfProceeds: "Clean energy, green buildings",
    spo: "Sustainalytics",
    spoColor: "#22c55e",
  },
  {
    issuer: "World Bank (IBRD)",
    type: "Sustainability",
    size: 3.5,
    currency: "USD",
    greenium: -0.028,
    rating: "AAA",
    maturity: 5,
    coupon: 4.12,
    useOfProceeds: "Climate adaptation, social programs",
    spo: "Vigeo Eiris",
    spoColor: "#3b82f6",
  },
  {
    issuer: "Enel SpA",
    type: "SLB",
    size: 3.5,
    currency: "EUR",
    greenium: -0.012,
    rating: "BBB+",
    maturity: 8,
    coupon: 3.25,
    useOfProceeds: "KPI: 60% renewable capacity by 2024",
    spo: "ISS ESG",
    spoColor: "#a855f7",
  },
  {
    issuer: "Netherlands",
    type: "Green",
    size: 5.5,
    currency: "EUR",
    greenium: -0.038,
    rating: "AAA",
    maturity: 15,
    coupon: 2.75,
    useOfProceeds: "Water management, clean transport",
    spo: "CICERO",
    spoColor: "#22c55e",
  },
  {
    issuer: "BNP Paribas",
    type: "Social",
    size: 2.0,
    currency: "EUR",
    greenium: -0.019,
    rating: "A+",
    maturity: 6,
    coupon: 3.55,
    useOfProceeds: "Affordable housing, healthcare access",
    spo: "Sustainalytics",
    spoColor: "#22c55e",
  },
];

interface YieldPoint {
  maturity: number;
  green: number;
  conventional: number;
}

const YIELD_CURVE: YieldPoint[] = [
  { maturity: 1, green: 3.82, conventional: 3.87 },
  { maturity: 2, green: 3.61, conventional: 3.67 },
  { maturity: 3, green: 3.44, conventional: 3.51 },
  { maturity: 5, green: 3.28, conventional: 3.36 },
  { maturity: 7, green: 3.35, conventional: 3.43 },
  { maturity: 10, green: 3.51, conventional: 3.60 },
  { maturity: 15, green: 3.72, conventional: 3.82 },
  { maturity: 20, green: 3.88, conventional: 3.99 },
];

interface ImpactKpi {
  year: number;
  renewableMwh: number;
  co2Avoided: number;
  greenBuildingsSqm: number;
  waterM3: number;
}

const IMPACT_DATA: ImpactKpi[] = [
  {
    year: 2019,
    renewableMwh: 112,
    co2Avoided: 48,
    greenBuildingsSqm: 3.2,
    waterM3: 0.8,
  },
  {
    year: 2020,
    renewableMwh: 198,
    co2Avoided: 82,
    greenBuildingsSqm: 5.1,
    waterM3: 1.4,
  },
  {
    year: 2021,
    renewableMwh: 341,
    co2Avoided: 144,
    greenBuildingsSqm: 9.7,
    waterM3: 2.6,
  },
  {
    year: 2022,
    renewableMwh: 428,
    co2Avoided: 181,
    greenBuildingsSqm: 13.4,
    waterM3: 3.5,
  },
  {
    year: 2023,
    renewableMwh: 512,
    co2Avoided: 218,
    greenBuildingsSqm: 17.8,
    waterM3: 4.9,
  },
  {
    year: 2024,
    renewableMwh: 623,
    co2Avoided: 264,
    greenBuildingsSqm: 22.1,
    waterM3: 6.2,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function ratingColor(r: string): string {
  if (r.startsWith("AAA") || r === "AA+") return "text-green-400";
  if (r.startsWith("AA")) return "text-emerald-400";
  if (r.startsWith("A")) return "text-primary";
  if (r.startsWith("BBB")) return "text-yellow-400";
  return "text-red-400";
}

function typeColor(t: GssBond["type"]): string {
  switch (t) {
    case "Green":
      return "bg-green-900/60 text-green-300 border-green-700";
    case "Social":
      return "bg-muted text-primary border-border";
    case "Sustainability":
      return "bg-muted text-primary border-border";
    case "SLB":
      return "bg-amber-900/60 text-amber-300 border-amber-700";
  }
}

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function IssuanceBarChart() {
  const W = 700;
  const H = 260;
  const PAD = { top: 20, right: 20, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxTotal = Math.max(
    ...ISSUANCE_DATA.map((d) => d.green + d.social + d.sustainability + d.linked),
  );
  const barW = (chartW / ISSUANCE_DATA.length) * 0.65;
  const barGap = chartW / ISSUANCE_DATA.length;

  const yTicks = [0, 200, 400, 600, 800, 1000, 1200];
  const colors = {
    green: "#22c55e",
    social: "#3b82f6",
    sustainability: "#a855f7",
    linked: "#f59e0b",
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {/* Grid lines */}
      {yTicks.map((tick) => {
        const y = PAD.top + chartH - (tick / maxTotal) * chartH;
        return (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={PAD.left + chartW}
              y1={y}
              y2={y}
              stroke="#1f2937"
              strokeWidth={1}
            />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#6b7280">
              {tick > 0 ? `$${tick}B` : "0"}
            </text>
          </g>
        );
      })}

      {/* Stacked bars */}
      {ISSUANCE_DATA.map((d, i) => {
        const x = PAD.left + i * barGap + (barGap - barW) / 2;
        const total = d.green + d.social + d.sustainability + d.linked;
        let accum = 0;

        const segments: { val: number; color: string; key: string }[] = [
          { val: d.green, color: colors.green, key: "g" },
          { val: d.social, color: colors.social, key: "s" },
          { val: d.sustainability, color: colors.sustainability, key: "su" },
          { val: d.linked, color: colors.linked, key: "l" },
        ];

        return (
          <g key={d.year}>
            {segments.map((seg) => {
              const barH = (seg.val / maxTotal) * chartH;
              const y = PAD.top + chartH - ((accum + seg.val) / maxTotal) * chartH;
              accum += seg.val;
              return (
                <rect
                  key={seg.key}
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill={seg.color}
                  opacity={0.85}
                />
              );
            })}
            <text
              x={x + barW / 2}
              y={PAD.top + chartH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#9ca3af"
            >
              {d.year}
            </text>
            {total >= 300 && (
              <text
                x={x + barW / 2}
                y={PAD.top + chartH - (total / maxTotal) * chartH - 4}
                textAnchor="middle"
                fontSize={8}
                fill="#d1d5db"
              >
                ${total}B
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      {[
        { label: "Green", color: colors.green },
        { label: "Social", color: colors.social },
        { label: "Sustainability", color: colors.sustainability },
        { label: "SLB", color: colors.linked },
      ].map((item, i) => (
        <g key={item.label} transform={`translate(${PAD.left + i * 130}, ${H - 6})`}>
          <rect x={0} y={-8} width={10} height={10} fill={item.color} rx={2} />
          <text x={14} y={1} fontSize={10} fill="#9ca3af">
            {item.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function RegionalDonut() {
  const cx = 120;
  const cy = 120;
  const r = 80;
  const inner = 48;
  const W = 320;
  const H = 240;

  let angle = -Math.PI / 2;
  const slices = REGION_DATA.map((d) => {
    const startAngle = angle;
    const sweep = (d.share / 100) * Math.PI * 2;
    angle += sweep;
    const midAngle = startAngle + sweep / 2;
    const lx = cx + (r + 18) * Math.cos(midAngle);
    const ly = cy + (r + 18) * Math.sin(midAngle);
    return { ...d, startAngle, sweep, midAngle, lx, ly };
  });

  function arcPath(sa: number, sw: number, ro: number, ri: number): string {
    const x1 = cx + ro * Math.cos(sa);
    const y1 = cy + ro * Math.sin(sa);
    const x2 = cx + ro * Math.cos(sa + sw);
    const y2 = cy + ro * Math.sin(sa + sw);
    const ix1 = cx + ri * Math.cos(sa + sw);
    const iy1 = cy + ri * Math.sin(sa + sw);
    const ix2 = cx + ri * Math.cos(sa);
    const iy2 = cy + ri * Math.sin(sa);
    const lg = sw > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${ro} ${ro} 0 ${lg} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${lg} 0 ${ix2} ${iy2} Z`;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      {slices.map((sl) => (
        <path
          key={sl.region}
          d={arcPath(sl.startAngle, sl.sweep, r, inner)}
          fill={sl.color}
          opacity={0.85}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#f9fafb">
        $1.06T
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill="#9ca3af">
        2024 total
      </text>

      {/* Legend on the right */}
      {REGION_DATA.map((d, i) => (
        <g key={d.region} transform={`translate(220, ${40 + i * 38})`}>
          <rect x={0} y={-10} width={12} height={12} fill={d.color} rx={2} />
          <text x={16} y={1} fontSize={11} fill="#e5e7eb">
            {d.region}
          </text>
          <text x={16} y={14} fontSize={10} fill="#6b7280">
            {d.share}%
          </text>
        </g>
      ))}
    </svg>
  );
}

function YieldComparisonChart() {
  const W = 600;
  const H = 240;
  const PAD = { top: 20, right: 20, bottom: 36, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const yVals = YIELD_CURVE.flatMap((d) => [d.green, d.conventional]);
  const yMin = Math.min(...yVals) - 0.1;
  const yMax = Math.max(...yVals) + 0.1;
  const xMin = YIELD_CURVE[0].maturity;
  const xMax = YIELD_CURVE[YIELD_CURVE.length - 1].maturity;

  function toX(m: number) {
    return PAD.left + ((m - xMin) / (xMax - xMin)) * chartW;
  }
  function toY(v: number) {
    return PAD.top + chartH - ((v - yMin) / (yMax - yMin)) * chartH;
  }

  const greenPath = YIELD_CURVE.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.maturity)} ${toY(d.green)}`).join(" ");
  const convPath = YIELD_CURVE.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.maturity)} ${toY(d.conventional)}`).join(" ");

  const yTicks = [3.2, 3.4, 3.6, 3.8, 4.0, 4.2];
  const xLabels = [1, 2, 3, 5, 7, 10, 15, 20];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 240 }}>
      {yTicks.map((t) => {
        const y = toY(t);
        return (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + chartW} y1={y} y2={y} stroke="#1f2937" strokeWidth={1} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#6b7280">
              {t.toFixed(1)}%
            </text>
          </g>
        );
      })}

      {xLabels.map((m) => (
        <text
          key={m}
          x={toX(m)}
          y={PAD.top + chartH + 14}
          textAnchor="middle"
          fontSize={10}
          fill="#6b7280"
        >
          {m}Y
        </text>
      ))}

      {/* Greenium fill area */}
      <path
        d={`${convPath} L ${toX(xMax)} ${toY(yMin + 0.1)} L ${toX(xMin)} ${toY(yMin + 0.1)} Z`}
        fill="none"
      />

      <path d={convPath} stroke="#6b7280" strokeWidth={2} fill="none" strokeDasharray="5,3" />
      <path d={greenPath} stroke="#22c55e" strokeWidth={2.5} fill="none" />

      {YIELD_CURVE.map((d) => (
        <circle key={d.maturity} cx={toX(d.maturity)} cy={toY(d.green)} r={3.5} fill="#22c55e" />
      ))}

      {/* Legend */}
      <g transform={`translate(${PAD.left + 10}, ${PAD.top + 10})`}>
        <line x1={0} x2={18} y1={5} y2={5} stroke="#22c55e" strokeWidth={2.5} />
        <text x={22} y={9} fontSize={10} fill="#9ca3af">Green Bond Yield</text>
        <line x1={100} x2={118} y1={5} y2={5} stroke="#6b7280" strokeWidth={2} strokeDasharray="5,3" />
        <text x={122} y={9} fontSize={10} fill="#9ca3af">Conventional Peer</text>
      </g>
    </svg>
  );
}

function ImpactBarChart({
  data,
  color,
  unit,
}: {
  data: { year: number; value: number }[];
  color: string;
  unit: string;
}) {
  const W = 480;
  const H = 160;
  const PAD = { top: 14, right: 14, bottom: 28, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.map((d) => d.value)) * 1.1;
  const barW = (chartW / data.length) * 0.6;
  const barGap = chartW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 160 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const val = maxVal * frac;
        const y = PAD.top + chartH - frac * chartH;
        return (
          <g key={frac}>
            <line x1={PAD.left} x2={PAD.left + chartW} y1={y} y2={y} stroke="#1f2937" strokeWidth={1} />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#6b7280">
              {val > 99 ? Math.round(val) : val.toFixed(1)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = PAD.left + i * barGap + (barGap - barW) / 2;
        const y = PAD.top + chartH - barH;
        return (
          <g key={d.year}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx={2} opacity={0.85} />
            <text x={x + barW / 2} y={PAD.top + chartH + 13} textAnchor="middle" fontSize={9} fill="#6b7280">
              {d.year}
            </text>
          </g>
        );
      })}
      <text x={PAD.left} y={PAD.top - 2} fontSize={9} fill="#6b7280">
        {unit}
      </text>
    </svg>
  );
}

// ── Sub-sections ───────────────────────────────────────────────────────────────

function IcmaComponent({
  num,
  title,
  desc,
  items,
  color,
}: {
  num: string;
  title: string;
  desc: string;
  items: string[];
  color: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="text-xs text-muted-foreground font-semibold px-2 py-1 rounded"
          style={{ background: color + "33", color }}
        >
          {num}
        </span>
        <span className="font-semibold text-sm text-foreground flex-1">{title}</span>
        {open ? (
          <ChevronUp size={14} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-border">
              <p className="text-xs text-muted-foreground mt-3">{desc}</p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={12} className="mt-0.5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default function GreenBondsPage() {
  const [selectedBond, setSelectedBond] = useState<GssBond | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Derived impact series
  const renewableSeries = useMemo(
    () => IMPACT_DATA.map((d) => ({ year: d.year, value: d.renewableMwh })),
    [],
  );
  const co2Series = useMemo(
    () => IMPACT_DATA.map((d) => ({ year: d.year, value: d.co2Avoided })),
    [],
  );
  const buildingSeries = useMemo(
    () => IMPACT_DATA.map((d) => ({ year: d.year, value: d.greenBuildingsSqm })),
    [],
  );
  const waterSeries = useMemo(
    () => IMPACT_DATA.map((d) => ({ year: d.year, value: d.waterM3 })),
    [],
  );

  // Market total stats
  const total2024 = ISSUANCE_DATA[ISSUANCE_DATA.length - 1];
  const totalGssMarket = 3800; // cumulative $B

  // Suppress unused rand calls to ensure PRNG state advances for deterministic data
  void ri(0, 10);

  const statChips = [
    { label: "2024 GSS Issuance", value: `$${total2024.green + total2024.social + total2024.sustainability + total2024.linked}B`, icon: BarChart2, color: "text-green-400" },
    { label: "Cumulative Market", value: `$${totalGssMarket}B`, icon: Globe, color: "text-primary" },
    { label: "Avg Greenium", value: "-3.2 bps", icon: TrendingDown, color: "text-emerald-400" },
    { label: "Verified Frameworks", value: "94%", icon: Shield, color: "text-primary" },
    { label: "Active Issuers", value: "4,200+", icon: Building2, color: "text-amber-400" },
    { label: "SDG Coverage", value: "13 of 17", icon: Award, color: "text-pink-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
      {/* Header — Hero */}
      <div className="mb-6 border-l-4 border-l-primary rounded-lg bg-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-green-900/40 border border-green-800/50">
            <Leaf size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Green, Social & Sustainability Bonds</h1>
            <p className="text-xs text-muted-foreground">
              GSS frameworks · use of proceeds · second-party opinions · impact reporting · greenium
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 space-y-4">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="frameworks" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            Frameworks
          </TabsTrigger>
          <TabsTrigger value="deals" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            Deal Analysis
          </TabsTrigger>
          <TabsTrigger value="impact" className="text-xs text-muted-foreground data-[state=active]:bg-muted">
            Impact Reporting
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Market Overview ─────────────────────────────────────────── */}
        <TabsContent value="overview" className="data-[state=inactive]:hidden space-y-5">
          {/* Stats chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statChips.map((chip) => (
              <Card key={chip.label} className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <chip.icon size={13} className={chip.color} />
                    <span className="text-xs text-muted-foreground">{chip.label}</span>
                  </div>
                  <p className={`text-base font-medium ${chip.color}`}>{chip.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Issuance chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <BarChart2 size={14} className="text-green-400" />
                Annual GSS Bond Issuance 2015–2024 (USD Billions)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <IssuanceBarChart />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Regional donut */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Globe size={14} className="text-muted-foreground/50" />
                  Regional Breakdown — 2024
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <RegionalDonut />
              </CardContent>
            </Card>

            {/* Top issuers */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Building2 size={14} className="text-amber-400" />
                  Top Issuers by Cumulative Volume
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 overflow-x-auto">
                <table className="w-full text-xs text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-2 text-left font-medium">Issuer</th>
                      <th className="pb-2 text-center font-medium">Type</th>
                      <th className="pb-2 text-right font-medium">Total ($B)</th>
                      <th className="pb-2 text-center font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_ISSUERS.map((iss, i) => (
                      <motion.tr
                        key={iss.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border/20 hover:bg-muted/30"
                      >
                        <td className="py-1.5 font-medium text-foreground">{iss.name}</td>
                        <td className="py-1.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs text-muted-foreground border ${
                              iss.type === "Sovereign"
                                ? "bg-amber-900/40 text-amber-300 border-amber-800"
                                : iss.type === "Corporate"
                                  ? "bg-muted/60 text-primary border-border"
                                  : "bg-muted/60 text-primary border-border"
                            }`}
                          >
                            {iss.type}
                          </span>
                        </td>
                        <td className="py-1.5 text-right font-mono text-green-400">
                          {iss.totalIssuance.toFixed(1)}
                        </td>
                        <td className={`py-1.5 text-center font-mono text-xs text-muted-foreground ${ratingColor(iss.rating)}`}>
                          {iss.rating}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: Frameworks ─────────────────────────────────────────────── */}
        <TabsContent value="frameworks" className="data-[state=inactive]:hidden space-y-5">
          {/* ICMA Principles */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <FileText size={14} className="text-green-400" />
                ICMA Green Bond Principles — 4 Core Components
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                The International Capital Market Association (ICMA) Green Bond Principles provide
                voluntary process guidelines that recommend transparency and disclosure.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <IcmaComponent
                num="1"
                title="Use of Proceeds"
                desc="The cornerstone of any green, social or sustainability bond. Net proceeds must be applied to eligible green or social projects."
                items={[
                  "Renewable energy (solar, wind, geothermal, tidal, hydro)",
                  "Energy efficiency (buildings, storage, smart grids, appliances)",
                  "Pollution prevention & control (solid waste management, wastewater treatment)",
                  "Sustainable land use, biodiversity conservation, marine protection",
                  "Clean transportation (EVs, public transit, rail, non-motorised)",
                  "Sustainable water & wastewater management",
                  "Climate change adaptation (early-warning systems, coastal resilience)",
                ]}
                color="#22c55e"
              />
              <IcmaComponent
                num="2"
                title="Project Evaluation & Selection"
                desc="Issuers must communicate the environmental sustainability objectives, the process for determining how projects fit, and related eligibility criteria."
                items={[
                  "Publicly state environmental sustainability objectives",
                  "Describe the decision-making process for green project selection",
                  "Communicate eligibility criteria for green categories",
                  "Address potentially material environmental and social risks",
                  "Use science-based thresholds where possible (e.g. EU Taxonomy)",
                  "Disclose information on the Green Bond Committee or equivalent",
                ]}
                color="#3b82f6"
              />
              <IcmaComponent
                num="3"
                title="Management of Proceeds"
                desc="Net proceeds should be credited to a sub-account or tracked in a sub-portfolio, enabling audit trail from issuance to project allocation."
                items={[
                  "Earmark net proceeds to dedicated sub-account or tracked sub-portfolio",
                  "Formally document unallocated proceeds held in cash or liquid instruments",
                  "Internal audit or third-party assurance of tracking mechanism",
                  "Re-investment of unallocated proceeds into money-market or ESG instruments",
                  "Disclose management policy for unallocated proceeds",
                ]}
                color="#a855f7"
              />
              <IcmaComponent
                num="4"
                title="Reporting"
                desc="Annual (minimum) reporting on use of proceeds and expected/achieved impact. Quantitative performance indicators required."
                items={[
                  "Annual allocation report: amount allocated per eligible category",
                  "Impact report: quantitative KPIs (MWh, tCO2e, m², m³)",
                  "Balanced reporting including negative impacts where relevant",
                  "Alignment with recognised frameworks (GRI, SASB, TCFD)",
                  "Verification or certification by independent reviewer",
                  "Post-allocation reporting until full disbursement",
                ]}
                color="#f59e0b"
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SFDR Classification */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Shield size={14} className="text-muted-foreground/50" />
                  SFDR Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    article: "Article 6",
                    title: "No ESG Integration",
                    desc: "Product does not promote environmental/social characteristics and does not have a sustainable investment objective.",
                    color: "text-muted-foreground",
                    bg: "bg-muted/60",
                    border: "border-border",
                    applicable: false,
                  },
                  {
                    article: "Article 8",
                    title: "Light Green",
                    desc: "Product promotes environmental or social characteristics using binding elements. Partial ESG integration with PAI consideration.",
                    color: "text-emerald-400",
                    bg: "bg-emerald-900/30",
                    border: "border-emerald-800",
                    applicable: true,
                  },
                  {
                    article: "Article 9",
                    title: "Dark Green",
                    desc: "Product has a sustainable investment as its objective. All investments must qualify as sustainable with DNSH compliance.",
                    color: "text-green-400",
                    bg: "bg-green-900/40",
                    border: "border-green-800",
                    applicable: true,
                  },
                ].map((item) => (
                  <div
                    key={item.article}
                    className={`p-3 rounded-lg border ${item.bg} ${item.border}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs text-muted-foreground font-medium ${item.color}`}>{item.article}</span>
                      <span className={`text-xs text-muted-foreground font-medium ${item.color}`}>{item.title}</span>
                      {item.applicable ? (
                        <CheckCircle size={12} className="text-green-500" />
                      ) : (
                        <XCircle size={12} className="text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* EU Taxonomy */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Globe size={14} className="text-green-400" />
                  EU Taxonomy — 6 Environmental Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  {
                    num: 1,
                    title: "Climate Change Mitigation",
                    icon: Sun,
                    color: "text-green-400",
                    aligned: true,
                    desc: "Substantially reduces GHG emissions. Core focus of EU green bonds.",
                  },
                  {
                    num: 2,
                    title: "Climate Change Adaptation",
                    icon: Wind,
                    color: "text-primary",
                    aligned: true,
                    desc: "Reduces risk from physical climate impacts on people and nature.",
                  },
                  {
                    num: 3,
                    title: "Sustainable Water & Marine Resources",
                    icon: Droplets,
                    color: "text-muted-foreground",
                    aligned: true,
                    desc: "Protects or restores water bodies and marine ecosystems.",
                  },
                  {
                    num: 4,
                    title: "Circular Economy Transition",
                    icon: Zap,
                    color: "text-amber-400",
                    aligned: false,
                    desc: "Prevents waste, promotes reuse and recycling. TSC under review.",
                  },
                  {
                    num: 5,
                    title: "Pollution Prevention & Control",
                    icon: Shield,
                    color: "text-primary",
                    aligned: false,
                    desc: "Prevents, reduces or controls pollution of air, water and soil.",
                  },
                  {
                    num: 6,
                    title: "Biodiversity & Ecosystems",
                    icon: Leaf,
                    color: "text-emerald-400",
                    aligned: false,
                    desc: "Protects, restores and sustainably uses biodiversity and ecosystems.",
                  },
                ].map((obj) => (
                  <div
                    key={obj.num}
                    className="flex items-start gap-3 p-2.5 rounded border border-border bg-muted/30"
                  >
                    <obj.icon size={14} className={`${obj.color} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{obj.title}</span>
                        <span
                          className={`text-xs text-muted-foreground px-1.5 py-0.5 rounded border ${
                            obj.aligned
                              ? "bg-green-900/40 text-green-300 border-green-800"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {obj.aligned ? "TSC finalised" : "TSC pending"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{obj.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-2 p-2.5 rounded border border-border bg-muted/40">
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={12} className="text-muted-foreground/50" />
                    <span className="text-xs font-semibold text-primary">CBI Certification</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Climate Bonds Initiative certification provides assurance that assets are
                    consistent with a 1.5°C economy. Sector-specific criteria cover buildings, energy,
                    transport, water, land use and ICT under the Climate Bonds Standard v4.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 3: Deal Analysis ───────────────────────────────────────────── */}
        <TabsContent value="deals" className="data-[state=inactive]:hidden space-y-5">
          {/* Bond table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <FileText size={14} className="text-green-400" />
                Sample GSS Bond Universe
              </CardTitle>
              <p className="text-xs text-muted-foreground">Click a row to view spread details</p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs text-muted-foreground min-w-[620px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2 text-left font-medium">Issuer</th>
                    <th className="pb-2 text-center font-medium">Type</th>
                    <th className="pb-2 text-right font-medium">Size</th>
                    <th className="pb-2 text-right font-medium">Coupon</th>
                    <th className="pb-2 text-right font-medium">Greenium</th>
                    <th className="pb-2 text-center font-medium">Rating</th>
                    <th className="pb-2 text-left font-medium">SPO</th>
                  </tr>
                </thead>
                <tbody>
                  {GSS_BONDS.map((bond, i) => (
                    <motion.tr
                      key={bond.issuer}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-b border-border/20 cursor-pointer transition-colors ${
                        selectedBond?.issuer === bond.issuer
                          ? "bg-muted/40"
                          : "hover:bg-muted/30"
                      }`}
                      onClick={() =>
                        setSelectedBond(selectedBond?.issuer === bond.issuer ? null : bond)
                      }
                    >
                      <td className="py-2 font-medium text-foreground">{bond.issuer}</td>
                      <td className="py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs text-muted-foreground border ${typeColor(bond.type)}`}>
                          {bond.type}
                        </span>
                      </td>
                      <td className="py-2 text-right font-mono text-muted-foreground">
                        {bond.currency} {bond.size.toFixed(1)}B
                      </td>
                      <td className="py-2 text-right font-mono text-primary">
                        {bond.coupon.toFixed(2)}%
                      </td>
                      <td className={`py-2 text-right font-mono font-semibold ${bond.greenium < 0 ? "text-green-400" : "text-red-400"}`}>
                        {bond.greenium > 0 ? "+" : ""}
                        {(bond.greenium * 100).toFixed(1)} bps
                      </td>
                      <td className={`py-2 text-center font-mono ${ratingColor(bond.rating)}`}>
                        {bond.rating}
                      </td>
                      <td className="py-2">
                        <span className="text-xs font-medium" style={{ color: bond.spoColor }}>
                          {bond.spo}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Detail panel */}
              <AnimatePresence>
                {selectedBond && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 rounded-lg border border-border bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {selectedBond.issuer}
                        </span>
                        <span
                          className={`text-xs text-muted-foreground px-2 py-0.5 rounded border ${typeColor(selectedBond.type)}`}
                        >
                          {selectedBond.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                        <div>
                          <p className="text-muted-foreground">Maturity</p>
                          <p className="font-medium text-foreground">{selectedBond.maturity}Y</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium text-foreground">
                            {selectedBond.currency} {selectedBond.size}B
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Greenium</p>
                          <p className="font-medium text-green-400">
                            {(selectedBond.greenium * 100).toFixed(1)} bps
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">SPO Provider</p>
                          <p className="font-medium" style={{ color: selectedBond.spoColor }}>
                            {selectedBond.spo}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Use of Proceeds</p>
                        <p className="text-xs text-muted-foreground bg-card/60 px-2 py-1 rounded">
                          {selectedBond.useOfProceeds}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Yield Comparison */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <TrendingUp size={14} className="text-green-400" />
                Green Bond vs Conventional Peer Yield Curve
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                The "greenium" is the negative spread — green bonds yield less than comparable
                conventional bonds, reflecting higher investor demand for ESG assets.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <YieldComparisonChart />
            </CardContent>
          </Card>

          {/* Spread Analysis + SPO providers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <BarChart2 size={14} className="text-muted-foreground/50" />
                  Spread Analysis by Bond Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: "Sovereign Green", spread: -4.2, max: 6 },
                  { type: "Corporate Green", spread: -2.8, max: 6 },
                  { type: "Financial Green", spread: -2.1, max: 6 },
                  { type: "Social Bond", spread: -1.6, max: 6 },
                  { type: "Sustainability Bond", spread: -2.3, max: 6 },
                  { type: "SLB (on-track)", spread: -0.9, max: 6 },
                  { type: "SLB (off-track)", spread: +1.4, max: 6 },
                ].map((row) => (
                  <div key={row.type}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{row.type}</span>
                      <span className={row.spread < 0 ? "text-green-400" : "text-red-400"}>
                        {row.spread > 0 ? "+" : ""}
                        {row.spread.toFixed(1)} bps
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.spread < 0 ? "bg-green-500" : "bg-red-500"}`}
                        style={{
                          width: `${(Math.abs(row.spread) / row.max) * 100}%`,
                          marginLeft: row.spread >= 0 ? "50%" : undefined,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Shield size={14} className="text-muted-foreground/50" />
                  Second-Party Opinion Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  {
                    name: "CICERO Shades of Green",
                    market: "35%",
                    strength: "Dark/Medium/Light green shading",
                    color: "#22c55e",
                  },
                  {
                    name: "Sustainalytics",
                    market: "28%",
                    strength: "ICMA alignment + portfolio screen",
                    color: "#3b82f6",
                  },
                  {
                    name: "ISS ESG",
                    market: "15%",
                    strength: "SLB KPI calibration + step-up review",
                    color: "#a855f7",
                  },
                  {
                    name: "Vigeo Eiris (Moody's)",
                    market: "10%",
                    strength: "Comprehensive ESG risk overlay",
                    color: "#f59e0b",
                  },
                  {
                    name: "S&P Global Ratings",
                    market: "7%",
                    strength: "Credit + sustainability integration",
                    color: "#ef4444",
                  },
                  {
                    name: "Other / Boutique",
                    market: "5%",
                    strength: "Specialist sector reviewers",
                    color: "#6b7280",
                  },
                ].map((spo) => (
                  <div
                    key={spo.name}
                    className="flex items-center gap-3 p-2.5 rounded border border-border bg-muted/30"
                  >
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ background: spo.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{spo.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{spo.market}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{spo.strength}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 4: Impact Reporting ────────────────────────────────────────── */}
        <TabsContent value="impact" className="data-[state=inactive]:hidden space-y-5">
          {/* KPI charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                  <Sun size={12} className="text-yellow-400" />
                  Renewable Energy Generated (TWh/yr)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ImpactBarChart data={renewableSeries} color="#f59e0b" unit="TWh" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                  <Wind size={12} className="text-green-400" />
                  CO₂ Emissions Avoided (MtCO₂e/yr)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ImpactBarChart data={co2Series} color="#22c55e" unit="MtCO₂e" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                  <Building2 size={12} className="text-muted-foreground/50" />
                  Green Buildings Certified (million m²)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ImpactBarChart data={buildingSeries} color="#3b82f6" unit="M m²" />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                  <Droplets size={12} className="text-muted-foreground" />
                  Sustainable Water Treatment (bn m³/yr)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ImpactBarChart data={waterSeries} color="#06b6d4" unit="Bn m³" />
              </CardContent>
            </Card>
          </div>

          {/* KPI tracking table */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <BarChart2 size={14} className="text-green-400" />
                Cumulative Impact KPI Tracker — 2024
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs text-muted-foreground min-w-[540px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-2 text-left font-medium">KPI Metric</th>
                    <th className="pb-2 text-right font-medium">2022</th>
                    <th className="pb-2 text-right font-medium">2023</th>
                    <th className="pb-2 text-right font-medium">2024</th>
                    <th className="pb-2 text-right font-medium">YoY</th>
                    <th className="pb-2 text-left font-medium pl-3">SDGs</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      metric: "Renewable Energy (TWh)",
                      v22: 428,
                      v23: 512,
                      v24: 623,
                      sdgs: ["SDG 7", "SDG 13"],
                    },
                    {
                      metric: "CO₂ Avoided (MtCO₂e)",
                      v22: 181,
                      v23: 218,
                      v24: 264,
                      sdgs: ["SDG 13", "SDG 15"],
                    },
                    {
                      metric: "Green Buildings (M m²)",
                      v22: 13.4,
                      v23: 17.8,
                      v24: 22.1,
                      sdgs: ["SDG 11", "SDG 9"],
                    },
                    {
                      metric: "Sustainable Water (Bn m³)",
                      v22: 3.5,
                      v23: 4.9,
                      v24: 6.2,
                      sdgs: ["SDG 6", "SDG 14"],
                    },
                    {
                      metric: "Green Transport (Bn pkm)",
                      v22: 142,
                      v23: 189,
                      v24: 231,
                      sdgs: ["SDG 11", "SDG 13"],
                    },
                    {
                      metric: "Land Protected (M ha)",
                      v22: 4.1,
                      v23: 5.6,
                      v24: 7.3,
                      sdgs: ["SDG 15", "SDG 14"],
                    },
                  ].map((row) => {
                    const growth = ((row.v24 - row.v23) / row.v23) * 100;
                    return (
                      <tr key={row.metric} className="border-b border-border/20 hover:bg-muted/20">
                        <td className="py-2 text-foreground font-medium">{row.metric}</td>
                        <td className="py-2 text-right font-mono text-muted-foreground">{row.v22}</td>
                        <td className="py-2 text-right font-mono text-muted-foreground">{row.v23}</td>
                        <td className="py-2 text-right font-mono text-green-400 font-medium">
                          {row.v24}
                        </td>
                        <td className="py-2 text-right">
                          <span className={`text-xs font-medium ${growth >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {growth >= 0 ? "+" : ""}
                            {growth.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 pl-3">
                          <div className="flex gap-1 flex-wrap">
                            {row.sdgs.map((sdg) => (
                              <span
                                key={sdg}
                                className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-primary border border-border"
                              >
                                {sdg}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* UN SDG alignment + Additionality debate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Globe size={14} className="text-muted-foreground/50" />
                  UN SDG Alignment Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { sdg: "SDG 6", title: "Clean Water & Sanitation", pct: 58, color: "#06b6d4" },
                  { sdg: "SDG 7", title: "Affordable & Clean Energy", pct: 92, color: "#f59e0b" },
                  { sdg: "SDG 9", title: "Industry, Innovation & Infrastructure", pct: 64, color: "#8b5cf6" },
                  { sdg: "SDG 11", title: "Sustainable Cities & Communities", pct: 71, color: "#f97316" },
                  { sdg: "SDG 13", title: "Climate Action", pct: 97, color: "#22c55e" },
                  { sdg: "SDG 14", title: "Life Below Water", pct: 23, color: "#3b82f6" },
                  { sdg: "SDG 15", title: "Life on Land", pct: 38, color: "#84cc16" },
                ].map((row) => (
                  <div key={row.sdg}>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className="text-muted-foreground">
                        <span className="font-medium" style={{ color: row.color }}>{row.sdg}</span>
                        {" — "}
                        {row.title}
                      </span>
                      <span className="text-muted-foreground">{row.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.pct}%`, background: row.color }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  % of active GSS bond proceeds mapped to each SDG (CBI 2024 estimate)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-400" />
                  Additionality Debate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Additionality asks whether green bond financing actually causes a new environmental
                  outcome — or merely refinances projects that would have happened anyway.
                </p>

                <div className="space-y-2">
                  {[
                    {
                      side: "Pro-Additionality",
                      color: "text-green-400",
                      border: "border-green-800",
                      bg: "bg-green-900/20",
                      icon: CheckCircle,
                      iconColor: "text-green-500",
                      points: [
                        "Lower funding cost enables marginal green projects that NPV-negative at conventional rates",
                        "Earmarked proceeds ring-fence spending — cannot be diverted",
                        "ICMA reporting requirements raise management attention and focus",
                        "CBI/EU Taxonomy alignment raises the bar for eligible projects",
                      ],
                    },
                    {
                      side: "Sceptical View",
                      color: "text-amber-400",
                      border: "border-amber-800",
                      bg: "bg-amber-900/20",
                      icon: XCircle,
                      iconColor: "text-amber-500",
                      points: [
                        "Greenium is typically only 2–5 bps — rarely material for investment decisions",
                        "Many large issuers would have financed projects regardless",
                        "Greenwashing risk: weak SPO standards and self-certification",
                        "No ex-ante proof of counterfactual — additionality is inherently unprovable",
                      ],
                    },
                  ].map((block) => (
                    <div
                      key={block.side}
                      className={`p-3 rounded-lg border ${block.bg} ${block.border}`}
                    >
                      <p className={`text-xs text-muted-foreground font-medium mb-2 ${block.color}`}>{block.side}</p>
                      <ul className="space-y-1">
                        {block.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <block.icon size={11} className={`mt-0.5 shrink-0 ${block.iconColor}`} />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded border border-border bg-muted/40 flex items-start gap-2">
                  <Info size={12} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    Academic consensus (Flammer 2021, Ehlers & Packer 2017) finds modest but
                    statistically significant improvements in environmental performance post-issuance,
                    suggesting partial additionality via reputational commitment mechanisms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
