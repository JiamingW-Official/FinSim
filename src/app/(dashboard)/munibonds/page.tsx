"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  Calculator,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Info,
  DollarSign,
  MapPin,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 662001;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface StateIssuance {
  state: string;
  abbr: string;
  volume: number; // $B
  creditQuality: "AAA" | "AA" | "A" | "BBB" | "Below";
}

interface MuniETF {
  ticker: string;
  name: string;
  aum: string;
  expRatio: number;
  duration: number;
  ytm: number;
  creditFocus: string;
  amtExposure: string;
}

interface StateFiscalHealth {
  state: string;
  score: number; // 0-100
  pensionFunded: number;
  debtPerCapita: number;
  budgetBalance: number; // % of budget
  rating: string;
}

// ── Static Data ───────────────────────────────────────────────────────────────
const STATE_ISSUANCES: StateIssuance[] = [
  { state: "California", abbr: "CA", volume: 68.4, creditQuality: "AA" },
  { state: "New York", abbr: "NY", volume: 52.1, creditQuality: "AA" },
  { state: "Texas", abbr: "TX", volume: 41.8, creditQuality: "AAA" },
  { state: "Florida", abbr: "FL", volume: 29.3, creditQuality: "AA" },
  { state: "Illinois", abbr: "IL", volume: 22.7, creditQuality: "BBB" },
  { state: "Pennsylvania", abbr: "PA", volume: 18.9, creditQuality: "AA" },
  { state: "Washington", abbr: "WA", volume: 16.4, creditQuality: "AAA" },
  { state: "Ohio", abbr: "OH", volume: 14.2, creditQuality: "AA" },
  { state: "New Jersey", abbr: "NJ", volume: 12.8, creditQuality: "A" },
  { state: "Massachusetts", abbr: "MA", volume: 11.3, creditQuality: "AA" },
];

const CREDIT_DISTRIBUTION = [
  { label: "AAA", pct: 14, color: "#22c55e" },
  { label: "AA", pct: 58, color: "#86efac" },
  { label: "A", pct: 18, color: "#fbbf24" },
  { label: "BBB", pct: 7, color: "#f97316" },
  { label: "Below BBB", pct: 3, color: "#ef4444" },
];

const MUNI_ETFS: MuniETF[] = [
  {
    ticker: "MUB",
    name: "iShares National Muni Bond ETF",
    aum: "$39.2B",
    expRatio: 0.07,
    duration: 6.8,
    ytm: 3.42,
    creditFocus: "Investment Grade",
    amtExposure: "~6%",
  },
  {
    ticker: "VTEB",
    name: "Vanguard Tax-Exempt Bond ETF",
    aum: "$32.1B",
    expRatio: 0.05,
    duration: 6.2,
    ytm: 3.38,
    creditFocus: "Investment Grade",
    amtExposure: "~4%",
  },
  {
    ticker: "HYD",
    name: "VanEck High Yield Muni ETF",
    aum: "$3.8B",
    expRatio: 0.35,
    duration: 8.9,
    ytm: 4.87,
    creditFocus: "High Yield",
    amtExposure: "~18%",
  },
  {
    ticker: "BAB",
    name: "Invesco Build America Bond ETF",
    aum: "$1.2B",
    expRatio: 0.28,
    duration: 12.4,
    ytm: 5.14,
    creditFocus: "Taxable Munis",
    amtExposure: "N/A",
  },
  {
    ticker: "PZA",
    name: "Invesco National AMT-Free Muni",
    aum: "$2.9B",
    expRatio: 0.28,
    duration: 7.1,
    ytm: 3.61,
    creditFocus: "AMT-Free",
    amtExposure: "0%",
  },
];

const STATE_FISCAL_HEALTH: StateFiscalHealth[] = [
  { state: "Colorado", score: 88, pensionFunded: 74, debtPerCapita: 2400, budgetBalance: 3.2, rating: "AAA" },
  { state: "Florida", score: 85, pensionFunded: 82, debtPerCapita: 1800, budgetBalance: 2.8, rating: "AAA" },
  { state: "Utah", score: 84, pensionFunded: 86, debtPerCapita: 1600, budgetBalance: 4.1, rating: "AAA" },
  { state: "Texas", score: 81, pensionFunded: 72, debtPerCapita: 1900, budgetBalance: 1.9, rating: "AAA" },
  { state: "Washington", score: 78, pensionFunded: 68, debtPerCapita: 3100, budgetBalance: 1.4, rating: "AA+" },
  { state: "California", score: 62, pensionFunded: 71, debtPerCapita: 5800, budgetBalance: -0.8, rating: "AA-" },
  { state: "Massachusetts", score: 60, pensionFunded: 64, debtPerCapita: 7200, budgetBalance: 0.6, rating: "AA" },
  { state: "New Jersey", score: 42, pensionFunded: 39, debtPerCapita: 8900, budgetBalance: -1.2, rating: "A-" },
  { state: "Connecticut", score: 38, pensionFunded: 36, debtPerCapita: 9400, budgetBalance: -0.4, rating: "A-" },
  { state: "Illinois", score: 28, pensionFunded: 43, debtPerCapita: 7600, budgetBalance: -2.1, rating: "BBB+" },
];

const DEFAULT_RATE_COMPARISON = [
  { category: "AAA Muni", rate5yr: 0.0, rate10yr: 0.01, color: "#22c55e" },
  { category: "AA Muni", rate5yr: 0.02, rate10yr: 0.04, color: "#86efac" },
  { category: "A Muni", rate5yr: 0.08, rate10yr: 0.14, color: "#fbbf24" },
  { category: "BBB Corp", rate5yr: 0.42, rate10yr: 0.81, color: "#f97316" },
  { category: "BB Corp", rate5yr: 1.8, rate10yr: 3.2, color: "#ef4444" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function taxEquivalentYield(muniYield: number, fedRate: number, stateRate: number): number {
  const effectiveTaxRate = fedRate / 100 + (stateRate / 100) * (1 - fedRate / 100);
  return muniYield / (1 - effectiveTaxRate);
}

function creditQualityColor(quality: string): string {
  const map: Record<string, string> = {
    AAA: "text-green-400",
    AA: "text-emerald-400",
    A: "text-yellow-400",
    BBB: "text-orange-400",
    Below: "text-red-400",
  };
  return map[quality] ?? "text-muted-foreground";
}

function fiscalScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 55) return "#fbbf24";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      {children}
    </div>
  );
}

function StatChip({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── Tab 1: Muni Market Overview ───────────────────────────────────────────────
function MarketOverviewTab() {
  const maxVol = Math.max(...STATE_ISSUANCES.map((s) => s.volume));

  return (
    <div className="space-y-5">
      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip label="Total Market Size" value="$4.0T" sub="Outstanding principal" />
        <StatChip label="Annual Issuance" value="~$400B" sub="New bonds issued/yr" />
        <StatChip label="Active Issuers" value="50,000+" sub="States, cities, districts" />
        <StatChip label="Avg Maturity" value="12.4 yrs" sub="Weighted average" />
      </div>

      {/* Bond type explainers */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard>
          <div className="mb-3 flex items-center gap-2">
            <Landmark className="h-4 w-4 text-blue-400" />
            <h3 className="font-semibold">General Obligation (GO) Bonds</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Backed by the full faith, credit, and taxing power of the issuing municipality. Considered
            the safest muni bond type as the issuer can raise taxes to meet debt obligations.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backing</span>
              <span className="text-foreground">Property tax pledge</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Typical credit</span>
              <span className="text-green-400">AA to AAA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market share</span>
              <span className="text-foreground">~35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voter approval</span>
              <span className="text-foreground">Often required</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <h3 className="font-semibold">Revenue Bonds</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Backed by specific revenue streams from the funded project — toll roads, airports, water
            utilities, hospitals. Higher yield but more credit analysis required.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backing</span>
              <span className="text-foreground">Project revenue only</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Typical credit</span>
              <span className="text-yellow-400">A to AA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market share</span>
              <span className="text-foreground">~65%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Key metric</span>
              <span className="text-foreground">Debt Service Coverage</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Credit quality distribution */}
      <SectionCard>
        <h3 className="mb-4 font-semibold">Credit Quality Distribution</h3>
        <div className="space-y-3">
          {CREDIT_DISTRIBUTION.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-16 text-sm text-muted-foreground">{item.label}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-muted/40" style={{ height: 20 }}>
                <div
                  className="flex h-full items-center rounded-full px-2"
                  style={{ width: `${item.pct}%`, backgroundColor: item.color + "33", border: `1px solid ${item.color}` }}
                >
                  <span className="text-xs font-semibold" style={{ color: item.color }}>
                    {item.pct}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          ~72% of the muni market carries AA or higher rating — far higher than corporate bonds.
        </p>
      </SectionCard>

      {/* State issuance SVG bar chart */}
      <SectionCard>
        <h3 className="mb-4 font-semibold">Annual Issuance by State (Top 10, $B)</h3>
        <svg viewBox="0 0 700 320" className="w-full" style={{ maxHeight: 320 }}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const x = 80 + (pct / 100) * 580;
            return (
              <g key={pct}>
                <line x1={x} y1={20} x2={x} y2={290} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <text x={x} y={310} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10}>
                  ${Math.round((pct / 100) * maxVol)}B
                </text>
              </g>
            );
          })}
          {STATE_ISSUANCES.map((item, i) => {
            const barWidth = (item.volume / maxVol) * 580;
            const y = 20 + i * 27;
            const colorMap: Record<string, string> = {
              AAA: "#22c55e",
              AA: "#86efac",
              A: "#fbbf24",
              BBB: "#f97316",
              Below: "#ef4444",
            };
            const color = colorMap[item.creditQuality] ?? "#6b7280";
            return (
              <g key={item.abbr}>
                <text x={75} y={y + 15} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={11}>
                  {item.abbr}
                </text>
                <rect x={80} y={y} width={barWidth} height={20} rx={3} fill={color + "44"} stroke={color} strokeWidth={1} />
                <text x={82 + barWidth} y={y + 14} fill={color} fontSize={10} fontWeight="600">
                  ${item.volume}B
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-3">
          {Object.entries({ AAA: "#22c55e", AA: "#86efac", A: "#fbbf24", BBB: "#f97316" }).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: v }} />
              <span className="text-xs text-muted-foreground">{k}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 2: Tax-Equivalent Yield ────────────────────────────────────────────────
function TaxEquivalentYieldTab() {
  const [fedRate, setFedRate] = useState(35);
  const [stateRate, setStateRate] = useState(9);
  const [muniYield, setMuniYield] = useState(3.5);

  const tey = useMemo(
    () => taxEquivalentYield(muniYield, fedRate, stateRate),
    [muniYield, fedRate, stateRate],
  );

  const effectiveTaxRate = useMemo(
    () => fedRate / 100 + (stateRate / 100) * (1 - fedRate / 100),
    [fedRate, stateRate],
  );

  // TEY at different tax brackets for chart
  const bracketData = useMemo(() => {
    const brackets = [10, 12, 22, 24, 32, 35, 37];
    return brackets.map((br) => ({
      bracket: br,
      tey: taxEquivalentYield(muniYield, br, stateRate),
      afterTax: muniYield,
    }));
  }, [muniYield, stateRate]);

  const maxTey = Math.max(...bracketData.map((d) => d.tey));
  const chartH = 200;
  const chartW = 580;

  return (
    <div className="space-y-5">
      {/* Calculator */}
      <SectionCard>
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-blue-400" />
          <h3 className="font-semibold">Tax-Equivalent Yield Calculator</h3>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-5">
            {/* Federal rate slider */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Federal Tax Rate</span>
                <span className="font-semibold text-blue-400">{fedRate}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={37}
                step={1}
                value={fedRate}
                onChange={(e) => setFedRate(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>37%</span>
              </div>
            </div>

            {/* State rate slider */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">State Tax Rate</span>
                <span className="font-semibold text-purple-400">{stateRate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={13}
                step={0.5}
                value={stateRate}
                onChange={(e) => setStateRate(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (TX, FL)</span>
                <span>13.3% (CA)</span>
              </div>
            </div>

            {/* Muni yield slider */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Muni Bond Yield</span>
                <span className="font-semibold text-green-400">{muniYield.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={0.1}
                value={muniYield}
                onChange={(e) => setMuniYield(Number(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1.0%</span>
                <span>6.0%</span>
              </div>
            </div>
          </div>

          {/* Result panel */}
          <div className="flex flex-col justify-center gap-4 rounded-xl border border-border bg-muted/20 p-5">
            <div>
              <div className="text-xs text-muted-foreground">Combined Effective Tax Rate</div>
              <div className="text-2xl font-bold text-foreground">{(effectiveTaxRate * 100).toFixed(1)}%</div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <div className="text-xs text-muted-foreground">Muni Bond Yield</div>
              <div className="text-2xl font-bold text-green-400">{muniYield.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">Tax-exempt from federal (and often state) tax</div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <div className="text-xs text-muted-foreground">Tax-Equivalent Yield</div>
              <div className="text-3xl font-bold text-blue-400">{tey.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground">
                A taxable bond must yield this much to match the muni
              </div>
            </div>
            {tey > 5 && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
                Strong value at high tax brackets — munis often beat taxable bonds above 32% federal rate.
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* SVG comparison chart */}
      <SectionCard>
        <h3 className="mb-1 font-semibold">TEY vs. Tax Bracket — Muni Yield {muniYield.toFixed(1)}%</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          A {muniYield.toFixed(1)}% muni is equivalent to the following taxable yield at each federal tax bracket (state rate {stateRate}%)
        </p>
        <svg viewBox={`0 0 700 ${chartH + 80}`} className="w-full" style={{ maxHeight: chartH + 80 }}>
          {/* Y-axis grid */}
          {[0, 2, 4, 6, 8, 10].map((yv) => {
            if (yv > maxTey * 1.1) return null;
            const y = chartH - (yv / (maxTey * 1.1)) * chartH + 20;
            return (
              <g key={yv}>
                <line x1={60} y1={y} x2={660} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <text x={55} y={y + 4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={10}>
                  {yv}%
                </text>
              </g>
            );
          })}
          {bracketData.map((d, i) => {
            const barW = 60;
            const gap = (600 - bracketData.length * barW) / (bracketData.length + 1);
            const x = 60 + gap + i * (barW + gap);
            const teyH = (d.tey / (maxTey * 1.1)) * chartH;
            const muniH = (d.afterTax / (maxTey * 1.1)) * chartH;
            const isCurrentBracket = d.bracket === fedRate ||
              (fedRate > d.bracket && (bracketData[i + 1]?.bracket ?? 999) > fedRate);
            return (
              <g key={d.bracket}>
                {/* Taxable equivalent bar */}
                <rect
                  x={x}
                  y={chartH - teyH + 20}
                  width={barW}
                  height={teyH}
                  rx={3}
                  fill={isCurrentBracket ? "#3b82f644" : "#3b82f622"}
                  stroke={isCurrentBracket ? "#3b82f6" : "#3b82f666"}
                  strokeWidth={isCurrentBracket ? 2 : 1}
                />
                {/* Muni yield line */}
                <rect
                  x={x}
                  y={chartH - muniH + 20}
                  width={barW}
                  height={3}
                  fill="#22c55e"
                />
                <text x={x + barW / 2} y={chartH + 35} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10}>
                  {d.bracket}%
                </text>
                <text
                  x={x + barW / 2}
                  y={chartH - teyH + 15}
                  textAnchor="middle"
                  fill={isCurrentBracket ? "#93c5fd" : "hsl(var(--muted-foreground))"}
                  fontSize={9}
                  fontWeight={isCurrentBracket ? "700" : "400"}
                >
                  {d.tey.toFixed(1)}%
                </text>
              </g>
            );
          })}
          <text x={360} y={chartH + 60} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={11}>
            Federal Tax Bracket
          </text>
        </svg>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded-sm bg-blue-500/40 border border-blue-500" />
            <span className="text-xs text-muted-foreground">Tax-Equivalent Yield (taxable needed)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-6 bg-green-500" />
            <span className="text-xs text-muted-foreground">Muni Yield ({muniYield.toFixed(1)}%)</span>
          </div>
        </div>
      </SectionCard>

      {/* Info box */}
      <SectionCard>
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Formula:</strong> TEY = Muni Yield ÷ (1 − Combined Tax Rate)
            <br />
            <strong className="text-foreground">In-state munis</strong> are often exempt from state income tax too, making them even more attractive for residents of high-tax states like California (13.3%), New York (10.9%), or Hawaii (11%).
            <br />
            <strong className="text-foreground">AMT caution:</strong> Some private activity bonds may trigger the Alternative Minimum Tax, reducing after-tax yield.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 3: Credit Analysis ────────────────────────────────────────────────────
function CreditAnalysisTab() {
  const maxRate = 3.5;

  return (
    <div className="space-y-5">
      {/* GO bond metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <h3 className="font-semibold">GO Bond Credit Metrics</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { metric: "Property Tax Levy Authority", value: "Unlimited (limited GO)", note: "Can raise taxes to repay" },
              { metric: "Debt per Capita", value: "<$4,000 ideal", note: "Budget stress indicator" },
              { metric: "Fund Balance (% of revenue)", value: "≥10% healthy", note: "Rainy day fund" },
              { metric: "Pension Funded Ratio", value: "≥80% healthy", note: "Long-term obligation" },
              { metric: "Net Direct Debt / AV", value: "<3% conservative", note: "Assessed valuation" },
            ].map((row) => (
              <div key={row.metric} className="rounded-lg bg-muted/20 p-3">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">{row.metric}</span>
                  <span className="text-green-400 font-semibold">{row.value}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{row.note}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <h3 className="font-semibold">Revenue Bond Credit Metrics</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { metric: "Debt Service Coverage Ratio", value: "≥1.25x minimum", note: "Net revenue / debt service" },
              { metric: "Days Cash on Hand", value: "≥150 days healthy", note: "Liquidity buffer" },
              { metric: "Revenue Concentration", value: "Diversified preferred", note: "Single payer risk" },
              { metric: "Rate Covenant", value: "Required by indenture", note: "Must raise rates if needed" },
              { metric: "Capital Structure Seniority", value: "Senior lien preferred", note: "First claim on revenue" },
            ].map((row) => (
              <div key={row.metric} className="rounded-lg bg-muted/20 p-3">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">{row.metric}</span>
                  <span className="text-purple-400 font-semibold">{row.value}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{row.note}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Default rate comparison */}
      <SectionCard>
        <h3 className="mb-4 font-semibold">10-Year Cumulative Default Rates: Munis vs. Corporates</h3>
        <svg viewBox="0 0 700 260" className="w-full" style={{ maxHeight: 260 }}>
          {/* Y grid */}
          {[0, 1, 2, 3, 3.5].map((yv) => {
            const y = 220 - (yv / maxRate) * 200;
            return (
              <g key={yv}>
                <line x1={80} y1={y} x2={660} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} />
                <text x={75} y={y + 4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={10}>
                  {yv}%
                </text>
              </g>
            );
          })}
          {DEFAULT_RATE_COMPARISON.map((item, i) => {
            const barW = 70;
            const gap = (580 - DEFAULT_RATE_COMPARISON.length * barW) / (DEFAULT_RATE_COMPARISON.length + 1);
            const x10 = 80 + gap + i * (barW + gap);
            const x5 = x10 + barW * 0.25;
            const bar10H = (item.rate10yr / maxRate) * 200;
            const bar5H = (item.rate5yr / maxRate) * 200;
            return (
              <g key={item.category}>
                {/* 10yr bar */}
                <rect
                  x={x10}
                  y={220 - bar10H}
                  width={barW * 0.45}
                  height={Math.max(bar10H, 1)}
                  rx={2}
                  fill={item.color + "44"}
                  stroke={item.color}
                  strokeWidth={1}
                />
                {/* 5yr bar (lighter, nested) */}
                <rect
                  x={x10 + barW * 0.5}
                  y={220 - bar5H}
                  width={barW * 0.45}
                  height={Math.max(bar5H, 1)}
                  rx={2}
                  fill={item.color + "22"}
                  stroke={item.color + "88"}
                  strokeWidth={1}
                  strokeDasharray="3,2"
                />
                <text x={x10 + barW * 0.5} y={240} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9}>
                  {item.category}
                </text>
                {item.rate10yr > 0.1 && (
                  <text x={x10 + barW * 0.22} y={215 - bar10H} textAnchor="middle" fill={item.color} fontSize={9} fontWeight="600">
                    {item.rate10yr}%
                  </text>
                )}
              </g>
            );
          })}
          <text x={370} y={260} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={11}>
            Bond Category
          </text>
        </svg>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded-sm bg-gray-500/40 border border-gray-500" />
            <span className="text-xs text-muted-foreground">10-year cumulative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded-sm bg-gray-500/20 border border-gray-500/50 border-dashed" />
            <span className="text-xs text-muted-foreground">5-year cumulative</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Investment-grade munis have historically had 10x lower default rates than similarly-rated corporates.
          S&P data: AAA/AA munis have near-zero 10-year default rates (0.01–0.04%).
        </p>
      </SectionCard>

      {/* Notable defaults context */}
      <SectionCard>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <h3 className="font-semibold">Notable Muni Market Stress Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4">Issuer</th>
                <th className="pb-2 pr-4">Year</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2">Key Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { issuer: "Puerto Rico PREPA", year: 2016, amount: "$72B", cause: "Unsustainable pension + debt load" },
                { issuer: "Detroit, MI", year: 2013, amount: "$18B", cause: "Population decline, pension obligations" },
                { issuer: "Stockton, CA", year: 2012, amount: "$700M", cause: "CalPERS pension spike, housing crisis" },
                { issuer: "Jefferson County, AL", year: 2011, amount: "$4B", cause: "Sewer bond derivative losses" },
                { issuer: "Orange County, CA", year: 1994, amount: "$1.7B", cause: "Interest rate derivatives losses" },
              ].map((row) => (
                <tr key={row.issuer} className="text-foreground">
                  <td className="py-2 pr-4 font-medium">{row.issuer}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.year}</td>
                  <td className="py-2 pr-4 text-red-400">{row.amount}</td>
                  <td className="py-2 text-muted-foreground text-xs">{row.cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Tab 4: ETFs vs Individual Bonds ──────────────────────────────────────────
function ETFsTab() {
  const [view, setView] = useState<"etfs" | "ladder" | "bab">("etfs");

  // Generate ladder rungs using PRNG (reset seed for determinism)
  const ladderRungs = useMemo(() => {
    let ls = 662001;
    const lr = () => { ls = (ls * 1103515245 + 12345) & 0x7fffffff; return ls / 0x7fffffff; };
    return Array.from({ length: 7 }, (_, i) => ({
      maturity: 2026 + i,
      yield: 3.2 + i * 0.18 + (lr() - 0.5) * 0.1,
      allocation: 14 + (lr() - 0.5) * 2,
    }));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[
          { key: "etfs", label: "ETF Comparison" },
          { key: "ladder", label: "Bond Laddering" },
          { key: "bab", label: "Build America Bonds" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setView(opt.key as typeof view)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              view === opt.key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {view === "etfs" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <SectionCard>
            <h3 className="mb-4 font-semibold">Muni ETF Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-3">Ticker</th>
                    <th className="pb-2 pr-3">AUM</th>
                    <th className="pb-2 pr-3">Exp. Ratio</th>
                    <th className="pb-2 pr-3">Duration</th>
                    <th className="pb-2 pr-3">YTM</th>
                    <th className="pb-2 pr-3">Focus</th>
                    <th className="pb-2">AMT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {MUNI_ETFS.map((etf) => (
                    <tr key={etf.ticker} className="text-foreground">
                      <td className="py-2.5 pr-3">
                        <span className="font-bold text-blue-400">{etf.ticker}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{etf.aum}</td>
                      <td className="py-2.5 pr-3">
                        <span className={cn(etf.expRatio <= 0.1 ? "text-green-400" : "text-yellow-400")}>
                          {etf.expRatio.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">{etf.duration.toFixed(1)} yrs</td>
                      <td className="py-2.5 pr-3 text-green-400">{etf.ytm.toFixed(2)}%</td>
                      <td className="py-2.5 pr-3 text-xs text-muted-foreground">{etf.creditFocus}</td>
                      <td className="py-2.5">
                        <span className={cn(
                          "rounded px-1.5 py-0.5 text-xs",
                          etf.amtExposure === "0%"
                            ? "bg-green-500/20 text-green-400"
                            : etf.amtExposure === "N/A"
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-500/20 text-amber-400",
                        )}>
                          {etf.amtExposure}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard>
              <h3 className="mb-3 font-semibold text-blue-400">ETFs: Pros</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Intraday liquidity — buy/sell any time market is open",
                  "Instant diversification across hundreds of bonds",
                  "Low minimums — start with 1 share (~$50–110)",
                  "Automatic reinvestment options",
                  "Transparent daily holdings disclosure",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-0.5 text-green-400">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard>
              <h3 className="mb-3 font-semibold text-amber-400">Individual Bonds: Pros</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Guaranteed par value at maturity if held to term",
                  "No ongoing management fees",
                  "Control over specific state/issuer for in-state tax benefit",
                  "No NAV discount/premium fluctuation risk",
                  "AMT-free selection fully in your control",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-0.5 text-yellow-400">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </motion.div>
      )}

      {view === "ladder" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <SectionCard>
            <div className="mb-4">
              <h3 className="font-semibold">Bond Ladder Strategy</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A bond ladder staggers maturities across years, providing regular cash flows
                and reducing reinvestment risk. As each rung matures, proceeds are reinvested at
                the long end of the ladder.
              </p>
            </div>
            <svg viewBox="0 0 700 260" className="w-full" style={{ maxHeight: 260 }}>
              {/* Y grid */}
              {[3.0, 3.5, 4.0, 4.5].map((yv) => {
                const y = 220 - ((yv - 2.8) / 2.0) * 180;
                return (
                  <g key={yv}>
                    <line x1={60} y1={y} x2={660} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} />
                    <text x={55} y={y + 4} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={10}>
                      {yv}%
                    </text>
                  </g>
                );
              })}
              {ladderRungs.map((rung, i) => {
                const barW = 62;
                const gap = (580 - ladderRungs.length * barW) / (ladderRungs.length + 1);
                const x = 60 + gap + i * (barW + gap);
                const barH = ((rung.yield - 2.8) / 2.0) * 180;
                const shade = Math.floor(55 + (i / ladderRungs.length) * 200);
                const color = `rgb(59, ${shade}, 246)`;
                return (
                  <g key={rung.maturity}>
                    <rect
                      x={x}
                      y={220 - barH}
                      width={barW}
                      height={barH}
                      rx={3}
                      fill={`rgba(59,130,246,${0.25 + i * 0.08})`}
                      stroke={color}
                      strokeWidth={1.5}
                    />
                    <text x={x + barW / 2} y={215 - barH} textAnchor="middle" fill="#93c5fd" fontSize={9} fontWeight="600">
                      {rung.yield.toFixed(2)}%
                    </text>
                    <text x={x + barW / 2} y={238} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10}>
                      {rung.maturity}
                    </text>
                    <text x={x + barW / 2} y={250} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9}>
                      {rung.allocation.toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-2 text-xs text-muted-foreground">
              Each bar = one maturity year. Heights show yield. Percentages = portfolio allocation per rung.
              Rebalance by rolling matured proceeds into the longest rung.
            </p>
          </SectionCard>
        </motion.div>
      )}

      {view === "bab" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <SectionCard>
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <h3 className="font-semibold">Build America Bonds (BABs)</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Created under the 2009 American Recovery and Reinvestment Act, BABs are taxable municipal
              bonds where the federal government subsidizes 35% of the interest cost. They attract
              institutional investors who don&apos;t benefit from tax-exempt status (pension funds, foreign investors).
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip label="Total Issued (2009–10)" value="$181B" sub="2-year program" />
              <StatChip label="Federal Subsidy" value="35%" sub="Of coupon cost" />
              <StatChip label="Typical Yield" value="+50–150bps" sub="Above tax-exempt" />
              <StatChip label="Key Buyers" value="Pensions" sub="Insurers, foreign" />
            </div>
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
              <strong>Sequestration Risk:</strong> BAB subsidy payments have been subject to automatic budget cuts (sequestration) since 2013, reducing the effective subsidy below 35%. Issuers bear this risk.
            </div>
          </SectionCard>
        </motion.div>
      )}
    </div>
  );
}

// ── Tab 5: Risk Factors ────────────────────────────────────────────────────────
function RiskFactorsTab() {
  const maxScore = 100;

  return (
    <div className="space-y-5">
      {/* IR sensitivity */}
      <SectionCard>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <h3 className="font-semibold">Interest Rate Sensitivity by Duration</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4">Category</th>
                <th className="pb-2 pr-4">Duration</th>
                <th className="pb-2 pr-4">+1% Rate Move</th>
                <th className="pb-2">-1% Rate Move</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { cat: "Short-Term (1–3yr)", dur: 2.1, loss: -2.1, gain: 2.1 },
                { cat: "Intermediate (3–7yr)", dur: 4.8, loss: -4.8, gain: 4.8 },
                { cat: "Core Muni (MUB)", dur: 6.8, loss: -6.8, gain: 6.8 },
                { cat: "Long-Term (10–20yr)", dur: 10.2, loss: -10.2, gain: 10.2 },
                { cat: "Ultra Long (20–30yr)", dur: 15.6, loss: -15.6, gain: 15.6 },
              ].map((row) => (
                <tr key={row.cat}>
                  <td className="py-2.5 pr-4 font-medium text-foreground">{row.cat}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{row.dur} yrs</td>
                  <td className="py-2.5 pr-4 text-red-400">{row.loss.toFixed(1)}%</td>
                  <td className="py-2.5 text-green-400">+{row.gain.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Price change ≈ −Duration × Δyield. A 7yr duration bond loses ~7% if rates rise 1%.
          Convexity slightly cushions downside and amplifies upside.
        </p>
      </SectionCard>

      {/* State Fiscal Health Scorecard */}
      <SectionCard>
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-purple-400" />
          <h3 className="font-semibold">State Fiscal Health Scorecard</h3>
        </div>

        {/* SVG Heatmap-style visualization */}
        <svg viewBox="0 0 700 300" className="w-full mb-3" style={{ maxHeight: 300 }}>
          {/* Color scale legend */}
          <defs>
            <linearGradient id="healthGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <rect x={60} y={10} width={580} height={14} rx={7} fill="url(#healthGradient)" opacity={0.6} />
          <text x={60} y={38} fill="hsl(var(--muted-foreground))" fontSize={9}>Weak</text>
          <text x={340} y={38} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9}>Moderate</text>
          <text x={640} y={38} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize={9}>Strong</text>

          {STATE_FISCAL_HEALTH.map((st, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 60 + col * 120;
            const y = 50 + row * 120;
            const color = fiscalScoreColor(st.score);
            return (
              <g key={st.state}>
                <rect x={x} y={y} width={110} height={100} rx={6}
                  fill={color + "22"} stroke={color} strokeWidth={1.5} />
                <text x={x + 55} y={y + 18} textAnchor="middle" fill={color} fontSize={11} fontWeight="700">
                  {st.state.split(" ").length > 1 ? st.state.split(" ").map(w => w[0]).join("") : st.state.substring(0, 8)}
                </text>
                <text x={x + 55} y={y + 36} textAnchor="middle" fill={color} fontSize={18} fontWeight="800">
                  {st.score}
                </text>
                <text x={x + 55} y={y + 50} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={9}>
                  {st.rating}
                </text>
                <text x={x + 55} y={y + 65} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8}>
                  Pension: {st.pensionFunded}%
                </text>
                <text x={x + 55} y={y + 78} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8}>
                  Debt/cap: ${(st.debtPerCapita / 1000).toFixed(1)}K
                </text>
                <text x={x + 55} y={y + 91} textAnchor="middle"
                  fill={st.budgetBalance >= 0 ? "#22c55e" : "#ef4444"} fontSize={8} fontWeight="600">
                  Budget: {st.budgetBalance > 0 ? "+" : ""}{st.budgetBalance}%
                </text>
              </g>
            );
          })}
        </svg>

        <p className="text-xs text-muted-foreground">
          Score 0–100. Factors: pension funded ratio (30%), debt/capita (20%), budget balance (25%), credit rating (25%).
        </p>
      </SectionCard>

      {/* Risk factors grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="font-semibold">AMT Exposure Risk</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Private Activity Bonds (PABs) — financing airports, housing, student loans — may
            trigger the Alternative Minimum Tax for some investors. High-income earners should verify
            AMT status before buying.
          </p>
          <div className="space-y-2 text-sm">
            {[
              { type: "Airport Revenue Bonds", amtRisk: "High" },
              { type: "Housing Authority Bonds", amtRisk: "High" },
              { type: "Student Loan Bonds", amtRisk: "High" },
              { type: "State GO Bonds", amtRisk: "None" },
              { type: "Essential Service Revenue", amtRisk: "None" },
            ].map((row) => (
              <div key={row.type} className="flex items-center justify-between rounded bg-muted/20 px-3 py-2">
                <span className="text-foreground">{row.type}</span>
                <span className={cn(
                  "rounded px-2 py-0.5 text-xs font-semibold",
                  row.amtRisk === "None" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  AMT: {row.amtRisk}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-red-400" />
            <h3 className="font-semibold">Liquidity Risk</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            The muni market is largely OTC with wide bid-ask spreads for individual bonds.
            Large trades from institutional holders can move prices significantly for smaller issues.
          </p>
          <div className="space-y-3">
            {[
              { metric: "Avg Bid-Ask Spread (ETF)", value: "0.01–0.03%", color: "text-green-400" },
              { metric: "Avg Bid-Ask Spread (Ind. Bond)", value: "0.25–1.0%", color: "text-yellow-400" },
              { metric: "Daily Trading Volume (MUB)", value: "~$500M", color: "text-blue-400" },
              { metric: "Market Maker Presence", value: "Limited OTC", color: "text-amber-400" },
              { metric: "Crisis Liquidity (Mar 2020)", value: "Spreads spiked 3–5%", color: "text-red-400" },
            ].map((row) => (
              <div key={row.metric} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{row.metric}</span>
                <span className={row.color}>{row.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Callout card */}
      <SectionCard>
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tax Reform Risk:</strong> Munis trade on after-tax value. Lower tax rates reduce the tax advantage and compress muni prices.
            The 2017 Tax Cuts and Jobs Act eliminated advance refunding of muni bonds, reducing supply.
            Any future reduction in corporate/personal tax rates may negatively impact muni valuations.
            <br /><br />
            <strong className="text-foreground">Callable Bonds:</strong> Many munis are callable at par after 10 years. In a falling rate environment, the best-yielding bonds get called away.
            Always check the yield-to-worst (YTW) not just nominal yield.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MuniBondsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
              <Landmark className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Municipal Bonds</h1>
              <p className="text-sm text-muted-foreground">
                Tax-exempt fixed income — analyzing a $4T market of state &amp; local government debt
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top-level summary chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <StatChip label="Market Size" value="$4.0T" sub="Largest tax-exempt market" />
          <StatChip label="Avg TEY (37% bracket)" value="~5.4%" sub="3.4% muni ÷ (1−37%)" />
          <StatChip label="IG Default Rate (10yr)" value="0.10%" sub="vs 2.24% IG corporate" />
          <StatChip label="Tax Brackets Benefiting" value="24%+" sub="Federal rate threshold" />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5" />
              Market Overview
            </TabsTrigger>
            <TabsTrigger value="tey" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Calculator className="h-3.5 w-3.5" />
              Tax-Equiv. Yield
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Credit Analysis
            </TabsTrigger>
            <TabsTrigger value="etfs" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <DollarSign className="h-3.5 w-3.5" />
              ETFs vs Bonds
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <AlertTriangle className="h-3.5 w-3.5" />
              Risk Factors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="data-[state=inactive]:hidden">
            <MarketOverviewTab />
          </TabsContent>
          <TabsContent value="tey" className="data-[state=inactive]:hidden">
            <TaxEquivalentYieldTab />
          </TabsContent>
          <TabsContent value="credit" className="data-[state=inactive]:hidden">
            <CreditAnalysisTab />
          </TabsContent>
          <TabsContent value="etfs" className="data-[state=inactive]:hidden">
            <ETFsTab />
          </TabsContent>
          <TabsContent value="risks" className="data-[state=inactive]:hidden">
            <RiskFactorsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
