"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Globe,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 924;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

function resetSeed() {
  s = 924;
}

// ── Reusable UI primitives ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-white/60 mb-3">
      {children}
    </h3>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg bg-sky-500/10 border border-sky-500/20 p-3 text-sm text-sky-300">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "amber" | "sky" | "red" | "violet";
}) {
  const colorMap = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    sky: "text-sky-400",
    red: "text-red-400",
    violet: "text-primary",
  };
  return (
    <div className="bg-foreground/5 rounded-lg p-3 flex flex-col gap-1">
      <span className="text-[11px] text-white/40 uppercase tracking-wide">{label}</span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          color ? colorMap[color] : "text-white"
        )}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-white/40">{sub}</span>}
    </div>
  );
}

function CompareRow({
  label,
  a,
  b,
  aGood,
}: {
  label: string;
  a: string;
  b: string;
  aGood?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50 text-sm">
      <span className="text-white/50">{label}</span>
      <span
        className={cn(
          "font-medium",
          aGood === true
            ? "text-emerald-400"
            : aGood === false
            ? "text-red-400"
            : "text-white"
        )}
      >
        {a}
      </span>
      <span
        className={cn(
          "font-medium",
          aGood === false
            ? "text-emerald-400"
            : aGood === true
            ? "text-red-400"
            : "text-white/70"
        )}
      >
        {b}
      </span>
    </div>
  );
}

// ── Tab 1: Letters of Credit ──────────────────────────────────────────────────

function LCStructureSVG() {
  const parties = [
    {
      id: "importer",
      label: "Importer",
      sub: "Applicant",
      x: 60,
      y: 130,
      color: "#6366f1",
    },
    {
      id: "issuing",
      label: "Issuing Bank",
      sub: "Importer's Bank",
      x: 220,
      y: 40,
      color: "#f59e0b",
    },
    {
      id: "advising",
      label: "Advising Bank",
      sub: "Exporter's Bank",
      x: 390,
      y: 40,
      color: "#f59e0b",
    },
    {
      id: "confirming",
      label: "Confirming Bank",
      sub: "Optional",
      x: 390,
      y: 200,
      color: "#10b981",
    },
    {
      id: "exporter",
      label: "Exporter",
      sub: "Beneficiary",
      x: 550,
      y: 130,
      color: "#6366f1",
    },
  ];

  const arrows = [
    {
      from: [60, 130] as [number, number],
      to: [220, 60] as [number, number],
      label: "1. LC Application",
      mid: [130, 78] as [number, number],
    },
    {
      from: [240, 40] as [number, number],
      to: [370, 40] as [number, number],
      label: "2. LC Issuance",
      mid: [305, 28] as [number, number],
    },
    {
      from: [410, 60] as [number, number],
      to: [550, 120] as [number, number],
      label: "3. LC Advice",
      mid: [500, 78] as [number, number],
    },
    {
      from: [550, 150] as [number, number],
      to: [410, 198] as [number, number],
      label: "4. Docs Presented",
      mid: [500, 188] as [number, number],
    },
    {
      from: [370, 200] as [number, number],
      to: [240, 60] as [number, number],
      label: "5. Doc Review",
      mid: [288, 148] as [number, number],
    },
    {
      from: [200, 60] as [number, number],
      to: [80, 128] as [number, number],
      label: "6. Payment",
      mid: [120, 80] as [number, number],
    },
  ];

  return (
    <svg viewBox="0 0 630 240" className="w-full" style={{ height: 200 }}>
      {arrows.map((a, i) => {
        const [x1, y1] = a.from;
        const [x2, y2] = a.to;
        const [mx, my] = a.mid;
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={mx}
              y={my}
              fill="rgba(255,255,255,0.35)"
              fontSize={8}
              textAnchor="middle"
            >
              {a.label}
            </text>
          </g>
        );
      })}
      {parties.map((p) => (
        <g key={p.id}>
          <rect
            x={p.x - 55}
            y={p.y - 22}
            width={110}
            height={38}
            rx={6}
            fill={p.color + "22"}
            stroke={p.color + "66"}
            strokeWidth={1.5}
          />
          <text
            x={p.x}
            y={p.y - 5}
            fill="white"
            fontSize={9.5}
            textAnchor="middle"
            fontWeight="600"
          >
            {p.label}
          </text>
          <text
            x={p.x}
            y={p.y + 10}
            fill="rgba(255,255,255,0.45)"
            fontSize={8}
            textAnchor="middle"
          >
            {p.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

function LCRiskSpectrumSVG() {
  const items = [
    {
      label: "Cash in Advance",
      risk: 5,
      color: "#6366f1",
    },
    {
      label: "Irrevocable LC",
      risk: 25,
      color: "#10b981",
    },
    {
      label: "Doc. Collection",
      risk: 50,
      color: "#f59e0b",
    },
    {
      label: "Open Acct 30d",
      risk: 70,
      color: "#f97316",
    },
    {
      label: "Open Acct 90d",
      risk: 88,
      color: "#ef4444",
    },
  ];

  return (
    <svg viewBox="0 0 560 130" className="w-full" style={{ height: 115 }}>
      <defs>
        <linearGradient id="riskGrad924" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect
        x={20}
        y={55}
        width={520}
        height={10}
        rx={5}
        fill="url(#riskGrad924)"
      />
      <text x={20} y={47} fill="rgba(255,255,255,0.4)" fontSize={9}>
        Buyer Risk
      </text>
      <text
        x={540}
        y={47}
        fill="rgba(255,255,255,0.4)"
        fontSize={9}
        textAnchor="end"
      >
        Seller Risk
      </text>
      {items.map((item, i) => {
        const cx = 20 + (item.risk / 100) * 520;
        const yLabel = i % 2 === 0 ? 88 : 102;
        return (
          <g key={i}>
            <circle cx={cx} cy={60} r={5} fill={item.color} />
            <line
              x1={cx}
              y1={67}
              x2={cx}
              y2={yLabel - 8}
              stroke={item.color}
              strokeWidth={1}
              strokeDasharray="2 2"
            />
            <text
              x={cx}
              y={yLabel}
              fill={item.color}
              fontSize={8}
              textAnchor="middle"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LCTimelineSVG() {
  const steps = [
    { day: "D0", label: "LC Application", color: "#6366f1" },
    { day: "D2–5", label: "LC Issued", color: "#8b5cf6" },
    { day: "D7–10", label: "LC Advised", color: "#a78bfa" },
    { day: "D30", label: "Shipment", color: "#f59e0b" },
    { day: "D35", label: "Docs Presented", color: "#f97316" },
    { day: "D40", label: "Review (5d)", color: "#ef4444" },
    { day: "D45", label: "Payment", color: "#10b981" },
  ];

  const W = 540;
  const step = W / (steps.length - 1);

  return (
    <svg viewBox={`0 0 ${W + 30} 88`} className="w-full" style={{ height: 80 }}>
      <line
        x1={15}
        y1={38}
        x2={W + 15}
        y2={38}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1.5}
      />
      {steps.map((st, i) => {
        const cx = 15 + i * step;
        return (
          <g key={i}>
            <circle cx={cx} cy={38} r={5} fill={st.color} />
            <text
              x={cx}
              y={27}
              fill={st.color}
              fontSize={8}
              textAnchor="middle"
            >
              {st.day}
            </text>
            <text
              x={cx}
              y={55}
              fill="rgba(255,255,255,0.5)"
              fontSize={7.5}
              textAnchor="middle"
            >
              {st.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LettersOfCreditTab() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: "types",
      title: "LC Types & Variants",
      content: [
        {
          term: "Irrevocable LC",
          desc: "Cannot be amended or cancelled without consent of all parties. Standard in modern trade. Governed by UCP 600.",
        },
        {
          term: "Revocable LC",
          desc: "Can be modified or cancelled by issuing bank at any time. Rarely used — offers minimal protection to beneficiary.",
        },
        {
          term: "Standby LC",
          desc: "Acts as a performance guarantee. Drawn on only if the applicant defaults. Used for project bonds and contract performance.",
        },
        {
          term: "Transferable LC",
          desc: "Beneficiary can transfer part/all of the credit to a second beneficiary. Common in back-to-back supply chains.",
        },
        {
          term: "Back-to-Back LC",
          desc: "Two separate LCs: master LC from buyer to intermediary, second LC from intermediary to manufacturer.",
        },
        {
          term: "Red Clause LC",
          desc: "Allows advance payment to beneficiary before shipment. Seller obtains working capital from buyer's credit.",
        },
      ],
    },
    {
      id: "ucp600",
      title: "UCP 600 Key Rules",
      content: [
        {
          term: "Article 14 — Standard for Examination",
          desc: "Banks have 5 banking days to examine presented documents. Discrepancies must be stated in one notice.",
        },
        {
          term: "Article 16 — Discrepant Documents",
          desc: "Bank must give notice of refusal with all discrepancies in a single communication. No second chance to add discrepancies.",
        },
        {
          term: "Article 18 — Commercial Invoice",
          desc: "Invoice must be in the name of applicant, in the currency of the credit, and not exceed the LC amount.",
        },
        {
          term: "Article 20 — Bill of Lading",
          desc: "Must indicate carrier, shipper, on-board notation, port of loading/discharge. Clean BoL required.",
        },
        {
          term: "Article 28 — Insurance Documents",
          desc: "Must be issued by insurer/underwriter or agent. Coverage cannot be less than CIF value + 10%.",
        },
        {
          term: "Article 29 — Expiry on Non-Banking Day",
          desc: "If expiry falls on non-banking day, automatically extends to next banking day for presentation.",
        },
      ],
    },
    {
      id: "bpo",
      title: "Bank Payment Obligation (BPO)",
      content: [
        {
          term: "Definition",
          desc: "ISO 20022-based irrevocable undertaking by an Obligor Bank to pay the Recipient Bank on a specified date after successful data matching.",
        },
        {
          term: "Difference from LC",
          desc: "BPO is data-driven (electronic), not document-driven (paper). Matches data from purchase orders, invoices, shipping info.",
        },
        {
          term: "SWIFT TSU",
          desc: "Trade Services Utility — SWIFT's platform underpins BPO matching. Buyer/seller banks submit data for automated comparison.",
        },
        {
          term: "Benefits",
          desc: "Faster processing, reduced cost, enables pre-shipment and post-shipment finance, fits digital trade flows.",
        },
        {
          term: "Adoption Challenges",
          desc: "Requires both buyer and seller banks to be SWIFT TSU members. Limited uptake due to network effects and legacy systems.",
        },
      ],
    },
  ];

  const discrepancyStats = [
    { type: "Port/Place Discrepancy", rate: 18 },
    { type: "Late Presentation", rate: 15 },
    { type: "Incomplete Documents", rate: 14 },
    { type: "Description Mismatch", rate: 12 },
    { type: "Insurance Deficiencies", rate: 9 },
    { type: "Other Discrepancies", rate: 12 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>LC Structure &amp; Parties</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <LCStructureSVG />
          <p className="text-xs text-white/40 mt-2 text-center">
            Five-party LC structure — banks intermediate between importer and
            exporter
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Avg LC Processing Time"
          value="5–7 days"
          sub="Banking days for issuance"
          color="sky"
        />
        <StatCard
          label="First-Presentation Discrepancy"
          value="70%+"
          sub="Industry average refusal rate"
          color="red"
        />
        <StatCard
          label="Global LC Volume"
          value="~$2.8T"
          sub="Annual trade value facilitated"
          color="emerald"
        />
        <StatCard
          label="LC Cost (Issuing Fee)"
          value="0.5–3%"
          sub="Of LC face value per annum"
          color="amber"
        />
      </div>

      <div>
        <SectionTitle>Risk Spectrum: LC vs Open Account</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <LCRiskSpectrumSVG />
        </div>
      </div>

      <div>
        <SectionTitle>LC Lifecycle Timeline</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <LCTimelineSVG />
        </div>
      </div>

      <div>
        <SectionTitle>Standby LC vs Commercial LC</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-white/40 uppercase tracking-wide">
            <span>Attribute</span>
            <span>Commercial LC</span>
            <span>Standby LC</span>
          </div>
          <CompareRow
            label="Primary Purpose"
            a="Payment mechanism for goods"
            b="Performance / financial guarantee"
          />
          <CompareRow
            label="Drawing Expectation"
            a="Expected to be drawn on delivery"
            b="Drawn only upon default"
            aGood={true}
          />
          <CompareRow
            label="Governed by"
            a="UCP 600"
            b="ISP98 or UCP 600"
          />
          <CompareRow
            label="Used by"
            a="Physical goods trade"
            b="Project finance, services"
          />
          <CompareRow
            label="Typical Tenor"
            a="30–180 days"
            b="1–5 years"
          />
          <CompareRow
            label="Cost"
            a="0.5–2% quarterly"
            b="1–3% per annum"
            aGood={false}
          />
        </div>
      </div>

      <div>
        <SectionTitle>Document Discrepancy Breakdown</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4 space-y-2">
          <p className="text-xs text-white/50 mb-3">
            ICC studies show over 70% of first LC presentations are rejected due
            to discrepancies
          </p>
          {discrepancyStats.map((d) => (
            <div key={d.type} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-48 shrink-0">
                {d.type}
              </span>
              <div className="flex-1 bg-foreground/5 rounded-full h-2">
                <div
                  className="bg-red-400/70 h-2 rounded-full"
                  style={{ width: `${(d.rate / 18) * 100}%` }}
                />
              </div>
              <span className="text-xs text-red-400 w-8 text-right">
                {d.rate}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {sections.map((sec) => (
        <div key={sec.id} className="bg-foreground/5 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
            onClick={() =>
              setExpandedSection(
                expandedSection === sec.id ? null : sec.id
              )
            }
          >
            <span className="font-semibold text-white text-sm">
              {sec.title}
            </span>
            {expandedSection === sec.id ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === sec.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {sec.content.map((item) => (
                    <div
                      key={item.term}
                      className="border-l-2 border-primary/40 pl-3"
                    >
                      <div className="text-xs font-semibold text-primary">
                        {item.term}
                      </div>
                      <div className="text-xs text-white/55 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <InfoBox>
        Complying presentation requires all documents to match each other and
        the LC terms strictly. Even minor discrepancies — such as a different
        spelling of a port name — can trigger rejection, requiring an amendment
        or acceptance under reserve.
      </InfoBox>
    </div>
  );
}

// ── Tab 2: Supply Chain Finance ────────────────────────────────────────────────

function ReverseFactoringSVG() {
  return (
    <svg viewBox="0 0 580 200" className="w-full" style={{ height: 175 }}>
      {/* Buyer */}
      <rect
        x={20}
        y={70}
        width={110}
        height={50}
        rx={8}
        fill="#6366f133"
        stroke="#6366f1"
        strokeWidth={1.5}
      />
      <text
        x={75}
        y={90}
        fill="white"
        fontSize={10}
        textAnchor="middle"
        fontWeight="600"
      >
        Buyer
      </text>
      <text
        x={75}
        y={104}
        fill="rgba(255,255,255,0.45)"
        fontSize={8}
        textAnchor="middle"
      >
        (Anchor Company)
      </text>

      {/* SCF Platform */}
      <rect
        x={230}
        y={55}
        width={120}
        height={80}
        rx={8}
        fill="#f59e0b22"
        stroke="#f59e0b"
        strokeWidth={1.5}
      />
      <text
        x={290}
        y={80}
        fill="#f59e0b"
        fontSize={10}
        textAnchor="middle"
        fontWeight="700"
      >
        SCF Platform
      </text>
      <text
        x={290}
        y={95}
        fill="rgba(255,255,255,0.45)"
        fontSize={7.5}
        textAnchor="middle"
      >
        Taulia / Kyriba
      </text>
      <text
        x={290}
        y={108}
        fill="rgba(255,255,255,0.45)"
        fontSize={7.5}
        textAnchor="middle"
      >
        C2FO / PrimeRevenue
      </text>
      <text
        x={290}
        y={122}
        fill="rgba(255,255,255,0.3)"
        fontSize={7}
        textAnchor="middle"
      >
        (Matches buyers &amp; suppliers)
      </text>

      {/* Supplier */}
      <rect
        x={450}
        y={70}
        width={110}
        height={50}
        rx={8}
        fill="#10b98133"
        stroke="#10b981"
        strokeWidth={1.5}
      />
      <text
        x={505}
        y={90}
        fill="white"
        fontSize={10}
        textAnchor="middle"
        fontWeight="600"
      >
        Supplier
      </text>
      <text
        x={505}
        y={104}
        fill="rgba(255,255,255,0.45)"
        fontSize={8}
        textAnchor="middle"
      >
        (Beneficiary)
      </text>

      {/* Bank */}
      <rect
        x={230}
        y={162}
        width={120}
        height={28}
        rx={6}
        fill="#3b82f622"
        stroke="#3b82f6"
        strokeWidth={1.2}
      />
      <text
        x={290}
        y={179}
        fill="#60a5fa"
        fontSize={9}
        textAnchor="middle"
        fontWeight="600"
      >
        Financing Bank
      </text>

      {/* Arrows */}
      <line
        x1={130}
        y1={95}
        x2={228}
        y2={95}
        stroke="#6366f1"
        strokeWidth={1.5}
      />
      <text
        x={179}
        y={87}
        fill="rgba(255,255,255,0.45)"
        fontSize={7.5}
        textAnchor="middle"
      >
        Approved Invoice
      </text>
      <line
        x1={350}
        y1={95}
        x2={448}
        y2={95}
        stroke="#10b981"
        strokeWidth={1.5}
      />
      <text
        x={399}
        y={87}
        fill="rgba(255,255,255,0.45)"
        fontSize={7.5}
        textAnchor="middle"
      >
        Early Payment
      </text>
      <line
        x1={290}
        y1={135}
        x2={290}
        y2={160}
        stroke="#3b82f6"
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />
      <text
        x={308}
        y={152}
        fill="rgba(255,255,255,0.35)"
        fontSize={7}
        textAnchor="start"
      >
        Funding
      </text>
    </svg>
  );
}

function WorkingCapitalSVG() {
  void rand(); // consume seed for consistency
  const companies = [
    {
      name: "Buyer (DPO 90)",
      dso: 45,
      dpo: 90,
      dio: 30,
      color: "#6366f1",
    },
    {
      name: "Supplier (DPO 30)",
      dso: 60,
      dpo: 30,
      dio: 40,
      color: "#10b981",
    },
  ];

  return (
    <svg viewBox="0 0 560 130" className="w-full" style={{ height: 115 }}>
      {companies.map((c, ci) => {
        const y = 12 + ci * 50;
        const ccc = c.dso + c.dio - c.dpo;
        return (
          <g key={c.name}>
            <text
              x={10}
              y={y + 12}
              fill="rgba(255,255,255,0.55)"
              fontSize={9}
              fontWeight="600"
            >
              {c.name}
            </text>
            <text
              x={10}
              y={y + 24}
              fill="rgba(255,255,255,0.35)"
              fontSize={8}
            >
              CCC: {ccc} days
            </text>
            <rect
              x={150}
              y={y + 4}
              width={c.dio * 2}
              height={10}
              rx={2}
              fill={c.color + "44"}
            />
            <text
              x={150 + c.dio}
              y={y + 13}
              fill={c.color}
              fontSize={7}
              textAnchor="middle"
            >
              DIO {c.dio}d
            </text>
            <rect
              x={150 + c.dio * 2}
              y={y + 4}
              width={c.dso * 2}
              height={10}
              rx={2}
              fill={c.color + "77"}
            />
            <text
              x={150 + c.dio * 2 + c.dso}
              y={y + 13}
              fill={c.color}
              fontSize={7}
              textAnchor="middle"
            >
              DSO {c.dso}d
            </text>
            <rect
              x={150}
              y={y + 17}
              width={c.dpo * 2}
              height={6}
              rx={2}
              fill="#ef444444"
            />
            <text
              x={150 + c.dpo}
              y={y + 24}
              fill="#f87171"
              fontSize={7}
              textAnchor="middle"
            >
              DPO {c.dpo}d
            </text>
          </g>
        );
      })}
      <text
        x={10}
        y={118}
        fill="rgba(255,255,255,0.3)"
        fontSize={7.5}
      >
        CCC = DSO + DIO - DPO. Lower (or negative) CCC = better working
        capital efficiency
      </text>
    </svg>
  );
}

function SupplyChainFinanceTab() {
  const scfMarketData = [
    { year: "2019", market: 600 },
    { year: "2020", market: 700 },
    { year: "2021", market: 1100 },
    { year: "2022", market: 1600 },
    { year: "2023", market: 2100 },
    { year: "2024E", market: 2500 },
  ];

  const max = 2500;

  const providers = [
    {
      name: "Taulia (SAP)",
      type: "Enterprise SCF",
      focus: "Large buyers, ERP-integrated",
      clients: "1,000+ buyers",
    },
    {
      name: "Kyriba",
      type: "Treasury + SCF",
      focus: "Dynamic discounting + reverse factoring",
      clients: "2,500+ corporates",
    },
    {
      name: "C2FO",
      type: "Working Capital Marketplace",
      focus: "Supplier-initiated early payment",
      clients: "5M+ suppliers",
    },
    {
      name: "PrimeRevenue",
      type: "Multi-bank SCF",
      focus: "Supplier finance programs",
      clients: "30,000+ suppliers",
    },
    {
      name: "Greensill (collapsed 2021)",
      type: "Supply Chain Finance",
      focus: "Aggressive future-receivables financing",
      clients: "N/A",
    },
  ];

  const esgLinked = [
    {
      metric: "Carbon Footprint Reduction",
      discount: "0.05–0.15% better rate",
      desc: "Suppliers hitting sustainability KPIs get lower discount rates",
    },
    {
      metric: "Diversity & Inclusion Score",
      discount: "0.05–0.10% better rate",
      desc: "Certified diverse suppliers receive enhanced program terms",
    },
    {
      metric: "Safety Record",
      discount: "0.05% better rate",
      desc: "Zero-incident suppliers qualify for preferential early payment",
    },
    {
      metric: "Fair Labor Practices",
      discount: "Program eligibility",
      desc: "Suppliers must meet social compliance audit standards",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>
          Reverse Factoring / Approved Payables Finance
        </SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <ReverseFactoringSVG />
          <p className="text-xs text-white/40 mt-2 text-center">
            Buyer-led SCF: Buyer approves invoices → Bank extends early payment
            to suppliers at buyer&apos;s credit rating
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Trade Finance Gap"
          value="$2T"
          sub="Unmet global demand (ICC/ADB)"
          color="red"
        />
        <StatCard
          label="SCF Market Size 2024E"
          value="$2.5T"
          sub="Outstanding payables financed"
          color="emerald"
        />
        <StatCard
          label="Typical Rate Saving"
          value="0.5–2%"
          sub="vs. supplier borrowing cost"
          color="sky"
        />
        <StatCard
          label="Payment Term Extension"
          value="30–60d"
          sub="Buyer DPO improvement"
          color="amber"
        />
      </div>

      <div>
        <SectionTitle>SCF Market Growth ($B Outstanding)</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <svg viewBox="0 0 540 120" className="w-full" style={{ height: 110 }}>
            {scfMarketData.map((d, i) => {
              const bw = 60;
              const x = 20 + i * 83;
              const h = (d.market / max) * 80;
              const isLast = i === scfMarketData.length - 1;
              return (
                <g key={d.year}>
                  <rect
                    x={x}
                    y={90 - h}
                    width={bw}
                    height={h}
                    rx={4}
                    fill={isLast ? "#10b98155" : "#6366f155"}
                    stroke={isLast ? "#10b981" : "#6366f1"}
                    strokeWidth={1}
                  />
                  <text
                    x={x + bw / 2}
                    y={90 - h - 4}
                    fill="white"
                    fontSize={8}
                    textAnchor="middle"
                  >
                    ${d.market}B
                  </text>
                  <text
                    x={x + bw / 2}
                    y={106}
                    fill="rgba(255,255,255,0.45)"
                    fontSize={8}
                    textAnchor="middle"
                  >
                    {d.year}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div>
        <SectionTitle>Working Capital Impact: CCC Analysis</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <WorkingCapitalSVG />
        </div>
      </div>

      <div>
        <SectionTitle>Dynamic Discounting vs SCF Comparison</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-white/40 uppercase tracking-wide">
            <span>Feature</span>
            <span>Dynamic Discounting</span>
            <span>Reverse Factoring (SCF)</span>
          </div>
          <CompareRow
            label="Who Funds?"
            a="Buyer (own cash)"
            b="Bank / 3rd party funder"
          />
          <CompareRow
            label="Balance Sheet"
            a="Buyer cash utilization"
            b="Off-balance sheet (buyer)"
            aGood={false}
          />
          <CompareRow
            label="Rate Reference"
            a="Buyer's ROI on cash"
            b="Buyer's credit rating"
          />
          <CompareRow
            label="Supplier Benefit"
            a="Flexible early payment"
            b="Lower rate vs own borrowing"
            aGood={true}
          />
          <CompareRow
            label="Setup Complexity"
            a="Low — no bank needed"
            b="Medium — bank onboarding"
            aGood={true}
          />
          <CompareRow
            label="Scalability"
            a="Limited by buyer cash"
            b="Unlimited (bank capacity)"
            aGood={false}
          />
        </div>
      </div>

      <div>
        <SectionTitle>ESG-Linked Supply Chain Finance</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4 space-y-3">
          {esgLinked.map((e) => (
            <div key={e.metric} className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">
                  {e.metric}
                </div>
                <div className="text-xs text-emerald-400">{e.discount}</div>
                <div className="text-xs text-white/50 mt-0.5">{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Key SCF Platform Providers</SectionTitle>
        <div className="bg-foreground/5 rounded-xl divide-y divide-white/5">
          {providers.map((p) => (
            <div
              key={p.name}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
            >
              <span
                className={cn(
                  "font-semibold text-sm",
                  p.name.includes("collapsed")
                    ? "text-red-400"
                    : "text-white"
                )}
              >
                {p.name}
              </span>
              <Badge variant="outline" className="text-xs w-fit">
                {p.type}
              </Badge>
              <span className="text-xs text-white/50 flex-1">{p.focus}</span>
              <span className="text-xs text-sky-400">{p.clients}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Receivables Purchase Comparison</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-white/40 uppercase tracking-wide">
            <span>Feature</span>
            <span>Factoring</span>
            <span>Invoice Discounting</span>
          </div>
          <CompareRow
            label="Credit Control"
            a="Factor manages collections"
            b="Seller retains control"
            aGood={false}
          />
          <CompareRow
            label="Confidentiality"
            a="Disclosed to buyer"
            b="Undisclosed (typically)"
            aGood={false}
          />
          <CompareRow
            label="Recourse"
            a="With or without recourse"
            b="Usually with recourse"
          />
          <CompareRow
            label="Advance Rate"
            a="70–85% of invoice"
            b="70–90% of invoice"
          />
          <CompareRow
            label="Cost"
            a="1–3% per month"
            b="0.5–2.5% per month"
            aGood={false}
          />
          <CompareRow
            label="Best For"
            a="SMEs needing full service"
            b="Larger firms, confidential"
          />
        </div>
      </div>

      <InfoBox>
        Asset-backed securitization of trade receivables pools thousands of
        short-duration invoices into a special purpose vehicle (SPV), which
        issues notes to capital market investors. This provides off-balance-sheet
        financing for corporates and attractive short-duration assets for money
        market funds.
      </InfoBox>
    </div>
  );
}

// ── Tab 3: Documentary Collections & Insurance ────────────────────────────────

function DocCollectionFlowSVG() {
  const partyList = [
    { label: "Exporter", x: 30, color: "#6366f1" },
    { label: "Remitting Bank", x: 180, color: "#f59e0b" },
    { label: "Collecting Bank", x: 375, color: "#f59e0b" },
    { label: "Importer", x: 530, color: "#10b981" },
  ];

  const flowSteps = [
    {
      from: "Exporter",
      to: "Remitting Bank",
      label: "1. Collection Order + Docs",
      y: 50,
    },
    {
      from: "Remitting Bank",
      to: "Collecting Bank",
      label: "2. Forward Docs",
      y: 80,
    },
    {
      from: "Collecting Bank",
      to: "Importer",
      label: "3. Present Docs",
      y: 110,
    },
    {
      from: "Importer",
      to: "Collecting Bank",
      label: "4. Payment / Acceptance",
      y: 140,
    },
    {
      from: "Collecting Bank",
      to: "Remitting Bank",
      label: "5. Remit Funds",
      y: 170,
    },
    {
      from: "Remitting Bank",
      to: "Exporter",
      label: "6. Credit Exporter",
      y: 200,
    },
  ];

  const getX = (name: string) => {
    const p = partyList.find((pt) => pt.label === name);
    return p ? p.x : 0;
  };

  return (
    <svg viewBox="0 0 580 220" className="w-full" style={{ height: 195 }}>
      {partyList.map((p) => (
        <g key={p.label}>
          <rect
            x={p.x - 48}
            y={0}
            width={96}
            height={22}
            rx={4}
            fill={p.color + "22"}
            stroke={p.color + "55"}
            strokeWidth={1}
          />
          <text
            x={p.x}
            y={14}
            fill={p.color}
            fontSize={8.5}
            textAnchor="middle"
            fontWeight="600"
          >
            {p.label}
          </text>
          <line
            x1={p.x}
            y1={22}
            x2={p.x}
            y2={215}
            stroke={p.color + "18"}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        </g>
      ))}
      {flowSteps.map((st, i) => {
        const x1 = getX(st.from);
        const x2 = getX(st.to);
        const dir = x2 > x1 ? 1 : -1;
        return (
          <g key={i}>
            <line
              x1={x1 + dir * 50}
              y1={st.y}
              x2={x2 - dir * 50}
              y2={st.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1.2}
            />
            <polygon
              points={`${x2 - dir * 50},${st.y - 3} ${x2 - dir * 50},${st.y + 3} ${x2 - dir * 44},${st.y}`}
              fill="rgba(255,255,255,0.25)"
            />
            <text
              x={(x1 + x2) / 2}
              y={st.y - 5}
              fill="rgba(255,255,255,0.38)"
              fontSize={7.5}
              textAnchor="middle"
            >
              {st.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DocumentaryCollectionsTab() {
  const [activeIncoterm, setActiveIncoterm] = useState<string | null>(null);

  const incoterms = [
    {
      code: "EXW",
      name: "Ex Works",
      seller: "Min",
      buyer: "Max",
      transfer: "Seller's premises",
      mode: "Any",
    },
    {
      code: "FCA",
      name: "Free Carrier",
      seller: "Low",
      buyer: "High",
      transfer: "Named place",
      mode: "Any",
    },
    {
      code: "CPT",
      name: "Carriage Paid To",
      seller: "Med",
      buyer: "Med",
      transfer: "Destination carrier",
      mode: "Any",
    },
    {
      code: "CIP",
      name: "Carriage & Insurance Paid",
      seller: "Med+",
      buyer: "Med-",
      transfer: "Destination carrier",
      mode: "Any",
    },
    {
      code: "DAP",
      name: "Delivered at Place",
      seller: "High",
      buyer: "Low",
      transfer: "Named destination",
      mode: "Any",
    },
    {
      code: "DPU",
      name: "Delivered at Place Unloaded",
      seller: "High+",
      buyer: "Low-",
      transfer: "Destination unloaded",
      mode: "Any",
    },
    {
      code: "DDP",
      name: "Delivered Duty Paid",
      seller: "Max",
      buyer: "Min",
      transfer: "Destination incl. duty",
      mode: "Any",
    },
    {
      code: "FAS",
      name: "Free Alongside Ship",
      seller: "Low",
      buyer: "High",
      transfer: "Alongside vessel",
      mode: "Sea",
    },
    {
      code: "FOB",
      name: "Free On Board",
      seller: "Med-",
      buyer: "Med+",
      transfer: "On board vessel",
      mode: "Sea",
    },
    {
      code: "CFR",
      name: "Cost & Freight",
      seller: "Med",
      buyer: "Med",
      transfer: "Port of destination",
      mode: "Sea",
    },
    {
      code: "CIF",
      name: "Cost Insurance Freight",
      seller: "Med+",
      buyer: "Med-",
      transfer: "Port of destination",
      mode: "Sea",
    },
  ];

  const insurers = [
    { name: "Euler Hermes (Allianz Trade)", share: 35, hq: "Germany" },
    { name: "Atradius", share: 25, hq: "Netherlands" },
    { name: "Coface", share: 20, hq: "France" },
    { name: "QBE / AIG / Others", share: 20, hq: "Various" },
  ];

  const ecas = [
    {
      name: "Ex-Im Bank (USA)",
      focus: "Export financing for US goods",
      instrument: "Guarantees, direct loans, insurance",
    },
    {
      name: "UK Export Finance",
      focus: "UK exporter support",
      instrument: "Buyer credit, supplier credit, bonds",
    },
    {
      name: "SACE (Italy)",
      focus: "Italian trade promotion",
      instrument: "Export credit insurance, guarantees",
    },
    {
      name: "EDC (Canada)",
      focus: "Canadian exporter support",
      instrument: "Loans, insurance, guarantees",
    },
    {
      name: "Bpifrance (France)",
      focus: "French SME export support",
      instrument: "Insurance + refinancing",
    },
    {
      name: "JBIC / NEXI (Japan)",
      focus: "Japanese trade and investment",
      instrument: "ODA loans, equity finance",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Documentary Collection Flow</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <DocCollectionFlowSVG />
        </div>
      </div>

      <div>
        <SectionTitle>D/P vs D/A Collections</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-white/40 uppercase tracking-wide">
            <span>Feature</span>
            <span>D/P (Documents Against Payment)</span>
            <span>D/A (Documents Against Acceptance)</span>
          </div>
          <CompareRow
            label="Release Trigger"
            a="Immediate payment (sight)"
            b="Acceptance of time draft"
          />
          <CompareRow
            label="Exporter Risk"
            a="Low — goods secured until paid"
            b="High — docs released on promise"
            aGood={true}
          />
          <CompareRow
            label="Importer Benefit"
            a="No credit extension"
            b="Receive goods on credit (30–180d)"
            aGood={false}
          />
          <CompareRow
            label="Bank Obligation"
            a="Deliver docs vs payment only"
            b="Collect draft at maturity"
          />
          <CompareRow
            label="Financing Options"
            a="Discounting of drafts"
            b="Avalised drafts (bank guarantee)"
          />
          <CompareRow
            label="Cost to Importer"
            a="Higher (immediate cash outflow)"
            b="Lower (deferred payment)"
            aGood={false}
          />
        </div>
      </div>

      <div>
        <SectionTitle>INCOTERMS 2020 — 11 Terms</SectionTitle>
        <div className="bg-foreground/5 rounded-xl overflow-hidden">
          <div className="grid grid-cols-6 gap-1 px-3 py-2 text-xs text-white/40 uppercase tracking-wide border-b border-border/50">
            <span>Code</span>
            <span>Name</span>
            <span>Seller</span>
            <span>Buyer</span>
            <span>Title Transfer</span>
            <span>Mode</span>
          </div>
          {incoterms.map((t) => {
            const highlighted = ["DDP", "FOB", "CIF"].includes(t.code);
            return (
              <button
                key={t.code}
                className={cn(
                  "w-full grid grid-cols-6 gap-1 px-3 py-2 text-xs border-b border-border/50 text-left transition-colors",
                  activeIncoterm === t.code
                    ? "bg-amber-500/10"
                    : "hover:bg-muted/30",
                  highlighted && "border-l-2 border-amber-500/40"
                )}
                onClick={() =>
                  setActiveIncoterm(
                    activeIncoterm === t.code ? null : t.code
                  )
                }
              >
                <span
                  className={cn(
                    "font-bold",
                    highlighted ? "text-amber-400" : "text-sky-400"
                  )}
                >
                  {t.code}
                </span>
                <span className="text-white/70">{t.name}</span>
                <span
                  className={cn(
                    t.seller === "Max"
                      ? "text-red-400"
                      : t.seller.startsWith("Low") || t.seller === "Min"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  )}
                >
                  {t.seller}
                </span>
                <span
                  className={cn(
                    t.buyer === "Max"
                      ? "text-red-400"
                      : t.buyer.startsWith("Low") || t.buyer === "Min"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  )}
                >
                  {t.buyer}
                </span>
                <span className="text-white/50">{t.transfer}</span>
                <span
                  className={cn(
                    t.mode === "Sea" ? "text-primary" : "text-white/50"
                  )}
                >
                  {t.mode}
                </span>
              </button>
            );
          })}
          <p className="text-xs text-white/30 px-3 py-2">
            Highlighted: DDP/FOB/CIF — most commonly used. Blue = sea-only
            terms.
          </p>
        </div>
      </div>

      <div>
        <SectionTitle>Trade Credit Insurance Market Share</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <svg viewBox="0 0 560 75" className="w-full" style={{ height: 65 }}>
            {(() => {
              let cumulative = 0;
              const colors = ["#6366f1", "#10b981", "#f59e0b", "#64748b"];
              return insurers.map((ins, i) => {
                const w = (ins.share / 100) * 520;
                const x = 20 + (cumulative / 100) * 520;
                cumulative += ins.share;
                return (
                  <g key={ins.name}>
                    <rect
                      x={x}
                      y={10}
                      width={w - 2}
                      height={22}
                      rx={3}
                      fill={colors[i] + "55"}
                      stroke={colors[i]}
                      strokeWidth={1}
                    />
                    <text
                      x={x + (w - 2) / 2}
                      y={24}
                      fill={colors[i]}
                      fontSize={8.5}
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {ins.share}%
                    </text>
                    <text
                      x={x + (w - 2) / 2}
                      y={46}
                      fill="rgba(255,255,255,0.5)"
                      fontSize={6.5}
                      textAnchor="middle"
                    >
                      {ins.name.split(" (")[0]}
                    </text>
                    <text
                      x={x + (w - 2) / 2}
                      y={57}
                      fill="rgba(255,255,255,0.3)"
                      fontSize={6.5}
                      textAnchor="middle"
                    >
                      {ins.hq}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>
        </div>
      </div>

      <div>
        <SectionTitle>Political Risk vs Commercial Risk</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-300">
                Political Risk
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-white/60">
              <li>• Sovereign default / moratorium</li>
              <li>• War, civil disturbance, expropriation</li>
              <li>• Currency inconvertibility / transfer restrictions</li>
              <li>• Import/export license cancellation</li>
              <li>• Covered by ECAs and specialist underwriters</li>
            </ul>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">
                Commercial Risk
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-white/60">
              <li>• Buyer insolvency / bankruptcy</li>
              <li>• Protracted default (slow payment)</li>
              <li>• Contract disputes / refusal to accept goods</li>
              <li>• Covered by private insurers (Euler Hermes etc.)</li>
              <li>• Credit limits set per buyer, reviewed annually</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Export Credit Agencies (ECAs)</SectionTitle>
        <div className="bg-foreground/5 rounded-xl divide-y divide-white/5">
          {ecas.map((e) => (
            <div key={e.name} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                <span className="font-semibold text-sm text-white">
                  {e.name}
                </span>
                <span className="text-xs text-white/40">{e.focus}</span>
              </div>
              <div className="text-xs text-sky-400">{e.instrument}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Single Buyer vs Whole Turnover Policies</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2 mb-2 text-xs text-white/40 uppercase tracking-wide">
            <span>Feature</span>
            <span>Single Buyer Policy</span>
            <span>Whole Turnover Policy</span>
          </div>
          <CompareRow
            label="Coverage Scope"
            a="One named buyer"
            b="Entire trade receivables book"
          />
          <CompareRow
            label="Premium"
            a="Higher per-buyer rate"
            b="Lower blended rate"
            aGood={false}
          />
          <CompareRow
            label="Flexibility"
            a="Targeted risk transfer"
            b="Portfolio-level protection"
          />
          <CompareRow
            label="Best for"
            a="Key account concentration"
            b="SMEs, diversified exporters"
          />
          <CompareRow
            label="Excess / Deductible"
            a="Typically 10–20%"
            b="First loss / aggregate"
          />
        </div>
      </div>

      <InfoBox>
        Collection order mechanics (URC 522): The remitting bank acts purely as
        an agent for the exporter and bears no payment obligation itself. If the
        importer defaults, the exporter bears the credit loss — unlike an LC
        where the issuing bank bears the payment obligation.
      </InfoBox>
    </div>
  );
}

// ── Tab 4: Fintech & Digital Trade ────────────────────────────────────────────

function TradeFinanceGapSVG() {
  const regions = [
    { name: "Asia Pacific", gap: 700, total: 900 },
    { name: "Latin America", gap: 350, total: 450 },
    { name: "Africa", gap: 290, total: 330 },
    { name: "Europe", gap: 200, total: 600 },
    { name: "North America", gap: 160, total: 700 },
  ];

  const maxTotal = 900;

  return (
    <svg viewBox="0 0 560 155" className="w-full" style={{ height: 140 }}>
      {regions.map((r, i) => {
        const y = 12 + i * 27;
        const totalW = (r.total / maxTotal) * 320;
        const gapW = (r.gap / maxTotal) * 320;
        return (
          <g key={r.name}>
            <text
              x={118}
              y={y + 11}
              fill="rgba(255,255,255,0.55)"
              fontSize={9}
              textAnchor="end"
            >
              {r.name}
            </text>
            <rect
              x={122}
              y={y}
              width={totalW}
              height={14}
              rx={3}
              fill="#6366f122"
              stroke="#6366f133"
              strokeWidth={1}
            />
            <rect
              x={122}
              y={y}
              width={gapW}
              height={14}
              rx={3}
              fill="#ef444466"
              stroke="#ef4444"
              strokeWidth={1}
            />
            <text
              x={122 + gapW + 4}
              y={y + 11}
              fill="#f87171"
              fontSize={8}
            >
              ${r.gap}B gap
            </text>
            <text
              x={122 + totalW + 4}
              y={y + 11}
              fill="rgba(255,255,255,0.3)"
              fontSize={8}
            >
              /${r.total}B mkt
            </text>
          </g>
        );
      })}
      <text
        x={10}
        y={148}
        fill="rgba(255,255,255,0.3)"
        fontSize={7.5}
      >
        Source: ICC / ADB Trade Finance Gaps Survey. Total gap ~$1.7T globally
      </text>
    </svg>
  );
}

function BlockchainCard({
  name,
  status,
  tech,
  desc,
  statusColor,
}: {
  name: string;
  status: string;
  tech: string;
  desc: string;
  statusColor: "emerald" | "amber" | "red" | "sky";
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
    sky: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  };
  return (
    <div className="bg-foreground/5 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-sm text-white">{name}</div>
          <div className="text-xs text-white/40 mt-0.5">{tech}</div>
        </div>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            colorMap[statusColor]
          )}
        >
          {status}
        </span>
      </div>
      <p className="text-xs text-white/55">{desc}</p>
    </div>
  );
}

function FintechDigitalTab() {
  const painPoints = [
    {
      issue: "Paper-Based Documentation",
      impact: "20+ documents per shipment, avg 7-day processing delay",
      icon: "📄",
    },
    {
      issue: "Manual Reconciliation",
      impact: "Error rates 3–5%, costly rework cycles",
      icon: "⚙️",
    },
    {
      issue: "Counterparty Risk Opacity",
      impact: "Limited real-time buyer creditworthiness data",
      icon: "🔍",
    },
    {
      issue: "Correspondent Banking Decline",
      impact: "De-risking reduced trade corridors by 20%+ since 2015",
      icon: "🏦",
    },
    {
      issue: "SME Access Barriers",
      impact: "80% of trade finance gap falls on SMEs and Mid-Caps",
      icon: "🏪",
    },
    {
      issue: "Fraud Vulnerability",
      impact: "Double-financing risk in paper BoL environment",
      icon: "⚠️",
    },
  ];

  const eBolProviders = [
    {
      name: "BOLERO",
      founded: "1999",
      adoption: "Established",
      legal: "Rule Book + Contractual",
      notes: "Pioneer, bank-owned consortium",
    },
    {
      name: "essDOCS",
      founded: "2002",
      adoption: "Growing",
      legal: "Switch BoL contractual",
      notes: "CargoX integration, commodity focus",
    },
    {
      name: "WaveBL",
      founded: "2017",
      adoption: "Expanding",
      legal: "MLETR-aligned",
      notes: "Blockchain-based, 100+ banks connected",
    },
    {
      name: "TradeLens (Maersk/IBM)",
      founded: "2018",
      adoption: "Defunct",
      legal: "N/A",
      notes: "Shut down 2022 — governance issues",
    },
  ];

  const geopoliticalTrends = [
    {
      trend: "Friend-shoring / Near-shoring",
      impact:
        "Trade corridors shifting from China to SEA, Mexico, India",
      risk: "amber" as const,
    },
    {
      trend: "Russia-Ukraine Conflict",
      impact:
        "Black Sea grain, energy disruptions; sanctions compliance burden",
      risk: "red" as const,
    },
    {
      trend: "US-China Decoupling",
      impact:
        "Dual supply chains; tech export controls; HK LC corridor shifts",
      risk: "red" as const,
    },
    {
      trend: "Digital Trade Agreements",
      impact:
        "DEPA/CPTPP digital chapters enable e-BoL legal recognition",
      risk: "emerald" as const,
    },
    {
      trend: "MLETR Adoption",
      impact:
        "UN Model Law on Electronic Transferable Records gaining country adoption",
      risk: "sky" as const,
    },
    {
      trend: "AI KYC/AML Platforms",
      impact:
        "Reduce correspondent banking compliance cost by 40–60%",
      risk: "emerald" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Trade Finance Gap by Region</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <TradeFinanceGapSVG />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Open Account Trade"
          value="80%"
          sub="Of global trade now open account"
          color="sky"
        />
        <StatCard
          label="Trade Finance Gap"
          value="$1.7T"
          sub="ICC/ADB estimate 2023"
          color="red"
        />
        <StatCard
          label="Digitization Savings"
          value="~$7B"
          sub="Potential annual cost reduction"
          color="emerald"
        />
        <StatCard
          label="e-BoL Adoption"
          value="<3%"
          sub="Of global BoLs still electronic"
          color="amber"
        />
      </div>

      <div>
        <SectionTitle>Traditional Trade Finance Pain Points</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {painPoints.map((p) => (
            <div key={p.issue} className="bg-foreground/5 rounded-xl p-3 flex gap-3">
              <span className="text-xl leading-none mt-0.5">{p.icon}</span>
              <div>
                <div className="text-sm font-medium text-white">
                  {p.issue}
                </div>
                <div className="text-xs text-white/50 mt-0.5">{p.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Blockchain Trade Finance Pilots</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BlockchainCard
            name="we.trade"
            status="Bankrupt 2022"
            tech="IBM Blockchain / Hyperledger"
            statusColor="red"
            desc="European bank consortium (12 banks incl. Santander, Deutsche Bank). LC and payment guarantees on blockchain. Governance disputes and insufficient adoption led to collapse."
          />
          <BlockchainCard
            name="Marco Polo"
            status="Restructured"
            tech="R3 Corda"
            statusColor="amber"
            desc="TradeIX + R3 venture. Open account trade finance automation. Faced adoption challenges; TradeIX went into administration 2022. Network assets acquired by MUFG."
          />
          <BlockchainCard
            name="Contour"
            status="Operating"
            tech="R3 Corda (LC focus)"
            statusColor="emerald"
            desc="Digital LC platform backed by 9 banks including HSBC, Standard Chartered, Citi. Processed $1B+ in LCs. Focused on digitizing the LC lifecycle specifically."
          />
          <BlockchainCard
            name="TradeLens (Maersk/IBM)"
            status="Shut Down 2022"
            tech="Hyperledger Fabric"
            statusColor="red"
            desc="Shipping data sharing platform connecting ports, carriers, customs. Achieved significant adoption (600+ organizations) but commercially unviable as neutral utility."
          />
        </div>
      </div>

      <div>
        <SectionTitle>Electronic Bills of Lading (e-BoL) Providers</SectionTitle>
        <div className="bg-foreground/5 rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 gap-2 px-4 py-2 text-xs text-white/40 uppercase tracking-wide border-b border-border/50">
            <span>Platform</span>
            <span>Founded</span>
            <span>Status</span>
            <span>Legal Basis</span>
            <span>Notes</span>
          </div>
          {eBolProviders.map((e) => (
            <div
              key={e.name}
              className={cn(
                "grid grid-cols-5 gap-2 px-4 py-3 text-xs border-b border-border/50",
                e.adoption === "Defunct" && "opacity-60"
              )}
            >
              <span
                className={cn(
                  "font-semibold",
                  e.adoption === "Defunct" ? "text-red-400" : "text-white"
                )}
              >
                {e.name}
              </span>
              <span className="text-white/50">{e.founded}</span>
              <span
                className={cn(
                  e.adoption === "Established"
                    ? "text-emerald-400"
                    : e.adoption === "Growing" || e.adoption === "Expanding"
                    ? "text-sky-400"
                    : "text-red-400"
                )}
              >
                {e.adoption}
              </span>
              <span className="text-white/50">{e.legal}</span>
              <span className="text-white/40">{e.notes}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>
          AI-Powered KYC/AML for Correspondent Banking
        </SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4 space-y-3">
          <p className="text-xs text-white/55">
            Correspondent banking de-risking has reduced access to trade finance
            in developing markets. AI platforms address compliance cost barriers:
          </p>
          {[
            {
              tool: "Entity Resolution AI",
              benefit:
                "Matches counterparty names across sanctioned lists with 95%+ accuracy vs 60–70% rule-based",
            },
            {
              tool: "Transaction Monitoring ML",
              benefit:
                "Reduces false positive alerts by 60–80%, freeing compliance teams for real investigations",
            },
            {
              tool: "Automated BoL/Invoice Analysis",
              benefit:
                "OCR + NLP extracts structured data from trade documents in seconds vs hours",
            },
            {
              tool: "Dual-Use Goods Detection",
              benefit:
                "Flags potentially controlled commodities (chemicals, electronics) in invoice descriptions",
            },
            {
              tool: "Country Risk Scoring",
              benefit:
                "Dynamic risk scoring incorporating geopolitical events, sanctions updates, counterparty history",
            },
          ].map((item) => (
            <div key={item.tool} className="flex gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">
                  {item.tool}
                </div>
                <div className="text-xs text-white/50">{item.benefit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>
          Geopolitical Fragmentation &amp; Trade Flows
        </SectionTitle>
        <div className="bg-foreground/5 rounded-xl divide-y divide-white/5">
          {geopoliticalTrends.map((t) => {
            const colorMap: Record<string, string> = {
              emerald: "text-emerald-400",
              amber: "text-amber-400",
              red: "text-red-400",
              sky: "text-sky-400",
            };
            const iconMap: Record<
              string,
              React.ComponentType<{ className?: string }>
            > = {
              emerald: CheckCircle,
              red: XCircle,
              amber: AlertTriangle,
              sky: Info,
            };
            const Icon = iconMap[t.risk];
            return (
              <div
                key={t.trend}
                className="px-4 py-3 flex gap-3 items-start"
              >
                <Icon
                  className={cn(
                    "w-4 h-4 mt-0.5 shrink-0",
                    colorMap[t.risk]
                  )}
                />
                <div>
                  <div className="text-sm font-medium text-white">
                    {t.trend}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {t.impact}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionTitle>Embedded Trade Finance in ERP Systems</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4">
          <p className="text-xs text-white/55 mb-3">
            Modern trade finance is moving inside ERP platforms (SAP, Oracle,
            Microsoft Dynamics) and B2B commerce networks:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                platform: "SAP (Taulia integration)",
                capability:
                  "SCF, dynamic discounting, e-invoicing — triggered directly from AP/AR workflows",
              },
              {
                platform: "Oracle Fusion",
                capability:
                  "Integrated payment factory with embedded FX hedging and trade payables finance",
              },
              {
                platform: "Tradeshift",
                capability:
                  "Supply chain network with embedded invoice financing and payment services",
              },
              {
                platform: "Amazon Business Pay",
                capability:
                  "B2B BNPL and early payment embedded in procurement flow — displacing traditional factoring",
              },
            ].map((item) => (
              <div key={item.platform} className="bg-foreground/5 rounded-lg p-3">
                <div className="text-xs font-semibold text-primary mb-1">
                  {item.platform}
                </div>
                <div className="text-xs text-white/50">{item.capability}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Digital Trade Corridor Initiatives</SectionTitle>
        <div className="bg-foreground/5 rounded-xl p-4 space-y-3">
          {[
            {
              name: "Singapore–UK Digital Economy Agreement",
              desc: "Mutual recognition of e-signatures, e-invoices, and electronic transferable records including BoLs",
              color: "sky",
            },
            {
              name: "ASEAN Digital Trade Framework",
              desc: "Harmonized standards for cross-border e-commerce and trade documentation across 10 member states",
              color: "emerald",
            },
            {
              name: "ICC Digital Trade Roadmap",
              desc: "Phase out paper-based trade by 2027 — targets 50% digital adoption through industry coalitions",
              color: "amber",
            },
            {
              name: "SWIFT Go (B2B payments)",
              desc: "Low-value cross-border payment rails designed for SME trade payments, replacing costly correspondent chains",
              color: "violet",
            },
          ].map((item) => {
            const colorMap: Record<string, string> = {
              sky: "border-sky-500/30 text-sky-300",
              emerald: "border-emerald-500/30 text-emerald-300",
              amber: "border-amber-500/30 text-amber-300",
              violet: "border-border text-primary",
            };
            return (
              <div
                key={item.name}
                className={cn(
                  "border-l-2 pl-3",
                  colorMap[item.color]
                )}
              >
                <div className="text-xs font-semibold">{item.name}</div>
                <div className="text-xs text-white/50 mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <InfoBox>
        The MLETR (UNCITRAL Model Law on Electronic Transferable Records)
        provides a legal framework for recognizing electronic trade documents
        including bills of lading and bills of exchange. As of 2026, the UK
        (Electronic Trade Documents Act 2023), Singapore, Bahrain, Kiribati, and
        Papua New Guinea have adopted MLETR — unlocking full legal negotiability
        of e-BoLs in those jurisdictions.
      </InfoBox>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TradeFinancePage() {
  const tabs = [
    { id: "lc", label: "Letters of Credit", icon: FileText },
    { id: "scf", label: "Supply Chain Finance", icon: TrendingUp },
    { id: "collections", label: "Documentary Collections", icon: Shield },
    { id: "fintech", label: "Fintech & Digital Trade", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Trade Finance</h1>
              <p className="text-sm text-white/40">
                Letters of credit, supply chain finance, documentary collections
                &amp; digital trade
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: "Global Trade Volume", value: "$32T/yr" },
              { label: "Trade Finance Gap", value: "$1.7T" },
              { label: "LC Market", value: "~$2.8T" },
              { label: "SCF Market", value: "~$2.5T" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-foreground/5 rounded-lg px-3 py-1.5 flex items-center gap-2"
              >
                <span className="text-xs text-white/40">{kpi.label}</span>
                <span className="text-xs font-semibold text-sky-400">
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="lc">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-foreground/5 p-1 rounded-xl mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 text-xs data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300 rounded-lg px-3 py-2"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="lc" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LettersOfCreditTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="scf" className="data-[state=inactive]:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SupplyChainFinanceTab />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="collections"
            className="data-[state=inactive]:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DocumentaryCollectionsTab />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="fintech"
            className="data-[state=inactive]:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FintechDigitalTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
