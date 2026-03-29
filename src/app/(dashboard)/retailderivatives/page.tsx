"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  BarChart2,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  DollarSign,
  Users,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────
let s = 752002;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface OptionRow {
  ticker: string;
  type: "Equity" | "ETF" | "Index";
  strike: number;
  expiry: string;
  bid: number;
  ask: number;
  iv: number;
  delta: number;
  openInterest: number;
  volume: number;
  marginRequired: number;
  cashSecured: number;
}

interface LevETF {
  name: string;
  ticker: string;
  leverage: number;
  underlying: string;
  expense: number;
  aum: number;
  avgDailyVol: number;
}

interface StructuredNote {
  id: string;
  name: string;
  type: "Principal-Protected" | "Leveraged" | "Reverse Convertible";
  issuer: string;
  notional: number;
  term: number;
  participation: number;
  coupon: number;
  barrierLevel: number;
  creditRating: string;
  embeddedOption: string;
  fairValue: number;
  issuePrice: number;
  spread: number;
}

interface Warrant {
  id: string;
  company: string;
  ticker: string;
  exercisePrice: number;
  currentStock: number;
  expiry: string;
  outstanding: number;
  dilution: number;
  intrinsic: number;
  timeValue: number;
  premium: number;
}

interface AlternativeProduct {
  name: string;
  type: "Interval Fund" | "Non-Traded REIT" | "BDC" | "Reg CF" | "Reg A+";
  minInvestment: number;
  accreditedRequired: boolean;
  liquidity: string;
  targetYield: number;
  fees: number;
  aum: number;
  lockup: string;
  riskLevel: "Low" | "Medium" | "High" | "Very High";
}

// ─── Generate Option Chain Data ───────────────────────────────────────────────

const OPTION_ROWS: OptionRow[] = (() => {
  const tickers: Array<{ t: string; type: OptionRow["type"]; base: number }> = [
    { t: "AAPL", type: "Equity", base: 182 },
    { t: "MSFT", type: "Equity", base: 415 },
    { t: "TSLA", type: "Equity", base: 248 },
    { t: "SPY", type: "ETF", base: 521 },
    { t: "QQQ", type: "ETF", base: 448 },
    { t: "IWM", type: "ETF", base: 205 },
    { t: "SPX", type: "Index", base: 5210 },
    { t: "NDX", type: "Index", base: 18240 },
    { t: "RUT", type: "Index", base: 2052 },
    { t: "VIX", type: "Index", base: 18 },
  ];
  const expiries = ["Apr-25", "May-25", "Jun-25", "Sep-25", "Dec-25"];
  return tickers.map(({ t, type, base }) => {
    const strike = Math.round((base * (0.95 + rand() * 0.1)) / (base > 1000 ? 50 : 5)) * (base > 1000 ? 50 : 5);
    const iv = 0.15 + rand() * 0.45;
    const bid = parseFloat((base * 0.02 + rand() * base * 0.03).toFixed(2));
    const ask = parseFloat((bid + bid * 0.05 + rand() * 0.5).toFixed(2));
    const delta = parseFloat((0.3 + rand() * 0.4).toFixed(2));
    const oi = Math.round(500 + rand() * 15000);
    const vol = Math.round(50 + rand() * 3000);
    const marginRequired = parseFloat((base * 0.2 + base * rand() * 0.05).toFixed(2));
    const cashSecured = parseFloat((strike * 100).toFixed(0));
    return {
      ticker: t,
      type,
      strike,
      expiry: expiries[Math.floor(rand() * expiries.length)],
      bid,
      ask,
      iv: parseFloat((iv * 100).toFixed(1)),
      delta,
      openInterest: oi,
      volume: vol,
      marginRequired,
      cashSecured,
    };
  });
})();

// ─── Generate Leveraged ETF Data ──────────────────────────────────────────────

const LEV_ETFS: LevETF[] = [
  { name: "ProShares UltraPro QQQ", ticker: "TQQQ", leverage: 3, underlying: "Nasdaq-100", expense: 0.88, aum: 21.4, avgDailyVol: 2.1 },
  { name: "ProShares UltraPro S&P500", ticker: "UPRO", leverage: 3, underlying: "S&P 500", expense: 0.92, aum: 3.8, avgDailyVol: 0.4 },
  { name: "Direxion Daily Financial Bull 3X", ticker: "FAS", leverage: 3, underlying: "Russell 1000 Fin.", expense: 0.95, aum: 1.9, avgDailyVol: 0.3 },
  { name: "ProShares UltraShort QQQ", ticker: "QID", leverage: -2, underlying: "Nasdaq-100", expense: 0.95, aum: 0.9, avgDailyVol: 0.2 },
  { name: "ProShares Ultra S&P500", ticker: "SSO", leverage: 2, underlying: "S&P 500", expense: 0.89, aum: 5.1, avgDailyVol: 0.5 },
  { name: "Direxion Daily S&P 500 Bear 3X", ticker: "SPXS", leverage: -3, underlying: "S&P 500", expense: 1.01, aum: 0.7, avgDailyVol: 0.3 },
  { name: "ProShares UltraPro Short QQQ", ticker: "SQQQ", leverage: -3, underlying: "Nasdaq-100", expense: 0.88, aum: 4.2, avgDailyVol: 1.8 },
  { name: "Direxion Daily Semiconductor Bull 3X", ticker: "SOXL", leverage: 3, underlying: "PHLX Semiconductor", expense: 0.76, aum: 9.3, avgDailyVol: 2.4 },
];

// Compute volatility decay simulation
function computeCompoundingDecay(leverage: number, days: number, dailyVol: number): number[] {
  // Reset rand seed for deterministic chart
  let localS = 752002 + Math.abs(leverage) * 1000;
  const localRand = () => {
    localS = (localS * 1103515245 + 12345) & 0x7fffffff;
    return localS / 0x7fffffff;
  };
  const values1x = [100];
  const valuesLev = [100];
  for (let i = 1; i <= days; i++) {
    const dailyReturn = (localRand() - 0.5) * 2 * dailyVol;
    values1x.push(values1x[i - 1] * (1 + dailyReturn));
    valuesLev.push(valuesLev[i - 1] * (1 + leverage * dailyReturn));
  }
  return [values1x[days], valuesLev[days]];
}

// ─── Generate Structured Notes Data ──────────────────────────────────────────

const STRUCTURED_NOTES: StructuredNote[] = (() => {
  const issuers = ["JPMorgan", "Goldman Sachs", "Citibank", "Morgan Stanley", "Barclays"];
  const ratings = ["AA+", "AA", "AA-", "A+", "A"];
  const types: StructuredNote["type"][] = ["Principal-Protected", "Leveraged", "Reverse Convertible"];
  return Array.from({ length: 9 }, (_, i) => {
    const type = types[i % 3];
    const notional = 1000;
    const term = Math.round(1 + rand() * 4);
    const participation = parseFloat((80 + rand() * 70).toFixed(0));
    const coupon = type === "Reverse Convertible" ? parseFloat((8 + rand() * 15).toFixed(1)) : 0;
    const barrier = type === "Reverse Convertible" ? parseFloat((60 + rand() * 20).toFixed(0)) : 100;
    const fairValue = parseFloat((920 + rand() * 60).toFixed(0));
    const issuePrice = 1000;
    return {
      id: `SN-${i + 1}`,
      name:
        type === "Principal-Protected"
          ? `${issuers[i % 5]} ${["S&P", "Nasdaq", "Global"][i % 3]} Growth Note`
          : type === "Leveraged"
          ? `${issuers[i % 5]} Accelerated Return Note`
          : `${issuers[i % 5]} Reverse Convertible on ${["AAPL", "TSLA", "AMZN"][i % 3]}`,
      type,
      issuer: issuers[i % 5],
      notional,
      term,
      participation,
      coupon,
      barrierLevel: barrier,
      creditRating: ratings[i % 5],
      embeddedOption:
        type === "Principal-Protected"
          ? "Long ATM Call on Index"
          : type === "Leveraged"
          ? "Long Call Spread (1.5x–2.5x)"
          : "Short OTM Put + Long Bond",
      fairValue,
      issuePrice,
      spread: parseFloat(((issuePrice - fairValue) / issuePrice * 100).toFixed(1)),
    };
  });
})();

// ─── Generate Warrants Data ───────────────────────────────────────────────────

const WARRANTS: Warrant[] = (() => {
  const companies = [
    { co: "Aurora Cannabis", t: "ACB.WT" },
    { co: "SPAC Holdings Corp", t: "SPACH.WS" },
    { co: "Rivian Warrants", t: "RIVN.WS" },
    { co: "Lucid Group", t: "LCID.WS" },
    { co: "Desktop Metal", t: "DM.WS" },
    { co: "Ginkgo Bioworks", t: "DNA.WS" },
  ];
  return companies.map(({ co, t }, i) => {
    const stock = parseFloat((3 + rand() * 25).toFixed(2));
    const exercisePrice = parseFloat((stock * (1.1 + rand() * 0.8)).toFixed(2));
    const intrinsic = Math.max(0, stock - exercisePrice);
    const timeValue = parseFloat((0.5 + rand() * 3).toFixed(2));
    const premium = parseFloat((intrinsic + timeValue).toFixed(2));
    const outstandingM = parseFloat((10 + rand() * 40).toFixed(1));
    const shareCount = 100 + rand() * 400;
    const dilution = parseFloat(((outstandingM / shareCount) * 100).toFixed(2));
    return {
      id: `WRT-${i + 1}`,
      company: co,
      ticker: t,
      exercisePrice,
      currentStock: stock,
      expiry: `${2025 + Math.floor(rand() * 3)}-${String(Math.floor(1 + rand() * 12)).padStart(2, "0")}-15`,
      outstanding: outstandingM,
      dilution,
      intrinsic: parseFloat(intrinsic.toFixed(2)),
      timeValue,
      premium,
    };
  });
})();

// ─── Generate Alternative Products Data ───────────────────────────────────────

const ALT_PRODUCTS: AlternativeProduct[] = [
  { name: "Blackstone Real Estate Income Trust", type: "Non-Traded REIT", minInvestment: 2500, accreditedRequired: false, liquidity: "Monthly (limited)", targetYield: 5.1, fees: 1.25, aum: 58.2, lockup: "12 months", riskLevel: "Medium" },
  { name: "Blue Owl Capital Corp III", type: "BDC", minInvestment: 5000, accreditedRequired: false, liquidity: "Daily (exchange)", targetYield: 9.8, fees: 1.5, aum: 4.1, lockup: "None", riskLevel: "High" },
  { name: "Cliffwater Corporate Lending Fund", type: "Interval Fund", minInvestment: 10000, accreditedRequired: false, liquidity: "Quarterly (5%)", targetYield: 10.2, fees: 1.85, aum: 19.7, lockup: "Quarterly redemption", riskLevel: "High" },
  { name: "Apollo Diversified Credit Fund", type: "Interval Fund", minInvestment: 25000, accreditedRequired: true, liquidity: "Quarterly (5%)", targetYield: 11.4, fees: 1.95, aum: 9.4, lockup: "Quarterly redemption", riskLevel: "High" },
  { name: "Republic Solar Energy Project", type: "Reg CF", minInvestment: 100, accreditedRequired: false, liquidity: "Illiquid", targetYield: 7.5, fees: 5.0, aum: 0.008, lockup: "5 years", riskLevel: "Very High" },
  { name: "StartEngine Tech Fund II", type: "Reg A+", minInvestment: 500, accreditedRequired: false, liquidity: "Illiquid", targetYield: 0, fees: 4.5, aum: 0.05, lockup: "3–7 years", riskLevel: "Very High" },
  { name: "Hines Real Estate Partners", type: "Non-Traded REIT", minInvestment: 2500, accreditedRequired: false, liquidity: "Quarterly (limited)", targetYield: 4.8, fees: 1.1, aum: 12.8, lockup: "18 months", riskLevel: "Medium" },
  { name: "Prospect Capital Corp", type: "BDC", minInvestment: 1000, accreditedRequired: false, liquidity: "Daily (exchange)", targetYield: 8.6, fees: 1.85, aum: 7.3, lockup: "None", riskLevel: "High" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div className={cn("rounded-lg border p-4", color)}>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function RiskBadge({ level }: { level: AlternativeProduct["riskLevel"] }) {
  const colors: Record<AlternativeProduct["riskLevel"], string> = {
    Low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Very High": "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return <span className={cn("px-2 py-0.5 rounded-full text-xs border font-medium", colors[level])}>{level}</span>;
}

// ─── Tab 1: Exchange-Traded Options ──────────────────────────────────────────

function ExchangeTradedOptionsTab() {
  const [filterType, setFilterType] = useState<"All" | "Equity" | "ETF" | "Index">("All");
  const [expandCompare, setExpandCompare] = useState(false);
  const [expandMargin, setExpandMargin] = useState(false);

  const filtered = useMemo(
    () => (filterType === "All" ? OPTION_ROWS : OPTION_ROWS.filter((r) => r.type === filterType)),
    [filterType]
  );

  const comparisonRows: Array<{ feature: string; options: string; stock: string }> = [
    { feature: "Capital Required", options: "Premium only (buyer)", stock: "Full share price" },
    { feature: "Max Loss (Buyer)", options: "Premium paid", stock: "Full investment" },
    { feature: "Leverage", options: "Up to 10–50×", stock: "None (unless margin)" },
    { feature: "Expiration", options: "Fixed expiry date", stock: "No expiry" },
    { feature: "Profit from decline", options: "Yes (puts)", stock: "Only via short selling" },
    { feature: "Income generation", options: "Yes (covered calls/CSP)", stock: "Dividends only" },
    { feature: "Complexity", options: "High", stock: "Low" },
    { feature: "Regulatory access", options: "Options approval required", stock: "Open to all" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoCard title="CBOE Daily Volume" value="~45M contracts" sub="All products combined" color="border-border bg-muted/50" />
        <InfoCard title="Equity Options" value="4,000+ tickers" sub="Single stocks" color="border-border bg-muted/50" />
        <InfoCard title="Index Options" value="European style" sub="Cash-settled at expiry" color="border-border bg-muted/50" />
        <InfoCard title="Options Approval" value="Levels 1–5" sub="Broker-granted tiers" color="border-border bg-muted/50" />
      </div>

      {/* CBOE Overview */}
      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BookOpen size={15} className="text-primary" /> CBOE Product Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            {
              title: "Equity Options",
              color: "border-primary/40 bg-primary/5",
              items: [
                "American-style exercise",
                "100-share contracts",
                "Weekly, monthly, LEAPS maturities",
                "Physical delivery at expiry",
                "Dividends affect put-call parity",
              ],
            },
            {
              title: "ETF Options",
              color: "border-primary/40 bg-primary/5",
              items: [
                "Tracks basket of assets",
                "SPY, QQQ, IWM most liquid",
                "Excellent for hedging portfolios",
                "American-style like equity",
                "Lower IV vs single stocks",
              ],
            },
            {
              title: "Index Options",
              color: "border-emerald-500/40 bg-emerald-500/5",
              items: [
                "European-style (no early exercise)",
                "Cash-settled — no shares delivered",
                "SPX, NDX, RUT most traded",
                "60/40 tax treatment (Section 1256)",
                "VIX options on volatility itself",
              ],
            },
          ].map((col) => (
            <div key={col.title} className={cn("rounded-lg border p-4", col.color)}>
              <p className="font-semibold text-white mb-3">{col.title}</p>
              <ul className="space-y-1.5">
                {col.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Option Chain Table */}
      <div className="rounded-xl border border-border bg-card/50">
        <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-semibold text-white">Sample Options Chain</h3>
          <div className="flex gap-1.5">
            {(["All", "Equity", "ETF", "Index"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  filterType === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2.5">Ticker</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-right px-4 py-2.5">Strike</th>
                <th className="text-left px-4 py-2.5">Expiry</th>
                <th className="text-right px-4 py-2.5">Bid</th>
                <th className="text-right px-4 py-2.5">Ask</th>
                <th className="text-right px-4 py-2.5">IV%</th>
                <th className="text-right px-4 py-2.5">Delta</th>
                <th className="text-right px-4 py-2.5">OI</th>
                <th className="text-right px-4 py-2.5">Vol</th>
                <th className="text-right px-4 py-2.5">Margin Req</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <motion.tr
                  key={row.ticker}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5 font-semibold text-white">{row.ticker}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        row.type === "Equity" ? "bg-primary/20 text-primary" : row.type === "ETF" ? "bg-primary/20 text-primary" : "bg-emerald-500/20 text-emerald-400"
                      )}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-foreground">${row.strike.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.expiry}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-400">${row.bid.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-red-400">${row.ask.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-amber-400">{row.iv}%</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{row.delta.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{row.openInterest.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{row.volume.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">${row.marginRequired.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Margin vs Cash-Secured */}
      <div className="rounded-xl border border-border bg-muted/40">
        <button
          className="w-full p-4 flex items-center justify-between text-left"
          onClick={() => setExpandMargin(!expandMargin)}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield size={15} className="text-amber-400" /> Margin vs Cash-Secured: What Retail Needs to Know
          </h3>
          {expandMargin ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {expandMargin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                  <p className="font-semibold text-amber-400">Margin-Secured Put</p>
                  <p className="text-muted-foreground">Broker lends portion of collateral. Amplifies risk if stock collapses below margin requirement. Maintenance margin calls possible.</p>
                  <p className="text-muted-foreground text-xs">Typical: 20% of underlying + premium − OTM amount</p>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                  <p className="font-semibold text-emerald-400">Cash-Secured Put</p>
                  <p className="text-muted-foreground">Full strike × 100 held in cash. Maximum downside = stock going to zero. No margin calls. Suitable for Options Level 1.</p>
                  <p className="text-muted-foreground text-xs">Capital required = Strike × 100 per contract</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options vs Stock Comparison */}
      <div className="rounded-xl border border-border bg-muted/40">
        <button
          className="w-full p-4 flex items-center justify-between text-left"
          onClick={() => setExpandCompare(!expandCompare)}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BarChart2 size={15} className="text-primary" /> Options vs Stock: Feature Comparison
          </h3>
          {expandCompare ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {expandCompare && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs">
                      <th className="text-left py-2 pr-4">Feature</th>
                      <th className="text-left py-2 pr-4 text-primary">Options</th>
                      <th className="text-left py-2 text-muted-foreground">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.feature} className="border-b border-border text-sm">
                        <td className="py-2 pr-4 text-muted-foreground text-xs">{row.feature}</td>
                        <td className="py-2 pr-4 text-foreground text-xs">{row.options}</td>
                        <td className="py-2 text-foreground text-xs">{row.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab 2: Leveraged & Inverse ETFs ─────────────────────────────────────────

function LeveragedETFsTab() {
  const [selected, setSelected] = useState<LevETF>(LEV_ETFS[0]);
  const [days, setDays] = useState(90);

  // Build compounding decay SVG chart for selected ETF
  const chartData = useMemo(() => {
    const lev = selected.leverage;
    const dailyVol = 0.02;
    let localS = 752002 + Math.abs(lev) * 1000 + LEV_ETFS.indexOf(selected) * 111;
    const lr = () => {
      localS = (localS * 1103515245 + 12345) & 0x7fffffff;
      return localS / 0x7fffffff;
    };
    const v1: number[] = [100];
    const vL: number[] = [100];
    for (let i = 1; i <= days; i++) {
      const r = (lr() - 0.5) * 2 * dailyVol;
      v1.push(v1[i - 1] * (1 + r));
      vL.push(vL[i - 1] * (1 + lev * r));
    }
    return { v1, vL };
  }, [selected, days]);

  const svgW = 520;
  const svgH = 200;
  const pad = { t: 16, r: 16, b: 32, l: 48 };
  const plotW = svgW - pad.l - pad.r;
  const plotH = svgH - pad.t - pad.b;

  const allVals = [...chartData.v1, ...chartData.vL];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const toX = (i: number) => pad.l + (i / days) * plotW;
  const toY = (v: number) => pad.t + plotH - ((v - minV) / range) * plotH;

  const pathOf = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");

  const yTicks = [minV, minV + range / 4, minV + range / 2, minV + (range * 3) / 4, maxV];

  const volatilityDecayPct = useMemo(() => {
    const [end1x, endLev] = computeCompoundingDecay(selected.leverage, 252, 0.018);
    const expectedLev = 100 * Math.pow(end1x / 100, Math.abs(selected.leverage)) * (selected.leverage < 0 ? -1 : 1);
    const diff = endLev - (100 + (expectedLev - 100));
    return diff.toFixed(1);
  }, [selected]);

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-red-400 mb-1">Not Suitable for Long-Term Holding</p>
          <p className="text-muted-foreground">Leveraged and inverse ETFs reset daily. Volatility decay (beta slippage) erodes returns over time. These products are designed for short-term tactical use — typically intraday to a few days.</p>
        </div>
      </div>

      {/* ETF Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {LEV_ETFS.map((etf) => (
          <button
            key={etf.ticker}
            onClick={() => setSelected(etf)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              selected.ticker === etf.ticker
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/40 hover:border-muted-foreground"
            )}
          >
            <p className="font-bold text-white text-sm">{etf.ticker}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{etf.leverage > 0 ? "+" : ""}{etf.leverage}× {etf.underlying.slice(0, 15)}</p>
            <p className={cn("text-xs font-semibold mt-1", etf.leverage > 0 ? "text-emerald-400" : "text-red-400")}>
              {etf.leverage > 0 ? "Bull" : "Bear"} {Math.abs(etf.leverage)}×
            </p>
          </button>
        ))}
      </div>

      {/* Detail + Chart */}
      <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-bold text-white">{selected.name}</h3>
            <p className="text-sm text-muted-foreground">{selected.ticker} · {selected.leverage > 0 ? "+" : ""}{selected.leverage}× Daily · {selected.underlying}</p>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">AUM</p>
              <p className="text-white font-semibold">${selected.aum}B</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Exp Ratio</p>
              <p className="text-amber-400 font-semibold">{selected.expense}%</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Vol Decay Est.</p>
              <p className="text-red-400 font-semibold">{volatilityDecayPct}% / yr</p>
            </div>
          </div>
        </div>

        {/* Simulation controls */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Simulation horizon:</span>
          {[30, 60, 90, 180, 252].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                days === d ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted"
              )}
            >
              {d === 252 ? "1Y" : `${d}d`}
            </button>
          ))}
        </div>

        {/* SVG Chart */}
        <div className="rounded-lg bg-card/60 p-2">
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {yTicks.map((v, i) => (
              <g key={i}>
                <line
                  x1={pad.l}
                  y1={toY(v)}
                  x2={svgW - pad.r}
                  y2={toY(v)}
                  stroke="#3f3f46"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
                <text x={pad.l - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">
                  {v.toFixed(0)}
                </text>
              </g>
            ))}
            {/* 100 reference line */}
            <line
              x1={pad.l}
              y1={toY(100)}
              x2={svgW - pad.r}
              y2={toY(100)}
              stroke="#52525b"
              strokeWidth="1"
              strokeDasharray="6,3"
            />
            {/* 1x path */}
            <path d={pathOf(chartData.v1)} fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            {/* Leveraged path */}
            <path
              d={pathOf(chartData.vL)}
              fill="none"
              stroke={selected.leverage > 0 ? "#34d399" : "#f87171"}
              strokeWidth="2"
            />
            {/* X axis */}
            <line x1={pad.l} y1={pad.t + plotH} x2={svgW - pad.r} y2={pad.t + plotH} stroke="#52525b" strokeWidth="1" />
            {/* X labels */}
            {[0, Math.round(days / 4), Math.round(days / 2), Math.round((days * 3) / 4), days].map((d) => (
              <text key={d} x={toX(d)} y={svgH - 6} textAnchor="middle" fontSize="9" fill="#71717a">
                {d}d
              </text>
            ))}
            {/* Legend */}
            <circle cx={pad.l + 10} cy={12} r={4} fill="#60a5fa" />
            <text x={pad.l + 18} y={16} fontSize="9" fill="#60a5fa">1× Base</text>
            <circle cx={pad.l + 75} cy={12} r={4} fill={selected.leverage > 0 ? "#34d399" : "#f87171"} />
            <text x={pad.l + 83} y={16} fontSize="9" fill={selected.leverage > 0 ? "#34d399" : "#f87171"}>
              {selected.leverage}× Leveraged
            </text>
          </svg>
        </div>
      </div>

      {/* Volatility Decay Math */}
      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap size={15} className="text-amber-400" /> Volatility Decay (Beta Slippage) Mathematics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2 text-muted-foreground">
            <p>For a 2× daily leveraged ETF, over two days with +10% then −10%:</p>
            <div className="rounded-lg bg-card p-3 font-mono text-xs space-y-1">
              <p className="text-muted-foreground">// Underlying returns</p>
              <p>Day 1: +10% → 100 × 1.10 = <span className="text-white">110.00</span></p>
              <p>Day 2: −10% → 110 × 0.90 = <span className="text-white">99.00</span></p>
              <p className="text-muted-foreground mt-2">// 2× ETF returns (daily reset)</p>
              <p>Day 1: +20% → 100 × 1.20 = <span className="text-emerald-400">120.00</span></p>
              <p>Day 2: −20% → 120 × 0.80 = <span className="text-red-400">96.00</span></p>
              <p className="text-amber-400 mt-2">// Underlying: −1% · Leveraged: −4%</p>
              <p className="text-amber-400">// "Multiplier drag" = extra −3%</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Key formula: Daily compounding introduces negative convexity proportional to variance:</p>
            <div className="rounded-lg bg-card p-3 font-mono text-xs">
              <p className="text-muted-foreground">// Annual decay approximation</p>
              <p className="text-white">{"decay ≈ −0.5 × (L² − L) × σ²"}</p>
              <p className="text-muted-foreground mt-1">L = leverage, σ = daily vol</p>
              <p className="text-amber-400 mt-2">{"// 3× ETF, σ=2%/day: −0.5×(9−3)×0.0004"}</p>
              <p className="text-amber-400">{"// = −0.12% per day = ~−30% annualized drag"}</p>
            </div>
            <p className="text-xs text-muted-foreground">Drag worsens in choppy, mean-reverting markets. Trending markets reduce drag but do not eliminate it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Structured Notes ──────────────────────────────────────────────────

function StructuredNotesTab() {
  const [filterType, setFilterType] = useState<StructuredNote["type"] | "All">("All");
  const [selected, setSelected] = useState<StructuredNote | null>(null);

  const filtered = filterType === "All" ? STRUCTURED_NOTES : STRUCTURED_NOTES.filter((n) => n.type === filterType);

  const typeColors: Record<StructuredNote["type"], string> = {
    "Principal-Protected": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Leveraged": "bg-primary/20 text-primary border-border",
    "Reverse Convertible": "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            t: "Principal-Protected Notes",
            desc: "Guarantees return of principal at maturity. Upside linked to index performance. Issuer embeds long call option funded by ZCB discount.",
            risk: "Issuer credit risk only",
            color: "border-emerald-500/40 bg-emerald-500/5",
            icon: <Shield size={14} className="text-emerald-400" />,
          },
          {
            t: "Leveraged Participation Notes",
            desc: "Amplified exposure to upside (e.g., 1.5× or 2× on index gains) with potential downside buffer. No guaranteed principal.",
            risk: "Market + credit risk",
            color: "border-primary/40 bg-primary/5",
            icon: <TrendingUp size={14} className="text-primary" />,
          },
          {
            t: "Reverse Convertibles",
            desc: "High coupon income. If stock drops below barrier at maturity, investor receives depreciated stock instead of cash.",
            risk: "Full downside below barrier",
            color: "border-red-500/40 bg-red-500/5",
            icon: <TrendingDown size={14} className="text-red-400" />,
          },
        ].map((c) => (
          <div key={c.t} className={cn("rounded-xl border p-4", c.color)}>
            <div className="flex items-center gap-2 mb-2">
              {c.icon}
              <p className="font-semibold text-white text-sm">{c.t}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{c.desc}</p>
            <p className="text-xs text-muted-foreground italic">{c.risk}</p>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="rounded-xl border border-border bg-card/50">
        <div className="p-4 border-b border-border flex flex-wrap gap-2">
          {(["All", "Principal-Protected", "Leveraged", "Reverse Convertible"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filterType === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2.5">ID</th>
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-left px-4 py-2.5">Issuer</th>
                <th className="text-right px-4 py-2.5">Term</th>
                <th className="text-right px-4 py-2.5">Participation</th>
                <th className="text-right px-4 py-2.5">Coupon%</th>
                <th className="text-right px-4 py-2.5">Rating</th>
                <th className="text-right px-4 py-2.5">Fair Value</th>
                <th className="text-right px-4 py-2.5">Spread</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((note, i) => (
                <motion.tr
                  key={note.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(selected?.id === note.id ? null : note)}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors",
                    selected?.id === note.id ? "bg-primary/10" : "hover:bg-muted/30"
                  )}
                >
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{note.id}</td>
                  <td className="px-4 py-2.5 text-foreground max-w-[200px] truncate">{note.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs border", typeColors[note.type])}>
                      {note.type === "Principal-Protected" ? "PP" : note.type === "Leveraged" ? "Lev" : "RevCon"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{note.issuer}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{note.term}yr</td>
                  <td className="px-4 py-2.5 text-right text-emerald-400">{note.participation}%</td>
                  <td className="px-4 py-2.5 text-right text-amber-400">{note.coupon > 0 ? `${note.coupon}%` : "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={cn("font-semibold", ["AA+", "AA"].includes(note.creditRating) ? "text-emerald-400" : "text-amber-400")}>
                      {note.creditRating}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-foreground">${note.fairValue}</td>
                  <td className="px-4 py-2.5 text-right text-red-400">{note.spread}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-xl border border-border bg-muted/60 p-5 space-y-4"
          >
            <h3 className="text-sm font-semibold text-white">{selected.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-muted-foreground">Embedded Option Decomposition</p>
                <div className="rounded-lg bg-card p-3 text-xs space-y-1.5 font-mono">
                  <p className="text-muted-foreground">// Structural decomposition</p>
                  <p className="text-foreground">Option leg: <span className="text-primary">{selected.embeddedOption}</span></p>
                  <p className="text-foreground">Funding: <span className="text-muted-foreground">ZCB + note issuance proceeds</span></p>
                  <p className="text-foreground">Barrier: <span className="text-amber-400">{selected.barrierLevel}% of initial level</span></p>
                  <p className="text-amber-400 mt-2">// Retail pricing transparency</p>
                  <p>Issue Price: <span className="text-white">$1,000.00</span></p>
                  <p>Fair Value est.: <span className="text-white">${selected.fairValue}</span></p>
                  <p>Implied spread: <span className="text-red-400">{selected.spread}% of notional</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Issuer Credit Risk Assessment</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Issuer</span>
                    <span className="text-white font-semibold">{selected.issuer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit Rating</span>
                    <span className={cn("font-semibold", ["AA+", "AA"].includes(selected.creditRating) ? "text-emerald-400" : "text-amber-400")}>
                      {selected.creditRating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Term to Maturity</span>
                    <span>{selected.term} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Not FDIC Insured</span>
                    <span className="text-red-400">Correct</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Secondary Liquidity</span>
                    <span className="text-amber-400">Limited / illiquid</span>
                  </div>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-muted-foreground mt-2">
                  If issuer defaults, investor is an unsecured creditor. Principal protection is only as strong as the issuer's credit.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab 4: Warrants & Rights ─────────────────────────────────────────────────

function WarrantsRightsTab() {
  const [expandDiff, setExpandDiff] = useState(false);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoCard title="Typical Term" value="3–7 years" sub="Longer than listed options" color="border-border bg-muted/50" />
        <InfoCard title="Dilution Impact" value="2–15%" sub="Depends on structure" color="border-border bg-muted/50" />
        <InfoCard title="Exercise Style" value="Usually American" sub="Some European-style" color="border-border bg-muted/50" />
        <InfoCard title="Common Source" value="SPACs & Biotech" sub="Attached to unit offerings" color="border-border bg-muted/50" />
      </div>

      {/* Warrant Table */}
      <div className="rounded-xl border border-border bg-card/50">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Sample Warrant Universe</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2.5">Company</th>
                <th className="text-left px-4 py-2.5">Ticker</th>
                <th className="text-right px-4 py-2.5">Exercise Price</th>
                <th className="text-right px-4 py-2.5">Stock Price</th>
                <th className="text-left px-4 py-2.5">Expiry</th>
                <th className="text-right px-4 py-2.5">Intrinsic</th>
                <th className="text-right px-4 py-2.5">Time Value</th>
                <th className="text-right px-4 py-2.5">Premium</th>
                <th className="text-right px-4 py-2.5">Dilution</th>
              </tr>
            </thead>
            <tbody>
              {WARRANTS.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5 text-foreground">{w.company}</td>
                  <td className="px-4 py-2.5 font-semibold text-primary font-mono">{w.ticker}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">${w.exercisePrice.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-white">${w.currentStock.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{w.expiry}</td>
                  <td className={cn("px-4 py-2.5 text-right", w.intrinsic > 0 ? "text-emerald-400" : "text-muted-foreground")}>
                    ${w.intrinsic.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-amber-400">${w.timeValue.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">${w.premium.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-red-400">{w.dilution.toFixed(2)}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dilution Impact Calculator */}
      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign size={15} className="text-emerald-400" /> Dilution Impact: How Warrants Affect Existing Shareholders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-card p-4 space-y-2 font-mono text-xs">
            <p className="text-muted-foreground">// Example: 100M shares outstanding</p>
            <p className="text-foreground">{"Pre-exercise shares:  100,000,000"}</p>
            <p className="text-foreground">{"Warrants outstanding:  15,000,000"}</p>
            <p className="text-foreground">{"Exercise price:       $11.50"}</p>
            <p className="text-foreground">{"Current stock:        $18.00"}</p>
            <p className="text-muted-foreground mt-2">// Treasury stock method (diluted EPS)</p>
            <p className="text-emerald-400">{"Proceeds = 15M × $11.50 = $172.5M"}</p>
            <p className="text-emerald-400">{"Buyback shares = $172.5M / $18 = 9.58M"}</p>
            <p className="text-emerald-400">{"Net dilution = 15M − 9.58M = 5.42M"}</p>
            <p className="text-amber-400">{"Diluted shares = 105.42M (+5.4%)"}</p>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Warrants are <span className="text-white font-semibold">company-issued</span> — unlike listed options which are contracts between investors. When exercised, new shares are created, diluting existing holders.</p>
            <div className="space-y-1.5 text-xs">
              {[
                ["Issued by", "Warrant: Company | Option: Exchange/counterparty"],
                ["New shares created", "Warrant: Yes (dilutive) | Option: No"],
                ["Proceeds to", "Warrant: Company | Option: Seller"],
                ["Typical term", "Warrant: 3–7 yrs | Option: Up to 3 yrs (LEAPS)"],
                ["Strike adjustment", "Warrant: Fixed usually | Option: Fixed"],
                ["Anti-dilution", "Warrant: Often included | Option: Not applicable"],
              ].map(([feat, val]) => (
                <div key={feat} className="flex gap-2">
                  <span className="text-muted-foreground w-28 flex-shrink-0">{feat}</span>
                  <span className="text-muted-foreground">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warrant vs Call Comparison */}
      <div className="rounded-xl border border-border bg-muted/40">
        <button
          className="w-full p-4 flex items-center justify-between text-left"
          onClick={() => setExpandDiff(!expandDiff)}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Info size={15} className="text-primary" /> Subscription Rights: Short-Lived Opportunities
          </h3>
          {expandDiff ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {expandDiff && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 text-sm">
                <p className="text-muted-foreground">Subscription rights give existing shareholders the right to buy new shares at a discount to market price. They typically expire in 2–4 weeks and are tradable on exchanges during that window.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { title: "Standby Rights", desc: "Underwriter commits to purchasing all unsubscribed shares. Reduces risk for the issuer.", color: "border-emerald-500/30" },
                    { title: "Renounceable Rights", desc: "Shareholders can sell their rights on the open market. Valuable if subscription price is below market.", color: "border-border" },
                    { title: "Non-Renounceable Rights", desc: "Must subscribe or let expire — cannot be sold. Common in smaller offerings. Watch for dilution.", color: "border-amber-500/30" },
                  ].map((r) => (
                    <div key={r.title} className={cn("rounded-lg border p-3", r.color, "bg-card")}>
                      <p className="font-semibold text-white mb-1">{r.title}</p>
                      <p className="text-muted-foreground">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Tab 5: Retail Access to Alternatives ────────────────────────────────────

function RetailAlternativesTab() {
  const [filterType, setFilterType] = useState<AlternativeProduct["type"] | "All">("All");
  const [expandDebate, setExpandDebate] = useState(false);

  const filtered = filterType === "All" ? ALT_PRODUCTS : ALT_PRODUCTS.filter((p) => p.type === filterType);

  const typeColors: Record<AlternativeProduct["type"], string> = {
    "Interval Fund": "bg-primary/20 text-primary",
    "Non-Traded REIT": "bg-primary/20 text-primary",
    "BDC": "bg-emerald-500/20 text-emerald-400",
    "Reg CF": "bg-amber-500/20 text-amber-400",
    "Reg A+": "bg-orange-500/20 text-orange-400",
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="rounded-xl border border-border bg-primary/5 p-4 flex items-start gap-3">
        <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-primary mb-1">Democratization of Alternative Investments</p>
          <p className="text-muted-foreground">Regulatory changes (JOBS Act, SEC Reg CF/A, 40 Act interval funds) now allow non-accredited retail investors to access private credit, real estate, and startup equity — previously available only to institutions and the ultra-wealthy.</p>
        </div>
      </div>

      {/* Structure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
        {([
          { type: "Interval Fund", desc: "Registered closed-end fund. Quarterly redemptions (typically 5%). Daily NAV.", access: "All investors", icon: <Layers size={13} />, color: "border-primary/40" },
          { type: "Non-Traded REIT", desc: "Real estate income. Monthly/quarterly liquidity. SEC-registered.", access: "All investors", icon: <BarChart2 size={13} />, color: "border-primary/40" },
          { type: "BDC", desc: "Business Development Company. Lends to middle-market firms. Exchange-listed or non-traded.", access: "All investors", icon: <DollarSign size={13} />, color: "border-emerald-500/40" },
          { type: "Reg CF", desc: "Crowdfunding up to $5M/yr. SEC Reg CF. High failure risk. Illiquid.", access: "All investors ($2.5K limit for non-accredited)", icon: <Users size={13} />, color: "border-amber-500/40" },
          { type: "Reg A+", desc: 'Mini-IPO up to $75M/yr. SEC "Tier 2". More flexibility than Reg CF.', access: "All investors", icon: <Unlock size={13} />, color: "border-orange-500/40" },
        ] as Array<{ type: string; desc: string; access: string; icon: React.ReactNode; color: string }>).map((item) => (
          <div key={item.type} className={cn("rounded-lg border p-3 bg-muted/40 space-y-1.5", item.color)}>
            <div className="flex items-center gap-1.5 text-white font-semibold">
              {item.icon}
              {item.type}
            </div>
            <p className="text-muted-foreground">{item.desc}</p>
            <p className="text-muted-foreground italic">{item.access}</p>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="rounded-xl border border-border bg-card/50">
        <div className="p-4 border-b border-border flex flex-wrap gap-2">
          {(["All", "Interval Fund", "Non-Traded REIT", "BDC", "Reg CF", "Reg A+"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filterType === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2.5">Name</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-right px-4 py-2.5">Min Invest</th>
                <th className="text-left px-4 py-2.5">Accredited</th>
                <th className="text-left px-4 py-2.5">Liquidity</th>
                <th className="text-right px-4 py-2.5">Target Yield</th>
                <th className="text-right px-4 py-2.5">Fees %</th>
                <th className="text-right px-4 py-2.5">AUM ($B)</th>
                <th className="text-left px-4 py-2.5">Lockup</th>
                <th className="text-left px-4 py-2.5">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-2.5 text-foreground max-w-[220px]">
                    <p className="truncate">{p.name}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs", typeColors[p.type])}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-white font-semibold">
                    ${p.minInvestment.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    {p.accreditedRequired ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Lock size={10} /> Required
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Unlock size={10} /> Open
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.liquidity}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-400">
                    {p.targetYield > 0 ? `${p.targetYield}%` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-red-400">{p.fees}%</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {p.aum >= 1 ? `$${p.aum}B` : `$${(p.aum * 1000).toFixed(0)}M`}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.lockup}</td>
                  <td className="px-4 py-2.5">
                    <RiskBadge level={p.riskLevel} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accredited Investor Debate */}
      <div className="rounded-xl border border-border bg-muted/40">
        <button
          className="w-full p-4 flex items-center justify-between text-left"
          onClick={() => setExpandDebate(!expandDebate)}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users size={15} className="text-primary" /> The Accredited Investor Threshold Debate
          </h3>
          {expandDebate ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {expandDebate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 text-sm">
                <div className="rounded-lg bg-card p-3 text-xs">
                  <p className="text-muted-foreground mb-2">Current SEC Definition (as of 2023 updates):</p>
                  <p className="text-foreground">Income {">"} $200K/yr (individual) or $300K (joint) for 2+ years, OR net worth {">"} $1M (excl. primary residence), OR certain professional certifications (Series 7/65/82)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
                    <p className="font-semibold text-emerald-400 text-xs">Arguments FOR lowering threshold</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {[
                        "Wealth-based gatekeeping excludes middle-class savers",
                        "Knowledge (not wealth) should determine access",
                        "Inflation has eroded the real value of thresholds",
                        "Index-accessible alternatives reduce some risks",
                        "KnowledgeFinancial inclusion improves retirement outcomes",
                      ].map((it) => (
                        <li key={it} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">✓</span>{it}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-2">
                    <p className="font-semibold text-red-400 text-xs">Arguments AGAINST lowering threshold</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {[
                        "Private investments have limited disclosure requirements",
                        "Illiquidity risk is amplified for lower-income investors",
                        "High fees disproportionately hurt smaller accounts",
                        "Fraud risk is higher in private markets",
                        "Regulatory review is lighter than public securities",
                      ].map((it) => (
                        <li key={it} className="flex items-start gap-1.5">
                          <span className="text-red-400 mt-0.5">✗</span>{it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-3 text-xs text-muted-foreground">
                  <span className="text-white font-semibold">Bottom line: </span>
                  The 2023 SEC amendments allow knowledge-based accreditation (professional licenses) — a step toward merit-based access. Further reform proposals include graduated caps on alternative allocations (e.g., max 10% of portfolio) rather than binary on/off thresholds.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reg CF/A Crowdfunding Summary */}
      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Users size={15} className="text-amber-400" /> Crowdfunding Limits (Reg CF vs Reg A+)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-4">Feature</th>
                <th className="text-left py-2 pr-4 text-amber-400">Reg CF</th>
                <th className="text-left py-2 text-orange-400">Reg A+ (Tier 2)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Issuer cap/yr", "$5 million", "$75 million"],
                ["Investor limit", "$2,500 (non-acc.) or 5% income/NW", "No limit for accredited; limits apply for non-acc."],
                ["SEC review", "Form C filing, no full review", "Full SEC qualification required"],
                ["Resale restrictions", "12-month lockup typical", "Freely tradable after qualification"],
                ["Disclosure", "Lighter than full registration", "Audited financials required"],
                ["Platforms", "Wefunder, Republic, StartEngine", "Direct or broker-dealer"],
                ["Failure risk", "Very high (early stage)", "High (growth stage)"],
              ].map(([feat, cf, ra]) => (
                <tr key={feat} className="border-b border-border">
                  <td className="py-2 pr-4 text-muted-foreground">{feat}</td>
                  <td className="py-2 pr-4 text-foreground">{cf}</td>
                  <td className="py-2 text-foreground">{ra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RetailDerivativesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2">
              <Layers size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Retail Derivatives & Structured Products</h1>
              <p className="text-sm text-muted-foreground">Exchange-traded options, leveraged ETFs, structured notes, warrants, and alternative access for individual investors</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="options" className="space-y-4">
          <TabsList className="bg-muted/60 border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="options" className="text-xs data-[state=active]:bg-muted data-[state=active]:text-white text-muted-foreground">
              Exchange-Traded Options
            </TabsTrigger>
            <TabsTrigger value="leveraged" className="text-xs data-[state=active]:bg-muted data-[state=active]:text-white text-muted-foreground">
              Leveraged & Inverse ETFs
            </TabsTrigger>
            <TabsTrigger value="structured" className="text-xs data-[state=active]:bg-muted data-[state=active]:text-white text-muted-foreground">
              Structured Notes
            </TabsTrigger>
            <TabsTrigger value="warrants" className="text-xs data-[state=active]:bg-muted data-[state=active]:text-white text-muted-foreground">
              Warrants & Rights
            </TabsTrigger>
            <TabsTrigger value="alternatives" className="text-xs data-[state=active]:bg-muted data-[state=active]:text-white text-muted-foreground">
              Retail Access to Alternatives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <ExchangeTradedOptionsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="leveraged" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <LeveragedETFsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="structured" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <StructuredNotesTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="warrants" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <WarrantsRightsTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="alternatives" className="data-[state=inactive]:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <RetailAlternativesTab />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
