"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Vote,
  Shield,
  BarChart2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Award,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 984;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const RAND_POOL: number[] = [];
for (let i = 0; i < 400; i++) RAND_POOL.push(rand());
let _ri = 0;
const _r = () => RAND_POOL[_ri++ % RAND_POOL.length];
void _r;

// ── Types ─────────────────────────────────────────────────────────────────────

interface BoardCompany {
  name: string;
  ticker: string;
  boardSize: number;
  independentPct: number;
  femalePct: number;
  avgTenure: number;
  ceoChairSplit: boolean;
  staggeredBoard: boolean;
  classifiedDirectors: number;
  govScore: number;
}

interface ActivistCampaign {
  fund: string;
  target: string;
  ticker: string;
  stakePct: number;
  demands: string[];
  status: "Ongoing" | "Settled" | "Withdrawn" | "Won";
  stockReaction: number;
}

interface ProxyResolution {
  id: string;
  title: string;
  type: "Management" | "Shareholder";
  description: string;
  boardRec: "For" | "Against";
  issScore: string;
}

interface EsgScore {
  company: string;
  ticker: string;
  boardIndependence: number;
  execPayAlignment: number;
  shareholderRights: number;
  transparency: number;
  overall: number;
}

interface TakeoverDefense {
  name: string;
  mechanism: string;
  pros: string[];
  cons: string[];
  prevalence: string;
}

interface Shareholder {
  name: string;
  type: "Index" | "Active" | "Hedge Fund" | "Insider";
  pct: number;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const BOARD_COMPANIES: BoardCompany[] = [
  {
    name: "Apex Technologies",
    ticker: "APTX",
    boardSize: 11,
    independentPct: 82,
    femalePct: 36,
    avgTenure: 6.2,
    ceoChairSplit: true,
    staggeredBoard: false,
    classifiedDirectors: 0,
    govScore: 88,
  },
  {
    name: "Global Retail Inc",
    ticker: "GRTN",
    boardSize: 13,
    independentPct: 69,
    femalePct: 23,
    avgTenure: 11.4,
    ceoChairSplit: false,
    staggeredBoard: true,
    classifiedDirectors: 4,
    govScore: 61,
  },
  {
    name: "MediCore Holdings",
    ticker: "MDCH",
    boardSize: 9,
    independentPct: 89,
    femalePct: 44,
    avgTenure: 5.1,
    ceoChairSplit: true,
    staggeredBoard: false,
    classifiedDirectors: 0,
    govScore: 92,
  },
  {
    name: "Pinnacle Energy",
    ticker: "PNEN",
    boardSize: 12,
    independentPct: 75,
    femalePct: 17,
    avgTenure: 9.8,
    ceoChairSplit: false,
    staggeredBoard: true,
    classifiedDirectors: 3,
    govScore: 67,
  },
  {
    name: "Vertex Financial",
    ticker: "VTXF",
    boardSize: 14,
    independentPct: 79,
    femalePct: 29,
    avgTenure: 7.5,
    ceoChairSplit: true,
    staggeredBoard: false,
    classifiedDirectors: 0,
    govScore: 81,
  },
  {
    name: "Cascade Media",
    ticker: "CSCM",
    boardSize: 10,
    independentPct: 60,
    femalePct: 20,
    avgTenure: 13.2,
    ceoChairSplit: false,
    staggeredBoard: true,
    classifiedDirectors: 5,
    govScore: 52,
  },
];

const ACTIVIST_CAMPAIGNS: ActivistCampaign[] = [
  {
    fund: "Starboard Capital",
    target: "Global Retail Inc",
    ticker: "GRTN",
    stakePct: 9.2,
    demands: ["Split CEO/Chair", "Sell underperforming units", "Board refresh"],
    status: "Ongoing",
    stockReaction: 14.3,
  },
  {
    fund: "Elliott Management",
    target: "Pinnacle Energy",
    ticker: "PNEN",
    stakePct: 6.8,
    demands: ["Accelerate capex review", "Return $2B via buyback"],
    status: "Settled",
    stockReaction: 21.7,
  },
  {
    fund: "ValueAct Capital",
    target: "Cascade Media",
    ticker: "CSCM",
    stakePct: 5.4,
    demands: ["Add 3 independent directors", "Strategic alternatives review"],
    status: "Ongoing",
    stockReaction: 8.9,
  },
  {
    fund: "Third Point LLC",
    target: "Apex Technologies",
    ticker: "APTX",
    stakePct: 3.1,
    demands: ["Spin off cloud division", "Reduce CEO pay"],
    status: "Withdrawn",
    stockReaction: -2.4,
  },
  {
    fund: "Pershing Square",
    target: "Vertex Financial",
    ticker: "VTXF",
    stakePct: 7.7,
    demands: ["M&A moratorium", "Dividend initiation", "Director election reform"],
    status: "Won",
    stockReaction: 18.2,
  },
];

const PROXY_RESOLUTIONS: ProxyResolution[] = [
  {
    id: "R1",
    title: "Say-on-Pay: CEO Compensation",
    type: "Management",
    description: "$28.4M package; 73% performance-based; peer-aligned",
    boardRec: "For",
    issScore: "For",
  },
  {
    id: "R2",
    title: "Elect Director: Jane M. Collins",
    type: "Management",
    description: "Former CFO, 6 yrs tenure, Audit Committee Chair",
    boardRec: "For",
    issScore: "For",
  },
  {
    id: "R3",
    title: "Elect Director: Robert P. Huang",
    type: "Management",
    description: "CEO of subsidiary; independence concern flagged by ISS",
    boardRec: "For",
    issScore: "Against",
  },
  {
    id: "R4",
    title: "Ratify Auditor: Deloitte LLP",
    type: "Management",
    description: "14-year engagement; fees up 8% YoY; no material weaknesses",
    boardRec: "For",
    issScore: "For",
  },
  {
    id: "R5",
    title: "Shareholder Proposal: Climate Risk Report",
    type: "Shareholder",
    description: "Annual Scope 3 emissions disclosure aligned with TCFD",
    boardRec: "Against",
    issScore: "For",
  },
  {
    id: "R6",
    title: "Shareholder Proposal: Political Spending Disclosure",
    type: "Shareholder",
    description: "Quarterly report on all lobbying and political contributions",
    boardRec: "Against",
    issScore: "For",
  },
  {
    id: "R7",
    title: "Approve Equity Incentive Plan",
    type: "Management",
    description: "Reserve 15M shares; 3-yr vesting; TSR hurdle at 75th pct",
    boardRec: "For",
    issScore: "Against",
  },
  {
    id: "R8",
    title: "Shareholder Proposal: Declassify Board",
    type: "Shareholder",
    description: "Annual election of all directors; remove staggered structure",
    boardRec: "Against",
    issScore: "For",
  },
];

const ESG_SCORES: EsgScore[] = [
  { company: "MediCore Holdings", ticker: "MDCH", boardIndependence: 94, execPayAlignment: 88, shareholderRights: 91, transparency: 89, overall: 91 },
  { company: "Apex Technologies", ticker: "APTX", boardIndependence: 85, execPayAlignment: 82, shareholderRights: 87, transparency: 90, overall: 86 },
  { company: "Vertex Financial", ticker: "VTXF", boardIndependence: 80, execPayAlignment: 76, shareholderRights: 83, transparency: 84, overall: 81 },
  { company: "Pinnacle Energy", ticker: "PNEN", boardIndependence: 74, execPayAlignment: 65, shareholderRights: 68, transparency: 71, overall: 70 },
  { company: "Global Retail Inc", ticker: "GRTN", boardIndependence: 67, execPayAlignment: 59, shareholderRights: 62, transparency: 66, overall: 64 },
  { company: "Cascade Media", ticker: "CSCM", boardIndependence: 58, execPayAlignment: 48, shareholderRights: 53, transparency: 55, overall: 54 },
  { company: "Summit Industrials", ticker: "SMIT", boardIndependence: 71, execPayAlignment: 70, shareholderRights: 72, transparency: 68, overall: 70 },
  { company: "Orbit Pharma", ticker: "ORBT", boardIndependence: 88, execPayAlignment: 79, shareholderRights: 85, transparency: 83, overall: 84 },
];

const TAKEOVER_DEFENSES: TakeoverDefense[] = [
  {
    name: "Poison Pill",
    mechanism: "Rights plan allowing existing shareholders to buy discounted shares if acquirer exceeds threshold",
    pros: ["Buys time for board", "Forces acquirer to negotiate", "Deters hostile bids"],
    cons: ["Can entrench management", "Viewed negatively by ISS/Glass Lewis", "May reduce shareholder value"],
    prevalence: "~30% of S&P 500",
  },
  {
    name: "Staggered Board",
    mechanism: "Directors elected in classes; only 1/3 up for election each year",
    pros: ["Continuity of leadership", "Discourages proxy fights", "Stability in strategy"],
    cons: ["Reduces director accountability", "Difficult to remove underperformers", "Activists face 2-year battles"],
    prevalence: "~40% of Russell 3000",
  },
  {
    name: "Dual-Class Shares",
    mechanism: "Founders hold super-voting shares (e.g. 10:1); economic/voting rights separated",
    pros: ["Preserves founder vision", "Long-term focus possible", "Shields from short-termism"],
    cons: ["Misaligns economic vs voting power", "Index inclusion restrictions", "Corporate governance risk"],
    prevalence: "~15% of IPOs since 2018",
  },
  {
    name: "White Knight",
    mechanism: "Target invites friendly acquirer to outbid hostile party",
    pros: ["Better deal for shareholders", "Cultural fit preserved", "Board retains control"],
    cons: ["White knight may overpay", "Competing bids drive up premium", "Integration risk shifts"],
    prevalence: "Situational / ad-hoc",
  },
  {
    name: "Pac-Man Defense",
    mechanism: "Target company counters by attempting to acquire the hostile bidder",
    pros: ["Completely neutralizes threat", "Sends strong signal to market", "Can be decisive"],
    cons: ["Extremely capital-intensive", "Requires board approval + financing", "Rarely executed"],
    prevalence: "Rare — notable examples: Martin Marietta vs Vulcan (2012)",
  },
  {
    name: "Golden Parachute",
    mechanism: "Large severance packages for executives triggered by change-of-control events",
    pros: ["Aligns executive interests with deal completion", "Reduces key-person risk", "Negotiated pre-offer"],
    cons: ["Creates perverse incentives", "Expensive for acquirer", "Investor backlash on magnitude"],
    prevalence: "Very common — ~80% of large-cap companies",
  },
];

const SHAREHOLDERS: Shareholder[] = [
  { name: "Vanguard Group", type: "Index", pct: 8.4 },
  { name: "BlackRock", type: "Index", pct: 7.9 },
  { name: "State Street Global", type: "Index", pct: 4.2 },
  { name: "Fidelity Investments", type: "Active", pct: 5.8 },
  { name: "T. Rowe Price", type: "Active", pct: 4.1 },
  { name: "Wellington Management", type: "Active", pct: 3.3 },
  { name: "Pershing Square", type: "Hedge Fund", pct: 7.7 },
  { name: "Elliott Management", type: "Hedge Fund", pct: 2.1 },
  { name: "CEO & Management", type: "Insider", pct: 4.6 },
  { name: "Other Insiders", type: "Insider", pct: 2.9 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const scoreColor = (v: number) =>
  v >= 80 ? "text-emerald-400" : v >= 65 ? "text-amber-400" : "text-rose-400";

const scoreBg = (v: number) =>
  v >= 80 ? "bg-emerald-400/20 text-emerald-400" : v >= 65 ? "bg-amber-400/20 text-amber-400" : "bg-rose-400/20 text-rose-400";

const statusColor: Record<ActivistCampaign["status"], string> = {
  Ongoing: "bg-primary/20 text-primary",
  Settled: "bg-emerald-500/20 text-emerald-400",
  Withdrawn: "bg-muted-foreground/20 text-muted-foreground",
  Won: "bg-primary/20 text-primary",
};

const typeColor: Record<Shareholder["type"], string> = {
  Index: "bg-primary/20 text-primary",
  Active: "bg-emerald-500/20 text-emerald-400",
  "Hedge Fund": "bg-amber-500/20 text-amber-400",
  Insider: "bg-primary/20 text-primary",
};

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "pos" | "neg" | "neutral";
}) {
  const valClass =
    highlight === "pos"
      ? "text-emerald-400"
      : highlight === "neg"
      ? "text-rose-400"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-foreground/5 p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl font-bold", valClass)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 80 ? "bg-emerald-500" : value >= 65 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Ownership Donut Chart ─────────────────────────────────────────────────────

function OwnershipDonut({ data }: { data: Shareholder[] }) {
  const W = 200;
  const CX = W / 2;
  const CY = W / 2;
  const R = 72;
  const IR = 44;

  const grouped: Record<string, number> = {};
  for (const s of data) {
    grouped[s.type] = (grouped[s.type] ?? 0) + s.pct;
  }

  const types = Object.keys(grouped) as Shareholder["type"][];
  const total = Object.values(grouped).reduce((a, b) => a + b, 0);
  const colors: Record<string, string> = {
    Index: "#3b82f6",
    Active: "#10b981",
    "Hedge Fund": "#f59e0b",
    Insider: "#8b5cf6",
  };

  let angle = -Math.PI / 2;
  const slices = types.map((t) => {
    const share = grouped[t] / total;
    const start = angle;
    const end = angle + share * 2 * Math.PI;
    angle = end;
    const x1 = CX + R * Math.cos(start);
    const y1 = CY + R * Math.sin(start);
    const x2 = CX + R * Math.cos(end);
    const y2 = CY + R * Math.sin(end);
    const ix1 = CX + IR * Math.cos(start);
    const iy1 = CY + IR * Math.sin(start);
    const ix2 = CX + IR * Math.cos(end);
    const iy2 = CY + IR * Math.sin(end);
    const large = share > 0.5 ? 1 : 0;
    const d = [
      `M ${ix1} ${iy1}`,
      `L ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${IR} ${IR} 0 ${large} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");
    return { t, d, color: colors[t], pct: (grouped[t]).toFixed(1) };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
        {slices.map((sl) => (
          <path key={sl.t} d={sl.d} fill={sl.color} opacity={0.85} />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" className="fill-white text-xs font-bold" fontSize={11}>
          {total.toFixed(1)}%
        </text>
        <text x={CX} y={CY + 9} textAnchor="middle" className="fill-muted-foreground text-xs" fontSize={9}>
          tracked
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((sl) => (
          <div key={sl.t} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: sl.color }} />
            <span className="text-xs text-muted-foreground w-24">{sl.t}</span>
            <span className="text-xs font-semibold text-foreground">{sl.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Board Composition Bar Chart ───────────────────────────────────────────────

function BoardBarChart({ companies }: { companies: BoardCompany[] }) {
  const W = 480;
  const H = 180;
  const PAD = { l: 100, r: 16, t: 16, b: 32 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const sorted = [...companies].sort((a, b) => b.govScore - a.govScore);

  const barH = chartH / sorted.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      {[0, 25, 50, 75, 100].map((v) => {
        const x = PAD.l + (v / 100) * chartW;
        return (
          <g key={v}>
            <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
            <text x={x} y={H - PAD.b + 12} textAnchor="middle" fill="#71717a" fontSize={8}>{v}</text>
          </g>
        );
      })}
      {sorted.map((c, i) => {
        const y = PAD.t + i * barH;
        const bW = (c.govScore / 100) * chartW;
        const fill = c.govScore >= 80 ? "#10b981" : c.govScore >= 65 ? "#f59e0b" : "#ef4444";
        return (
          <g key={c.ticker}>
            <text x={PAD.l - 6} y={y + barH * 0.62} textAnchor="end" fill="#a1a1aa" fontSize={9}>{c.ticker}</text>
            <rect x={PAD.l} y={y + 3} width={bW} height={barH - 7} rx={3} fill={fill} opacity={0.8} />
            <text x={PAD.l + bW + 4} y={y + barH * 0.62} fill="#e4e4e7" fontSize={8}>{c.govScore}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Proxy Vote Simulator ──────────────────────────────────────────────────────

function ProxyVoteSimulator() {
  const [votes, setVotes] = useState<Record<string, "For" | "Against" | "Abstain">>({});

  const cast = (id: string, v: "For" | "Against" | "Abstain") =>
    setVotes((prev) => ({ ...prev, [id]: v }));

  const total = Object.keys(votes).length;
  const forCount = Object.values(votes).filter((v) => v === "For").length;
  const againstCount = Object.values(votes).filter((v) => v === "Against").length;

  return (
    <div className="space-y-3">
      {PROXY_RESOLUTIONS.map((res) => {
        const voted = votes[res.id];
        return (
          <div key={res.id} className={cn(
            "rounded-xl border p-4 transition-colors",
            voted ? "border-border bg-foreground/5" : "border-border bg-foreground/[0.02]"
          )}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={cn("text-xs px-1.5 py-0", res.type === "Management" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary")}>
                    {res.type}
                  </Badge>
                  <span className="text-xs font-semibold text-foreground">{res.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{res.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    Board: <span className={res.boardRec === "For" ? "text-emerald-400" : "text-rose-400"}>{res.boardRec}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ISS: <span className={res.issScore === "For" ? "text-emerald-400" : "text-rose-400"}>{res.issScore}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {(["For", "Against", "Abstain"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => cast(res.id, v)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-md border font-medium transition-all",
                      voted === v
                        ? v === "For"
                          ? "bg-emerald-500 border-emerald-500 text-foreground"
                          : v === "Against"
                          ? "bg-rose-500 border-rose-500 text-foreground"
                          : "bg-muted-foreground border-muted-foreground text-foreground"
                        : "border-border text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-foreground/5 p-4"
        >
          <p className="text-xs text-muted-foreground mb-2 font-semibold">Your Ballot Summary ({total}/{PROXY_RESOLUTIONS.length} voted)</p>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xl font-medium text-emerald-400">{forCount}</p>
              <p className="text-xs text-muted-foreground">For</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-rose-400">{againstCount}</p>
              <p className="text-xs text-muted-foreground">Against</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-muted-foreground">{total - forCount - againstCount}</p>
              <p className="text-xs text-muted-foreground">Abstain</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── ESG Scorecard Chart ───────────────────────────────────────────────────────

function EsgRadarMini({ score }: { score: EsgScore }) {
  const metrics = [
    { label: "Board Indep.", value: score.boardIndependence },
    { label: "Pay Align.", value: score.execPayAlignment },
    { label: "Shrhlder Rights", value: score.shareholderRights },
    { label: "Transparency", value: score.transparency },
  ];
  const W = 120;
  const CX = W / 2;
  const CY = W / 2;
  const R = 46;
  const n = metrics.length;
  const angles = metrics.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);

  const points = metrics.map((m, i) => {
    const r = (m.value / 100) * R;
    return [CX + r * Math.cos(angles[i]), CY + r * Math.sin(angles[i])] as [number, number];
  });

  const polyStr = points.map(([x, y]) => `${x},${y}`).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg viewBox={`0 0 ${W} ${W}`} width={W} height={W}>
      {gridLevels.map((lvl) => {
        const gPts = angles.map((a) => {
          const r = lvl * R;
          return `${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`;
        });
        return <polygon key={lvl} points={gPts.join(" ")} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
      })}
      {angles.map((a, i) => (
        <line key={i} x1={CX} y1={CY} x2={CX + R * Math.cos(a)} y2={CY + R * Math.sin(a)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      ))}
      <polygon points={polyStr} fill="rgba(99,102,241,0.3)" stroke="#6366f1" strokeWidth={1.5} />
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CorpGovernancePage() {
  const [selectedCompany, setSelectedCompany] = useState<BoardCompany>(BOARD_COMPANIES[0]);
  const [expandedDefense, setExpandedDefense] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* HERO Header */}
        <div className="border-l-4 border-l-primary rounded-xl bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-semibold text-foreground">Corporate Governance & Shareholder Activism</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Analyze board composition, proxy battles, and governance quality across public companies.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="S&P 500 Avg. Board Indep." value="82%" sub="vs. 74% in 2015" highlight="pos" />
          <StatCard label="Active Campaigns (2024)" value="238" sub="+18% YoY" highlight="neutral" />
          <StatCard label="Avg. Activist Premium" value="+14.2%" sub="6-month post-disclosure" highlight="pos" />
          <StatCard label="Say-on-Pay Failures" value="2.3%" sub="of Russell 3000 votes" highlight="neutral" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="board">
          <TabsList className="bg-foreground/5 border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="board" className="text-xs gap-1.5"><Users className="w-3 h-3" />Board Composition</TabsTrigger>
            <TabsTrigger value="activist" className="text-xs gap-1.5"><Target className="w-3 h-3" />Activist Campaigns</TabsTrigger>
            <TabsTrigger value="proxy" className="text-xs gap-1.5"><Vote className="w-3 h-3" />Proxy Vote Sim</TabsTrigger>
            <TabsTrigger value="esg" className="text-xs gap-1.5"><Award className="w-3 h-3" />ESG Scorecard</TabsTrigger>
            <TabsTrigger value="defense" className="text-xs gap-1.5"><Shield className="w-3 h-3" />Takeover Defenses</TabsTrigger>
            <TabsTrigger value="ownership" className="text-xs gap-1.5"><BarChart2 className="w-3 h-3" />Institutional Ownership</TabsTrigger>
          </TabsList>

          {/* ── Board Composition ── */}
          <TabsContent value="board" className={cn("mt-4", "data-[state=inactive]:hidden")}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Governance Score by Company</h3>
                  <BoardBarChart companies={BOARD_COMPANIES} />
                </div>
                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Company Detail</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {BOARD_COMPANIES.map((c) => (
                      <button
                        key={c.ticker}
                        onClick={() => setSelectedCompany(c)}
                        className={cn(
                          "text-xs px-2 py-1 rounded-md border transition-all",
                          selectedCompany.ticker === c.ticker
                            ? "bg-indigo-500 border-indigo-500 text-foreground"
                            : "border-border text-muted-foreground hover:border-border"
                        )}
                      >
                        {c.ticker}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{selectedCompany.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">Board Size</span><span className="text-foreground font-medium">{selectedCompany.boardSize} members</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Independent</span><span className={cn("font-medium", scoreColor(selectedCompany.independentPct))}>{selectedCompany.independentPct}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Female Directors</span><span className={cn("font-medium", scoreColor(selectedCompany.femalePct))}>{selectedCompany.femalePct}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Avg. Tenure</span><span className={cn("font-medium", selectedCompany.avgTenure > 10 ? "text-rose-400" : "text-emerald-400")}>{selectedCompany.avgTenure} yrs</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">CEO/Chair Split</span><span className={cn("font-medium", selectedCompany.ceoChairSplit ? "text-emerald-400" : "text-rose-400")}>{selectedCompany.ceoChairSplit ? "Yes" : "No"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Staggered Board</span><span className={cn("font-medium", selectedCompany.staggeredBoard ? "text-rose-400" : "text-emerald-400")}>{selectedCompany.staggeredBoard ? "Yes" : "No"}</span></div>
                      {selectedCompany.classifiedDirectors > 0 && (
                        <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Classified Directors</span><span className="text-amber-400 font-medium">{selectedCompany.classifiedDirectors} classes</span></div>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Governance Score</span>
                        <span className={cn("font-medium", scoreColor(selectedCompany.govScore))}>{selectedCompany.govScore}/100</span>
                      </div>
                      <ScoreBar value={selectedCompany.govScore} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-foreground/5 p-4 overflow-x-auto">
                <h3 className="text-sm font-medium text-foreground mb-3">Full Comparison Table</h3>
                <table className="w-full text-xs min-w-[580px]">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="text-left pb-2 font-medium">Company</th>
                      <th className="text-center pb-2 font-medium">Size</th>
                      <th className="text-center pb-2 font-medium">Indep %</th>
                      <th className="text-center pb-2 font-medium">Female %</th>
                      <th className="text-center pb-2 font-medium">Tenure</th>
                      <th className="text-center pb-2 font-medium">CEO/Chair</th>
                      <th className="text-center pb-2 font-medium">Staggered</th>
                      <th className="text-center pb-2 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BOARD_COMPANIES.map((c) => (
                      <tr key={c.ticker} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2 font-medium text-foreground">{c.name} <span className="text-muted-foreground">({c.ticker})</span></td>
                        <td className="text-center py-2 text-muted-foreground">{c.boardSize}</td>
                        <td className={cn("text-center py-2 font-medium", scoreColor(c.independentPct))}>{c.independentPct}%</td>
                        <td className={cn("text-center py-2 font-medium", scoreColor(c.femalePct))}>{c.femalePct}%</td>
                        <td className={cn("text-center py-2", c.avgTenure > 10 ? "text-rose-400" : "text-emerald-400")}>{c.avgTenure}y</td>
                        <td className="text-center py-2">{c.ceoChairSplit ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" /> : <XCircle className="w-3.5 h-3.5 text-rose-400 inline" />}</td>
                        <td className="text-center py-2">{c.staggeredBoard ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />}</td>
                        <td className="text-center py-2"><Badge className={cn("text-xs", scoreBg(c.govScore))}>{c.govScore}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── Activist Campaigns ── */}
          <TabsContent value="activist" className={cn("mt-4", "data-[state=inactive]:hidden")}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatCard label="Active Campaigns" value="2" sub="vs 5 tracked" />
                <StatCard label="Avg. Stake Size" value="6.5%" sub="at 13D filing" />
                <StatCard label="Avg. Stock Reaction" value="+12.1%" sub="post-disclosure" highlight="pos" />
                <StatCard label="Win Rate (activists)" value="60%" sub="of tracked campaigns" highlight="pos" />
              </div>
              {ACTIVIST_CAMPAIGNS.map((c) => (
                <div key={c.fund + c.target} className="rounded-xl border border-border bg-foreground/5 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{c.fund}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-sm font-medium text-indigo-300">{c.target}</span>
                        <Badge className="text-xs bg-muted/50 text-muted-foreground">{c.ticker}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Stake: <span className="text-foreground font-medium">{c.stakePct}%</span></span>
                        <span>Stock reaction: <span className={cn("font-medium", c.stockReaction >= 0 ? "text-emerald-400" : "text-rose-400")}>{c.stockReaction >= 0 ? "+" : ""}{c.stockReaction}%</span></span>
                      </div>
                    </div>
                    <Badge className={cn("text-xs flex-shrink-0", statusColor[c.status])}>{c.status}</Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1.5">Key Demands:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.demands.map((d) => (
                        <span key={d} className="text-xs bg-foreground/5 border border-border rounded-md px-2 py-0.5 text-muted-foreground">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ── Proxy Vote ── */}
          <TabsContent value="proxy" className={cn("mt-4", "data-[state=inactive]:hidden")}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 mb-4">
                <p className="text-xs text-indigo-300">
                  Cast your votes on the upcoming annual meeting proxy ballot. Compare your decisions with ISS proxy advisory recommendations.
                </p>
              </div>
              <ProxyVoteSimulator />
            </motion.div>
          </TabsContent>

          {/* ── ESG Scorecard ── */}
          <TabsContent value="esg" className={cn("mt-4", "data-[state=inactive]:hidden")}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ESG_SCORES.map((e) => (
                  <div key={e.ticker} className="rounded-xl border border-border bg-foreground/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">{e.company}</p>
                        <p className="text-xs text-muted-foreground">{e.ticker}</p>
                      </div>
                      <EsgRadarMini score={e} />
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: "Board Indep.", value: e.boardIndependence },
                        { label: "Pay Alignment", value: e.execPayAlignment },
                        { label: "Shr. Rights", value: e.shareholderRights },
                        { label: "Transparency", value: e.transparency },
                      ].map((m) => (
                        <div key={m.label}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-muted-foreground">{m.label}</span>
                            <span className={cn("font-medium", scoreColor(m.value))}>{m.value}</span>
                          </div>
                          <ScoreBar value={m.value} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Overall Score</span>
                      <Badge className={cn("text-xs font-medium", scoreBg(e.overall))}>{e.overall}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-foreground/5 p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Score Interpretation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 mt-0.5 flex-shrink-0" /><div><p className="text-emerald-400 font-medium">80–100: Strong Governance</p><p className="text-muted-foreground mt-0.5">Majority independent board, pay tied to performance, robust shareholder rights, full disclosure</p></div></div>
                  <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 mt-0.5 flex-shrink-0" /><div><p className="text-amber-400 font-medium">65–79: Adequate Governance</p><p className="text-muted-foreground mt-0.5">Some concerns — tenure concentration, partial disclosure gaps, or minor pay misalignment</p></div></div>
                  <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 mt-0.5 flex-shrink-0" /><div><p className="text-rose-400 font-medium">Below 65: Governance Risk</p><p className="text-muted-foreground mt-0.5">Material weaknesses — entrenched board, pay-for-no-performance, activist target profile</p></div></div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── Takeover Defenses ── */}
          <TabsContent value="defense" className={cn("mt-4", "data-[state=inactive]:hidden")}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 mb-2">
                <p className="text-xs text-amber-300">
                  Takeover defenses protect companies from hostile acquisitions but can also entrench management. Governance experts weigh each mechanism differently.
                </p>
              </div>
              {TAKEOVER_DEFENSES.map((def) => (
                <div key={def.name} className="rounded-xl border border-border bg-foreground/5 overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left"
                    onClick={() => setExpandedDefense(expandedDefense === def.name ? null : def.name)}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{def.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{def.mechanism}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Badge className="text-xs bg-muted/50 text-muted-foreground hidden sm:block">{def.prevalence}</Badge>
                      <TrendingUp className={cn("w-4 h-4 transition-transform", expandedDefense === def.name ? "rotate-90 text-indigo-400" : "text-muted-foreground")} />
                    </div>
                  </button>
                  {expandedDefense === def.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 border-t border-border"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                        <div>
                          <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Advantages</p>
                          <ul className="space-y-1">
                            {def.pros.map((p) => (
                              <li key={p} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-emerald-500 mt-0.5">+</span>{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-rose-400 mb-2 flex items-center gap-1"><XCircle className="w-3 h-3" />Disadvantages</p>
                          <ul className="space-y-1">
                            {def.cons.map((c) => (
                              <li key={c} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-rose-500 mt-0.5">−</span>{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Prevalence: {def.prevalence}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ── Institutional Ownership ── */}
          <TabsContent value="ownership" className={cn("mt-4", "data-[state=inactive]:hidden")}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                  <h3 className="text-sm font-medium text-foreground mb-4">Ownership Breakdown — Vertex Financial (VTXF)</h3>
                  <OwnershipDonut data={SHAREHOLDERS} />
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-border bg-foreground/5 p-3">
                      <p className="text-muted-foreground mb-1">Passive (Index)</p>
                      <p className="text-xl font-medium text-primary">
                        {SHAREHOLDERS.filter((s) => s.type === "Index").reduce((a, b) => a + b.pct, 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-foreground/5 p-3">
                      <p className="text-muted-foreground mb-1">Active Managers</p>
                      <p className="text-xl font-medium text-emerald-400">
                        {SHAREHOLDERS.filter((s) => s.type === "Active").reduce((a, b) => a + b.pct, 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-foreground/5 p-3">
                      <p className="text-muted-foreground mb-1">Hedge Funds</p>
                      <p className="text-xl font-medium text-amber-400">
                        {SHAREHOLDERS.filter((s) => s.type === "Hedge Fund").reduce((a, b) => a + b.pct, 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-foreground/5 p-3">
                      <p className="text-muted-foreground mb-1">Insiders</p>
                      <p className="text-xl font-medium text-primary">
                        {SHAREHOLDERS.filter((s) => s.type === "Insider").reduce((a, b) => a + b.pct, 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Top Shareholders</h3>
                  <div className="space-y-2">
                    {SHAREHOLDERS.sort((a, b) => b.pct - a.pct).map((sh, i) => (
                      <div key={sh.name} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-foreground font-medium">{sh.name}</span>
                            <span className="text-foreground font-medium">{sh.pct}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", sh.type === "Index" ? "bg-primary" : sh.type === "Active" ? "bg-emerald-500" : sh.type === "Hedge Fund" ? "bg-amber-500" : "bg-primary")}
                                style={{ width: `${(sh.pct / 9) * 100}%` }}
                              />
                            </div>
                            <Badge className={cn("text-[11px] px-1", typeColor[sh.type])}>{sh.type}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-foreground/5 p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Voting Power Dynamics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" />Index Funds (Passive)</p>
                    <p className="text-muted-foreground">Control ~20.5% of votes but historically rubber-stamp management. The "Big Three" (Vanguard, BlackRock, State Street) are increasingly exercising stewardship via proxy voting guidelines.</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3 text-amber-400" />Hedge Funds (Active)</p>
                    <p className="text-muted-foreground">Pershing Square&apos;s 7.7% stake represents meaningful voting power. Hedge funds leverage smaller stakes through proxy campaigns, media pressure, and coalition-building with other institutions.</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-primary" />Insider Holdings</p>
                    <p className="text-muted-foreground">7.5% insider ownership aligns management incentives with shareholders. High insider ownership can also entrench leadership — context matters (founder vs. legacy management).</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
