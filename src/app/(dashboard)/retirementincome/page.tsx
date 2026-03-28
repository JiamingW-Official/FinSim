"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  Activity,
  Clock,
  ChevronRight,
  Landmark,
  PieChart,
  Layers,
} from "lucide-react";

// ── PRNG (seed 642008) ────────────────────────────────────────────────────────

function makeRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtDollar(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function fmtM(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtDollar(n);
}

function fmtPct(n: number, d = 1): string {
  return `${n.toFixed(d)}%`;
}

// ── Entrance animation ────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

// ── Tab 1: Safe Withdrawal Rates ──────────────────────────────────────────────

// Pre-computed Trinity-style success rates (% of 30-yr periods survived)
// rows: withdrawal rate 3% → 7%  cols: stock/bond blends
const TRINITY_DATA: Record<string, number[]> = {
  "3.0%": [100, 100, 100, 100, 100],
  "3.5%": [100, 100, 99, 98, 96],
  "4.0%": [98, 97, 95, 91, 85],
  "4.5%": [90, 88, 84, 79, 70],
  "5.0%": [78, 74, 68, 61, 52],
  "5.5%": [64, 59, 52, 44, 35],
  "6.0%": [50, 44, 38, 31, 22],
  "7.0%": [28, 23, 17, 12, 7],
};

// Success rates by retirement length for 4% rule at 60/40 blend
const SWR_BY_LENGTH = [
  { years: 20, rate75: 98, rate60: 96, rate100: 100 },
  { years: 25, rate75: 96, rate60: 93, rate100: 99 },
  { years: 30, rate75: 95, rate60: 91, rate100: 97 },
  { years: 35, rate75: 90, rate60: 85, rate100: 94 },
];

function SWRChart() {
  const W = 520;
  const H = 200;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const rates = Object.keys(TRINITY_DATA);
  const blendIdx = 2; // 60/40 blend column
  const values = rates.map((r) => TRINITY_DATA[r][blendIdx]);

  const xStep = chartW / (rates.length - 1);

  const toY = (v: number) => padT + chartH - (v / 100) * chartH;
  const toX = (i: number) => padL + i * xStep;

  const polyline = values
    .map((v, i) => `${toX(i)},${toY(v)}`)
    .join(" ");

  const area = [
    `${toX(0)},${padT + chartH}`,
    ...values.map((v, i) => `${toX(i)},${toY(v)}`),
    `${toX(values.length - 1)},${padT + chartH}`,
  ].join(" ");

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="swr-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={padL}
            y1={toY(t)}
            x2={W - padR}
            y2={toY(t)}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text x={padL - 6} y={toY(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {t}%
          </text>
        </g>
      ))}
      {/* Safe zone band */}
      <rect
        x={padL}
        y={toY(95)}
        width={chartW}
        height={toY(80) - toY(95)}
        fill="#22c55e"
        opacity="0.06"
      />
      <text x={padL + 4} y={toY(95) + 12} fontSize="9" fill="#22c55e" opacity="0.8">
        Safe zone (≥95%)
      </text>
      {/* Area */}
      <polygon points={area} fill="url(#swr-grad)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      {/* Dots */}
      {values.map((v, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(v)}
          r="4"
          fill={v >= 90 ? "#22c55e" : v >= 70 ? "#f59e0b" : "#ef4444"}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      ))}
      {/* X labels */}
      {rates.map((r, i) => (
        <text
          key={r}
          x={toX(i)}
          y={H - 8}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          {r}
        </text>
      ))}
      <text x={W / 2} y={H - 0} textAnchor="middle" fontSize="9" fill="#64748b">
        Withdrawal Rate (60/40 Portfolio, 30 Years)
      </text>
    </svg>
  );
}

function SafeWithdrawalTab() {
  const [retireLen, setRetireLen] = useState(30);
  const [swrPct, setSwrPct] = useState(4.0);
  const [portfolioSize, setPortfolioSize] = useState(1_000_000);

  const annualWithdrawal = portfolioSize * (swrPct / 100);
  const monthlyWithdrawal = annualWithdrawal / 12;

  const currentRow = SWR_BY_LENGTH.find((r) => r.years === retireLen) ?? SWR_BY_LENGTH[2];
  const successRate = currentRow.rate60; // using 60/40 as default

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <DollarSign className="w-4 h-4" />
              Portfolio Size
            </div>
            <p className="text-2xl font-bold text-white">{fmtM(portfolioSize)}</p>
            <Slider
              value={[portfolioSize]}
              min={200_000}
              max={3_000_000}
              step={50_000}
              onValueChange={([v]) => setPortfolioSize(v)}
              className="mt-1"
            />
            <p className="text-xs text-slate-500">$200K – $3M</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Activity className="w-4 h-4" />
              Withdrawal Rate
            </div>
            <p className="text-2xl font-bold text-white">{fmtPct(swrPct)}</p>
            <Slider
              value={[swrPct * 10]}
              min={25}
              max={70}
              step={5}
              onValueChange={([v]) => setSwrPct(v / 10)}
              className="mt-1"
            />
            <p className="text-xs text-slate-500">2.5% – 7.0%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              Retirement Length
            </div>
            <p className="text-2xl font-bold text-white">{retireLen} yrs</p>
            <Slider
              value={[retireLen]}
              min={20}
              max={35}
              step={5}
              onValueChange={([v]) => setRetireLen(v)}
              className="mt-1"
            />
            <p className="text-xs text-slate-500">20 – 35 years</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Projected Withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Annual withdrawal</span>
              <span className="text-white font-semibold">{fmtDollar(annualWithdrawal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Monthly withdrawal</span>
              <span className="text-white font-semibold">{fmtDollar(monthlyWithdrawal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Historical success rate</span>
              <Badge className={successRate >= 90 ? "bg-green-500/20 text-green-400" : successRate >= 75 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}>
                {successRate}%
              </Badge>
            </div>
            <Progress value={successRate} className="h-2" />
            <p className="text-xs text-slate-500">
              Based on rolling historical periods. Past results do not guarantee future performance.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Success Rate by Length (4% Rule)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SWR_BY_LENGTH.map((row) => (
              <div key={row.years} className={`flex items-center gap-3 p-2 rounded-lg ${retireLen === row.years ? "bg-blue-500/10 border border-blue-500/30" : ""}`}>
                <span className="text-slate-400 w-16 text-sm">{row.years} yrs</span>
                <div className="flex-1">
                  <Progress value={row.rate60} className="h-1.5" />
                </div>
                <Badge className="bg-slate-700 text-slate-300 text-xs">{row.rate60}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Historical Success Rates by Withdrawal Rate (60/40 Portfolio)</CardTitle>
        </CardHeader>
        <CardContent>
          <SWRChart />
        </CardContent>
      </Card>

      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">The Trinity Study — Key Findings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="space-y-2">
            <p className="font-semibold text-white">Origins (1998)</p>
            <p>Professors Cooley, Hubbard, and Walz at Trinity University analyzed rolling historical 30-year periods from 1926–1995 using US stock and bond returns.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white">The 4% Rule</p>
            <p>Withdraw 4% of portfolio in year one, then adjust for inflation annually. A 60/40 portfolio had a 95%+ success rate over 30 years historically.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white">Limitations</p>
            <p>Based on US historical returns. Lower expected returns today may reduce success rates. Sequence of returns risk is not fully captured.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-white">Modern Guidance</p>
            <p>Many planners now recommend 3.3%–3.5% for 40+ year retirements, or using dynamic spending rules to adjust withdrawals in down markets.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab 2: Income Sources ─────────────────────────────────────────────────────

function IncomeStackedBar({ ss, pension, portfolio, annuity }: { ss: number; pension: number; portfolio: number; annuity: number }) {
  const total = ss + pension + portfolio + annuity;
  const W = 500;
  const H = 60;
  const barH = 36;
  const barY = (H - barH) / 2;

  const segments = [
    { value: ss, color: "#22c55e", label: "Social Security" },
    { value: pension, color: "#3b82f6", label: "Pension" },
    { value: annuity, color: "#a855f7", label: "Annuity" },
    { value: portfolio, color: "#f59e0b", label: "Portfolio" },
  ];

  let x = 0;
  const rects = segments.map((seg) => {
    const w = total > 0 ? (seg.value / total) * W : 0;
    const rect = { x, w, ...seg };
    x += w;
    return rect;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded overflow-hidden">
      {rects.map((r) =>
        r.w > 0 ? (
          <g key={r.label}>
            <rect x={r.x} y={barY} width={r.w} height={barH} fill={r.color} opacity="0.85" rx={r.x === 0 ? 4 : 0} />
            {r.w > 40 && (
              <text x={r.x + r.w / 2} y={barY + barH / 2 + 4} textAnchor="middle" fontSize="11" fill="#0f172a" fontWeight="600">
                {Math.round((r.value / total) * 100)}%
              </text>
            )}
          </g>
        ) : null
      )}
    </svg>
  );
}

function IncomeSourcesTab() {
  const [ssAge, setSsAge] = useState(67);
  const [ssEarnings, setSsEarnings] = useState(75_000);
  const [pensionMonthly, setPensionMonthly] = useState(1_200);
  const [portfolioVal, setPortfolioVal] = useState(800_000);
  const [annuityPremium, setAnnuityPremium] = useState(200_000);

  // Social Security benefit estimation (simplified)
  const baseSSBenefit = ssEarnings * 0.0155; // ~monthly benefit at FRA
  const ssAdjustment = ssAge === 62 ? 0.7 : ssAge === 67 ? 1.0 : ssAge === 70 ? 1.24 : 1.0;
  const ssMonthly = baseSSBenefit * ssAdjustment;
  const ssAnnual = ssMonthly * 12;

  const pensionAnnual = pensionMonthly * 12;
  const portfolioWithdrawal = portfolioVal * 0.04; // 4% rule
  const annuityPayout = annuityPremium * 0.06; // ~6% payout rate for immediate annuity

  const totalAnnual = ssAnnual + pensionAnnual + portfolioWithdrawal + annuityPayout;
  const incomeFloor = ssAnnual + pensionAnnual + annuityPayout; // guaranteed

  const floorPct = totalAnnual > 0 ? (incomeFloor / totalAnnual) * 100 : 0;

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Social Security */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-green-400" />
              <CardTitle className="text-base text-white">Social Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Claiming age</span>
                <span className="text-white font-semibold">{ssAge}</span>
              </div>
              <Slider value={[ssAge]} min={62} max={70} step={1} onValueChange={([v]) => setSsAge(v)} />
              <div className="flex justify-between text-xs text-slate-500">
                <span>62 (early)</span>
                <span>67 (FRA)</span>
                <span>70 (max)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Avg annual earnings</span>
                <span className="text-white font-semibold">{fmtM(ssEarnings)}</span>
              </div>
              <Slider value={[ssEarnings]} min={30_000} max={150_000} step={5_000} onValueChange={([v]) => setSsEarnings(v)} />
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-xs text-green-400">Estimated monthly benefit</p>
              <p className="text-xl font-bold text-green-300">{fmtDollar(ssMonthly)}/mo</p>
              <p className="text-xs text-slate-500 mt-1">
                {ssAge < 67 ? `${Math.round((1 - ssAdjustment) * 100)}% reduction for early claiming` : ssAge > 67 ? `${Math.round((ssAdjustment - 1) * 100)}% delayed retirement credits` : "Full Retirement Age benefit"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pension & Portfolio */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <CardTitle className="text-base text-white">Pension & Portfolio</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Monthly pension</span>
                <span className="text-white font-semibold">{fmtDollar(pensionMonthly)}</span>
              </div>
              <Slider value={[pensionMonthly]} min={0} max={5_000} step={100} onValueChange={([v]) => setPensionMonthly(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Investment portfolio</span>
                <span className="text-white font-semibold">{fmtM(portfolioVal)}</span>
              </div>
              <Slider value={[portfolioVal]} min={0} max={3_000_000} step={50_000} onValueChange={([v]) => setPortfolioVal(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Annuity premium</span>
                <span className="text-white font-semibold">{fmtM(annuityPremium)}</span>
              </div>
              <Slider value={[annuityPremium]} min={0} max={500_000} step={25_000} onValueChange={([v]) => setAnnuityPremium(v)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Total Retirement Income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <IncomeStackedBar ss={ssAnnual} pension={pensionAnnual} portfolio={portfolioWithdrawal} annuity={annuityPayout} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {[
              { label: "Social Security", value: ssAnnual, color: "text-green-400" },
              { label: "Pension", value: pensionAnnual, color: "text-blue-400" },
              { label: "Annuity", value: annuityPayout, color: "text-purple-400" },
              { label: "Portfolio (4%)", value: portfolioWithdrawal, color: "text-amber-400" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className={`text-base font-bold ${item.color}`}>{fmtM(item.value)}/yr</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div>
              <p className="text-sm text-slate-400">Total annual income</p>
              <p className="text-2xl font-bold text-white">{fmtM(totalAnnual)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Guaranteed income floor</p>
              <p className="text-lg font-semibold text-green-400">{fmtM(incomeFloor)}</p>
              <p className="text-xs text-slate-500">{fmtPct(floorPct)} of total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Floor Strategy */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Income Floor vs. Upside Strategy</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <p className="font-semibold text-white">Income Floor (Essential Needs)</p>
            </div>
            <p>Cover all essential expenses with guaranteed, inflation-protected income — Social Security, pension, and fixed annuities. This floor never runs out regardless of market conditions.</p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li><ChevronRight className="inline w-3 h-3 mr-1" />Housing, food, healthcare, utilities</li>
              <li><ChevronRight className="inline w-3 h-3 mr-1" />Must be fully covered by guaranteed sources</li>
              <li><ChevronRight className="inline w-3 h-3 mr-1" />Not exposed to market risk</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <p className="font-semibold text-white">Upside Portfolio (Discretionary)</p>
            </div>
            <p>Invest remaining assets for growth. Use portfolio withdrawals for travel, gifts, luxury spending. Accept market volatility since essential needs are already covered.</p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li><ChevronRight className="inline w-3 h-3 mr-1" />Travel, dining, hobbies, gifts</li>
              <li><ChevronRight className="inline w-3 h-3 mr-1" />Can tolerate market downturns</li>
              <li><ChevronRight className="inline w-3 h-3 mr-1" />Opportunity for legacy wealth</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab 3: Sequence of Returns Risk ──────────────────────────────────────────

interface SequencePath {
  label: string;
  color: string;
  balances: number[];
}

function computeSequencePaths(
  initialBalance: number,
  annualWithdrawal: number,
  years: number
): SequencePath[] {
  // Good sequence: positive returns early
  const goodReturns = [
    0.18, 0.14, 0.12, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03,
    0.02, -0.02, -0.04, -0.06, -0.08, 0.04, 0.05, 0.06, 0.07, 0.08,
    0.09, 0.10, 0.08, 0.07, 0.06, 0.05, 0.04, 0.04, 0.03, 0.03,
  ];
  // Bad sequence: losses early
  const badReturns = [
    -0.08, -0.06, -0.04, -0.02, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07,
    0.08, 0.09, 0.10, 0.12, 0.14, 0.18, 0.09, 0.08, 0.07, 0.06,
    0.05, 0.04, 0.03, 0.02, 0.01, 0.02, 0.03, 0.03, 0.04, 0.04,
  ];

  const computeBalances = (returns: number[]) => {
    const bals: number[] = [initialBalance];
    let b = initialBalance;
    for (let i = 0; i < years; i++) {
      b = Math.max(0, (b - annualWithdrawal) * (1 + (returns[i] ?? 0.05)));
      bals.push(b);
    }
    return bals;
  };

  return [
    { label: "Good Sequence (Bull start)", color: "#22c55e", balances: computeBalances(goodReturns.slice(0, years)) },
    { label: "Bad Sequence (Bear start)", color: "#ef4444", balances: computeBalances(badReturns.slice(0, years)) },
  ];
}

function SequenceChart({ paths, years }: { paths: SequencePath[]; years: number }) {
  const W = 520;
  const H = 220;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allVals = paths.flatMap((p) => p.balances);
  const maxVal = Math.max(...allVals);
  const minVal = 0;

  const toX = (i: number) => padL + (i / years) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minVal) / (maxVal - minVal || 1)) * chartH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => minVal + f * (maxVal - minVal));
  const xTicks = [0, 5, 10, 15, 20, 25, 30].filter((t) => t <= years);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={W - padR} y2={toY(t)} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <text x={padL - 6} y={toY(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {fmtM(t)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={toX(t)} y1={padT} x2={toX(t)} y2={padT + chartH} stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
          <text x={toX(t)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
            Yr {t}
          </text>
        </g>
      ))}
      {/* Paths */}
      {paths.map((path) => {
        const points = path.balances.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        return (
          <g key={path.label}>
            <polyline points={points} fill="none" stroke={path.color} strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx={toX(path.balances.length - 1)} cy={toY(path.balances[path.balances.length - 1])} r="4" fill={path.color} stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );
      })}
      {/* Legend */}
      {paths.map((path, i) => (
        <g key={path.label} transform={`translate(${padL + i * 200}, ${padT + 4})`}>
          <rect width="12" height="3" y="-1.5" fill={path.color} rx="1.5" />
          <text x="16" y="4" fontSize="10" fill="#cbd5e1">{path.label}</text>
        </g>
      ))}
    </svg>
  );
}

function SequenceRiskTab() {
  const [portfolioSize, setPortfolioSize] = useState(1_000_000);
  const [withdrawalPct, setWithdrawalPct] = useState(4);
  const [yearsLen, setYearsLen] = useState(30);

  const annualWithdrawal = portfolioSize * (withdrawalPct / 100);
  const paths = useMemo(
    () => computeSequencePaths(portfolioSize, annualWithdrawal, yearsLen),
    [portfolioSize, annualWithdrawal, yearsLen]
  );

  const goodFinal = paths[0].balances[paths[0].balances.length - 1];
  const badFinal = paths[1].balances[paths[1].balances.length - 1];
  const difference = goodFinal - badFinal;

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <p className="text-slate-400 text-sm">Starting Portfolio</p>
            <p className="text-2xl font-bold text-white">{fmtM(portfolioSize)}</p>
            <Slider value={[portfolioSize]} min={200_000} max={3_000_000} step={50_000} onValueChange={([v]) => setPortfolioSize(v)} />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <p className="text-slate-400 text-sm">Withdrawal Rate</p>
            <p className="text-2xl font-bold text-white">{withdrawalPct}%</p>
            <Slider value={[withdrawalPct * 10]} min={30} max={60} step={5} onValueChange={([v]) => setWithdrawalPct(v / 10)} />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <p className="text-slate-400 text-sm">Retirement Length</p>
            <p className="text-2xl font-bold text-white">{yearsLen} yrs</p>
            <Slider value={[yearsLen]} min={20} max={30} step={5} onValueChange={([v]) => setYearsLen(v)} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Same Returns, Different Sequence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">Both portfolios have identical average annual returns — only the order differs. Early losses devastate the retiree drawing down assets.</p>
          <SequenceChart paths={paths} years={yearsLen} />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-green-400">Good Sequence Final</p>
              <p className="text-lg font-bold text-green-300">{fmtM(goodFinal)}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">Difference</p>
              <p className="text-lg font-bold text-white">{fmtM(difference)}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-red-400">Bad Sequence Final</p>
              <p className="text-lg font-bold text-red-300">{badFinal <= 0 ? "Depleted" : fmtM(badFinal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Mitigation Strategies</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            {
              icon: <Shield className="w-4 h-4 text-green-400" />,
              title: "Cash Buffer / Bucket Strategy",
              desc: "Keep 1–2 years of expenses in cash. Draw from cash during downturns, allowing the portfolio to recover. Refill cash when markets recover.",
            },
            {
              icon: <TrendingDown className="w-4 h-4 text-blue-400" />,
              title: "Reduce Withdrawals in Down Years",
              desc: "Guardrails and dynamic spending rules cut withdrawals by 10% when the portfolio drops to critical levels. Small cuts prevent catastrophic depletion.",
            },
            {
              icon: <Landmark className="w-4 h-4 text-purple-400" />,
              title: "Delay Social Security",
              desc: "Work part-time or use savings early; delay SS to age 70. Guaranteed 8%/year credits reduce dependence on the portfolio in volatile early years.",
            },
            {
              icon: <PieChart className="w-4 h-4 text-amber-400" />,
              title: "Bond Tent / Rising Equity Glide Path",
              desc: "Enter retirement with 40–50% bonds, then slowly increase equities. Higher bonds in early years reduce sequence risk when withdrawals matter most.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 bg-slate-900/50 rounded-lg">
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div>
                <p className="font-semibold text-white mb-1">{item.title}</p>
                <p className="text-slate-400 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Tab 4: Withdrawal Strategies ──────────────────────────────────────────────

interface Strategy {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  badge: string;
  badgeColor: string;
}

const STRATEGIES: Strategy[] = [
  {
    name: "Fixed Dollar",
    description: "Withdraw a fixed dollar amount each year, adjusted for inflation annually.",
    pros: ["Simple and predictable", "Easy budgeting", "Stable lifestyle"],
    cons: ["Ignores portfolio performance", "High depletion risk in prolonged downturns", "Overly rigid"],
    bestFor: "Retirees with strong guaranteed income floor covering basic needs",
    badge: "Simple",
    badgeColor: "bg-blue-500/20 text-blue-400",
  },
  {
    name: "Fixed Percentage",
    description: "Withdraw a fixed % of portfolio value each year (e.g. 4%). Amount fluctuates.",
    pros: ["Portfolio never fully depleted", "Withdrawals shrink automatically in bad years", "Adapts to growth"],
    cons: ["Variable income creates budgeting challenges", "May cut spending when market falls", "Requires discipline"],
    bestFor: "Flexible retirees comfortable with variable spending",
    badge: "Adaptive",
    badgeColor: "bg-green-500/20 text-green-400",
  },
  {
    name: "Guardrails (Kitces)",
    description: "Start at 5.5%. Cut 10% when ratio hits 6%+; boost 10% when ratio drops to 4%. Stay within bounds.",
    pros: ["Higher initial rate than 4% rule", "Automatic adjustments preserve longevity", "Research-backed"],
    cons: ["Requires annual monitoring", "Spending cuts can be stressful", "More complex to implement"],
    bestFor: "Retirees who want higher income with a systematic safety net",
    badge: "Recommended",
    badgeColor: "bg-purple-500/20 text-purple-400",
  },
  {
    name: "Guyton-Klinger Dynamic",
    description: "Three decision rules: Prosperity Rule (boost when up >20%), Withdrawal Rule (skip inflation adj. after bad year), Capital Preservation Rule (cut 10% if portfolio ratio exceeds ceiling).",
    pros: ["Maximizes sustainable spending", "Evidence-based framework", "Built-in flexibility"],
    cons: ["Complex; requires tracking multiple rules", "Spending can vary significantly year-to-year", "Not intuitive for non-planners"],
    bestFor: "Financially sophisticated retirees or those working with a financial planner",
    badge: "Advanced",
    badgeColor: "bg-amber-500/20 text-amber-400",
  },
];

function WithdrawalStrategiesTab() {
  const [selected, setSelected] = useState(0);
  const [portfolioSize, setPortfolioSize] = useState(1_000_000);
  const [selectedPct, setSelectedPct] = useState(4.5);

  const strategy = STRATEGIES[selected];
  const annualAmount = portfolioSize * (selectedPct / 100);
  const monthlyAmount = annualAmount / 12;

  const comparisonData = [
    { label: "Fixed Dollar", rate: 4.0, predictability: 10, longevity: 6, flexibility: 2 },
    { label: "Fixed %", rate: 4.5, predictability: 5, longevity: 9, flexibility: 8 },
    { label: "Guardrails", rate: 5.5, predictability: 7, longevity: 8, flexibility: 7 },
    { label: "GK Dynamic", rate: 6.0, predictability: 4, longevity: 9, flexibility: 10 },
  ];

  return (
    <motion.div {...fadeUp} className="space-y-6">
      {/* Strategy Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STRATEGIES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setSelected(i)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selected === i
                ? "border-blue-500 bg-blue-500/10"
                : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
            }`}
          >
            <Badge className={`text-xs mb-2 ${s.badgeColor}`}>{s.badge}</Badge>
            <p className="text-sm font-semibold text-white">{s.name}</p>
          </button>
        ))}
      </div>

      {/* Selected Strategy Detail */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white">{strategy.name}</CardTitle>
            <Badge className={strategy.badgeColor}>{strategy.badge}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 text-sm">{strategy.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-green-400 font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" />Pros</p>
              <ul className="space-y-1">
                {strategy.pros.map((p) => (
                  <li key={p} className="text-slate-300 text-xs flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">+</span>{p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />Cons
              </p>
              <ul className="space-y-1">
                {strategy.cons.map((c) => (
                  <li key={c} className="text-slate-300 text-xs flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">-</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-400">Best for</p>
            <p className="text-sm text-slate-300">{strategy.bestFor}</p>
          </div>
        </CardContent>
      </Card>

      {/* Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Strategy Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Portfolio size</span>
                <span className="text-white">{fmtM(portfolioSize)}</span>
              </div>
              <Slider value={[portfolioSize]} min={200_000} max={3_000_000} step={50_000} onValueChange={([v]) => setPortfolioSize(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Withdrawal rate</span>
                <span className="text-white">{fmtPct(selectedPct)}</span>
              </div>
              <Slider value={[selectedPct * 10]} min={30} max={70} step={5} onValueChange={([v]) => setSelectedPct(v / 10)} />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Annual withdrawal</span>
                <span className="text-white font-bold">{fmtDollar(annualAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Monthly income</span>
                <span className="text-white font-bold">{fmtDollar(monthlyAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Strategy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">{row.label}</span>
                    <span className="text-slate-500">Initial rate: {row.rate}%</span>
                  </div>
                  <div className="flex gap-1.5 text-xs text-slate-500">
                    <span className="w-20">Stability</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${row.predictability * 10}%` }} className="h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 text-xs text-slate-500">
                    <span className="w-20">Longevity</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${row.longevity * 10}%` }} className="h-full bg-green-500 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 text-xs text-slate-500">
                    <span className="w-20">Flexibility</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${row.flexibility * 10}%` }} className="h-full bg-amber-500 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// ── Tab 5: Portfolio Longevity (Monte Carlo Fan Chart) ────────────────────────

interface MonteCarloPath {
  percentile: string;
  color: string;
  opacity: number;
  values: number[];
}

function computeMonteCarloPaths(
  initial: number,
  withdrawal: number,
  years: number
): MonteCarloPath[] {
  const rand = makeRand(642008);

  // Run simulated paths and pick percentile outcomes
  const numSims = 200;
  const finalValues: { final: number; values: number[] }[] = [];

  for (let sim = 0; sim < numSims; sim++) {
    const vals: number[] = [initial];
    let b = initial;
    for (let y = 0; y < years; y++) {
      const mu = 0.065; // 6.5% expected return
      const sigma = 0.14; // 14% volatility
      // Box-Muller
      const u1 = rand();
      const u2 = rand();
      const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
      const r = mu + sigma * z;
      b = Math.max(0, (b - withdrawal) * (1 + r));
      vals.push(b);
    }
    finalValues.push({ final: vals[vals.length - 1], values: vals });
  }

  finalValues.sort((a, b) => a.final - b.final);

  const p10 = finalValues[Math.floor(numSims * 0.1)];
  const p25 = finalValues[Math.floor(numSims * 0.25)];
  const p50 = finalValues[Math.floor(numSims * 0.5)];
  const p75 = finalValues[Math.floor(numSims * 0.75)];
  const p90 = finalValues[Math.floor(numSims * 0.9)];

  return [
    { percentile: "90th", color: "#22c55e", opacity: 0.6, values: p90.values },
    { percentile: "75th", color: "#4ade80", opacity: 0.4, values: p75.values },
    { percentile: "50th (Median)", color: "#3b82f6", opacity: 1.0, values: p50.values },
    { percentile: "25th", color: "#f97316", opacity: 0.4, values: p25.values },
    { percentile: "10th", color: "#ef4444", opacity: 0.6, values: p10.values },
  ];
}

function FanChart({ paths, years }: { paths: MonteCarloPath[]; years: number }) {
  const W = 540;
  const H = 240;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allVals = paths.flatMap((p) => p.values);
  const maxVal = Math.max(...allVals);
  const minVal = 0;

  const toX = (i: number) => padL + (i / years) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minVal) / (maxVal - minVal || 1)) * chartH;

  const yTicks = [0, 0.33, 0.66, 1].map((f) => minVal + f * (maxVal - minVal));
  const xTicks = Array.from({ length: Math.floor(years / 5) + 1 }, (_, i) => i * 5).filter((t) => t <= years);

  // Fan fill between p10 and p90
  const p10 = paths.find((p) => p.percentile === "10th")!;
  const p90 = paths.find((p) => p.percentile === "90th")!;

  const fanTopPoints = p90.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const fanBotPoints = [...p10.values].reverse().map((v, i) => {
    const idx = p10.values.length - 1 - i;
    return `${toX(idx)},${toY(v)}`;
  }).join(" ");

  const fanPoly = `${fanTopPoints} ${fanBotPoints}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="fan-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={toY(t)} x2={W - padR} y2={toY(t)} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <text x={padL - 6} y={toY(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {fmtM(t)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={toX(t)} y1={padT} x2={toX(t)} y2={padT + chartH} stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />
          <text x={toX(t)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
            Yr {t}
          </text>
        </g>
      ))}
      {/* Fan polygon */}
      <polygon points={fanPoly} fill="url(#fan-grad)" />
      {/* Individual paths */}
      {paths.map((path) => {
        const pts = path.values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        return (
          <polyline
            key={path.percentile}
            points={pts}
            fill="none"
            stroke={path.color}
            strokeWidth={path.percentile.includes("50th") ? 2.5 : 1.5}
            strokeOpacity={path.opacity}
            strokeLinejoin="round"
            strokeDasharray={path.percentile.includes("50th") ? "none" : "4 2"}
          />
        );
      })}
      {/* Legend */}
      {paths.filter((_, i) => i % 2 === 0).map((path, i) => (
        <g key={path.percentile} transform={`translate(${padL + i * 120}, ${padT})`}>
          <rect width="12" height="3" y="-1.5" fill={path.color} rx="1.5" opacity={path.opacity} />
          <text x="16" y="4" fontSize="9" fill="#cbd5e1">{path.percentile} pct</text>
        </g>
      ))}
    </svg>
  );
}

function PortfolioLongevityTab() {
  const [startAge, setStartAge] = useState(65);
  const [portfolioSize, setPortfolioSize] = useState(1_000_000);
  const [withdrawalRate, setWithdrawalRate] = useState(4.0);

  const targetAge = 95;
  const years = targetAge - startAge;
  const annualWithdrawal = portfolioSize * (withdrawalRate / 100);

  const paths = useMemo(
    () => computeMonteCarloPaths(portfolioSize, annualWithdrawal, years),
    [portfolioSize, annualWithdrawal, years]
  );

  const medianPath = paths.find((p) => p.percentile === "50th (Median)")!;
  const p10Path = paths.find((p) => p.percentile === "10th")!;
  const p90Path = paths.find((p) => p.percentile === "90th")!;

  const medianFinal = medianPath.values[medianPath.values.length - 1];
  const p10Final = p10Path.values[p10Path.values.length - 1];
  const p90Final = p90Path.values[p90Path.values.length - 1];

  // Survival probability: % of simulated paths that don't hit 0
  const survivalPct = Math.round(
    (paths.filter((p) => p.values[p.values.length - 1] > 0).length / paths.length) * 100
  );

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <p className="text-slate-400 text-sm">Retirement Age</p>
            <p className="text-2xl font-bold text-white">{startAge}</p>
            <Slider value={[startAge]} min={55} max={75} step={1} onValueChange={([v]) => setStartAge(v)} />
            <p className="text-xs text-slate-500">Planning to age 95 ({years} yrs)</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <p className="text-slate-400 text-sm">Portfolio Size</p>
            <p className="text-2xl font-bold text-white">{fmtM(portfolioSize)}</p>
            <Slider value={[portfolioSize]} min={200_000} max={3_000_000} step={50_000} onValueChange={([v]) => setPortfolioSize(v)} />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="pt-5 space-y-3">
            <p className="text-slate-400 text-sm">Withdrawal Rate</p>
            <p className="text-2xl font-bold text-white">{fmtPct(withdrawalRate)}</p>
            <Slider value={[withdrawalRate * 10]} min={25} max={70} step={5} onValueChange={([v]) => setWithdrawalRate(v / 10)} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white">Monte Carlo Portfolio Longevity Fan Chart</CardTitle>
            <Badge className="bg-blue-500/20 text-blue-400">200 Simulations</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            Shaded band shows the range of possible outcomes from age {startAge} to 95, based on 200 simulated market scenarios using 6.5% expected return and 14% annual volatility.
          </p>
          <FanChart paths={paths} years={years} />
        </CardContent>
      </Card>

      {/* Outcome Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border ${survivalPct >= 85 ? "bg-green-500/10 border-green-500/30" : survivalPct >= 70 ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"}`}>
          <CardContent className="pt-5 text-center">
            <p className={`text-3xl font-bold ${survivalPct >= 85 ? "text-green-400" : survivalPct >= 70 ? "text-amber-400" : "text-red-400"}`}>{survivalPct}%</p>
            <p className="text-slate-400 text-sm mt-1">Survival to Age 95</p>
            <Progress value={survivalPct} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border border-green-500/20">
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-bold text-green-400">{fmtM(p90Final)}</p>
            <p className="text-slate-400 text-sm mt-1">Best Case (90th pct)</p>
            <p className="text-xs text-slate-500 mt-1">Age 95 balance</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border border-blue-500/20">
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-bold text-blue-400">{fmtM(medianFinal)}</p>
            <p className="text-slate-400 text-sm mt-1">Median Outcome</p>
            <p className="text-xs text-slate-500 mt-1">Age 95 balance</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border border-red-500/20">
          <CardContent className="pt-5 text-center">
            <p className="text-2xl font-bold text-red-400">{p10Final <= 0 ? "$0" : fmtM(p10Final)}</p>
            <p className="text-slate-400 text-sm mt-1">Worst Case (10th pct)</p>
            <p className="text-xs text-slate-500 mt-1">Age 95 balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Longevity Planning Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            {
              icon: <Info className="w-4 h-4 text-blue-400" />,
              title: "Life Expectancy Risk",
              desc: `A 65-year-old couple has a 50% chance one partner lives to 92. Plan for age 95+ to be safe — running out at 88 is a real risk.`,
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-green-400" />,
              title: "Inflation Erosion",
              desc: "At 3% inflation, your purchasing power halves in 23 years. A $60K/year lifestyle in 2026 requires $116K in 2049. Always inflation-adjust projections.",
            },
            {
              icon: <Activity className="w-4 h-4 text-amber-400" />,
              title: "Healthcare Surge",
              desc: "Healthcare costs rise ~5% per year and surge in the final years. Model an extra $200K–$400K in late-life care as a separate budget item.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 bg-slate-900/50 rounded-lg">
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div>
                <p className="font-semibold text-white mb-1">{item.title}</p>
                <p className="text-slate-400 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export default function RetirementIncomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div {...fadeUp} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Retirement Income Planning</h1>
            <p className="text-slate-400 text-sm">Decumulation strategies, withdrawal rates, and portfolio longevity</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { icon: <Shield className="w-3 h-3" />, label: "Trinity Study" },
            { icon: <Layers className="w-3 h-3" />, label: "Income Buckets" },
            { icon: <Activity className="w-3 h-3" />, label: "Sequence Risk" },
            { icon: <TrendingUp className="w-3 h-3" />, label: "Monte Carlo" },
          ].map((tag) => (
            <Badge key={tag.label} className="bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 text-xs">
              {tag.icon}
              {tag.label}
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="swr" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="swr" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-sm">
            Safe Withdrawal
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-sm">
            Income Sources
          </TabsTrigger>
          <TabsTrigger value="sequence" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-sm">
            Sequence Risk
          </TabsTrigger>
          <TabsTrigger value="strategies" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-sm">
            Withdrawal Strategies
          </TabsTrigger>
          <TabsTrigger value="longevity" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 text-sm">
            Portfolio Longevity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swr" className="data-[state=inactive]:hidden">
          <SafeWithdrawalTab />
        </TabsContent>
        <TabsContent value="income" className="data-[state=inactive]:hidden">
          <IncomeSourcesTab />
        </TabsContent>
        <TabsContent value="sequence" className="data-[state=inactive]:hidden">
          <SequenceRiskTab />
        </TabsContent>
        <TabsContent value="strategies" className="data-[state=inactive]:hidden">
          <WithdrawalStrategiesTab />
        </TabsContent>
        <TabsContent value="longevity" className="data-[state=inactive]:hidden">
          <PortfolioLongevityTab />
        </TabsContent>
      </Tabs>

      {/* Disclaimer */}
      <motion.div {...fadeUp} className="border border-slate-700 bg-slate-800/40 rounded-lg p-4 text-xs text-slate-500 flex gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
        <p>
          All projections are for educational purposes only and are based on historical data or simulated scenarios. They do not constitute financial advice. Past performance does not guarantee future results. Consult a qualified financial planner before making retirement income decisions.
        </p>
      </motion.div>
    </div>
  );
}
