"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Info,
  Target,
  PieChart,
  Zap,
  Scale,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Seeded PRNG (seed = 662005)
// ---------------------------------------------------------------------------
let s = 662005;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Deterministic helpers
function seededRange(min: number, max: number) {
  return min + rand() * (max - min);
}

// ---------------------------------------------------------------------------
// Portfolio positions data
// ---------------------------------------------------------------------------
interface Position {
  ticker: string;
  name: string;
  weight: number; // %
  beta: number;
  vol: number; // annualised %
  sector: string;
}

const POSITIONS: Position[] = [
  { ticker: "AAPL", name: "Apple Inc.", weight: 18.4, beta: 1.21, vol: 28.3, sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft Corp.", weight: 16.2, beta: 0.98, vol: 24.1, sector: "Technology" },
  { ticker: "AMZN", name: "Amazon.com Inc.", weight: 12.7, beta: 1.34, vol: 32.6, sector: "Consumer Disc." },
  { ticker: "GOOGL", name: "Alphabet Inc.", weight: 10.5, beta: 1.05, vol: 26.8, sector: "Communication" },
  { ticker: "JPM", name: "JPMorgan Chase", weight: 8.3, beta: 1.18, vol: 22.4, sector: "Financials" },
  { ticker: "UNH", name: "UnitedHealth Group", weight: 7.6, beta: 0.72, vol: 18.9, sector: "Healthcare" },
  { ticker: "XOM", name: "Exxon Mobil", weight: 6.4, beta: 0.89, vol: 21.7, sector: "Energy" },
  { ticker: "JNJ", name: "Johnson & Johnson", weight: 5.8, beta: 0.58, vol: 14.2, sector: "Healthcare" },
  { ticker: "BRK.B", name: "Berkshire Hathaway", weight: 4.9, beta: 0.82, vol: 17.6, sector: "Financials" },
  { ticker: "GLD", name: "Gold ETF", weight: 9.2, beta: -0.05, vol: 13.8, sector: "Commodities" },
];

// ---------------------------------------------------------------------------
// Tab 1: Risk Decomposition data
// ---------------------------------------------------------------------------
interface FactorRisk {
  factor: string;
  contribution: number; // % of total risk
  color: string;
}

const FACTOR_RISKS: FactorRisk[] = [
  { factor: "Market", contribution: 41.2, color: "#6366f1" },
  { factor: "Size", contribution: 12.8, color: "#8b5cf6" },
  { factor: "Value", contribution: 9.4, color: "#a78bfa" },
  { factor: "Momentum", contribution: 14.6, color: "#7c3aed" },
  { factor: "Quality", contribution: 7.3, color: "#4f46e5" },
  { factor: "Idiosyncratic", contribution: 14.7, color: "#374151" },
];

const SYSTEMATIC_RISK = 85.3; // %
const IDIOSYNCRATIC_RISK = 14.7;
const PORTFOLIO_VOL = 17.8; // annualised %
const TRACKING_ERROR = 4.2;
const BETA = 1.04;

// ---------------------------------------------------------------------------
// Tab 2: Marginal Contribution data
// ---------------------------------------------------------------------------
interface MCTRRow {
  ticker: string;
  weight: number;
  mctr: number; // marginal contribution to risk %
  pctRiskContrib: number; // % of total risk
  color: string;
}

const MCTR_DATA: MCTRRow[] = POSITIONS.map((p, i) => {
  const colors = [
    "#6366f1","#8b5cf6","#a78bfa","#7c3aed","#4f46e5",
    "#818cf8","#c4b5fd","#5b21b6","#ddd6fe","#4338ca",
  ];
  const mctr = seededRange(0.5, 3.2);
  const pctRisk = p.weight * mctr * 0.6 + seededRange(-1, 1);
  return {
    ticker: p.ticker,
    weight: p.weight,
    mctr: parseFloat(mctr.toFixed(2)),
    pctRiskContrib: parseFloat(Math.max(1, pctRisk).toFixed(1)),
    color: colors[i],
  };
});

// Normalise pctRiskContrib to 100
const totalRisk = MCTR_DATA.reduce((a, b) => a + b.pctRiskContrib, 0);
const MCTR_NORMALISED: MCTRRow[] = MCTR_DATA.map((r) => ({
  ...r,
  pctRiskContrib: parseFloat(((r.pctRiskContrib / totalRisk) * 100).toFixed(1)),
}));

const CONCENTRATION_SCORE = 68; // 0-100 (higher = more concentrated)

// ---------------------------------------------------------------------------
// Tab 3: Stress Testing scenarios
// ---------------------------------------------------------------------------
interface StressScenario {
  name: string;
  year: string;
  marketReturn: number; // %
  portfolioReturn: number; // %
  maxDrawdown: number; // %
  recoveryDays: number;
  description: string;
}

const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: "2008 Global Financial Crisis",
    year: "2008–2009",
    marketReturn: -56.8,
    portfolioReturn: -48.3,
    maxDrawdown: -51.2,
    recoveryDays: 1265,
    description: "Lehman collapse, credit freeze, systemic banking failure",
  },
  {
    name: "2020 COVID-19 Crash",
    year: "2020",
    marketReturn: -33.9,
    portfolioReturn: -27.4,
    maxDrawdown: -29.8,
    recoveryDays: 148,
    description: "Global pandemic, lockdowns, sudden economic halt",
  },
  {
    name: "2022 Rate Shock",
    year: "2022",
    marketReturn: -25.4,
    portfolioReturn: -21.7,
    maxDrawdown: -22.9,
    recoveryDays: 420,
    description: "Fed 425bps hike cycle, duration risk, growth-to-value rotation",
  },
  {
    name: "1987 Black Monday",
    year: "Oct 1987",
    marketReturn: -22.6,
    portfolioReturn: -19.8,
    maxDrawdown: -20.4,
    recoveryDays: 504,
    description: "Program trading cascade, single-day 22.6% market decline",
  },
  {
    name: "Dot-Com Bust",
    year: "2000–2002",
    marketReturn: -49.1,
    portfolioReturn: -38.6,
    maxDrawdown: -41.3,
    recoveryDays: 1752,
    description: "Tech bubble burst, NASDAQ -78%, value outperformed",
  },
  {
    name: "Russia Default / LTCM",
    year: "1998",
    marketReturn: -19.3,
    portfolioReturn: -14.2,
    maxDrawdown: -15.8,
    recoveryDays: 92,
    description: "Russian sovereign default, LTCM liquidity crisis",
  },
];

// ---------------------------------------------------------------------------
// Tab 4: Value at Risk
// ---------------------------------------------------------------------------
interface VaRResult {
  method: string;
  cl95_1d: number;
  cl99_1d: number;
  cl95_10d: number;
  cl99_10d: number;
  cvar95: number;
  cvar99: number;
}

const VAR_RESULTS: VaRResult[] = [
  {
    method: "Parametric (Normal)",
    cl95_1d: -1.84,
    cl99_1d: -2.61,
    cl95_10d: -5.82,
    cl99_10d: -8.25,
    cvar95: -2.31,
    cvar99: -3.18,
  },
  {
    method: "Historical Simulation",
    cl95_1d: -1.97,
    cl99_1d: -2.88,
    cl95_10d: -6.23,
    cl99_10d: -9.11,
    cvar95: -2.54,
    cvar99: -3.47,
  },
];

// Generate histogram data (returns distribution)
const HIST_BUCKETS = 30;
const HIST_DATA: { x: number; count: number; isLoss: boolean }[] = [];
for (let i = 0; i < HIST_BUCKETS; i++) {
  const x = -6 + (i / (HIST_BUCKETS - 1)) * 12; // -6% to +6%
  const normal = Math.exp((-0.5 * Math.pow((x - 0.04) / 1.78, 2)));
  const count = Math.round(normal * 180 + seededRange(0, 15));
  HIST_DATA.push({ x: parseFloat(x.toFixed(2)), count, isLoss: x < -1.84 });
}

// ---------------------------------------------------------------------------
// Tab 5: Risk Budgeting
// ---------------------------------------------------------------------------
interface RiskBudgetRow {
  ticker: string;
  currentWeight: number;
  currentRiskContrib: number; // %
  ercWeight: number; // equal risk contribution target weight
  ercRiskContrib: number; // target risk contribution %
  color: string;
}

const COLORS_10 = [
  "#6366f1","#8b5cf6","#a78bfa","#7c3aed","#4f46e5",
  "#818cf8","#c4b5fd","#5b21b6","#ddd6fe","#4338ca",
];

// ERC target: equalise risk contribution (~10% each)
const RISK_BUDGET_DATA: RiskBudgetRow[] = POSITIONS.map((p, i) => {
  const currentRC = parseFloat(MCTR_NORMALISED[i].pctRiskContrib.toFixed(1));
  // ERC weight inversely proportional to vol
  const rawErc = 1 / p.vol;
  return {
    ticker: p.ticker,
    currentWeight: p.weight,
    currentRiskContrib: currentRC,
    ercWeight: rawErc, // will normalise below
    ercRiskContrib: 10.0,
    color: COLORS_10[i],
  };
});

const totalErcWeight = RISK_BUDGET_DATA.reduce((a, b) => a + b.ercWeight, 0);
const RISK_BUDGET_FINAL: RiskBudgetRow[] = RISK_BUDGET_DATA.map((r) => ({
  ...r,
  ercWeight: parseFloat(((r.ercWeight / totalErcWeight) * 100).toFixed(1)),
}));

// ---------------------------------------------------------------------------
// Shared: colour helpers
// ---------------------------------------------------------------------------
function returnColor(val: number) {
  if (val > 0) return "text-emerald-400";
  if (val < 0) return "text-red-400";
  return "text-muted-foreground";
}

function returnBg(val: number) {
  if (val > 0) return "bg-emerald-500/20 text-emerald-300";
  return "bg-red-500/20 text-red-300";
}

// ---------------------------------------------------------------------------
// Tab 1 Component: Risk Decomposition
// ---------------------------------------------------------------------------
function RiskDecompositionTab() {
  const totalFactor = FACTOR_RISKS.reduce((a, b) => a + b.contribution, 0);
  let cumX = 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Portfolio Vol", value: `${PORTFOLIO_VOL}%`, sub: "Annualised", icon: Activity, color: "text-indigo-400" },
          { label: "Portfolio Beta", value: BETA.toFixed(2), sub: "vs S&P 500", icon: BarChart3, color: "text-primary" },
          { label: "Tracking Error", value: `${TRACKING_ERROR}%`, sub: "vs Benchmark", icon: Target, color: "text-primary" },
          { label: "Systematic %", value: `${SYSTEMATIC_RISK}%`, sub: "of total risk", icon: Layers, color: "text-primary" },
        ].map((item) => (
          <Card key={item.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Systematic vs Idiosyncratic */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Systematic vs Idiosyncratic Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Systematic Risk</span>
                <span className="font-semibold text-indigo-400">{SYSTEMATIC_RISK}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${SYSTEMATIC_RISK}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Idiosyncratic Risk</span>
                <span className="font-semibold text-muted-foreground">{IDIOSYNCRATIC_RISK}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-muted rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${IDIOSYNCRATIC_RISK}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-muted-foreground font-medium">Systematic risk</span> is driven by market factors and cannot
              be diversified away. <span className="text-muted-foreground font-medium">Idiosyncratic risk</span> is
              stock-specific and can be reduced through diversification.
            </p>
          </CardContent>
        </Card>

        {/* Factor risk SVG stacked bar */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Factor Risk Contribution (Stacked)</CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox="0 0 340 48" className="w-full" style={{ height: 48 }}>
              {FACTOR_RISKS.map((f) => {
                const w = (f.contribution / totalFactor) * 340;
                const x = cumX;
                cumX += w;
                return (
                  <rect
                    key={f.factor}
                    x={x}
                    y={0}
                    width={w}
                    height={48}
                    fill={f.color}
                    rx={x === 0 ? 4 : 0}
                  />
                );
              })}
            </svg>
            <div className="mt-4 grid grid-cols-2 gap-y-2">
              {FACTOR_RISKS.map((f) => (
                <div key={f.factor} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: f.color }} />
                  <span className="text-xs text-muted-foreground">{f.factor}</span>
                  <span className="text-xs font-semibold text-foreground ml-auto">{f.contribution}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-position systematic vs idiosyncratic breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Per-Position Risk Characteristics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Ticker</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Weight</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Beta</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Vol (Ann.)</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Systematic %</th>
                  <th className="text-left py-2 pl-4 text-muted-foreground font-medium">Sector</th>
                </tr>
              </thead>
              <tbody>
                {POSITIONS.map((p) => {
                  const r2 = Math.min(0.95, 0.45 + (p.beta - 0.5) * 0.35);
                  const syst = parseFloat((r2 * 100).toFixed(1));
                  return (
                    <tr key={p.ticker} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 font-semibold text-foreground">{p.ticker}</td>
                      <td className="py-2 text-right text-muted-foreground">{p.weight}%</td>
                      <td className="py-2 text-right text-muted-foreground">{p.beta.toFixed(2)}</td>
                      <td className="py-2 text-right text-muted-foreground">{p.vol}%</td>
                      <td className="py-2 text-right">
                        <span className={syst > 70 ? "text-indigo-400" : "text-muted-foreground"}>{syst}%</span>
                      </td>
                      <td className="py-2 pl-4">
                        <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                          {p.sector}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2 Component: Marginal Contribution
// ---------------------------------------------------------------------------
function MarginalContributionTab() {
  const svgW = 340;
  const svgH = 240;
  const padL = 44;
  const padB = 36;
  const padT = 16;
  const padR = 16;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padB - padT;

  const maxWeight = Math.max(...MCTR_NORMALISED.map((r) => r.weight));
  const maxRisk = Math.max(...MCTR_NORMALISED.map((r) => r.pctRiskContrib));

  const xScale = (v: number) => padL + (v / (maxWeight * 1.1)) * innerW;
  const yScale = (v: number) => padT + innerH - (v / (maxRisk * 1.1)) * innerH;

  // Y-axis ticks
  const yTicks = [0, 5, 10, 15, 20, 25].filter((t) => t <= maxRisk * 1.1 + 2);
  // X-axis ticks
  const xTicks = [0, 5, 10, 15, 20].filter((t) => t <= maxWeight * 1.1 + 2);

  // Diagonal parity line (weight == risk)
  const parityX1 = xScale(0);
  const parityY1 = yScale(0);
  const parityEnd = Math.min(maxWeight * 1.1, maxRisk * 1.1);
  const parityX2 = xScale(parityEnd);
  const parityY2 = yScale(parityEnd);

  return (
    <div className="space-y-6">
      {/* Concentration risk score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-muted-foreground">Concentration Risk</span>
            </div>
            <div className="text-4xl font-bold text-amber-400 mb-1">{CONCENTRATION_SCORE}</div>
            <div className="text-xs text-muted-foreground mb-3">Score out of 100</div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${CONCENTRATION_SCORE}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-amber-400">Moderate-High concentration</div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Top 3 positions account for 47.3% of weight but 54.1% of total portfolio risk.
            </p>
          </CardContent>
        </Card>

        {/* MCTR Table */}
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">MCTR — Marginal Contribution to Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground">Ticker</th>
                    <th className="text-right py-2 text-muted-foreground">Weight %</th>
                    <th className="text-right py-2 text-muted-foreground">MCTR %</th>
                    <th className="text-right py-2 text-muted-foreground">Risk Contrib %</th>
                    <th className="text-right py-2 text-muted-foreground">Overweight?</th>
                  </tr>
                </thead>
                <tbody>
                  {MCTR_NORMALISED.map((r) => {
                    const over = r.pctRiskContrib > r.weight;
                    return (
                      <tr key={r.ticker} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: r.color }} />
                            <span className="font-semibold text-foreground">{r.ticker}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{r.weight.toFixed(1)}%</td>
                        <td className="py-2 text-right text-indigo-300">{r.mctr.toFixed(2)}%</td>
                        <td className="py-2 text-right font-semibold text-foreground">{r.pctRiskContrib.toFixed(1)}%</td>
                        <td className="py-2 text-right">
                          {over ? (
                            <Badge className="bg-red-500/20 text-red-300 border-0 text-xs">Risk Heavy</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">Efficient</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scatter SVG: % Risk vs % Weight */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Risk Contribution % vs Portfolio Weight % — Scatter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 240 }}>
            {/* Grid lines */}
            {yTicks.map((t) => (
              <line
                key={`yg-${t}`}
                x1={padL}
                y1={yScale(t)}
                x2={svgW - padR}
                y2={yScale(t)}
                stroke="#27272a"
                strokeWidth={1}
              />
            ))}
            {xTicks.map((t) => (
              <line
                key={`xg-${t}`}
                x1={xScale(t)}
                y1={padT}
                x2={xScale(t)}
                y2={padT + innerH}
                stroke="#27272a"
                strokeWidth={1}
              />
            ))}
            {/* Y-axis labels */}
            {yTicks.map((t) => (
              <text key={`yl-${t}`} x={padL - 4} y={yScale(t) + 4} textAnchor="end" fontSize={9} fill="#71717a">
                {t}%
              </text>
            ))}
            {/* X-axis labels */}
            {xTicks.map((t) => (
              <text key={`xl-${t}`} x={xScale(t)} y={padT + innerH + 14} textAnchor="middle" fontSize={9} fill="#71717a">
                {t}%
              </text>
            ))}
            {/* Axis labels */}
            <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize={9} fill="#52525b">
              Portfolio Weight %
            </text>
            <text
              x={10}
              y={padT + innerH / 2}
              textAnchor="middle"
              fontSize={9}
              fill="#52525b"
              transform={`rotate(-90, 10, ${padT + innerH / 2})`}
            >
              Risk Contrib %
            </text>
            {/* Parity line */}
            <line
              x1={parityX1}
              y1={parityY1}
              x2={parityX2}
              y2={parityY2}
              stroke="#52525b"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text x={parityX2 - 4} y={parityY2 - 4} fontSize={8} fill="#52525b">Parity</text>
            {/* Dots */}
            {MCTR_NORMALISED.map((r) => (
              <g key={r.ticker}>
                <circle cx={xScale(r.weight)} cy={yScale(r.pctRiskContrib)} r={7} fill={r.color} opacity={0.85} />
                <text
                  x={xScale(r.weight)}
                  y={yScale(r.pctRiskContrib) - 10}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#d4d4d8"
                >
                  {r.ticker}
                </text>
              </g>
            ))}
          </svg>
          <p className="text-xs text-muted-foreground mt-2">
            Points above the parity line contribute more risk than their weight warrants. Points below are risk-efficient.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3 Component: Stress Testing
// ---------------------------------------------------------------------------
function StressTestingTab() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Historical Stress Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Scenario</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Period</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Market Return</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Portfolio Return</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Max Drawdown</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Recovery (days)</th>
                </tr>
              </thead>
              <tbody>
                {STRESS_SCENARIOS.map((sc, i) => (
                  <>
                    <tr
                      key={sc.name}
                      className={`border-b border-border/50 cursor-pointer transition-colors ${
                        selected === i ? "bg-muted/60" : "hover:bg-muted/30"
                      }`}
                      onClick={() => setSelected(selected === i ? null : i)}
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span className="font-medium text-foreground">{sc.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">{sc.year}</td>
                      <td className={`py-2.5 text-right font-semibold ${returnColor(sc.marketReturn)}`}>
                        {sc.marketReturn.toFixed(1)}%
                      </td>
                      <td className={`py-2.5 text-right font-semibold ${returnColor(sc.portfolioReturn)}`}>
                        {sc.portfolioReturn.toFixed(1)}%
                      </td>
                      <td className={`py-2.5 text-right font-semibold ${returnColor(sc.maxDrawdown)}`}>
                        {sc.maxDrawdown.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">{sc.recoveryDays.toLocaleString()}</td>
                    </tr>
                    <AnimatePresence>
                      {selected === i && (
                        <motion.tr
                          key={`detail-${i}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-muted/40"
                        >
                          <td colSpan={6} className="py-3 px-4">
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground leading-relaxed">{sc.description}</p>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-3">
                              <div className="bg-card rounded-lg p-2">
                                <div className="text-xs text-muted-foreground mb-0.5">Portfolio vs Market</div>
                                <div className={`text-sm font-bold ${(sc.portfolioReturn - sc.marketReturn) > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                  {(sc.portfolioReturn - sc.marketReturn) > 0 ? "+" : ""}
                                  {(sc.portfolioReturn - sc.marketReturn).toFixed(1)}%
                                </div>
                                <div className="text-xs text-muted-foreground">alpha vs index</div>
                              </div>
                              <div className="bg-card rounded-lg p-2">
                                <div className="text-xs text-muted-foreground mb-0.5">Portfolio Beta Used</div>
                                <div className="text-sm font-bold text-indigo-300">
                                  {(sc.portfolioReturn / sc.marketReturn).toFixed(2)}x
                                </div>
                                <div className="text-xs text-muted-foreground">implied beta</div>
                              </div>
                              <div className="bg-card rounded-lg p-2">
                                <div className="text-xs text-muted-foreground mb-0.5">Recovery Speed</div>
                                <div className={`text-sm font-bold ${sc.recoveryDays < 200 ? "text-emerald-400" : sc.recoveryDays < 600 ? "text-amber-400" : "text-red-400"}`}>
                                  {sc.recoveryDays < 200 ? "Fast" : sc.recoveryDays < 600 ? "Moderate" : "Slow"}
                                </div>
                                <div className="text-xs text-muted-foreground">{sc.recoveryDays} days</div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Horizontal bar chart of portfolio returns */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Loss by Scenario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {STRESS_SCENARIOS.map((sc) => {
              const pct = Math.abs(sc.portfolioReturn);
              const maxPct = 55;
              const barW = (pct / maxPct) * 100;
              return (
                <div key={sc.name} className="flex items-center gap-3">
                  <div className="w-36 text-xs text-muted-foreground truncate flex-shrink-0">{sc.year}</div>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden relative">
                    <motion.div
                      className="h-full bg-red-600/80 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${barW}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <span className="absolute right-2 top-0.5 text-xs text-muted-foreground">
                      {sc.portfolioReturn.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Portfolio showed average outperformance of{" "}
            <span className="text-emerald-400 font-medium">
              +
              {(
                STRESS_SCENARIOS.reduce((a, sc) => a + (sc.portfolioReturn - sc.marketReturn), 0) /
                STRESS_SCENARIOS.length
              ).toFixed(1)}
              %
            </span>{" "}
            versus the market across all six stress scenarios.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4 Component: Value at Risk
// ---------------------------------------------------------------------------
function ValueAtRiskTab() {
  const [horizon, setHorizon] = useState<"1d" | "10d">("1d");

  const histMax = Math.max(...HIST_DATA.map((d) => d.count));
  const svgW = 480;
  const svgH = 200;
  const padL = 36;
  const padR = 16;
  const padT = 12;
  const padB = 36;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;

  const xMin = HIST_DATA[0].x;
  const xMax = HIST_DATA[HIST_DATA.length - 1].x;
  const barW = innerW / HIST_DATA.length;

  const xScale = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * innerW;
  const yScale = (v: number) => padT + innerH - (v / (histMax * 1.1)) * innerH;

  const var95x = xScale(-1.84);
  const var99x = xScale(-2.61);

  const xLabels = [-6, -4, -2, 0, 2, 4, 6];
  const yTicks = [0, 50, 100, 150, 200].filter((t) => t <= histMax * 1.1 + 10);

  return (
    <div className="space-y-6">
      {/* Horizon toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setHorizon("1d")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            horizon === "1d" ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted"
          }`}
        >
          1-Day Horizon
        </button>
        <button
          onClick={() => setHorizon("10d")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            horizon === "10d" ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted"
          }`}
        >
          10-Day Horizon
        </button>
      </div>

      {/* VaR comparison table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VAR_RESULTS.map((v) => (
          <Card key={v.method} className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{v.method}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">VaR 95% ({horizon})</div>
                  <div className="text-2xl font-bold text-red-400">
                    {horizon === "1d" ? v.cl95_1d.toFixed(2) : v.cl95_10d.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">VaR 99% ({horizon})</div>
                  <div className="text-2xl font-bold text-red-500">
                    {horizon === "1d" ? v.cl99_1d.toFixed(2) : v.cl99_10d.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">CVaR 95% (Expected Shortfall)</div>
                  <div className="text-xl font-bold text-orange-400">{v.cvar95.toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">CVaR 99%</div>
                  <div className="text-xl font-bold text-orange-500">{v.cvar99.toFixed(2)}%</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {v.method === "Parametric (Normal)"
                  ? "Assumes normally distributed returns. Underestimates tail risk in fat-tailed distributions."
                  : "Uses actual historical return distribution. Captures fat tails and non-normality."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histogram SVG */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Return Distribution — 1-Day (Simulated)</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 200 }}>
            {/* Grid */}
            {yTicks.map((t) => (
              <line
                key={`yg-${t}`}
                x1={padL}
                y1={yScale(t)}
                x2={svgW - padR}
                y2={yScale(t)}
                stroke="#27272a"
                strokeWidth={1}
              />
            ))}
            {/* Bars */}
            {HIST_DATA.map((d, i) => {
              const bx = padL + i * barW;
              const bh = ((d.count / (histMax * 1.1)) * innerH);
              const by = padT + innerH - bh;
              return (
                <rect
                  key={`bar-${i}`}
                  x={bx + 0.5}
                  y={by}
                  width={barW - 1}
                  height={bh}
                  fill={d.isLoss ? "#ef4444" : "#6366f1"}
                  opacity={0.75}
                />
              );
            })}
            {/* VaR 95% line */}
            <line
              x1={var95x}
              y1={padT}
              x2={var95x}
              y2={padT + innerH}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
            <text x={var95x + 3} y={padT + 14} fontSize={9} fill="#f59e0b">VaR 95%</text>
            {/* VaR 99% line */}
            <line
              x1={var99x}
              y1={padT}
              x2={var99x}
              y2={padT + innerH}
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
            <text x={var99x + 3} y={padT + 26} fontSize={9} fill="#ef4444">VaR 99%</text>
            {/* X-axis labels */}
            {xLabels.map((t) => (
              <text
                key={`xl-${t}`}
                x={xScale(t)}
                y={padT + innerH + 16}
                textAnchor="middle"
                fontSize={9}
                fill="#71717a"
              >
                {t > 0 ? "+" : ""}{t}%
              </text>
            ))}
            {/* Y-axis labels */}
            {yTicks.map((t) => (
              <text key={`yl-${t}`} x={padL - 4} y={yScale(t) + 4} textAnchor="end" fontSize={9} fill="#71717a">
                {t}
              </text>
            ))}
            {/* Axis label */}
            <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize={9} fill="#52525b">
              Daily Return %
            </text>
          </svg>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500/80 rounded-sm" />
              <span className="text-xs text-muted-foreground">Loss tail (&lt;VaR 95%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-indigo-500/80 rounded-sm" />
              <span className="text-xs text-muted-foreground">Normal range</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#f59e0b" }} />
              <span className="text-xs text-muted-foreground">VaR 95% threshold</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explainer */}
      <Card className="bg-card border-border">
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium text-muted-foreground">VaR (Value at Risk)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Maximum expected loss over a given horizon at a specified confidence level. VaR 95% 1-day of -1.84%
                means a 5% chance of losing more than 1.84% tomorrow.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-medium text-muted-foreground">CVaR (Expected Shortfall)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Average loss in the worst scenarios beyond VaR. More robust than VaR for tail risk because it
                captures the expected magnitude of extreme losses, not just the threshold.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-muted-foreground">10-Day Scaling</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                10-day VaR is approximated by scaling 1-day VaR by √10 ≈ 3.16× under normality. Historical
                simulation uses actual 10-day overlapping windows, capturing autocorrelation effects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 5 Component: Risk Budgeting
// ---------------------------------------------------------------------------
function RiskBudgetingTab() {
  const svgW = 480;
  const svgH = 220;
  const padL = 60;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;

  const tickers = RISK_BUDGET_FINAL.map((r) => r.ticker);
  const n = tickers.length;
  const groupW = innerW / n;
  const barW = (groupW - 8) / 2;

  const maxVal = Math.max(
    ...RISK_BUDGET_FINAL.map((r) => Math.max(r.currentRiskContrib, r.ercRiskContrib, r.currentWeight, r.ercWeight))
  );

  const yScale = (v: number) => padT + innerH - (v / (maxVal * 1.1)) * innerH;
  const yTicks = [0, 5, 10, 15, 20, 25].filter((t) => t <= maxVal * 1.1 + 2);

  return (
    <div className="space-y-6">
      {/* Concept cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-muted-foreground">Equal Risk Contribution (ERC)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              ERC portfolio targets equal risk contribution from each position. Rather than equal weighting by
              dollar amount, it weights positions inversely to their volatility so each contributes identically to
              total portfolio risk.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Current Portfolio Vol</div>
                <div className="text-xl font-bold text-indigo-400">{PORTFOLIO_VOL}%</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">ERC Portfolio Vol (est.)</div>
                <div className="text-xl font-bold text-emerald-400">13.2%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Risk Parity Concept</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Risk parity allocates capital based on risk units rather than dollar units. Low-volatility assets
              receive higher nominal weights and high-volatility assets receive lower weights, achieving a balanced
              risk distribution.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Concentration (HHI)</div>
                <div className="text-xl font-bold text-amber-400">0.074</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">ERC HHI (target)</div>
                <div className="text-xl font-bold text-emerald-400">0.100</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Before/After SVG grouped bar */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current vs ERC Risk Contribution % — Before/After
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 220 }}>
            {/* Grid */}
            {yTicks.map((t) => (
              <line
                key={`yg-${t}`}
                x1={padL}
                y1={yScale(t)}
                x2={svgW - padR}
                y2={yScale(t)}
                stroke="#27272a"
                strokeWidth={1}
              />
            ))}
            {/* Y labels */}
            {yTicks.map((t) => (
              <text key={`yl-${t}`} x={padL - 4} y={yScale(t) + 4} textAnchor="end" fontSize={9} fill="#71717a">
                {t}%
              </text>
            ))}
            {/* Bars */}
            {RISK_BUDGET_FINAL.map((r, i) => {
              const gx = padL + i * groupW + 4;
              const currentH = ((r.currentRiskContrib / (maxVal * 1.1)) * innerH);
              const ercH = ((r.ercRiskContrib / (maxVal * 1.1)) * innerH);
              const currentY = padT + innerH - currentH;
              const ercY = padT + innerH - ercH;
              return (
                <g key={r.ticker}>
                  {/* Current */}
                  <rect x={gx} y={currentY} width={barW} height={currentH} fill={r.color} opacity={0.7} rx={2} />
                  {/* ERC target */}
                  <rect
                    x={gx + barW}
                    y={ercY}
                    width={barW}
                    height={ercH}
                    fill={r.color}
                    opacity={1}
                    rx={2}
                    stroke="#fff"
                    strokeWidth={0.5}
                  />
                  {/* Ticker label */}
                  <text
                    x={gx + groupW / 2 - 4}
                    y={padT + innerH + 14}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#71717a"
                  >
                    {r.ticker}
                  </text>
                </g>
              );
            })}
            {/* Axis label */}
            <text x={svgW / 2} y={svgH - 4} textAnchor="middle" fontSize={9} fill="#52525b">
              Position
            </text>
            <text
              x={10}
              y={padT + innerH / 2}
              textAnchor="middle"
              fontSize={9}
              fill="#52525b"
              transform={`rotate(-90, 10, ${padT + innerH / 2})`}
            >
              Risk Contrib %
            </text>
          </svg>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-indigo-500/70 rounded-sm" />
              <span className="text-xs text-muted-foreground">Current (faded)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-indigo-500 rounded-sm border border-white/30" />
              <span className="text-xs text-muted-foreground">ERC Target (solid)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk budget allocation table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Target Risk Allocation Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">Ticker</th>
                  <th className="text-right py-2 text-muted-foreground">Current Weight</th>
                  <th className="text-right py-2 text-muted-foreground">Current Risk %</th>
                  <th className="text-right py-2 text-muted-foreground">ERC Weight</th>
                  <th className="text-right py-2 text-muted-foreground">ERC Risk %</th>
                  <th className="text-right py-2 text-muted-foreground">Weight Delta</th>
                  <th className="text-right py-2 text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {RISK_BUDGET_FINAL.map((r) => {
                  const delta = r.ercWeight - r.currentWeight;
                  return (
                    <tr key={r.ticker} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: r.color }} />
                          <span className="font-semibold text-foreground">{r.ticker}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-muted-foreground">{r.currentWeight.toFixed(1)}%</td>
                      <td className="py-2 text-right text-muted-foreground">{r.currentRiskContrib.toFixed(1)}%</td>
                      <td className="py-2 text-right font-semibold text-indigo-300">{r.ercWeight.toFixed(1)}%</td>
                      <td className="py-2 text-right text-emerald-300">10.0%</td>
                      <td className={`py-2 text-right font-semibold ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                        {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                      </td>
                      <td className="py-2 text-right">
                        {Math.abs(delta) < 0.5 ? (
                          <Badge className="bg-muted text-muted-foreground border-0 text-xs">Hold</Badge>
                        ) : delta > 0 ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">Buy</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-300 border-0 text-xs">Trim</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function RiskDecompositionPage() {
  const tabs = [
    { id: "decomposition", label: "Risk Decomposition", icon: Layers },
    { id: "marginal", label: "Marginal Contribution", icon: BarChart3 },
    { id: "stress", label: "Stress Testing", icon: AlertTriangle },
    { id: "var", label: "Value at Risk", icon: TrendingDown },
    { id: "budgeting", label: "Risk Budgeting", icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-indigo-600/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Portfolio Risk Decomposition</h1>
          <p className="text-sm text-muted-foreground">Attribution analysis, stress testing, VaR, and risk budgeting</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground border-border text-xs">
            10 Positions
          </Badge>
          <Badge className="bg-indigo-600/20 text-indigo-300 border-0 text-xs">
            AUM $1.24M
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="decomposition">
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground text-muted-foreground text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="decomposition" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <RiskDecompositionTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="marginal" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <MarginalContributionTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="stress" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <StressTestingTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="var" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <ValueAtRiskTab />
          </motion.div>
        </TabsContent>

        <TabsContent value="budgeting" className="data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <RiskBudgetingTab />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
