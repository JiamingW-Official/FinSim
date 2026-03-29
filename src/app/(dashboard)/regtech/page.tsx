"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Globe,
  TrendingUp,
  Search,
  Users,
  Zap,
  BarChart2,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Building2,
  Eye,
  Filter,
  Database,
  Network,
  Cpu,
  Lock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Seeded PRNG — seed 861
let s = 861;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate random values
const rvals = Array.from({ length: 120 }, () => rand());
let ri = 0;
const r = () => rvals[ri++ % rvals.length];

// ─── Data ────────────────────────────────────────────────────────────────────

const AML_FINES = [
  { bank: "HSBC", year: 2012, fine: 1920, reason: "Mexican drug cartel laundering" },
  { bank: "BNP Paribas", year: 2014, fine: 8970, reason: "Sanctions violations (Sudan/Iran)" },
  { bank: "Standard Chartered", year: 2019, fine: 1100, reason: "Iran sanctions breaches" },
  { bank: "Deutsche Bank", year: 2017, fine: 630, reason: "Russian mirror trading" },
  { bank: "Commerzbank", year: 2015, fine: 1450, reason: "Iran/Sudan sanctions violations" },
  { bank: "Wachovia", year: 2010, fine: 160, reason: "Drug cartel money laundering" },
];

const RISK_FACTORS = [
  { factor: "Transaction Volume", weight: 18, desc: "Frequency & size of transactions" },
  { factor: "Geographic Risk", weight: 15, desc: "High-risk jurisdictions" },
  { factor: "Industry Type", weight: 14, desc: "Cash-intensive sectors" },
  { factor: "PEP Status", weight: 13, desc: "Politically exposed persons" },
  { factor: "Adverse Media", weight: 12, desc: "Negative news screening" },
  { factor: "Ownership Structure", weight: 10, desc: "Complex beneficial ownership" },
  { factor: "Account Age", weight: 7, desc: "New vs established relationships" },
  { factor: "Sanctions History", weight: 5, desc: "Prior screening hits" },
  { factor: "Source of Funds", weight: 4, desc: "Unexplained wealth" },
  { factor: "Customer Type", weight: 2, desc: "Retail vs institutional" },
];

const RULE_CHANGES = [
  { year: 2010, count: 210 },
  { year: 2011, count: 256 },
  { year: 2012, count: 289 },
  { year: 2013, count: 315 },
  { year: 2014, count: 368 },
  { year: 2015, count: 401 },
  { year: 2016, count: 447 },
  { year: 2017, count: 512 },
  { year: 2018, count: 574 },
  { year: 2019, count: 621 },
  { year: 2020, count: 698 },
  { year: 2021, count: 752 },
  { year: 2022, count: 803 },
  { year: 2023, count: 876 },
  { year: 2024, count: 941 },
];

const COMPLIANCE_COST = [
  { year: 2015, pct: 2.1 },
  { year: 2016, pct: 2.4 },
  { year: 2017, pct: 2.8 },
  { year: 2018, pct: 3.2 },
  { year: 2019, pct: 3.7 },
  { year: 2020, pct: 4.1 },
  { year: 2021, pct: 4.6 },
  { year: 2022, pct: 5.0 },
  { year: 2023, pct: 5.3 },
  { year: 2024, pct: 5.6 },
];

const SANCTION_LISTS = [
  { name: "OFAC SDN", jurisdiction: "US", entries: 14200, type: "Sanctions" },
  { name: "OFAC Non-SDN", jurisdiction: "US", entries: 9800, type: "Restricted" },
  { name: "EU Consolidated", jurisdiction: "EU", entries: 5600, type: "Sanctions" },
  { name: "UN Security Council", jurisdiction: "UN", entries: 3100, type: "Sanctions" },
  { name: "HMT (UK)", jurisdiction: "UK", entries: 4700, type: "Financial Sanctions" },
  { name: "OFSI", jurisdiction: "UK", entries: 3900, type: "Sanctions" },
];

const MATCHING_ALGOS = [
  { name: "Exact Match", precision: 99, recall: 42, fpr: 1, speed: "< 1ms" },
  { name: "Fuzzy Match", precision: 84, recall: 78, fpr: 16, speed: "2–5ms" },
  { name: "Phonetic (Soundex)", precision: 71, recall: 85, fpr: 29, speed: "3ms" },
  { name: "ML Ensemble", precision: 93, recall: 91, fpr: 7, speed: "8–15ms" },
  { name: "Transformer NLP", precision: 97, recall: 95, fpr: 3, speed: "20–40ms" },
];

const REGTECH_VENDORS = [
  { name: "ComplyAdvantage", focus: "AML/KYC", region: "Global", stage: "Scale-up" },
  { name: "Refinitiv", focus: "Sanctions/KYC", region: "Global", stage: "Enterprise" },
  { name: "Regnology", focus: "Reg Reporting", region: "EU/APAC", stage: "Enterprise" },
  { name: "Suade", focus: "COREP/FINREP", region: "EU", stage: "Scale-up" },
  { name: "Temenos Financial Crime", focus: "AML", region: "Global", stage: "Enterprise" },
  { name: "Hawk AI", focus: "AML Monitoring", region: "Global", stage: "Growth" },
  { name: "Ayasdi", focus: "ML AML", region: "US", stage: "Scale-up" },
  { name: "Fenergo", focus: "CLM/KYC", region: "Global", stage: "Enterprise" },
];

const FUNDING_SECTORS = [
  { sector: "AML/KYC", pct: 34, color: "#6366f1" },
  { sector: "Regulatory Reporting", pct: 22, color: "#8b5cf6" },
  { sector: "Risk Management", pct: 18, color: "#a78bfa" },
  { sector: "Sanctions", pct: 12, color: "#c4b5fd" },
  { sector: "Fraud Detection", pct: 9, color: "#ddd6fe" },
  { sector: "Other", pct: 5, color: "#4b5563" },
];

const SANDBOX_PARTICIPANTS = [
  { country: "UK (FCA)", cohorts: 12, firms: 280 },
  { country: "Singapore (MAS)", cohorts: 8, firms: 190 },
  { country: "EU (ESMA)", cohorts: 5, firms: 120 },
  { country: "US (OCC)", cohorts: 3, firms: 72 },
  { country: "Australia (ASIC)", cohorts: 6, firms: 145 },
  { country: "UAE (ADGM)", cohorts: 4, firms: 95 },
];

// ─── SVG Helpers ─────────────────────────────────────────────────────────────

function FalsePositiveChart() {
  const W = 480;
  const H = 200;
  const pad = { t: 20, r: 20, b: 40, l: 50 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  // Rule-based FPR: high, slowly declining
  const ruleData = [92, 89, 87, 85, 83, 80, 78, 76, 74, 72];
  // ML FPR: starts lower, drops further
  const mlData = [85, 74, 62, 51, 43, 35, 28, 22, 17, 12];
  const n = ruleData.length;

  const xScale = (i: number) => pad.l + (i / (n - 1)) * cw;
  const yScale = (v: number) => pad.t + ch - (v / 100) * ch;

  const rulePath = ruleData
    .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`)
    .join(" ");
  const mlPath = mlData
    .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`)
    .join(" ");

  const yTicks = [0, 20, 40, 60, 80, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={pad.l}
            y1={yScale(t)}
            x2={pad.l + cw}
            y2={yScale(t)}
            stroke="#374151"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
          <text x={pad.l - 6} y={yScale(t) + 4} fill="#9ca3af" fontSize={10} textAnchor="end">
            {t}%
          </text>
        </g>
      ))}

      {/* X axis labels */}
      {ruleData.map((_, i) => (
        <text
          key={i}
          x={xScale(i)}
          y={H - 8}
          fill="#9ca3af"
          fontSize={9}
          textAnchor="middle"
        >
          Y{i + 1}
        </text>
      ))}

      {/* Lines */}
      <path d={rulePath} fill="none" stroke="#f59e0b" strokeWidth={2} />
      <path d={mlPath} fill="none" stroke="#6366f1" strokeWidth={2} />

      {/* Dots */}
      {ruleData.map((v, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3} fill="#f59e0b" />
      ))}
      {mlData.map((v, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(v)} r={3} fill="#6366f1" />
      ))}

      {/* Legend */}
      <rect x={pad.l} y={pad.t} width={10} height={3} fill="#f59e0b" rx={1} />
      <text x={pad.l + 14} y={pad.t + 5} fill="#f59e0b" fontSize={10}>
        Rule-based
      </text>
      <rect x={pad.l + 90} y={pad.t} width={10} height={3} fill="#6366f1" rx={1} />
      <text x={pad.l + 104} y={pad.t + 5} fill="#6366f1" fontSize={10}>
        ML-based
      </text>

      {/* Y axis label */}
      <text
        x={12}
        y={H / 2}
        fill="#6b7280"
        fontSize={10}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${H / 2})`}
      >
        False Positive Rate
      </text>
    </svg>
  );
}

function AMLFlowDiagram() {
  const steps = [
    { label: "Transaction\nMonitoring", icon: "👁", color: "#6366f1", x: 40 },
    { label: "Alert\nTriage", icon: "⚡", color: "#8b5cf6", x: 175 },
    { label: "Investigation", icon: "🔍", color: "#a78bfa", x: 310 },
    { label: "SAR Filing", icon: "📋", color: "#ec4899", x: 445 },
  ];

  const dispositions = [
    { label: "False Positive\n(Closed)", y: 115, fromX: 175, color: "#374151" },
    { label: "Escalate to\nCompliance", y: 115, fromX: 310, color: "#f59e0b" },
  ];

  return (
    <svg viewBox="0 0 540 160" className="w-full h-auto">
      {/* Arrows between main steps */}
      {steps.slice(0, -1).map((step, i) => (
        <g key={i}>
          <line
            x1={step.x + 60}
            y1={50}
            x2={steps[i + 1].x}
            y2={50}
            stroke="#4b5563"
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />
        </g>
      ))}

      {/* Disposition arrows */}
      {dispositions.map((d, i) => (
        <g key={i}>
          <line
            x1={d.fromX + 30}
            y1={75}
            x2={d.fromX + 30}
            y2={d.y - 12}
            stroke={d.color}
            strokeWidth={1}
            strokeDasharray="3,2"
          />
          <text
            x={d.fromX + 30}
            y={d.y + 4}
            fill={d.color}
            fontSize={8}
            textAnchor="middle"
          >
            {d.label.split("\n").map((line, li) => (
              <tspan key={li} x={d.fromX + 30} dy={li === 0 ? 0 : 10}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      ))}

      {/* Arrow marker */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#4b5563" />
        </marker>
      </defs>

      {/* Main step boxes */}
      {steps.map((step, i) => (
        <g key={i}>
          <rect
            x={step.x}
            y={20}
            width={80}
            height={55}
            rx={8}
            fill={step.color + "22"}
            stroke={step.color}
            strokeWidth={1}
          />
          <text x={step.x + 40} y={42} textAnchor="middle" fontSize={16}>
            {step.icon}
          </text>
          {step.label.split("\n").map((line, li) => (
            <text
              key={li}
              x={step.x + 40}
              y={58 + li * 11}
              fill="#e5e7eb"
              fontSize={8}
              textAnchor="middle"
            >
              {line}
            </text>
          ))}
        </g>
      ))}

      {/* Stats row */}
      <text x={80} y={155} fill="#6b7280" fontSize={8} textAnchor="middle">
        ~10M alerts/day
      </text>
      <text x={215} y={155} fill="#6b7280" fontSize={8} textAnchor="middle">
        95% closed
      </text>
      <text x={350} y={155} fill="#6b7280" fontSize={8} textAnchor="middle">
        5% investigated
      </text>
      <text x={485} y={155} fill="#f59e0b" fontSize={8} textAnchor="middle">
        0.1% SAR
      </text>
    </svg>
  );
}

function RuleChangesChart() {
  const W = 520;
  const H = 200;
  const pad = { t: 20, r: 20, b: 40, l: 55 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const maxVal = 1000;

  const xScale = (i: number) => pad.l + (i / (RULE_CHANGES.length - 1)) * cw;
  const yScale = (v: number) => pad.t + ch - (v / maxVal) * ch;

  const path = RULE_CHANGES.map((d, i) =>
    `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(d.count).toFixed(1)}`
  ).join(" ");

  const area =
    path +
    ` L${xScale(RULE_CHANGES.length - 1).toFixed(1)},${(pad.t + ch).toFixed(1)} L${pad.l.toFixed(1)},${(pad.t + ch).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="rcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[200, 400, 600, 800, 1000].map((t) => (
        <g key={t}>
          <line
            x1={pad.l}
            y1={yScale(t)}
            x2={pad.l + cw}
            y2={yScale(t)}
            stroke="#374151"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
          <text x={pad.l - 6} y={yScale(t) + 4} fill="#9ca3af" fontSize={10} textAnchor="end">
            {t}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={area} fill="url(#rcGrad)" />
      {/* Line */}
      <path d={path} fill="none" stroke="#6366f1" strokeWidth={2} />

      {/* X labels */}
      {RULE_CHANGES.map((d, i) =>
        i % 3 === 0 ? (
          <text key={d.year} x={xScale(i)} y={H - 8} fill="#9ca3af" fontSize={9} textAnchor="middle">
            {d.year}
          </text>
        ) : null
      )}

      {/* Y axis label */}
      <text
        x={12}
        y={H / 2}
        fill="#6b7280"
        fontSize={10}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${H / 2})`}
      >
        Rule Changes
      </text>
    </svg>
  );
}

function DonutChart() {
  const cx = 90;
  const cy = 90;
  const r = 65;
  const innerR = 38;
  let startAngle = -Math.PI / 2;
  const slices: { d: string; color: string; sector: string; pct: number }[] = [];

  for (const seg of FUNDING_SECTORS) {
    const angle = (seg.pct / 100) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    slices.push({
      d: `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${innerR},${innerR} 0 ${large},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z`,
      color: seg.color,
      sector: seg.sector,
      pct: seg.pct,
    });
    startAngle = endAngle;
  }

  return (
    <svg viewBox="0 0 320 200" className="w-full h-auto">
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} stroke="#111827" strokeWidth={1} />
      ))}

      <text x={cx} y={cy - 5} fill="#e5e7eb" fontSize={11} textAnchor="middle">
        RegTech
      </text>
      <text x={cx} y={cy + 10} fill="#e5e7eb" fontSize={11} textAnchor="middle">
        Funding
      </text>

      {/* Legend */}
      {FUNDING_SECTORS.map((seg, i) => (
        <g key={i}>
          <rect x={190} y={20 + i * 28} width={12} height={12} fill={seg.color} rx={2} />
          <text x={208} y={31 + i * 28} fill="#d1d5db" fontSize={10}>
            {seg.sector}
          </text>
          <text x={310} y={31 + i * 28} fill="#9ca3af" fontSize={10} textAnchor="end">
            {seg.pct}%
          </text>
        </g>
      ))}
    </svg>
  );
}

function ComplianceCostChart() {
  const W = 480;
  const H = 180;
  const pad = { t: 20, r: 20, b: 40, l: 45 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;
  const maxVal = 7;

  const xScale = (i: number) => pad.l + (i / (COMPLIANCE_COST.length - 1)) * cw;
  const yScale = (v: number) => pad.t + ch - (v / maxVal) * ch;

  const path = COMPLIANCE_COST.map((d, i) =>
    `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(d.pct).toFixed(1)}`
  ).join(" ");
  const area =
    path +
    ` L${xScale(COMPLIANCE_COST.length - 1).toFixed(1)},${(pad.t + ch).toFixed(1)} L${pad.l.toFixed(1)},${(pad.t + ch).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ec4899" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
        </linearGradient>
      </defs>

      {[1, 2, 3, 4, 5, 6].map((t) => (
        <g key={t}>
          <line
            x1={pad.l}
            y1={yScale(t)}
            x2={pad.l + cw}
            y2={yScale(t)}
            stroke="#374151"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
          <text x={pad.l - 4} y={yScale(t) + 4} fill="#9ca3af" fontSize={9} textAnchor="end">
            {t}%
          </text>
        </g>
      ))}

      <path d={area} fill="url(#costGrad)" />
      <path d={path} fill="none" stroke="#ec4899" strokeWidth={2} />

      {COMPLIANCE_COST.map((d, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(d.pct)} r={3} fill="#ec4899" />
      ))}

      {COMPLIANCE_COST.map((d, i) =>
        i % 2 === 0 ? (
          <text key={d.year} x={xScale(i)} y={H - 8} fill="#9ca3af" fontSize={9} textAnchor="middle">
            {d.year}
          </text>
        ) : null
      )}

      <text
        x={12}
        y={H / 2}
        fill="#6b7280"
        fontSize={9}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${H / 2})`}
      >
        % Revenue
      </text>
    </svg>
  );
}

function ReportingTimeline() {
  const items = [
    { label: "COREP", color: "#6366f1", day: 15, desc: "Capital adequacy" },
    { label: "FINREP", color: "#8b5cf6", day: 20, desc: "Financial reporting" },
    { label: "MiFID II", color: "#a78bfa", day: 1, desc: "Trade reporting (T+1)" },
    { label: "EMIR", color: "#ec4899", day: 1, desc: "Derivatives reporting" },
    { label: "BCBS 239", color: "#f59e0b", day: 30, desc: "Risk aggregation" },
    { label: "Pillar 3", color: "#10b981", day: 45, desc: "Market disclosure" },
  ];

  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto">
      {/* Timeline axis */}
      <line x1={40} y1={90} x2={490} y2={90} stroke="#374151" strokeWidth={1.5} />

      {/* Day ticks */}
      {[1, 5, 10, 15, 20, 30, 45].map((day) => {
        const x = 40 + (day / 50) * 450;
        return (
          <g key={day}>
            <line x1={x} y1={85} x2={x} y2={95} stroke="#4b5563" strokeWidth={1} />
            <text x={x} y={108} fill="#6b7280" fontSize={8} textAnchor="middle">
              T+{day}
            </text>
          </g>
        );
      })}

      {/* Items */}
      {items.map((item, i) => {
        const x = 40 + (item.day / 50) * 450;
        const above = i % 2 === 0;
        return (
          <g key={i}>
            <circle cx={x} cy={90} r={5} fill={item.color} />
            <line
              x1={x}
              y1={above ? 84 : 96}
              x2={x}
              y2={above ? 55 : 125}
              stroke={item.color}
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <rect
              x={x - 28}
              y={above ? 30 : 127}
              width={56}
              height={22}
              rx={4}
              fill={item.color + "22"}
              stroke={item.color}
              strokeWidth={0.8}
            />
            <text x={x} y={above ? 41 : 138} fill={item.color} fontSize={8} textAnchor="middle" fontWeight="600">
              {item.label}
            </text>
            <text x={x} y={above ? 50 : 148} fill="#9ca3af" fontSize={7} textAnchor="middle">
              {item.desc}
            </text>
          </g>
        );
      })}

      <text x={265} y={185} fill="#6b7280" fontSize={9} textAnchor="middle">
        Reporting deadline (calendar days after period end)
      </text>
    </svg>
  );
}

// ─── ROI Calculator ───────────────────────────────────────────────────────────

function ROICalculator() {
  const [staff, setStaff] = useState(50);
  const [avgSalary, setAvgSalary] = useState(85000);
  const [fteReduction, setFteReduction] = useState(35);
  const [toolCost, setToolCost] = useState(500000);

  const savings = Math.round(staff * (fteReduction / 100) * avgSalary);
  const netSavings = savings - toolCost;
  const roi = toolCost > 0 ? Math.round((netSavings / toolCost) * 100) : 0;
  const payback = netSavings > 0 ? (toolCost / savings * 12).toFixed(1) : "N/A";

  return (
    <div className="bg-card rounded-md border border-border p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-green-400" />
        RegTech ROI Calculator
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Compliance Staff Count</label>
          <input
            type="range"
            min={5}
            max={200}
            value={staff}
            onChange={(e) => setStaff(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <span className="text-xs text-muted-foreground">{staff} FTEs</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Avg Salary ($/yr)</label>
          <input
            type="range"
            min={50000}
            max={200000}
            step={5000}
            value={avgSalary}
            onChange={(e) => setAvgSalary(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <span className="text-xs text-muted-foreground">${(avgSalary / 1000).toFixed(0)}k</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">FTE Reduction via Automation</label>
          <input
            type="range"
            min={10}
            max={70}
            value={fteReduction}
            onChange={(e) => setFteReduction(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <span className="text-xs text-muted-foreground">{fteReduction}%</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">RegTech Tool Cost ($/yr)</label>
          <input
            type="range"
            min={100000}
            max={5000000}
            step={50000}
            value={toolCost}
            onChange={(e) => setToolCost(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <span className="text-xs text-muted-foreground">${(toolCost / 1000000).toFixed(2)}M</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Annual Savings</p>
          <p className="text-lg font-semibold text-green-400">${(savings / 1000).toFixed(0)}k</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Net Benefit</p>
          <p className={`text-lg font-semibold ${netSavings >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            ${(netSavings / 1000).toFixed(0)}k
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">ROI / Payback</p>
          <p className="text-lg font-medium text-primary">{roi}% / {payback}mo</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs Content ─────────────────────────────────────────────────────────────

function AMLKYCTab() {
  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Global AML Fines 2023", value: "$6.8B", icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, color: "text-amber-400" },
          { label: "Avg KYC Onboarding (Manual)", value: "5 days", icon: <Clock className="w-4 h-4 text-red-400" />, color: "text-red-400" },
          { label: "KYC Onboarding (Auto)", value: "2 hrs", icon: <Zap className="w-4 h-4 text-green-400" />, color: "text-green-400" },
          { label: "False Positive Rate (rules)", value: "~92%", icon: <XCircle className="w-4 h-4 text-rose-400" />, color: "text-rose-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-md border border-border p-4">
            <div className="flex items-center gap-2 mb-1">{kpi.icon}<p className="text-xs text-muted-foreground">{kpi.label}</p></div>
            <p className={`text-xl font-medium ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Flow Diagram */}
      <div className="bg-card rounded-md border border-border p-6 border-l-4 border-l-primary">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-muted-foreground/50" />
          AML Transaction Monitoring Flow
        </h3>
        <AMLFlowDiagram />
      </div>

      {/* False Positive Chart */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground/50" />
          False Positive Rate: Rule-Based vs ML (Year 1–10)
        </h3>
        <FalsePositiveChart />
        <p className="text-xs text-muted-foreground mt-2">
          ML models reduce false positives from ~92% to ~12% over time, dramatically cutting analyst workload.
        </p>
      </div>

      {/* KYC Comparison */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
          KYC Onboarding Time Comparison
        </h3>
        <div className="space-y-3">
          {[
            { label: "Manual KYC Process", value: 120, unit: "hrs (5 days)", color: "bg-red-500/70" },
            { label: "Semi-Automated KYC", value: 36, unit: "hrs (1.5 days)", color: "bg-amber-500/70" },
            { label: "Fully Automated KYC", value: 2, unit: "hrs", color: "bg-green-500/70" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-muted-foreground">{item.unit}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / 120) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Risk Score Factors */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />
          Customer Risk Scoring Model — 10 Factors
        </h3>
        <div className="space-y-2">
          {RISK_FACTORS.map((f) => (
            <div key={f.factor} className="flex items-center gap-3">
              <div className="w-36 text-xs text-muted-foreground truncate">{f.factor}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(f.weight / 18) * 100}%` }}
                  transition={{ duration: 0.7 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <div className="w-8 text-xs text-primary text-right">{f.weight}%</div>
              <div className="hidden sm:block w-48 text-xs text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AML Fines Table */}
      <div className="bg-card rounded-md border border-border p-5 overflow-x-auto">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Top AML/Sanctions Fines in History
        </h3>
        <table className="w-full text-xs text-muted-foreground">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2">Institution</th>
              <th className="text-left py-2">Year</th>
              <th className="text-right py-2">Fine ($M)</th>
              <th className="text-left py-2 pl-4">Reason</th>
            </tr>
          </thead>
          <tbody>
            {AML_FINES.sort((a, b) => b.fine - a.fine).map((row) => (
              <tr key={row.bank} className="border-b border-border hover:bg-muted/40 transition-colors">
                <td className="py-2 font-medium text-foreground">{row.bank}</td>
                <td className="py-2 text-muted-foreground">{row.year}</td>
                <td className="py-2 text-right text-amber-400 font-medium">{row.fine.toLocaleString()}</td>
                <td className="py-2 pl-4 text-muted-foreground">{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RegulatoryReportingTab() {
  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Regulatory Rules (2024)", value: "941/yr", icon: <FileText className="w-3.5 h-3.5 text-muted-foreground/50" />, color: "text-primary" },
          { label: "Avg Compliance Cost", value: "5.6% Rev", icon: <DollarSign className="w-4 h-4 text-rose-400" />, color: "text-rose-400" },
          { label: "COREP Deadline", value: "T+15d", icon: <Clock className="w-4 h-4 text-amber-400" />, color: "text-amber-400" },
          { label: "MiFID II Reporting", value: "T+1d", icon: <Zap className="w-4 h-4 text-green-400" />, color: "text-green-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-md border border-border p-4">
            <div className="flex items-center gap-2 mb-1">{kpi.icon}<p className="text-xs text-muted-foreground">{kpi.label}</p></div>
            <p className={`text-xl font-medium ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Reporting Timeline */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
          Regulatory Reporting Timeline — COREP / FINREP / MiFID II / EMIR
        </h3>
        <ReportingTimeline />
      </div>

      {/* Data Lineage Diagram */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-muted-foreground/50" />
          Data Lineage for Regulatory Reporting
        </h3>
        <svg viewBox="0 0 560 130" className="w-full h-auto">
          {/* Source systems */}
          {[
            { label: "Core Banking", x: 20, color: "#6366f1" },
            { label: "Trading Systems", x: 20, color: "#8b5cf6" },
            { label: "Risk Engine", x: 20, color: "#a78bfa" },
          ].map((s, i) => (
            <g key={i}>
              <rect x={s.x} y={20 + i * 35} width={100} height={24} rx={5} fill={s.color + "22"} stroke={s.color} strokeWidth={1} />
              <text x={s.x + 50} y={34 + i * 35} fill={s.color} fontSize={8} textAnchor="middle">{s.label}</text>
              <line x1={s.x + 100} y1={32 + i * 35} x2={150} y2={64} stroke={s.color} strokeWidth={0.8} strokeDasharray="3,2" />
            </g>
          ))}

          {/* Central data hub */}
          <rect x={150} y={45} width={100} height={36} rx={6} fill="#374151" stroke="#6b7280" strokeWidth={1} />
          <text x={200} y={60} fill="#e5e7eb" fontSize={8} textAnchor="middle" fontWeight="600">Central Data</text>
          <text x={200} y={72} fill="#9ca3af" fontSize={7} textAnchor="middle">Repository</text>
          <line x1={250} y1={63} x2={290} y2={63} stroke="#6b7280" strokeWidth={1} />

          {/* Transformation */}
          <rect x={290} y={45} width={90} height={36} rx={6} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1} />
          <text x={335} y={60} fill="#a78bfa" fontSize={8} textAnchor="middle">RegTech</text>
          <text x={335} y={72} fill="#a78bfa" fontSize={7} textAnchor="middle">Engine</text>

          {/* Output reports */}
          {["COREP", "FINREP", "MiFID II", "EMIR"].map((rep, i) => (
            <g key={rep}>
              <line x1={380} y1={63} x2={415} y2={28 + i * 28} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="3,2" />
              <rect x={415} y={16 + i * 28} width={65} height={20} rx={4} fill="#6366f122" stroke="#6366f1" strokeWidth={0.8} />
              <text x={447} y={29 + i * 28} fill="#a5b4fc" fontSize={8} textAnchor="middle">{rep}</text>
            </g>
          ))}

          {/* Regulator */}
          <rect x={500} y={45} width={50} height={36} rx={6} fill="#065f46" stroke="#10b981" strokeWidth={1} />
          <text x={525} y={60} fill="#10b981" fontSize={8} textAnchor="middle">Regulator</text>
          <text x={525} y={72} fill="#6ee7b7" fontSize={7} textAnchor="middle">Portal</text>
        </svg>
      </div>

      {/* Rule Changes Chart */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50" />
          Global Regulatory Rule Changes per Year (2010–2024)
        </h3>
        <RuleChangesChart />
        <p className="text-xs text-muted-foreground mt-2">
          Financial institutions face ~941 new/amended rules per year in 2024, a 4.5× increase from 2010.
        </p>
      </div>

      {/* Compliance Cost Trend */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-rose-400" />
          Cost of Compliance as % of Revenue (2015–2024)
        </h3>
        <ComplianceCostChart />
        <p className="text-xs text-muted-foreground mt-2">
          Compliance costs have grown from 2.1% to 5.6% of revenue — RegTech automation is key to containing this trend.
        </p>
      </div>

      {/* ROI Calculator */}
      <ROICalculator />
    </div>
  );
}

function SanctionsTab() {
  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "OFAC SDN Entries", value: "14,200", icon: <Lock className="w-4 h-4 text-red-400" />, color: "text-red-400" },
          { label: "Global PEP Profiles", value: "1.3M+", icon: <Users className="w-4 h-4 text-amber-400" />, color: "text-amber-400" },
          { label: "Adverse Media Sources", value: "100k+", icon: <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />, color: "text-primary" },
          { label: "ML Screening FPR", value: "3%", icon: <CheckCircle className="w-4 h-4 text-green-400" />, color: "text-green-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-md border border-border p-4">
            <div className="flex items-center gap-2 mb-1">{kpi.icon}<p className="text-xs text-muted-foreground">{kpi.label}</p></div>
            <p className={`text-xl font-medium ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sanction List Sizes */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
          Global Sanctions List Sizes
        </h3>
        <div className="space-y-3">
          {SANCTION_LISTS.map((lst) => (
            <div key={lst.name} className="flex items-center gap-3">
              <div className="w-28 text-xs text-muted-foreground">{lst.name}</div>
              <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">{lst.jurisdiction}</Badge>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(lst.entries / 14200) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <div className="w-16 text-xs text-right text-primary">
                {lst.entries.toLocaleString()}
              </div>
              <div className="hidden sm:block w-28 text-xs text-muted-foreground">{lst.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Name Matching Algorithms */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
            Name Matching Algorithms Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="text-muted-foreground bg-muted/50">
                <th className="text-left px-4 py-3">Algorithm</th>
                <th className="text-right px-4 py-3">Precision</th>
                <th className="text-right px-4 py-3">Recall</th>
                <th className="text-right px-4 py-3">FPR</th>
                <th className="text-right px-4 py-3">Speed</th>
              </tr>
            </thead>
            <tbody>
              {MATCHING_ALGOS.map((algo) => (
                <tr key={algo.name} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{algo.name}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${algo.precision >= 90 ? "text-green-400" : algo.precision >= 80 ? "text-amber-400" : "text-red-400"}`}>
                      {algo.precision}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${algo.recall >= 90 ? "text-green-400" : algo.recall >= 80 ? "text-amber-400" : "text-red-400"}`}>
                      {algo.recall}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${algo.fpr <= 5 ? "text-green-400" : algo.fpr <= 15 ? "text-amber-400" : "text-red-400"}`}>
                      {algo.fpr}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{algo.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time vs Batch */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-muted-foreground/50" />
          Real-Time vs Batch Screening Comparison
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              mode: "Batch Screening",
              icon: <Clock className="w-5 h-5 text-amber-400" />,
              color: "border-amber-500/40",
              pros: ["Lower cost per screen", "Overnight processing", "High throughput"],
              cons: ["Delayed detection (hours)", "Compliance gap window", "Not suitable for real-time payments"],
            },
            {
              mode: "Real-Time Screening",
              icon: <Zap className="w-5 h-5 text-green-400" />,
              color: "border-green-500/40",
              pros: ["Instant alert generation", "ISO 20022 compliant", "Required for instant payments"],
              cons: ["Higher infrastructure cost", "Latency must be <200ms", "Alert management overhead"],
            },
          ].map((item) => (
            <div key={item.mode} className={`rounded-md border ${item.color} bg-muted/50 p-4`}>
              <div className="flex items-center gap-2 mb-3">
                {item.icon}
                <span className="text-sm font-medium text-foreground">{item.mode}</span>
              </div>
              <div className="space-y-1 mb-3">
                {item.pros.map((p) => (
                  <div key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {item.cons.map((c) => (
                  <div key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PEP + Adverse Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-md border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground/50" />
            PEP Screening
          </h3>
          <div className="space-y-3 text-xs text-muted-foreground">
            {[
              { tier: "Tier 1 PEP", desc: "Heads of state, ministers, senior officials", risk: "Extreme" },
              { tier: "Tier 2 PEP", desc: "Senior military, judiciary, SOE execs", risk: "High" },
              { tier: "Tier 3 PEP", desc: "Local politicians, mid-level officials", risk: "Medium" },
              { tier: "RCA (Relatives)", desc: "Close associates & family members", risk: "Elevated" },
            ].map((p) => (
              <div key={p.tier} className="flex justify-between items-start gap-2 py-1.5 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{p.tier}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{p.desc}</p>
                </div>
                <Badge
                  className={`text-xs text-muted-foreground shrink-0 ${
                    p.risk === "Extreme" ? "bg-red-900/50 text-red-300 border-red-700" :
                    p.risk === "High" ? "bg-orange-900/50 text-orange-300 border-orange-700" :
                    p.risk === "Medium" ? "bg-amber-900/50 text-amber-300 border-amber-700" :
                    "bg-muted/70 text-primary border-border"
                  }`}
                  variant="outline"
                >
                  {p.risk}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-md border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground/50" />
            Adverse Media Monitoring
          </h3>
          <div className="space-y-3">
            {[
              { category: "Financial Crime", coverage: 95, sources: "Regulators, courts" },
              { category: "Corruption & Bribery", coverage: 88, sources: "Investigative journalism" },
              { category: "Terrorism Financing", coverage: 92, sources: "Govt watchlists" },
              { category: "Tax Evasion", coverage: 74, sources: "Leaks, filings" },
              { category: "Human Trafficking", coverage: 67, sources: "NGOs, news" },
            ].map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="text-muted-foreground">{item.sources}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.coverage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Coverage across 100k+ global news sources in 60+ languages.</p>
        </div>
      </div>
    </div>
  );
}

function MarketFutureTab() {
  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Global RegTech Market 2024", value: "$22B", icon: <TrendingUp className="w-4 h-4 text-green-400" />, color: "text-green-400" },
          { label: "Projected CAGR", value: "23%", icon: <BarChart2 className="w-3.5 h-3.5 text-muted-foreground/50" />, color: "text-primary" },
          { label: "AI/NLP Adoption in Regs", value: "41%", icon: <Cpu className="w-3.5 h-3.5 text-muted-foreground/50" />, color: "text-primary" },
          { label: "FCA Sandbox Firms Funded", value: "280+", icon: <Building2 className="w-4 h-4 text-amber-400" />, color: "text-amber-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-md border border-border p-4">
            <div className="flex items-center gap-2 mb-1">{kpi.icon}<p className="text-xs text-muted-foreground">{kpi.label}</p></div>
            <p className={`text-xl font-medium ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Funding by Sector Donut */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground/50" />
          RegTech Funding by Sector
        </h3>
        <DonutChart />
      </div>

      {/* Top Vendors */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" />
            Top RegTech Vendors
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="text-muted-foreground bg-muted/50">
                <th className="text-left px-4 py-3">Vendor</th>
                <th className="text-left px-4 py-3">Focus</th>
                <th className="text-left px-4 py-3">Region</th>
                <th className="text-left px-4 py-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {REGTECH_VENDORS.map((v) => (
                <tr key={v.name} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{v.name}</td>
                  <td className="px-4 py-3 text-primary">{v.focus}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.region}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs text-muted-foreground ${
                      v.stage === "Enterprise" ? "text-primary border-border" :
                      v.stage === "Scale-up" ? "text-green-300 border-green-700" :
                      "text-amber-300 border-amber-700"
                    }`}>
                      {v.stage}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI/NLP in Regulatory Interpretation */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-muted-foreground/50" />
          AI/NLP in Regulatory Interpretation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              use: "Regulatory Text Parsing",
              desc: "NLP extracts obligations, deadlines, and data requirements from dense regulatory documents.",
              maturity: "Mature",
              adoption: 68,
            },
            {
              use: "Change Impact Analysis",
              desc: "ML models map rule changes to internal policies, flagging gaps and required updates.",
              maturity: "Growing",
              adoption: 44,
            },
            {
              use: "Automated Q&A",
              desc: "LLMs trained on regulatory corpora answer compliance queries with source citations.",
              maturity: "Emerging",
              adoption: 21,
            },
          ].map((item) => (
            <div key={item.use} className="bg-muted/50 rounded-md border border-border p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-foreground">{item.use}</span>
                <Badge variant="outline" className={`text-xs text-muted-foreground shrink-0 ml-2 ${
                  item.maturity === "Mature" ? "text-green-300 border-green-700" :
                  item.maturity === "Growing" ? "text-primary border-border" :
                  "text-amber-300 border-amber-700"
                }`}>
                  {item.maturity}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Industry adoption</span>
                  <span>{item.adoption}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.adoption}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Sandbox Participation */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/50" />
          Regulatory Sandbox Participation
        </h3>
        <div className="space-y-2">
          {SANDBOX_PARTICIPANTS.map((p) => (
            <div key={p.country} className="flex items-center gap-3">
              <div className="w-36 text-xs text-muted-foreground">{p.country}</div>
              <div className="w-16 text-xs text-muted-foreground text-center">{p.cohorts} cohorts</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(p.firms / 280) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <div className="w-14 text-xs text-primary text-right">{p.firms} firms</div>
            </div>
          ))}
        </div>
      </div>

      {/* SupTech & Talent Gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-md border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground/50" />
            SupTech (Supervisory Tech) Adoption
          </h3>
          <div className="space-y-3">
            {[
              { area: "Automated data collection", pct: 72 },
              { area: "Real-time supervisory dashboards", pct: 58 },
              { area: "AI-driven anomaly detection", pct: 43 },
              { area: "NLP for examination reports", pct: 31 },
              { area: "Predictive enforcement", pct: 18 },
            ].map((item) => (
              <div key={item.area} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-muted-foreground">{item.area}</span>
                  <span className="text-primary">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-md border border-border p-5">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Talent Gap Challenge
          </h3>
          <div className="space-y-3">
            {[
              { role: "AML Analysts", open: 42000, fill: 61, color: "bg-red-500" },
              { role: "RegTech Engineers", open: 28000, fill: 72, color: "bg-amber-500" },
              { role: "Compliance Officers", open: 35000, fill: 55, color: "bg-orange-500" },
              { role: "Data Scientists (Compliance)", open: 19000, fill: 48, color: "bg-rose-500" },
              { role: "FinCrime Investigators", open: 15000, fill: 67, color: "bg-yellow-500" },
            ].map((item) => (
              <div key={item.role} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="text-muted-foreground">{item.role}</span>
                  <span className="text-muted-foreground">{item.open.toLocaleString()} open roles</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.fill}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{item.fill}% fill rate</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegtechPage() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-muted/10 border border-primary/40 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">RegTech & Compliance Automation</h1>
            <p className="text-sm text-muted-foreground">
              AML/KYC automation, regulatory reporting, sanctions screening, and compliance cost reduction
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {["AML/KYC", "COREP/FINREP", "Sanctions Screening", "SupTech", "AI Compliance"].map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs text-primary border-border">
              {tag}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="aml">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="aml" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" />
            AML / KYC
          </TabsTrigger>
          <TabsTrigger value="reporting" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground">
            <FileText className="w-3 h-3 mr-1" />
            Regulatory Reporting
          </TabsTrigger>
          <TabsTrigger value="sanctions" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground">
            <Lock className="w-3 h-3 mr-1" />
            Sanctions Screening
          </TabsTrigger>
          <TabsTrigger value="market" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            Market & Future
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="aml" className="mt-6 data-[state=inactive]:hidden">
            <motion.div
              key="aml"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AMLKYCTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="reporting" className="mt-6 data-[state=inactive]:hidden">
            <motion.div
              key="reporting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <RegulatoryReportingTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="sanctions" className="mt-6 data-[state=inactive]:hidden">
            <motion.div
              key="sanctions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <SanctionsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="market" className="mt-6 data-[state=inactive]:hidden">
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <MarketFutureTab />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
