"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Info,
  ArrowRight,
  DollarSign,
  PieChart,
  GitBranch,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Scale,
  Activity,
  Building2,
  CreditCard,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 931;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
function resetSeed() {
  s = 931;
}

// ── UI Primitives ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
      {children}
    </h3>
  );
}

function InfoBox({
  children,
  variant = "sky",
}: {
  children: React.ReactNode;
  variant?: "sky" | "amber" | "emerald" | "violet";
}) {
  const colors = {
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-300",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-300",
  };
  return (
    <div
      className={cn(
        "flex gap-2 rounded-lg border p-3 text-sm",
        colors[variant],
      )}
    >
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "red" | "amber" | "sky" | "violet";
}) {
  const textColor = {
    emerald: "text-emerald-400",
    red: "text-red-400",
    amber: "text-amber-400",
    sky: "text-sky-400",
    violet: "text-violet-400",
  };
  return (
    <div className="bg-white/5 rounded-lg p-3 flex flex-col gap-1">
      <span className="text-[11px] text-white/40 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          color ? textColor[color] : "text-white",
        )}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-white/40">{sub}</span>}
    </div>
  );
}

function ExpandableCard({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
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
            <div className="px-4 pb-4 text-sm text-white/70 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tab 1: ABS & MBS Basics ───────────────────────────────────────────────────

function SecuritizationFlowSVG() {
  const steps = [
    { label: "Originator", sub: "Bank / Lender", color: "#3b82f6", x: 50 },
    { label: "SPV", sub: "Special Purpose Vehicle", color: "#8b5cf6", x: 230 },
    { label: "Investors", sub: "Tranches A/B/Equity", color: "#10b981", x: 410 },
  ];
  return (
    <svg
      viewBox="0 0 500 140"
      className="w-full h-36 select-none"
      aria-label="Securitization flow diagram"
    >
      {/* Boxes */}
      {steps.map((st, i) => (
        <g key={i}>
          <rect
            x={st.x}
            y={40}
            width={110}
            height={60}
            rx={8}
            fill={st.color + "22"}
            stroke={st.color + "66"}
            strokeWidth={1.5}
          />
          <text
            x={st.x + 55}
            y={67}
            textAnchor="middle"
            fill={st.color}
            fontSize={11}
            fontWeight={600}
          >
            {st.label}
          </text>
          <text
            x={st.x + 55}
            y={83}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={9}
          >
            {st.sub}
          </text>
        </g>
      ))}
      {/* Arrows */}
      {[
        { x1: 160, x2: 228 },
        { x1: 340, x2: 408 },
      ].map((a, i) => (
        <g key={i}>
          <line
            x1={a.x1}
            y1={70}
            x2={a.x2}
            y2={70}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.5}
          />
          <polygon
            points={`${a.x2},65 ${a.x2 + 8},70 ${a.x2},75`}
            fill="rgba(255,255,255,0.25)"
          />
        </g>
      ))}
      {/* Labels on arrows */}
      <text x={175} y={62} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={8}>
        assets
      </text>
      <text x={355} y={62} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={8}>
        ABS notes
      </text>
      {/* Cash flow arrows back (dashed) */}
      <line
        x1={230}
        y1={90}
        x2={162}
        y2={90}
        stroke="#10b98155"
        strokeWidth={1}
        strokeDasharray="4,3"
      />
      <polygon points={`162,85 154,90 162,95`} fill="#10b98155" />
      <line
        x1={410}
        y1={90}
        x2={342}
        y2={90}
        stroke="#10b98155"
        strokeWidth={1}
        strokeDasharray="4,3"
      />
      <polygon points={`342,85 334,90 342,95`} fill="#10b98155" />
      <text x={196} y={103} textAnchor="middle" fill="#10b98177" fontSize={8}>
        proceeds
      </text>
      <text x={376} y={103} textAnchor="middle" fill="#10b98177" fontSize={8}>
        cash flows
      </text>
    </svg>
  );
}

function TranchWaterfallSVG() {
  const tranches = [
    {
      label: "Senior (AAA)",
      pct: 75,
      color: "#10b981",
      oc: "OC ≥ 125%",
      ce: "CE: 25%",
    },
    {
      label: "Mezzanine (BBB)",
      pct: 15,
      color: "#f59e0b",
      oc: "OC ≥ 105%",
      ce: "CE: 5%",
    },
    {
      label: "Equity / First-Loss",
      pct: 10,
      color: "#ef4444",
      oc: "No floor",
      ce: "CE: 0%",
    },
  ];
  let y = 10;
  return (
    <svg
      viewBox="0 0 420 160"
      className="w-full h-40 select-none"
      aria-label="Tranche waterfall"
    >
      {tranches.map((t, i) => {
        const h = t.pct * 1.35;
        const yStart = y;
        y += h + 4;
        return (
          <g key={i}>
            <rect
              x={10}
              y={yStart}
              width={200}
              height={h}
              rx={4}
              fill={t.color + "33"}
              stroke={t.color + "88"}
              strokeWidth={1.2}
            />
            <text
              x={20}
              y={yStart + h / 2 + 4}
              fill={t.color}
              fontSize={10}
              fontWeight={600}
            >
              {t.label}
            </text>
            <text
              x={225}
              y={yStart + h / 2 - 3}
              fill="rgba(255,255,255,0.5)"
              fontSize={9}
            >
              {t.oc}
            </text>
            <text
              x={225}
              y={yStart + h / 2 + 9}
              fill="rgba(255,255,255,0.35)"
              fontSize={9}
            >
              {t.ce}
            </text>
          </g>
        );
      })}
      {/* waterfall arrow */}
      <text
        x={395}
        y={50}
        fill="rgba(255,255,255,0.25)"
        fontSize={9}
        textAnchor="end"
      >
        Cash
      </text>
      <text
        x={395}
        y={62}
        fill="rgba(255,255,255,0.25)"
        fontSize={9}
        textAnchor="end"
      >
        Flows
      </text>
      <line
        x1={388}
        y1={65}
        x2={388}
        y2={148}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1.5}
      />
      <polygon points={`383,148 388,156 393,148`} fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

function ABSMarketPieSVG() {
  const segments = [
    { label: "Auto ABS", pct: 27, color: "#3b82f6" },
    { label: "Credit Card", pct: 23, color: "#8b5cf6" },
    { label: "RMBS Agency", pct: 22, color: "#10b981" },
    { label: "CMBS", pct: 14, color: "#f59e0b" },
    { label: "Student Loan", pct: 9, color: "#06b6d4" },
    { label: "Equipment", pct: 5, color: "#f43f5e" },
  ];
  const cx = 80;
  const cy = 80;
  const r = 65;
  let cumPct = 0;
  const slices = segments.map((seg) => {
    const startAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    cumPct += seg.pct;
    const endAngle = (cumPct / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = seg.pct > 50 ? 1 : 0;
    const midAngle = (startAngle + endAngle) / 2;
    return { ...seg, x1, y1, x2, y2, largeArc, midAngle };
  });
  return (
    <svg viewBox="0 0 420 170" className="w-full h-44 select-none" aria-label="ABS market size pie chart">
      {slices.map((sl, i) => (
        <path
          key={i}
          d={`M${cx},${cy} L${sl.x1},${sl.y1} A${r},${r} 0 ${sl.largeArc} 1 ${sl.x2},${sl.y2} Z`}
          fill={sl.color + "55"}
          stroke={sl.color}
          strokeWidth={1}
        />
      ))}
      {/* Legend */}
      {segments.map((seg, i) => (
        <g key={i}>
          <rect
            x={175}
            y={18 + i * 24}
            width={10}
            height={10}
            rx={2}
            fill={seg.color + "88"}
            stroke={seg.color}
            strokeWidth={0.5}
          />
          <text x={190} y={28 + i * 24} fill="rgba(255,255,255,0.7)" fontSize={10}>
            {seg.label}
          </text>
          <text
            x={400}
            y={28 + i * 24}
            textAnchor="end"
            fill={seg.color}
            fontSize={10}
            fontWeight={600}
          >
            {seg.pct}%
          </text>
        </g>
      ))}
    </svg>
  );
}

function AbsMbsTab() {
  const assetClasses = [
    {
      type: "Auto ABS",
      collateral: "Car loans & leases",
      avgLife: "2–3 yr",
      prepayRisk: "Moderate",
      rating: "AAA–BBB",
    },
    {
      type: "Credit Card ABS",
      collateral: "Revolving card balances",
      avgLife: "2–5 yr",
      prepayRisk: "Low",
      rating: "AAA–BBB",
    },
    {
      type: "Student Loan ABS",
      collateral: "FFELP / private loans",
      avgLife: "5–10 yr",
      prepayRisk: "Low",
      rating: "AAA–BBB",
    },
    {
      type: "Equipment ABS",
      collateral: "Heavy machinery / IT",
      avgLife: "3–5 yr",
      prepayRisk: "Low",
      rating: "AAA–A",
    },
    {
      type: "RMBS (Agency)",
      collateral: "Residential mortgages",
      avgLife: "5–12 yr",
      prepayRisk: "High",
      rating: "AAA (implicit)",
    },
    {
      type: "CMBS",
      collateral: "Commercial real estate",
      avgLife: "5–10 yr",
      prepayRisk: "Low",
      rating: "AAA–B",
    },
  ];

  const enhancements = [
    {
      name: "Overcollateralization (OC)",
      desc: "Collateral pool exceeds note balance; excess absorbs losses first",
    },
    {
      name: "Subordination",
      desc: "Junior tranches take losses before senior tranches",
    },
    {
      name: "Reserve Accounts",
      desc: "Cash reserve funded at close; replenishes shortfalls",
    },
    {
      name: "Excess Spread",
      desc: "Coupon earned on collateral minus note costs; first loss buffer",
    },
    {
      name: "Insurance / Wrap",
      desc: "Financial guarantor wraps senior tranche (pre-crisis model)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="US ABS Market" value="$1.7T" sub="Outstanding (2025)" color="sky" />
        <MetricCard label="Agency MBS" value="$9.2T" sub="Fannie/Freddie/Ginnie" color="emerald" />
        <MetricCard label="CMBS O/S" value="$650B" sub="US conduit + SASB" color="amber" />
        <MetricCard label="Avg CPR (30yr)" value="8–12%" sub="Conditional prepay rate" color="violet" />
      </div>

      {/* Securitization flow */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Securitization Process</SectionTitle>
        <SecuritizationFlowSVG />
        <p className="text-xs text-white/40 mt-2">
          Originators sell receivables to a bankruptcy-remote SPV, which issues
          rated notes to investors. The SPV&apos;s assets are legally isolated from
          the originator.
        </p>
      </div>

      {/* Asset classes table */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>ABS / MBS Asset Classes</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                {["Type", "Collateral", "Avg Life", "Prepay Risk", "Rating Range"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-2 pr-3 text-white/40 font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {assetClasses.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-2 pr-3 font-medium text-white">{row.type}</td>
                  <td className="py-2 pr-3 text-white/60">{row.collateral}</td>
                  <td className="py-2 pr-3 text-sky-400 tabular-nums">{row.avgLife}</td>
                  <td
                    className={cn(
                      "py-2 pr-3",
                      row.prepayRisk === "High"
                        ? "text-red-400"
                        : row.prepayRisk === "Moderate"
                          ? "text-amber-400"
                          : "text-emerald-400",
                    )}
                  >
                    {row.prepayRisk}
                  </td>
                  <td className="py-2 text-white/60">{row.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tranche waterfall */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <SectionTitle>Tranche Waterfall</SectionTitle>
          <TranchWaterfallSVG />
          <p className="text-xs text-white/40 mt-2">
            Losses flow upward: equity tranche absorbs first, then mezzanine, then senior.
            OC = overcollateralization level; CE = credit enhancement.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <SectionTitle>Market Size by Type</SectionTitle>
          <ABSMarketPieSVG />
        </div>
      </div>

      {/* Credit Enhancements */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Credit Enhancement Mechanisms</SectionTitle>
        <div className="space-y-2">
          {enhancements.map((e, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-emerald-400 font-medium min-w-[200px] shrink-0">
                {e.name}
              </span>
              <span className="text-white/60">{e.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WAL vs Stated Maturity + CPR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpandableCard title="Prepayment Risk: CPR & PSA Conventions" defaultOpen>
          <p>
            <strong className="text-white">CPR (Conditional Prepayment Rate)</strong> — annualized
            fraction of pool balance prepaid. CPR 10% = 10% of remaining balance pays off per year.
          </p>
          <p>
            <strong className="text-white">PSA (Public Securities Association)</strong> — ramp
            model: 100 PSA = 0.2% CPR/month rising to 6% CPR by month 30, then constant.
            200 PSA doubles the ramp.
          </p>
          <p>
            Higher prepayments shorten duration (good at premium, bad at discount) — known as
            the <em className="text-amber-300">negative convexity</em> of MBS.
          </p>
        </ExpandableCard>
        <ExpandableCard title="WAL vs Stated Maturity" defaultOpen>
          <p>
            <strong className="text-white">Stated Maturity</strong> — contractual final payment
            date (e.g., 30-year mortgage pool). Rarely relevant because loans prepay.
          </p>
          <p>
            <strong className="text-white">WAL (Weighted Average Life)</strong> — average time
            until each dollar of principal is returned, weighted by amount. A 30yr RMBS at
            100 PSA has a WAL of ≈7 years.
          </p>
          <p>
            Investors analyze spread <em className="text-sky-300">to WAL</em>, not final maturity,
            for yield comparisons.
          </p>
        </ExpandableCard>
      </div>

      <InfoBox variant="amber">
        <strong>Rating Agency Analysis:</strong> Agencies stress-test pools using
        multiples of historical default/loss curves (e.g., 3× base-case losses for AAA
        rating). They analyze pool diversification, obligor concentration, originator
        quality, and servicer capabilities.
      </InfoBox>
    </div>
  );
}

// ── Tab 2: CMOs & Structured MBS ─────────────────────────────────────────────

function PACBandSVG() {
  const width = 460;
  const height = 130;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // PSA speeds and expected WAL data points for PAC band illustration
  const psaSpeeds = [50, 100, 150, 200, 250, 300, 400, 500];
  // PAC tranche WAL stays stable between 100-300 PSA (PAC band)
  const pacWAL = psaSpeeds.map((psa) => {
    if (psa < 100 || psa > 300) {
      // Outside band: WAL shifts
      if (psa < 100) return 12 - (psa / 100) * 3;
      return 7 - (psa - 300) / 100;
    }
    return 7.5; // stable within band
  });
  const supportWAL = psaSpeeds.map((psa) => {
    return 15 - (psa / 500) * 12;
  });

  const minPSA = psaSpeeds[0];
  const maxPSA = psaSpeeds[psaSpeeds.length - 1];
  const minWAL = 0;
  const maxWAL = 15;

  const toX = (psa: number) =>
    padL + ((psa - minPSA) / (maxPSA - minPSA)) * chartW;
  const toY = (wal: number) =>
    padT + ((maxWAL - wal) / (maxWAL - minWAL)) * chartH;

  const pacPath = psaSpeeds
    .map((psa, i) => `${i === 0 ? "M" : "L"}${toX(psa)},${toY(pacWAL[i])}`)
    .join(" ");
  const supportPath = psaSpeeds
    .map(
      (psa, i) => `${i === 0 ? "M" : "L"}${toX(psa)},${toY(supportWAL[i])}`,
    )
    .join(" ");

  // Band shading: PSA 100-300
  const bandX1 = toX(100);
  const bandX2 = toX(300);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-32 select-none"
      aria-label="PAC band stability chart"
    >
      {/* Band shading */}
      <rect
        x={bandX1}
        y={padT}
        width={bandX2 - bandX1}
        height={chartH}
        fill="#10b98115"
      />
      <text x={bandX1 + 3} y={padT + 10} fill="#10b98166" fontSize={8}>
        PAC Band
      </text>
      {/* Axes */}
      <line
        x1={padL}
        y1={padT}
        x2={padL}
        y2={padT + chartH}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <line
        x1={padL}
        y1={padT + chartH}
        x2={padL + chartW}
        y2={padT + chartH}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <text x={padL - 4} y={padT + 4} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="end">
        WAL
      </text>
      {/* Y axis ticks */}
      {[0, 5, 10, 15].map((v) => (
        <g key={v}>
          <line
            x1={padL - 3}
            y1={toY(v)}
            x2={padL}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.2)"
          />
          <text x={padL - 5} y={toY(v) + 3} fill="rgba(255,255,255,0.3)" fontSize={7} textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {/* X axis labels */}
      {psaSpeeds.map((psa) => (
        <text
          key={psa}
          x={toX(psa)}
          y={padT + chartH + 12}
          fill="rgba(255,255,255,0.3)"
          fontSize={7}
          textAnchor="middle"
        >
          {psa}
        </text>
      ))}
      <text
        x={padL + chartW / 2}
        y={height - 2}
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        textAnchor="middle"
      >
        PSA Speed
      </text>
      {/* Lines */}
      <path d={pacPath} fill="none" stroke="#10b981" strokeWidth={2} />
      <path
        d={supportPath}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5}
        strokeDasharray="4,3"
      />
      {/* Legend */}
      <line x1={padL + 10} y1={padT + 2} x2={padL + 25} y2={padT + 2} stroke="#10b981" strokeWidth={2} />
      <text x={padL + 28} y={padT + 5} fill="#10b981" fontSize={8}>PAC</text>
      <line x1={padL + 60} y1={padT + 2} x2={padL + 75} y2={padT + 2} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={padL + 78} y={padT + 5} fill="#f59e0b" fontSize={8}>Support</text>
    </svg>
  );
}

function CmosTab() {
  const trancheTypes = [
    {
      name: "Sequential Pay",
      desc: "Tranches A→B→C receive principal in order; simplest CMO structure",
      risk: "Extension/contraction per tranche",
      color: "text-sky-400",
    },
    {
      name: "PAC (Planned Amortization Class)",
      desc: "Principal schedule maintained within a prepayment band (e.g., 100–300 PSA); support tranches absorb variability",
      risk: "Low within band; high outside",
      color: "text-emerald-400",
    },
    {
      name: "TAC (Targeted Amortization Class)",
      desc: "One-sided PAC — protected against contraction only (single PSA speed target)",
      risk: "Unprotected against extension",
      color: "text-violet-400",
    },
    {
      name: "Z-Bond (Accrual)",
      desc: "Interest accrues and is added to principal; no cash flows until prior tranches are retired",
      risk: "High extension; longest WAL",
      color: "text-amber-400",
    },
    {
      name: "IO (Interest Only)",
      desc: "Receives only the interest strip; value rises as prepayments slow (negative duration)",
      risk: "Extreme prepayment risk",
      color: "text-red-400",
    },
    {
      name: "PO (Principal Only)",
      desc: "Receives only principal; bought at discount; profits when prepayments accelerate",
      risk: "Very high prepay sensitivity",
      color: "text-pink-400",
    },
  ];

  const cmbs = [
    { feature: "Loan Type", conduit: "Multi-borrower pool (10–200 loans)", sasb: "Single large asset (e.g., office tower)" },
    { feature: "LTV (typical)", conduit: "60–70%", sasb: "55–65%" },
    { feature: "Debt Service", conduit: "DSCR ≥ 1.25×", sasb: "DSCR ≥ 1.40×" },
    { feature: "Prepayment", conduit: "Yield maintenance / defeasance", sasb: "Negotiated lockout" },
    { feature: "Balloon Risk", conduit: "Diversified across loans", sasb: "Concentrated in one asset" },
    { feature: "IO Period", conduit: "Often 2–5 yr partial IO", sasb: "Often full IO term" },
    { feature: "B-Piece", conduit: "Required; first-loss buyer", sasb: "Not applicable (vertical)" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="CMO Market" value="$1.2T" sub="Agency CMO outstanding" color="sky" />
        <MetricCard label="IO Duration" value="Negative" sub="Price falls as rates fall" color="red" />
        <MetricCard label="PAC Band" value="100–300 PSA" sub="Typical collar range" color="emerald" />
        <MetricCard label="CMBS B-Piece" value="2–5%" sub="Typical first-loss position" color="amber" />
      </div>

      {/* CMO tranche types */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>CMO Tranche Types</SectionTitle>
        <div className="space-y-3">
          {trancheTypes.map((t, i) => (
            <div key={i} className="flex gap-3">
              <span className={cn("font-semibold text-sm min-w-[180px] shrink-0", t.color)}>
                {t.name}
              </span>
              <div className="flex-1">
                <p className="text-sm text-white/70">{t.desc}</p>
                <p className="text-xs text-white/40 mt-0.5">Risk: {t.risk}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PAC Band SVG */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>PAC Band Stability vs Support Tranche Variability</SectionTitle>
        <PACBandSVG />
        <p className="text-xs text-white/40 mt-2">
          Within the PAC band (100–300 PSA), the PAC WAL remains near 7.5 years.
          Outside the band, the PAC shifts while the support tranche absorbs excess
          prepayment variability.
        </p>
      </div>

      {/* IO vs PO */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>IO vs PO: Inverse Price Behavior</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-400">IO Strip</span>
            </div>
            <ul className="text-sm text-white/60 space-y-1 ml-6 list-disc">
              <li>Value = PV of all interest payments</li>
              <li>Faster prepays → fewer interest payments → IO price falls</li>
              <li>Exhibits <em className="text-amber-300">negative duration</em></li>
              <li>Used to hedge MBS portfolios against falling rates</li>
              <li>Price can go to zero if pool prepays immediately</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold text-sky-400">PO Strip</span>
            </div>
            <ul className="text-sm text-white/60 space-y-1 ml-6 list-disc">
              <li>Value = PV of principal; bought at deep discount</li>
              <li>Faster prepays → principal returned sooner → PO price rises</li>
              <li>Positive duration amplified by leverage effect</li>
              <li>Very rate-sensitive; acts like a levered mortgage bet</li>
              <li>IO + PO = reconstituted whole pool</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CMBS conduit vs SASB */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>CMBS: Conduit vs Single-Asset Single-Borrower (SASB)</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-3 text-white/40 font-medium">Feature</th>
                <th className="text-left py-2 pr-3 text-sky-400 font-medium">Conduit</th>
                <th className="text-left py-2 text-amber-400 font-medium">SASB</th>
              </tr>
            </thead>
            <tbody>
              {cmbs.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 pr-3 text-white/60 font-medium">{row.feature}</td>
                  <td className="py-2 pr-3 text-white/70">{row.conduit}</td>
                  <td className="py-2 text-white/70">{row.sasb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoBox variant="sky">
          <strong>Agency vs Non-Agency MBS:</strong> Agency MBS (Fannie, Freddie,
          Ginnie) carry implicit/explicit government guarantee on credit risk —
          only prepayment risk remains. Non-agency bears full credit + prepay risk,
          requiring subordination and OC structures.
        </InfoBox>
        <InfoBox variant="amber">
          <strong>Post-2008 QM/Non-QM Divide:</strong> The Ability-to-Repay rule
          created Qualified Mortgage (QM) safe harbor. Non-QM loans (DSCR, bank
          statement, foreign national) carry higher originator liability and price
          at wider spreads in private-label securitization.
        </InfoBox>
      </div>
    </div>
  );
}

// ── Tab 3: Equity-Linked Structured Notes ─────────────────────────────────────

function AutocallablePayoffSVG() {
  const width = 460;
  const height = 170;
  const padL = 45;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // X axis: underlying performance at maturity (normalized to 100)
  // Y axis: payoff as % of notional
  const xMin = 50; // -50%
  const xMax = 150; // +50%
  const yMin = 0;
  const yMax = 130;

  const toX = (v: number) =>
    padL + ((v - xMin) / (xMax - xMin)) * chartW;
  const toY = (v: number) =>
    padT + ((yMax - v) / (yMax - yMin)) * chartH;

  // Scenario 1: No knock-in (above barrier 70), standard redemption at 100% + coupon
  // Scenario 2: Knock-in barrier breached (below 70 at any point), loses 1:1 below barrier
  // Scenario 3: Early autocall (above 100 at observation dates), returns 100% + enhanced coupon

  // Build paths
  // Line 1: autocall / early redemption — flat at 115 (returned early with coupon)
  // Represented as annotation, not a full line

  // Standard payoff if no knock-in (barrier = 70):
  // - final ≥ 100: get 100 + coupon (say 108)
  // - final 70–100: get 100 (capital protected)
  // - final < 70: get final (1:1 loss from barrier)
  const noKnockIn = (x: number) => {
    if (x >= 100) return 108;
    if (x >= 70) return 100;
    return x; // 1:1 loss
  };

  // With knock-in barrier breached:
  const knockIn = (x: number) => {
    if (x >= 100) return 108;
    return x; // participates in downside 1:1
  };

  const xs = Array.from({ length: 51 }, (_, i) => xMin + i * 2);

  const pathNoKI = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${toX(x)},${toY(noKnockIn(x))}`)
    .join(" ");
  const pathKI = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${toX(x)},${toY(knockIn(x))}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-44 select-none"
      aria-label="Autocallable payoff diagram"
    >
      {/* Axes */}
      <line
        x1={padL}
        y1={padT}
        x2={padL}
        y2={padT + chartH}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      <line
        x1={padL}
        y1={padT + chartH}
        x2={padL + chartW}
        y2={padT + chartH}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      {/* 100% line */}
      <line
        x1={padL}
        y1={toY(100)}
        x2={padL + chartW}
        y2={toY(100)}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
        strokeDasharray="4,4"
      />
      <text x={padL - 3} y={toY(100) + 3} fill="rgba(255,255,255,0.3)" fontSize={7} textAnchor="end">
        100
      </text>
      {/* Barrier line at 70 */}
      <line
        x1={toX(70)}
        y1={padT}
        x2={toX(70)}
        y2={padT + chartH}
        stroke="#ef444466"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <text x={toX(70) + 2} y={padT + 10} fill="#ef444488" fontSize={8}>
        Barrier 70
      </text>
      {/* Y ticks */}
      {[0, 50, 70, 100, 115, 130].map((v) => (
        <g key={v}>
          <line x1={padL - 3} y1={toY(v)} x2={padL} y2={toY(v)} stroke="rgba(255,255,255,0.15)" />
          <text x={padL - 5} y={toY(v) + 3} fill="rgba(255,255,255,0.25)" fontSize={7} textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {/* X axis labels */}
      {[50, 70, 100, 130, 150].map((v) => (
        <text
          key={v}
          x={toX(v)}
          y={padT + chartH + 12}
          fill="rgba(255,255,255,0.25)"
          fontSize={7}
          textAnchor="middle"
        >
          {v}%
        </text>
      ))}
      <text
        x={padL + chartW / 2}
        y={height - 2}
        fill="rgba(255,255,255,0.2)"
        fontSize={7}
        textAnchor="middle"
      >
        Underlying at Maturity
      </text>
      <text x={padL - 4} y={padT + 3} fill="rgba(255,255,255,0.2)" fontSize={7} textAnchor="end">
        Payoff
      </text>
      {/* Paths */}
      <path d={pathNoKI} fill="none" stroke="#10b981" strokeWidth={2} />
      <path d={pathKI} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      {/* Early call annotation */}
      <line
        x1={toX(100)}
        y1={toY(115)}
        x2={padL + chartW}
        y2={toY(115)}
        stroke="#8b5cf6"
        strokeWidth={1.5}
        strokeDasharray="6,3"
      />
      <circle cx={toX(100)} cy={toY(115)} r={3} fill="#8b5cf6" />
      <text x={toX(122)} y={toY(115) - 4} fill="#8b5cf6" fontSize={8}>
        Early autocall (115%)
      </text>
      {/* Legend */}
      <line x1={padL} y1={padT} x2={padL + 20} y2={padT} stroke="#10b981" strokeWidth={2} />
      <text x={padL + 23} y={padT + 4} fill="#10b981" fontSize={8}>No knock-in</text>
      <line x1={padL + 95} y1={padT} x2={padL + 115} y2={padT} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={padL + 118} y={padT + 4} fill="#f59e0b" fontSize={8}>Knock-in breached</text>
    </svg>
  );
}

function EquityNotesTab() {
  const noteTypes = [
    {
      name: "Principal-Protected Note (PPN)",
      mechanics: "Zero-coupon bond (to return 100% at maturity) + long call option on underlying",
      participation: "Typically 70–90% of upside (depends on call cost)",
      risk: "No downside below 100% at maturity; opportunity cost vs direct equity",
      color: "emerald",
    },
    {
      name: "Barrier Note (Knock-In)",
      mechanics: "Enhanced coupon; capital protected unless barrier is breached (e.g., 30% downside). Barrier breach converts to 1:1 equity exposure.",
      participation: "100% + enhanced coupon if barrier not breached",
      risk: "Tail risk: 1:1 participation in losses beyond barrier",
      color: "amber",
    },
    {
      name: "Autocallable",
      mechanics: "Monthly/quarterly observation dates. If underlying ≥ strike, note is called at par + coupon. If never called, knock-in provisions apply at maturity.",
      participation: "Enhanced coupon (8–12% pa) while outstanding",
      risk: "Path-dependent; worst-case: barrier breach + no call",
      color: "sky",
    },
    {
      name: "Phoenix Autocallable",
      mechanics: "Memory coupon feature: missed coupons accumulate when underlying recovers above coupon barrier, paid out upon next observation above barrier.",
      participation: "Memory coupon recovers missed payments",
      risk: "Complex path-dependency; difficult to value",
      color: "violet",
    },
    {
      name: "Reverse Convertible",
      mechanics: "High coupon; at maturity issuer may deliver shares instead of cash if stock fell below barrier. Short put to investor.",
      participation: "Fixed coupon (10–15% pa); no upside",
      risk: "Concentrated equity downside risk; high yield = high risk",
      color: "red",
    },
    {
      name: "Quanto Note",
      mechanics: "Payoff in domestic currency regardless of FX moves. Underlying performance hedged for currency risk via quanto adjustment.",
      participation: "Full equity upside in local CCY",
      risk: "Quanto cost reduces participation; model risk from correlation",
      color: "pink",
    },
  ];

  const costsTable = [
    { item: "Bid-offer spread", value: "2–5% of notional", note: "Embedded at inception" },
    { item: "Issuer funding benefit", value: "0.5–1.5% pa", note: "Bank raises cheap funding" },
    { item: "Hedge cost / vol premium", value: "1–3% pa", note: "Bank buys options at ask" },
    { item: "Distribution fee", value: "1–3% upfront", note: "Paid to distributor/advisor" },
    { item: "Estimated all-in cost", value: "3–8% of notional", note: "Not always transparent" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="US Structured Notes" value="$80B" sub="Annual issuance (2025)" color="sky" />
        <MetricCard label="Typical Tenor" value="1–5 yr" sub="Most common 2–3 yr" color="emerald" />
        <MetricCard label="Participation Rate" value="70–110%" sub="vs direct equity exposure" color="violet" />
        <MetricCard label="Bid-Offer" value="2–5%" sub="Embedded structuring cost" color="amber" />
      </div>

      {/* Principal-protected note mechanics */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Principal-Protected Note Mechanics</SectionTitle>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-3 text-sm text-white/70">
            <p>
              A PPN invests the <span className="text-emerald-400 font-medium">zero-coupon bond component</span> (say 85 cents for a 3yr note at 6% rate) to guarantee 100% principal return, then uses the remaining 15 cents to buy <span className="text-sky-400 font-medium">call options</span> on the underlying index.
            </p>
            <p>
              <strong className="text-white">Participation Rate Formula:</strong>
            </p>
            <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-emerald-300">
              Participation = Option Budget / Call Option Premium<br />
              Option Budget = 1 − PV(100) at maturity<br />
              Example: 1 − e^(−0.06×3) ≈ 16.5% budget<br />
              ATM 3yr call at 18% = 92% participation rate
            </div>
            <p>
              Higher rates → larger budget → higher participation (why PPNs are more attractive in rising rate environments). Higher vol → more expensive options → lower participation.
            </p>
          </div>
        </div>
      </div>

      {/* Autocallable payoff SVG */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Autocallable / Barrier Note Payoff Scenarios</SectionTitle>
        <AutocallablePayoffSVG />
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center">
            <div className="w-3 h-1 bg-emerald-400 mx-auto mb-1" />
            <p className="text-xs text-white/50">Barrier not breached — capital returned + coupon</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-1 bg-amber-400 mx-auto mb-1" style={{ borderTop: "2px dashed" }} />
            <p className="text-xs text-white/50">Barrier breached — 1:1 loss from 100%</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-1 bg-violet-400 mx-auto mb-1" style={{ borderTop: "2px dashed" }} />
            <p className="text-xs text-white/50">Early autocall — returned at 115% before maturity</p>
          </div>
        </div>
      </div>

      {/* Note types */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Structured Note Types</SectionTitle>
        <div className="space-y-3">
          {noteTypes.map((n, i) => {
            const colorMap: Record<string, string> = {
              emerald: "text-emerald-400",
              amber: "text-amber-400",
              sky: "text-sky-400",
              violet: "text-violet-400",
              red: "text-red-400",
              pink: "text-pink-400",
            };
            return (
              <div key={i} className="bg-black/20 rounded-lg p-3 space-y-1">
                <span className={cn("font-semibold text-sm", colorMap[n.color])}>
                  {n.name}
                </span>
                <p className="text-xs text-white/60">{n.mechanics}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400/70">Return: {n.participation}</span>
                  <span className="text-red-400/70">Risk: {n.risk}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost of structuring */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Cost of Structuring (Typical)</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-3 text-white/40 font-medium">Cost Item</th>
                <th className="text-left py-2 pr-3 text-white/40 font-medium">Amount</th>
                <th className="text-left py-2 text-white/40 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {costsTable.map((row, i) => (
                <tr key={i} className={cn("border-b border-white/5", i === costsTable.length - 1 && "border-amber-500/30 bg-amber-500/5")}>
                  <td className="py-2 pr-3 text-white/80">{row.item}</td>
                  <td className="py-2 pr-3 text-amber-400 font-medium">{row.value}</td>
                  <td className="py-2 text-white/50">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox variant="amber">
        <strong>Regulatory Suitability:</strong> Structured notes are subject to FINRA
        suitability and best-interest obligations. Issuers must provide a simplified prospectus.
        EU PRIIPs regulation mandates a Key Information Document (KID) with scenario analysis
        and summary risk indicator (SRI) score 1–7.
      </InfoBox>
    </div>
  );
}

// ── Tab 4: Structured Credit ──────────────────────────────────────────────────

function CorrelationTradingSVG() {
  resetSeed();
  const width = 460;
  const height = 150;
  const padL = 45;
  const padR = 20;
  const padT = 15;
  const padB = 35;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // X axis: implied correlation 0–100%
  // Y axis: tranche spread (bps)
  const corrVals = Array.from({ length: 21 }, (_, i) => i * 5);

  // Senior tranche spread increases with correlation (CDX 15-30 tranche)
  // Equity tranche spread decreases with correlation
  const seniorSpread = corrVals.map((c) => 30 + c * 2.5 + rand() * 8 - 4);
  const equitySpread = corrVals.map((c) => 800 - c * 12 + rand() * 40 - 20);

  const xMin = 0;
  const xMax = 100;
  const yMin = 0;
  const yMax = 900;

  const toX = (c: number) => padL + (c / xMax) * chartW;
  const toY = (v: number) => padT + ((yMax - v) / yMax) * chartH;

  const seniorPath = corrVals
    .map((c, i) => `${i === 0 ? "M" : "L"}${toX(c)},${toY(seniorSpread[i])}`)
    .join(" ");
  const equityPath = corrVals
    .map((c, i) => `${i === 0 ? "M" : "L"}${toX(c)},${toY(equitySpread[i])}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-40 select-none"
      aria-label="Correlation trading chart"
    >
      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      {/* Y ticks */}
      {[0, 200, 400, 600, 800].map((v) => (
        <g key={v}>
          <line x1={padL - 3} y1={toY(v)} x2={padL} y2={toY(v)} stroke="rgba(255,255,255,0.1)" />
          <text x={padL - 5} y={toY(v) + 3} fill="rgba(255,255,255,0.25)" fontSize={7} textAnchor="end">{v}</text>
        </g>
      ))}
      {/* X ticks */}
      {[0, 25, 50, 75, 100].map((v) => (
        <text key={v} x={toX(v)} y={padT + chartH + 12} fill="rgba(255,255,255,0.25)" fontSize={7} textAnchor="middle">{v}%</text>
      ))}
      <text x={padL - 4} y={padT + 4} fill="rgba(255,255,255,0.2)" fontSize={7} textAnchor="end">bps</text>
      <text x={padL + chartW / 2} y={height - 5} fill="rgba(255,255,255,0.2)" fontSize={7} textAnchor="middle">Implied Correlation</text>
      {/* Paths */}
      <path d={seniorPath} fill="none" stroke="#10b981" strokeWidth={2} />
      <path d={equityPath} fill="none" stroke="#ef4444" strokeWidth={2} />
      {/* Legend */}
      <line x1={padL} y1={padT} x2={padL + 20} y2={padT} stroke="#10b981" strokeWidth={2} />
      <text x={padL + 23} y={padT + 4} fill="#10b981" fontSize={8}>Senior spread</text>
      <line x1={padL + 100} y1={padT} x2={padL + 120} y2={padT} stroke="#ef4444" strokeWidth={2} />
      <text x={padL + 123} y={padT + 4} fill="#ef4444" fontSize={8}>Equity spread</text>
    </svg>
  );
}

function StructuredCreditTab() {
  const cdoCloComparison = [
    { feature: "Full Name", cdo: "Collateralized Debt Obligation", clo: "Collateralized Loan Obligation" },
    { feature: "Collateral", cdo: "ABS, RMBS, corporate bonds, CDO²", clo: "Leveraged loans (floating rate)" },
    { feature: "Rate Type", cdo: "Fixed (mostly)", clo: "Floating (SOFR + spread)" },
    { feature: "Manager Role", cdo: "Static or managed", clo: "Active CLO manager" },
    { feature: "Reinvestment", cdo: "Usually static", clo: "Reinvestment period 3–5 yr" },
    { feature: "Crisis Performance", cdo: "Catastrophic (2008)", clo: "AAA tranche 0 defaults (2008)" },
    { feature: "Market Size", cdo: "Largely legacy", clo: "$1T+ outstanding (2025)" },
    { feature: "Typical AAA Spread", cdo: "N/A (credit crisis)", clo: "SOFR+135-160 bps" },
  ];

  const postCrisis = [
    {
      reform: "Dodd-Frank Risk Retention (5%)",
      detail: "Securitizers must retain 5% of each tranche (or vertical/horizontal slice equivalent) — aligns originator incentives",
    },
    {
      reform: "Volcker Rule",
      detail: "Banks prohibited from proprietary trading in CDOs backed by non-loan assets; limited CLO exemptions",
    },
    {
      reform: "Basel III Capital",
      detail: "Higher risk-weights for re-securitization (CDO-squared); banks face punitive capital for complex structured credit",
    },
    {
      reform: "Reg AB II",
      detail: "Enhanced disclosure for ABS issuers; loan-level data required for shelf registration",
    },
    {
      reform: "ABX Index Legacy",
      detail: "ABX (CDS on subprime RMBS) became the barometer of housing crisis; Paulson's famous short was via ABX",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="CLO Market" value="$1.1T" sub="US outstanding (2025)" color="sky" />
        <MetricCard label="CLO AAA" value="SOFR+140" sub="Typical new-issue spread" color="emerald" />
        <MetricCard label="Risk Retention" value="5%" sub="Dodd-Frank requirement" color="amber" />
        <MetricCard label="2008 CDO Losses" value="$500B+" sub="Super-senior AAA losses" color="red" />
      </div>

      {/* CDO vs CLO */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>CDO vs CLO: Anatomy Comparison</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-3 text-white/40 font-medium">Feature</th>
                <th className="text-left py-2 pr-3 text-amber-400 font-medium">CDO</th>
                <th className="text-left py-2 text-sky-400 font-medium">CLO</th>
              </tr>
            </thead>
            <tbody>
              {cdoCloComparison.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 pr-3 text-white/60 font-medium">{row.feature}</td>
                  <td className="py-2 pr-3 text-white/70">{row.cdo}</td>
                  <td className="py-2 text-white/70">{row.clo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthetic CDO + single tranche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpandableCard title="Synthetic CDO & CDS Mechanics" defaultOpen>
          <p>
            Unlike a <strong className="text-white">cash CDO</strong> which owns bonds outright, a
            <strong className="text-sky-300"> synthetic CDO</strong> sells credit protection via
            CDS on a reference portfolio.
          </p>
          <p>Investors receive CDS premiums (funded via collateral invested in Treasuries) and bear losses
            in the tranche layer as CDS settlements occur.</p>
          <p className="text-amber-300 text-xs">
            Single-Tranche CDO: bank warehouses the risk and hedges delta using CDS on individual
            names — only the requested tranche is issued to investor.
          </p>
          <p>
            <strong className="text-white">Bespoke Tranche Opportunity (BTO)</strong> post-2015:
            custom CDX tranches sized to specific attachment/detachment points for hedge funds.
          </p>
        </ExpandableCard>
        <ExpandableCard title="Total Return Swap on Credit Indices" defaultOpen>
          <p>
            TRS allows unfunded credit exposure: receiver gets index returns (price + carry),
            payer receives SOFR + spread.
          </p>
          <p>Indices: <strong className="text-white">CDX.IG</strong> (125 IG corporates),
            <strong className="text-white"> CDX.HY</strong> (100 HY names),
            <strong className="text-white"> iTraxx Europe</strong> (125 European IG).
          </p>
          <p className="text-xs text-white/40">
            Used by macro funds to get rapid credit beta without funding loans, and by dealers
            to hedge credit index positions.
          </p>
        </ExpandableCard>
      </div>

      {/* Correlation trading SVG */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Correlation Trading: Senior vs Equity Tranche Sensitivity</SectionTitle>
        <CorrelationTradingSVG />
        <p className="text-xs text-white/40 mt-2">
          Higher correlation: defaults cluster together — senior tranches suffer more (spread widens),
          while equity tranches benefit from reduced expected idiosyncratic losses (spread tightens).
          Correlation traders go long equity / short senior (or vice versa) to trade this dynamic.
        </p>
      </div>

      {/* Credit Linked Notes */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Credit-Linked Notes vs Funded CDS</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-sky-400">Credit-Linked Note (CLN)</p>
            <ul className="text-sm text-white/60 space-y-1 ml-4 list-disc">
              <li>Funded instrument — investor posts full notional</li>
              <li>Embedded CDS: coupon = SOFR + credit premium</li>
              <li>On credit event, principal is reduced by loss amount</li>
              <li>No counterparty risk for issuer (unlike unfunded CDS)</li>
              <li>Accessible to investors without ISDA agreement</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-violet-400">Funded CDS (ISDA)</p>
            <ul className="text-sm text-white/60 space-y-1 ml-4 list-disc">
              <li>Unfunded — no upfront cash exchange</li>
              <li>Bilateral counterparty risk; requires CSA/collateral</li>
              <li>More flexible: single name or portfolio</li>
              <li>Used by hedge funds and dealers</li>
              <li>CLN = funded equivalent of CDS protection sale</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Post-crisis reforms */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <SectionTitle>Post-Crisis Reforms & Market Structure</SectionTitle>
        <div className="space-y-3">
          {postCrisis.map((item, i) => (
            <div key={i} className="flex gap-3">
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-400 text-[10px] shrink-0 h-fit mt-0.5"
              >
                {item.reform.split(" ")[0]}
              </Badge>
              <div>
                <p className="text-xs font-medium text-white/80">{item.reform}</p>
                <p className="text-xs text-white/50 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InfoBox variant="sky">
        <strong>2008 Crisis: Super-Senior AAA Losses.</strong> CDOs backed by subprime
        RMBS were tranched to AAA with ratings based on correlation models that
        assumed diversification. When housing prices fell nationally (correlations
        spiked to 1), super-senior tranches suffered unprecedented losses — proving
        that model risk, not just credit risk, was the core vulnerability.
      </InfoBox>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StructuredProductsPage() {
  const [activeTab, setActiveTab] = useState("abs");

  const tabs = [
    { id: "abs", label: "ABS & MBS", icon: Layers },
    { id: "cmos", label: "CMOs", icon: GitBranch },
    { id: "equity", label: "Equity Notes", icon: TrendingUp },
    { id: "credit", label: "Structured Credit", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Structured Products</h1>
            <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-xs">
              Advanced
            </Badge>
          </div>
          <p className="text-sm text-white/50">
            ABS, MBS, CMOs, principal-protected notes, autocallables, and structured credit instruments
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 h-auto p-1 flex flex-wrap gap-1 mb-6">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 text-white/50 px-3 py-1.5"
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="abs" data-[state=inactive]:hidden>
                <AbsMbsTab />
              </TabsContent>
              <TabsContent value="cmos" data-[state=inactive]:hidden>
                <CmosTab />
              </TabsContent>
              <TabsContent value="equity" data-[state=inactive]:hidden>
                <EquityNotesTab />
              </TabsContent>
              <TabsContent value="credit" data-[state=inactive]:hidden>
                <StructuredCreditTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
