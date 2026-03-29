"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  DollarSign,
  Target,
  Shield,
  Home,
  GraduationCap,
  Briefcase,
  Heart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  BarChart3,
  PieChart,
  CreditCard,
  TreePine,
  Baby,
  Building2,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── PRNG ──────────────────────────────────────────────────────────────────────
let s = 672002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// pre-warm noise values used in charts
const NOISE: number[] = Array.from({ length: 200 }, () => rand());

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface ChartPoint {
  year: number;
  value: number;
  label?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  priority: "high" | "medium" | "low";
}

// ── SVG Wealth Projection Chart ────────────────────────────────────────────────
interface WealthChartProps {
  data: ChartPoint[];
  milestones?: { year: number; label: string; value: number }[];
  color?: string;
  title: string;
  height?: number;
}

function WealthChart({ data, milestones = [], color = "#6366f1", title, height = 220 }: WealthChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 560;
  const H = height;
  const PAD = { top: 20, right: 20, bottom: 36, left: 64 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const minV = Math.min(0, ...data.map((d) => d.value));
  const maxV = Math.max(...data.map((d) => d.value)) * 1.08;
  const minY = Math.min(...data.map((d) => d.year));
  const maxY = Math.max(...data.map((d) => d.year));
  const spanY = maxY - minY || 1;
  const spanV = maxV - minV || 1;

  const px = (year: number) => PAD.left + ((year - minY) / spanY) * innerW;
  const py = (val: number) => PAD.top + innerH - ((val - minV) / spanV) * innerH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${px(d.year).toFixed(1)} ${py(d.value).toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${px(data[data.length - 1].year).toFixed(1)} ${py(minV).toFixed(1)}` +
    ` L ${px(data[0].year).toFixed(1)} ${py(minV).toFixed(1)} Z`;

  const yTicks = 5;
  const yStep = spanV / yTicks;

  return (
    <div className="relative w-full">
      <p className="text-xs font-medium text-muted-foreground mb-2">{title}</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={`grad-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = minV + yStep * i;
          const y = py(v);
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + innerW}
                y2={y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                {fmtK(v)}
              </text>
            </g>
          );
        })}

        {/* x-axis labels */}
        {data
          .filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0)
          .map((d) => (
            <text
              key={d.year}
              x={px(d.year)}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {d.year}
            </text>
          ))}

        {/* area */}
        <path d={areaPath} fill={`url(#grad-${title.replace(/\s/g, "")})`} />

        {/* line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />

        {/* milestones */}
        {milestones.map((m) => {
          const mx = px(m.year);
          const my = py(m.value);
          return (
            <g key={m.year + m.label}>
              <line x1={mx} y1={PAD.top} x2={mx} y2={PAD.top + innerH} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              <circle cx={mx} cy={my} r="5" fill="#f59e0b" stroke="#1e293b" strokeWidth="2" />
              <text x={mx + 6} y={my - 6} fontSize="9" fill="#f59e0b" fontWeight="600">
                {m.label}
              </text>
            </g>
          );
        })}

        {/* hover overlay */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={px(d.year) - innerW / data.length / 2}
            y={PAD.top}
            width={innerW / data.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
          />
        ))}

        {/* hover dot + tooltip */}
        {hovered !== null && (
          <g>
            <circle
              cx={px(data[hovered].year)}
              cy={py(data[hovered].value)}
              r="5"
              fill={color}
              stroke="#1e293b"
              strokeWidth="2"
            />
            <rect
              x={Math.min(px(data[hovered].year) - 42, W - 100)}
              y={py(data[hovered].value) - 36}
              width="90"
              height="28"
              rx="4"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1"
            />
            <text
              x={Math.min(px(data[hovered].year) - 42, W - 100) + 45}
              y={py(data[hovered].value) - 17}
              textAnchor="middle"
              fontSize="11"
              fill="#f1f5f9"
              fontWeight="600"
            >
              {fmtK(data[hovered].value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ── InfoCard ───────────────────────────────────────────────────────────────────
function InfoCard({
  icon,
  title,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 shrink-0", color)}>{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="font-semibold text-sm text-foreground truncate">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

// ── ChecklistCard ──────────────────────────────────────────────────────────────
function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const pct = (checked.size / items.length) * 100;

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-sm text-foreground">Action Checklist</p>
        <Badge variant="outline" className="text-xs">
          {checked.size}/{items.length}
        </Badge>
      </div>
      <Progress value={pct} className="h-1.5 mb-4" />
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors",
              checked.has(item.id) ? "bg-primary/10" : "hover:bg-muted/50"
            )}
            onClick={() => toggle(item.id)}
          >
            <CheckCircle
              className={cn(
                "mt-0.5 shrink-0 w-4 h-4 transition-colors",
                checked.has(item.id) ? "text-primary" : "text-muted-foreground/40"
              )}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-sm font-medium",
                    checked.has(item.id) ? "line-through text-muted-foreground" : "text-foreground"
                  )}
                >
                  {item.label}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs shrink-0",
                    item.priority === "high" && "border-red-500/40 text-red-400",
                    item.priority === "medium" && "border-amber-500/40 text-amber-400",
                    item.priority === "low" && "border-green-500/40 text-green-400"
                  )}
                >
                  {item.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── SectionHeader ──────────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  subtitle,
  accentColor,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div
        className="p-3 rounded-xl shrink-0"
        style={{ background: `${accentColor}18`, color: accentColor }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Tooltip hint ──────────────────────────────────────────────────────────────
function Hint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-border text-xs text-primary">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 1 — 20s Foundation
// ─────────────────────────────────────────────────────────────────────────────
function Tab20s() {
  const [salary, setSalary] = useState(55000);
  const [loanBalance, setLoanBalance] = useState(35000);
  const [contrib401k, setContrib401k] = useState(6);
  const [emergencyMonths, setEmergencyMonths] = useState(3);

  const monthlyExpenses = salary * 0.55 / 12;
  const emergencyTarget = monthlyExpenses * emergencyMonths;
  const annualContrib = salary * (contrib401k / 100);
  const employerMatch = salary * Math.min(contrib401k / 100, 0.04);

  // Wealth projection: 10 years (age 22–32)
  const projData = useMemo<ChartPoint[]>(() => {
    const points: ChartPoint[] = [];
    let netWorth = -loanBalance;
    const returnRate = 0.07;
    const loanRate = 0.055;
    const loanPmt = (loanBalance * loanRate) / (1 - Math.pow(1 + loanRate, -10));
    for (let yr = 0; yr <= 10; yr++) {
      points.push({ year: 2025 + yr, value: Math.round(netWorth) });
      const noise = (NOISE[yr] - 0.5) * 0.04;
      const invest = annualContrib + employerMatch + 6500; // Roth IRA
      netWorth = netWorth * (1 + returnRate + noise) + invest - loanPmt;
    }
    return points;
  }, [salary, loanBalance, contrib401k, annualContrib, employerMatch]);

  const milestones = [
    { year: 2027, label: "Emergency ✓", value: projData[2]?.value ?? 0 },
    { year: 2030, label: "+$0 NW", value: 0 },
  ];

  const checklist: ChecklistItem[] = [
    { id: "emergency", label: "Build 3–6 month emergency fund", description: `Target: ${fmt(emergencyTarget)}`, priority: "high" },
    { id: "401k", label: "Contribute enough for full 401(k) match", description: "Free money — never leave it on the table", priority: "high" },
    { id: "roth", label: "Open & max Roth IRA ($7,000/yr)", description: "Tax-free growth while in a lower bracket", priority: "high" },
    { id: "loan", label: "Attack high-interest student loans first", description: "Prioritize loans above 6% APR", priority: "medium" },
    { id: "credit", label: "Achieve 750+ credit score", description: "On-time payments + keep utilization < 30%", priority: "medium" },
    { id: "hsa", label: "Open an HSA if eligible (HDHP)", description: "Triple tax advantage; invest the balance", priority: "low" },
    { id: "budget", label: "Track spending with 50/30/20 rule", description: "Needs/Wants/Savings split", priority: "medium" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={<GraduationCap className="w-6 h-6" />}
        title="20s — Foundation Building"
        subtitle="Establish habits that compound for decades: eliminate high-interest debt, build your safety net, and start investing early."
        accentColor="#6366f1"
      />

      {/* sliders */}
      <Card className="p-5 bg-card border-border">
        <p className="font-semibold text-sm mb-4 text-foreground">Your Situation</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Annual Salary</label>
              <span className="text-xs font-medium text-foreground">{fmt(salary)}</span>
            </div>
            <Slider
              min={30000}
              max={150000}
              step={1000}
              value={[salary]}
              onValueChange={([v]) => setSalary(v)}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Student Loan Balance</label>
              <span className="text-xs font-medium text-foreground">{fmt(loanBalance)}</span>
            </div>
            <Slider
              min={0}
              max={120000}
              step={1000}
              value={[loanBalance]}
              onValueChange={([v]) => setLoanBalance(v)}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">401(k) Contribution</label>
              <span className="text-xs font-medium text-foreground">{fmtPct(contrib401k)}</span>
            </div>
            <Slider
              min={0}
              max={23}
              step={0.5}
              value={[contrib401k]}
              onValueChange={([v]) => setContrib401k(v)}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Emergency Fund (months)</label>
              <span className="text-xs font-medium text-foreground">{emergencyMonths} mo</span>
            </div>
            <Slider
              min={1}
              max={12}
              step={1}
              value={[emergencyMonths]}
              onValueChange={([v]) => setEmergencyMonths(v)}
            />
          </div>
        </div>
      </Card>

      {/* stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={<DollarSign className="w-4 h-4" />}
          title="Annual 401(k) + Match"
          value={fmtK(annualContrib + employerMatch)}
          sub={`You: ${fmt(annualContrib)} | Match: ${fmt(employerMatch)}`}
          color="text-indigo-400"
        />
        <InfoCard
          icon={<Shield className="w-4 h-4" />}
          title="Emergency Fund Target"
          value={fmt(emergencyTarget)}
          sub={`${emergencyMonths} × ${fmt(monthlyExpenses)}/mo`}
          color="text-emerald-400"
        />
        <InfoCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Roth IRA Limit (2025)"
          value="$7,000"
          sub="Tax-free after 59½"
          color="text-primary"
        />
        <InfoCard
          icon={<CreditCard className="w-4 h-4" />}
          title="Loan Rate Threshold"
          value="6% APR"
          sub="Pay off before investing more"
          color="text-amber-400"
        />
      </div>

      {/* chart */}
      <Card className="p-5 bg-card border-border">
        <WealthChart
          data={projData}
          milestones={milestones}
          color="#6366f1"
          title="Net Worth Projection (10-Year, 7% avg return)"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChecklistCard items={checklist} />
        <Card className="p-4 bg-card border-border space-y-3">
          <p className="font-semibold text-sm text-foreground">Key Concepts</p>
          <Hint text="Employer 401(k) match is an immediate 50–100% return on your contribution. Always contribute at least enough to get the full match." />
          <Hint text="Roth IRA vs Traditional: In your 20s you're likely in a lower tax bracket — Roth conversions are cheapest now. You keep all the gains tax-free." />
          <Hint text="Compound interest math: $5,000/yr from age 22 at 7% grows to ~$1.1M by age 65. Same amount starting at 32 yields ~$530K — half as much." />
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-foreground mb-1">Credit Score Factors</p>
            <div className="space-y-1">
              {[
                ["Payment History", 35],
                ["Credit Utilization", 30],
                ["Length of History", 15],
                ["Credit Mix", 10],
                ["New Credit", 10],
              ].map(([label, pct]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 2 — 30s Accumulation
// ─────────────────────────────────────────────────────────────────────────────
function Tab30s() {
  const [homePrice, setHomePrice] = useState(450000);
  const [downPct, setDownPct] = useState(20);
  const [rent, setRent] = useState(2200);
  const [childAge, setChildAge] = useState(0);
  const [salary, setSalary] = useState(95000);

  const down = homePrice * (downPct / 100);
  const loan = homePrice - down;
  const rate = 0.065;
  const term = 30;
  const monthlyMortgage = (loan * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -term * 12));
  const ownerTotal = monthlyMortgage + homePrice * 0.012 / 12 + homePrice * 0.008 / 12; // PITI + maint
  const rentBreakEvenYrs = Math.max(0, Math.round((down * 0.06) / ((ownerTotal - rent) * 12)));

  const collegeYears = 18 - childAge;
  const college529Target = 200000;
  const monthly529 = collegeYears > 0
    ? (college529Target / (((Math.pow(1.06, collegeYears) - 1) / 0.06) * 12))
    : 0;

  const termLifeNeeded = salary * 10;

  // 20-year projection age 30→50
  const projData = useMemo<ChartPoint[]>(() => {
    const points: ChartPoint[] = [];
    let nw = down * -0.5; // had some savings but committed to down payment
    const investAnnual = salary * 0.15 + salary * 0.04; // 15% personal + match
    const homeAppreciation = 0.04;
    let homeEquity = down;
    let loanBal = loan;
    for (let yr = 0; yr <= 20; yr++) {
      points.push({ year: 2025 + yr, value: Math.round(nw + homeEquity) });
      const noise = (NOISE[yr + 20] - 0.5) * 0.06;
      nw = nw * (1 + 0.07 + noise) + investAnnual;
      // mortgage paydown
      const interestPaid = loanBal * rate;
      const principal = monthlyMortgage * 12 - interestPaid;
      loanBal = Math.max(0, loanBal - principal);
      homeEquity = homePrice * Math.pow(1 + homeAppreciation, yr + 1) - loanBal;
    }
    return points;
  }, [salary, down, loan, homePrice, monthlyMortgage]);

  const milestones = [
    { year: 2030, label: "Home equity", value: projData[5]?.value ?? 0 },
    { year: 2040, label: "$500K NW", value: projData[15]?.value ?? 0 },
  ];

  const checklist: ChecklistItem[] = [
    { id: "buy", label: "Save 20% down payment to avoid PMI", description: `PMI adds ~${fmt(loan * 0.008 / 12)}/mo on your loan`, priority: "high" },
    { id: "529", label: `Open 529 — contribute ${fmt(monthly529)}/mo`, description: `Reach $200K by college in ${collegeYears} yrs`, priority: "high" },
    { id: "life", label: `Get ${fmtK(termLifeNeeded)} term life insurance`, description: "20–30 yr term; 10× income rule of thumb", priority: "high" },
    { id: "disability", label: "Verify long-term disability coverage", description: "Should replace 60–70% of income", priority: "medium" },
    { id: "estate", label: "Draft will & beneficiary designations", description: "Especially critical once you have dependents", priority: "medium" },
    { id: "401kmax", label: "Increase 401(k) to $23,500/yr limit", description: "Capture more tax-deferred growth", priority: "medium" },
    { id: "umbrella", label: "Add $1M umbrella liability policy", description: "Costs ~$200–400/yr; protects net worth", priority: "low" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={<Home className="w-6 h-6" />}
        title="30s — Accumulation Phase"
        subtitle="Major life decisions: homeownership, family planning, and accelerating wealth accumulation while managing new responsibilities."
        accentColor="#0ea5e9"
      />

      <Card className="p-5 bg-card border-border">
        <p className="font-semibold text-sm mb-4 text-foreground">Rent vs. Buy Calculator</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Home Price</label>
              <span className="text-xs font-medium text-foreground">{fmtK(homePrice)}</span>
            </div>
            <Slider min={150000} max={1200000} step={5000} value={[homePrice]} onValueChange={([v]) => setHomePrice(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Down Payment</label>
              <span className="text-xs font-medium text-foreground">{fmtPct(downPct)} ({fmtK(down)})</span>
            </div>
            <Slider min={3} max={40} step={1} value={[downPct]} onValueChange={([v]) => setDownPct(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Monthly Rent Alternative</label>
              <span className="text-xs font-medium text-foreground">{fmt(rent)}/mo</span>
            </div>
            <Slider min={800} max={6000} step={50} value={[rent]} onValueChange={([v]) => setRent(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Child's Current Age</label>
              <span className="text-xs font-medium text-foreground">{childAge === 0 ? "Newborn" : `${childAge} yrs`}</span>
            </div>
            <Slider min={0} max={17} step={1} value={[childAge]} onValueChange={([v]) => setChildAge(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Annual Salary</label>
              <span className="text-xs font-medium text-foreground">{fmt(salary)}</span>
            </div>
            <Slider min={50000} max={300000} step={2000} value={[salary]} onValueChange={([v]) => setSalary(v)} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={<Home className="w-4 h-4" />}
          title="Monthly Ownership Cost"
          value={fmt(ownerTotal)}
          sub={`Mortgage + tax + maint`}
          color="text-sky-400"
        />
        <InfoCard
          icon={<Clock className="w-4 h-4" />}
          title="Buy Break-Even"
          value={rentBreakEvenYrs <= 0 ? "Buy now" : `~${rentBreakEvenYrs} yrs`}
          sub="Time to offset buy-in costs vs rent"
          color="text-amber-400"
        />
        <InfoCard
          icon={<Baby className="w-4 h-4" />}
          title="529 Monthly Needed"
          value={fmt(monthly529)}
          sub={`${collegeYears} yrs to college at 6% growth`}
          color="text-rose-400"
        />
        <InfoCard
          icon={<Shield className="w-4 h-4" />}
          title="Term Life Coverage"
          value={fmtK(termLifeNeeded)}
          sub="~10× income rule"
          color="text-emerald-400"
        />
      </div>

      <Card className="p-5 bg-card border-border">
        <WealthChart
          data={projData}
          milestones={milestones}
          color="#0ea5e9"
          title="Net Worth (incl. home equity) — Age 30→50 Projection"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChecklistCard items={checklist} />
        <Card className="p-4 bg-card border-border space-y-3">
          <p className="font-semibold text-sm text-foreground">30s Money Insights</p>
          <Hint text="529 plans: Contributions grow tax-free when used for qualified education expenses. Many states offer a deduction on contributions — always check your state's plan." />
          <Hint text="PMI costs 0.5–1.5% annually. Putting 20% down eliminates it and saves $150–400/month on a typical mortgage." />
          <Hint text="Renting isn't throwing money away — opportunity cost of down payment + flexibility matters. Buy when break-even < 5 years and planning to stay." />
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-foreground mb-2">Family Financial Planning Priorities</p>
            <div className="space-y-2">
              {[
                { label: "Employer benefits open enrollment", color: "bg-indigo-500" },
                { label: "Life & disability insurance", color: "bg-sky-500" },
                { label: "Will + healthcare proxy", color: "bg-emerald-500" },
                { label: "529 college savings", color: "bg-amber-500" },
                { label: "UTMA/custodial accounts", color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", item.color)} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 3 — 40s Peak Earning
// ─────────────────────────────────────────────────────────────────────────────
function Tab40s() {
  const [salary, setSalary] = useState(145000);
  const [currentNW, setCurrentNW] = useState(450000);
  const [brokerageExtra, setBrokerageExtra] = useState(12000);
  const [hasDisability, setHasDisability] = useState(false);

  const backdoorRothLimit = 7000;
  const megaBackdoor = 46000 - 23500; // after-tax 401k space (approx)
  const annualMax401k = 23500;

  // 20-year projection age 40→60
  const projData = useMemo<ChartPoint[]>(() => {
    const points: ChartPoint[] = [];
    let nw = currentNW;
    const annualInvest = annualMax401k + backdoorRothLimit + brokerageExtra + salary * 0.04;
    for (let yr = 0; yr <= 20; yr++) {
      points.push({ year: 2025 + yr, value: Math.round(nw) });
      const noise = (NOISE[yr + 40] - 0.5) * 0.05;
      nw = nw * (1 + 0.07 + noise) + annualInvest;
    }
    return points;
  }, [currentNW, brokerageExtra, salary]);

  const milestones = [
    { year: 2030, label: "$1M", value: 1_000_000 },
    { year: 2040, label: "Retire Ready?", value: projData[15]?.value ?? 0 },
  ];

  const disabilityGap = hasDisability ? 0 : salary * 0.6;

  const checklist: ChecklistItem[] = [
    { id: "backdoor", label: "Execute annual backdoor Roth IRA", description: `Contribute $${backdoorRothLimit.toLocaleString()} non-deductible → convert to Roth`, priority: "high" },
    { id: "megabackdoor", label: "Mega backdoor Roth via after-tax 401(k)", description: `Up to ${fmtK(megaBackdoor)}/yr additional Roth space`, priority: "high" },
    { id: "taxable", label: "Open taxable brokerage for overflow", description: `${fmtK(brokerageExtra)}/yr beyond tax-advantaged limits`, priority: "high" },
    { id: "disability", label: "Get own-occupation disability insurance", description: `Protect ${fmtK(disabilityGap)}/yr income if disabled`, priority: "high" },
    { id: "estate", label: "Estate planning: trust + pour-over will", description: "Revocable living trust avoids probate on large estates", priority: "high" },
    { id: "heirlooms", label: "Annual gift tax exclusion planning", description: `Give up to $18,000/person/yr tax-free in 2025`, priority: "medium" },
    { id: "i529", label: "Superfund 529 with 5-year gift election", description: `Lump in up to $90,000/child ($180K per couple)`, priority: "medium" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={<Briefcase className="w-6 h-6" />}
        title="40s — Peak Earning Years"
        subtitle="Maximize tax-advantaged space with backdoor Roth strategies, build taxable brokerage wealth, and begin estate planning before you need it."
        accentColor="#f59e0b"
      />

      <Card className="p-5 bg-card border-border">
        <p className="font-semibold text-sm mb-4 text-foreground">Your Financial Inputs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Annual Salary</label>
              <span className="text-xs font-medium text-foreground">{fmt(salary)}</span>
            </div>
            <Slider min={80000} max={500000} step={5000} value={[salary]} onValueChange={([v]) => setSalary(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Current Net Worth</label>
              <span className="text-xs font-medium text-foreground">{fmtK(currentNW)}</span>
            </div>
            <Slider min={50000} max={2000000} step={10000} value={[currentNW]} onValueChange={([v]) => setCurrentNW(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Extra Taxable Brokerage/yr</label>
              <span className="text-xs font-medium text-foreground">{fmtK(brokerageExtra)}</span>
            </div>
            <Slider min={0} max={100000} step={1000} value={[brokerageExtra]} onValueChange={([v]) => setBrokerageExtra(v)} />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={hasDisability ? "default" : "outline"}
              size="sm"
              onClick={() => setHasDisability(!hasDisability)}
              className="gap-2"
            >
              <Shield className="w-3.5 h-3.5" />
              {hasDisability ? "Has Disability Insurance" : "No Disability Insurance"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Backdoor Roth IRA"
          value={fmtK(backdoorRothLimit)}
          sub="Non-deductible → immediate convert"
          color="text-amber-400"
        />
        <InfoCard
          icon={<BarChart3 className="w-4 h-4" />}
          title="Mega Backdoor 401(k)"
          value={fmtK(megaBackdoor)}
          sub="After-tax contributions"
          color="text-orange-400"
        />
        <InfoCard
          icon={<Shield className="w-4 h-4" />}
          title="Disability Income Gap"
          value={hasDisability ? "Covered" : fmtK(disabilityGap) + "/yr at risk"}
          sub={hasDisability ? "Good — income protected" : "Own-occ policy recommended"}
          color={hasDisability ? "text-emerald-400" : "text-red-400"}
        />
        <InfoCard
          icon={<Building2 className="w-4 h-4" />}
          title="Annual Gift Exclusion"
          value="$18,000"
          sub="Per recipient, tax-free (2025)"
          color="text-primary"
        />
      </div>

      <Card className="p-5 bg-card border-border">
        <WealthChart
          data={projData}
          milestones={milestones}
          color="#f59e0b"
          title="Net Worth Projection — Age 40→60 (7% avg return)"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChecklistCard items={checklist} />
        <Card className="p-4 bg-card border-border space-y-3">
          <p className="font-semibold text-sm text-foreground">Advanced Strategies</p>
          <Hint text="Backdoor Roth: Contribute $7,000 to a traditional IRA (non-deductible), then immediately convert to Roth. Eliminates income limits. Watch for pro-rata rule if you have pre-tax IRA balances." />
          <Hint text="Own-occupation disability insurance covers you if you can't work in your specific occupation — more valuable than any-occ policies for high-income professionals." />
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-foreground mb-2">Asset Location Strategy</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              {[
                { account: "Tax-Deferred 401(k)", assets: "Bonds, REITs, high-dividend stocks" },
                { account: "Roth IRA", assets: "High-growth stocks (small cap, intl)" },
                { account: "Taxable Brokerage", assets: "Index funds, tax-loss harvest candidates" },
              ].map((row) => (
                <div key={row.account} className="flex gap-2">
                  <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-medium text-foreground">{row.account}: </span>
                    {row.assets}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-foreground mb-1">Estate Planning Basics</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {[
                "Revocable living trust: avoids probate, faster distribution",
                "Pour-over will: catches assets not in trust",
                "Healthcare proxy & durable power of attorney",
                "Update beneficiaries on all accounts (IRA, 401k, life insurance)",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-amber-400 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 4 — 50s Pre-Retirement
// ─────────────────────────────────────────────────────────────────────────────
function Tab50s() {
  const [portfolio, setPortfolio] = useState(850000);
  const [salary, setSalary] = useState(165000);
  const [ssAge, setSsAge] = useState(67);
  const [retireAge, setRetireAge] = useState(65);

  const catchUp401k = 23500 + 7500; // 2025 catch-up
  const catchUpRoth = 7000 + 1000;

  // SS benefit estimation (simplified)
  const ssEarlyBenefit = 1800; // at 62
  const ssFull = 2900; // at 67
  const ssDelayed = ssFull * (1 + 0.08 * (ssAge - 67)); // 8%/yr past FRA

  const monthsUntilRetire = (retireAge - 50) * 12;
  const projData = useMemo<ChartPoint[]>(() => {
    const points: ChartPoint[] = [];
    let nw = portfolio;
    const annualInvest = catchUp401k + catchUpRoth + salary * 0.05;
    for (let yr = 0; yr <= 20; yr++) {
      const age = 50 + yr;
      const isRetired = age >= retireAge;
      points.push({ year: 2025 + yr, value: Math.round(nw) });
      const noise = (NOISE[yr + 60] - 0.5) * 0.04;
      if (!isRetired) {
        nw = nw * (1 + 0.065 + noise) + annualInvest;
      } else {
        const spending = salary * 0.7; // 70% replacement
        nw = nw * (1 + 0.05 + noise) - spending + ssDelayed * 12;
      }
    }
    return points;
  }, [portfolio, salary, retireAge, ssDelayed]);

  const milestones = [
    { year: 2025 + (retireAge - 50), label: "Retire", value: projData[retireAge - 50]?.value ?? 0 },
  ];

  // Roth conversion ladder: convert tIRA to Roth when in lower bracket pre-retirement
  const rothConversionIdeal = Math.max(0, 89075 - salary * 0.3); // rough headroom in 22% bracket

  const checklist: ChecklistItem[] = [
    { id: "catchup", label: "Max catch-up contributions every year", description: `401(k) ${fmtK(catchUp401k)} + IRA ${fmtK(catchUpRoth)} — extra $8,500 vs under-50`, priority: "high" },
    { id: "ladder", label: "Begin Roth conversion ladder", description: `Convert ${fmtK(rothConversionIdeal)}/yr at current tax bracket`, priority: "high" },
    { id: "ssopt", label: "Model Social Security claiming ages", description: `Delay to 70 adds 24% vs claiming at 67`, priority: "high" },
    { id: "healthcare", label: "Plan healthcare bridge 65 → Medicare", description: "COBRA, ACA marketplace, or FIRE-friendly plans", priority: "high" },
    { id: "sequence", label: "Build 2-year cash cushion for sequence risk", description: "Avoid selling equities in early retirement downturn", priority: "medium" },
    { id: "longterm", label: "Evaluate long-term care insurance", description: "Premiums spike after 60 — buy in 50s or self-insure", priority: "medium" },
    { id: "cola", label: "Stress-test for 3% inflation scenario", description: "Ensure portfolio survives 30+ year retirement", priority: "medium" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={<Calendar className="w-6 h-6" />}
        title="50s — Pre-Retirement Sprint"
        subtitle="Accelerate savings with catch-up contributions, begin Roth conversion ladders, and optimize Social Security claiming strategy."
        accentColor="#10b981"
      />

      <Card className="p-5 bg-card border-border">
        <p className="font-semibold text-sm mb-4 text-foreground">Retirement Planning Inputs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Current Portfolio</label>
              <span className="text-xs font-medium text-foreground">{fmtK(portfolio)}</span>
            </div>
            <Slider min={100000} max={3000000} step={25000} value={[portfolio]} onValueChange={([v]) => setPortfolio(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Annual Salary</label>
              <span className="text-xs font-medium text-foreground">{fmt(salary)}</span>
            </div>
            <Slider min={60000} max={500000} step={5000} value={[salary]} onValueChange={([v]) => setSalary(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Target Retirement Age</label>
              <span className="text-xs font-medium text-foreground">{retireAge}</span>
            </div>
            <Slider min={55} max={72} step={1} value={[retireAge]} onValueChange={([v]) => setRetireAge(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">SS Claiming Age</label>
              <span className="text-xs font-medium text-foreground">{ssAge} ({ssDelayed > ssFull ? `+${fmtPct((ssDelayed / ssFull - 1) * 100)}` : "FRA"})</span>
            </div>
            <Slider min={62} max={70} step={1} value={[ssAge]} onValueChange={([v]) => setSsAge(v)} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Annual Catch-Up Space"
          value={fmtK(catchUp401k + catchUpRoth)}
          sub={`401k: ${fmtK(catchUp401k)} + IRA: ${fmtK(catchUpRoth)}`}
          color="text-emerald-400"
        />
        <InfoCard
          icon={<DollarSign className="w-4 h-4" />}
          title="SS at Claimed Age"
          value={fmt(ssDelayed)+ "/mo"}
          sub={`FRA: ${fmt(ssFull)}/mo | Age 62: ${fmt(ssEarlyBenefit)}/mo`}
          color="text-sky-400"
        />
        <InfoCard
          icon={<Clock className="w-4 h-4" />}
          title="SS Break-Even (delay)"
          value="~82 years old"
          sub="Delaying to 70 pays off after ~10 yrs"
          color="text-amber-400"
        />
        <InfoCard
          icon={<Stethoscope className="w-4 h-4" />}
          title="Healthcare Bridge Cost"
          value="~$800–1,500/mo"
          sub="Individual ACA plan until Medicare 65"
          color="text-rose-400"
        />
      </div>

      <Card className="p-5 bg-card border-border">
        <WealthChart
          data={projData}
          milestones={milestones}
          color="#10b981"
          title="Portfolio Value — Age 50→70 Projection"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChecklistCard items={checklist} />
        <Card className="p-4 bg-card border-border space-y-3">
          <p className="font-semibold text-sm text-foreground">SS Claiming Strategy</p>
          <div className="space-y-2">
            {[
              { age: 62, pct: 70, benefit: ssEarlyBenefit, label: "Early (reduced)" },
              { age: 67, pct: 100, benefit: ssFull, label: "Full Retirement Age" },
              { age: 70, pct: 124, benefit: Math.round(ssFull * 1.24), label: "Maximum (delayed)" },
            ].map((row) => (
              <div
                key={row.age}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg border",
                  ssAge === row.age ? "border-emerald-500/50 bg-emerald-500/10" : "border-border"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-400">{row.age}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-foreground">{row.label}</span>
                    <span className="text-xs font-bold text-emerald-400">{fmt(row.benefit)}/mo</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{row.pct}% of PIA</span>
                </div>
              </div>
            ))}
          </div>
          <Hint text="Roth conversion ladder: Convert traditional IRA funds to Roth in the years between retirement and SS/RMD onset when your taxable income is lowest — often the most tax-efficient window of your life." />
        </Card>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TAB 5 — 60s+ Distribution
// ─────────────────────────────────────────────────────────────────────────────
function Tab60s() {
  const [portfolio, setPortfolio] = useState(1200000);
  const [ssMonthly, setSsMonthly] = useState(2800);
  const [spending, setSpending] = useState(72000);
  const [ssClaimAge, setSsClaimAge] = useState(68);

  const rmdAge = 73;
  const rmdFactor = 26.5; // IRS table for age 73
  const estimatedRmd = portfolio * 0.6 / rmdFactor; // assume 60% in tax-deferred

  const safeWithdrawalRate = 0.04;
  const portfolioSustain = portfolio * safeWithdrawalRate;
  const ssAnnual = ssMonthly * 12;
  const incomeGap = Math.max(0, spending - ssAnnual - portfolioSustain);

  // Draw-down chart 60→90
  const projData = useMemo<ChartPoint[]>(() => {
    const points: ChartPoint[] = [];
    let nw = portfolio;
    const annualReturn = 0.055;
    const withdrawSeq = [
      spending * 0.4, // taxable first
      spending * 0.35, // deferred next
      spending * 0.25, // roth last
    ].reduce((a, b) => a + b, 0);

    for (let yr = 0; yr <= 30; yr++) {
      const age = 60 + yr;
      points.push({ year: 2025 + yr, value: Math.round(Math.max(0, nw)) });
      const noise = (NOISE[yr + 80] - 0.5) * 0.035;
      const incSS = age >= ssClaimAge ? ssAnnual : 0;
      const net = nw * (1 + annualReturn + noise) - withdrawSeq + incSS;
      nw = Math.max(0, net);
      if (nw === 0) {
        for (let rem = yr + 1; rem <= 30; rem++) {
          points.push({ year: 2025 + rem, value: 0 });
        }
        break;
      }
    }
    return points;
  }, [portfolio, spending, ssClaimAge, ssAnnual]);

  const milestones = useMemo(() => {
    const rmdStart = projData[rmdAge - 60];
    if (!rmdStart) return [];
    return [{ year: 2025 + (rmdAge - 60), label: "RMD Start", value: rmdStart.value }];
  }, [projData]);

  const exhaustYear = projData.findIndex((d) => d.value === 0);
  const ageAtExhaust = exhaustYear === -1 ? "90+" : `${60 + exhaustYear}`;

  const checklist: ChecklistItem[] = [
    { id: "rmd", label: "Set up automatic RMD distributions by April 1", description: `First RMD at 73: est. ${fmtK(estimatedRmd)}/yr (50% penalty if missed)`, priority: "high" },
    { id: "medicare", label: "Enroll in Medicare Parts A, B, D at 65", description: "7-month enrollment window; late penalty is permanent", priority: "high" },
    { id: "sequence", label: "Follow withdrawal sequence: taxable → tIRA → Roth", description: "Preserves Roth tax-free growth longest", priority: "high" },
    { id: "ss", label: "Coordinate SS with pension/RMDs to minimize taxes", description: "Up to 85% of SS is taxable if provisional income > $44K", priority: "high" },
    { id: "irmaa", label: "Watch for IRMAA Medicare surcharge", description: "Income > $103K triggers higher Part B/D premiums", priority: "medium" },
    { id: "qcd", label: "Use QCDs to satisfy RMD + reduce taxable income", description: "$105,000/yr directly to charity; excluded from AGI", priority: "medium" },
    { id: "longterm", label: "Designate Roth IRA for heirs (no RMDs)", description: "Roth passes without tax bill to beneficiaries", priority: "low" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SectionHeader
        icon={<TreePine className="w-6 h-6" />}
        title="60s+ — Distribution Phase"
        subtitle="Shift from accumulating to efficiently spending down your nest egg: RMDs, Social Security optimization, Medicare, and tax-efficient withdrawal sequencing."
        accentColor="#ec4899"
      />

      <Card className="p-5 bg-card border-border">
        <p className="font-semibold text-sm mb-4 text-foreground">Retirement Income Inputs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Portfolio at Retirement</label>
              <span className="text-xs font-medium text-foreground">{fmtK(portfolio)}</span>
            </div>
            <Slider min={200000} max={5000000} step={25000} value={[portfolio]} onValueChange={([v]) => setPortfolio(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Monthly SS Benefit</label>
              <span className="text-xs font-medium text-foreground">{fmt(ssMonthly)}</span>
            </div>
            <Slider min={800} max={4900} step={50} value={[ssMonthly]} onValueChange={([v]) => setSsMonthly(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">Annual Spending Goal</label>
              <span className="text-xs font-medium text-foreground">{fmtK(spending)}</span>
            </div>
            <Slider min={30000} max={200000} step={1000} value={[spending]} onValueChange={([v]) => setSpending(v)} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs text-muted-foreground">SS Claiming Age</label>
              <span className="text-xs font-medium text-foreground">{ssClaimAge}</span>
            </div>
            <Slider min={62} max={70} step={1} value={[ssClaimAge]} onValueChange={([v]) => setSsClaimAge(v)} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard
          icon={<DollarSign className="w-4 h-4" />}
          title="4% Safe Withdrawal"
          value={fmtK(portfolioSustain) + "/yr"}
          sub={`Portfolio sustains 30 yrs historically`}
          color="text-pink-400"
        />
        <InfoCard
          icon={<AlertTriangle className="w-4 h-4" />}
          title="Estimated First RMD"
          value={fmtK(estimatedRmd)}
          sub={`At age ${rmdAge} on 60% tax-deferred`}
          color="text-amber-400"
        />
        <InfoCard
          icon={<Target className="w-4 h-4" />}
          title="Income Gap"
          value={incomeGap > 0 ? fmtK(incomeGap) + "/yr" : "Fully Funded"}
          sub={incomeGap > 0 ? "Extra withdrawal needed" : "SS + SWR covers spending"}
          color={incomeGap > 0 ? "text-red-400" : "text-emerald-400"}
        />
        <InfoCard
          icon={<Clock className="w-4 h-4" />}
          title="Portfolio Longevity"
          value={`Age ${ageAtExhaust}`}
          sub="Before potential depletion"
          color="text-primary"
        />
      </div>

      <Card className="p-5 bg-card border-border">
        <WealthChart
          data={projData}
          milestones={milestones}
          color="#ec4899"
          title="Portfolio Draw-Down — Age 60→90 (5.5% return, 4% SWR)"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChecklistCard items={checklist} />
        <Card className="p-4 bg-card border-border space-y-3">
          <p className="font-semibold text-sm text-foreground">Withdrawal Sequencing</p>
          <div className="space-y-2">
            {[
              {
                step: 1,
                account: "Taxable Brokerage",
                why: "Only capital gains taxed (not ordinary income). Use losses for tax-loss harvesting.",
                color: "bg-sky-500",
              },
              {
                step: 2,
                account: "Tax-Deferred (401k / tIRA)",
                why: "RMDs force withdrawals anyway at 73. Fill brackets strategically. Convert remainder to Roth.",
                color: "bg-amber-500",
              },
              {
                step: 3,
                account: "Roth IRA",
                why: "No RMDs. Tax-free growth. Last resort — let it compound. Pass to heirs tax-free.",
                color: "bg-emerald-500",
              },
            ].map((row) => (
              <div key={row.step} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold", row.color)}>
                  {row.step}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{row.account}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.why}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="font-semibold text-xs text-foreground mt-2">Medicare Coverage</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { part: "Part A", covers: "Hospital stays", cost: "Usually free (if 40+ work qtrs)" },
              { part: "Part B", covers: "Doctor visits, outpatient", cost: "~$185/mo (2025 standard)" },
              { part: "Part C", covers: "Medicare Advantage", cost: "Varies; bundled A+B+D" },
              { part: "Part D", covers: "Prescription drugs", cost: "~$30–80/mo + IRMAA" },
            ].map((m) => (
              <div key={m.part} className="p-2 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs font-bold text-pink-400">{m.part}</p>
                <p className="text-xs text-foreground">{m.covers}</p>
                <p className="text-xs text-muted-foreground">{m.cost}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { value: "20s", label: "20s", subtitle: "Foundation", icon: <GraduationCap className="w-4 h-4" /> },
  { value: "30s", label: "30s", subtitle: "Accumulation", icon: <Home className="w-4 h-4" /> },
  { value: "40s", label: "40s", subtitle: "Peak Earning", icon: <Briefcase className="w-4 h-4" /> },
  { value: "50s", label: "50s", subtitle: "Pre-Retirement", icon: <Calendar className="w-4 h-4" /> },
  { value: "60s", label: "60s+", subtitle: "Distribution", icon: <TreePine className="w-4 h-4" /> },
];

export default function LifeStagesPage() {
  const [tab, setTab] = useState("20s");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Life-Stage Financial Planning</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive wealth projections and action checklists from your first paycheck to retirement income.
          </p>
        </div>

        {/* Stage overview strip */}
        <div className="grid grid-cols-5 gap-2">
          {TABS.map((t, i) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center",
                tab === t.value
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-current/10 flex items-center justify-center opacity-80">
                {t.icon}
              </div>
              <span className="text-xs font-bold">{t.label}</span>
              <span className="text-xs opacity-70 hidden sm:block">{t.subtitle}</span>
              {i < TABS.length - 1 && (
                <div className="hidden" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="hidden">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} />
            ))}
          </TabsList>

          <TabsContent value="20s" className="data-[state=inactive]:hidden mt-0">
            <Tab20s />
          </TabsContent>
          <TabsContent value="30s" className="data-[state=inactive]:hidden mt-0">
            <Tab30s />
          </TabsContent>
          <TabsContent value="40s" className="data-[state=inactive]:hidden mt-0">
            <Tab40s />
          </TabsContent>
          <TabsContent value="50s" className="data-[state=inactive]:hidden mt-0">
            <Tab50s />
          </TabsContent>
          <TabsContent value="60s" className="data-[state=inactive]:hidden mt-0">
            <Tab60s />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
