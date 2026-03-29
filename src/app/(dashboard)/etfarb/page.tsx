"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Building2,
  Users,
  BarChart3,
  DollarSign,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 784;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface ETFRow {
  ticker: string;
  name: string;
  assetClass: string;
  avgPremiumDiscount: number;
  volume: number;
  spread: number;
  trackingError: number;
  aum: number;
  intraday: boolean;
}

interface PremDiscPoint {
  day: number;
  nav: number;
  price: number;
  diff: number;
}

// ── Generate premium/discount time series (90 days) ───────────────────────────
function generatePremDiscSeries(): PremDiscPoint[] {
  const points: PremDiscPoint[] = [];
  let nav = 100;
  for (let d = 0; d < 90; d++) {
    const navChange = (rand() - 0.5) * 0.8;
    nav += navChange;
    // ETF price deviates from NAV, then mean-reverts
    const rawDev = (rand() - 0.5) * 0.4;
    const prevDiff = d > 0 ? points[d - 1].diff : 0;
    const diff = prevDiff * 0.3 + rawDev; // mean reversion
    const price = nav + diff;
    points.push({ day: d, nav: parseFloat(nav.toFixed(3)), price: parseFloat(price.toFixed(3)), diff: parseFloat(diff.toFixed(3)) });
  }
  return points;
}

// ── ETF Comparison Data ────────────────────────────────────────────────────────
const ETF_TABLE: ETFRow[] = [
  { ticker: "SPY",  name: "SPDR S&P 500 ETF",        assetClass: "Equity",        avgPremiumDiscount:  0.01, volume: 82000000, spread: 0.01, trackingError: 0.03, aum: 520, intraday: true },
  { ticker: "QQQ",  name: "Invesco NASDAQ-100 ETF",   assetClass: "Equity",        avgPremiumDiscount:  0.02, volume: 43000000, spread: 0.01, trackingError: 0.05, aum: 210, intraday: true },
  { ticker: "IWM",  name: "iShares Russell 2000 ETF", assetClass: "Equity",        avgPremiumDiscount:  0.05, volume: 28000000, spread: 0.02, trackingError: 0.12, aum:  67, intraday: true },
  { ticker: "EEM",  name: "iShares MSCI EM ETF",      assetClass: "Intl Equity",   avgPremiumDiscount:  0.18, volume:  9000000, spread: 0.03, trackingError: 0.35, aum:  24, intraday: false },
  { ticker: "HYG",  name: "iShares HY Corp Bond ETF", assetClass: "Fixed Income",  avgPremiumDiscount:  0.22, volume:  8000000, spread: 0.04, trackingError: 0.28, aum:  18, intraday: false },
  { ticker: "LQD",  name: "iShares IG Corp Bond ETF", assetClass: "Fixed Income",  avgPremiumDiscount:  0.15, volume:  4000000, spread: 0.03, trackingError: 0.20, aum:  31, intraday: false },
  { ticker: "GLD",  name: "SPDR Gold Shares ETF",     assetClass: "Commodity",     avgPremiumDiscount:  0.03, volume:  7000000, spread: 0.02, trackingError: 0.04, aum:  58, intraday: true },
  { ticker: "VNQ",  name: "Vanguard REIT ETF",        assetClass: "Real Estate",   avgPremiumDiscount:  0.08, volume:  5000000, spread: 0.02, trackingError: 0.15, aum:  38, intraday: true },
];

// ── Arbitrage scenarios ────────────────────────────────────────────────────────
interface ArbScenario {
  label: string;
  navPerShare: number;
  etfPrice: number;
  cuSize: number;
  description: string;
}

const ARB_SCENARIOS: ArbScenario[] = [
  { label: "Mild Premium",  navPerShare: 100.00, etfPrice: 100.12, cuSize: 50000, description: "ETF trading above NAV — AP creates new shares" },
  { label: "Mild Discount", navPerShare: 100.00, etfPrice:  99.88, cuSize: 50000, description: "ETF trading below NAV — AP redeems shares for basket" },
  { label: "Large Premium", navPerShare: 100.00, etfPrice: 100.45, cuSize: 50000, description: "Wide premium — stress event, fast arbitrage" },
  { label: "Bond ETF Gap",  navPerShare: 100.00, etfPrice:  99.55, cuSize: 50000, description: "Fixed income ETF discount — stale bond prices" },
];

// ── Metric card ────────────────────────────────────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Creation / Redemption Flow SVG ────────────────────────────────────────────
function CreationRedemptionDiagram() {
  const boxW = 120;
  const boxH = 44;
  const W = 680;
  const H = 260;

  // Node positions
  const ap     = { x: 40,  y: H / 2 - boxH / 2 };
  const issuer = { x: W / 2 - boxW / 2, y: H / 2 - boxH / 2 };
  const basket = { x: W - 40 - boxW, y: H / 2 - boxH / 2 };

  const midY = H / 2;
  const arrowUp   = midY - 26;
  const arrowDown = midY + 26;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 260 }}>
      {/* Background */}
      <rect width={W} height={H} rx={12} fill="hsl(var(--card))" />

      {/* AP box */}
      <rect x={ap.x} y={ap.y} width={boxW} height={boxH} rx={8} fill="hsl(var(--primary))" opacity={0.9} />
      <text x={ap.x + boxW / 2} y={ap.y + 16} textAnchor="middle" fontSize={11} fontWeight="600" fill="white">Authorized</text>
      <text x={ap.x + boxW / 2} y={ap.y + 30} textAnchor="middle" fontSize={11} fontWeight="600" fill="white">Participant</text>

      {/* Issuer box */}
      <rect x={issuer.x} y={issuer.y} width={boxW} height={boxH} rx={8} fill="hsl(var(--secondary))" opacity={0.9} />
      <text x={issuer.x + boxW / 2} y={issuer.y + 16} textAnchor="middle" fontSize={11} fontWeight="600" fill="hsl(var(--foreground))">ETF</text>
      <text x={issuer.x + boxW / 2} y={issuer.y + 30} textAnchor="middle" fontSize={11} fontWeight="600" fill="hsl(var(--foreground))">Issuer</text>

      {/* Basket box */}
      <rect x={basket.x} y={basket.y} width={boxW} height={boxH} rx={8} fill="hsl(0 72% 51%)" opacity={0.85} />
      <text x={basket.x + boxW / 2} y={basket.y + 16} textAnchor="middle" fontSize={11} fontWeight="600" fill="white">Stock</text>
      <text x={basket.x + boxW / 2} y={basket.y + 30} textAnchor="middle" fontSize={11} fontWeight="600" fill="white">Basket</text>

      {/* === CREATION (top arrows) ===  AP → Issuer: stock basket */}
      <defs>
        <marker id="arr-create" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
        </marker>
        <marker id="arr-redeem" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
        </marker>
        <marker id="arr-etf" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
        </marker>
        <marker id="arr-cash" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
        </marker>
      </defs>

      {/* Creation top: AP → Issuer (basket) */}
      <line
        x1={ap.x + boxW} y1={arrowUp}
        x2={issuer.x}     y2={arrowUp}
        stroke="#22c55e" strokeWidth={1.5} markerEnd="url(#arr-create)"
      />
      <text x={(ap.x + boxW + issuer.x) / 2} y={arrowUp - 6} textAnchor="middle" fontSize={9.5} fill="#22c55e">stock basket</text>

      {/* Creation top: Issuer → AP (ETF shares) */}
      <line
        x1={issuer.x}     y1={arrowDown}
        x2={ap.x + boxW}  y2={arrowDown}
        stroke="#22c55e" strokeWidth={1.5} markerEnd="url(#arr-etf)"
      />
      <text x={(ap.x + boxW + issuer.x) / 2} y={arrowDown + 14} textAnchor="middle" fontSize={9.5} fill="#22c55e">ETF shares (50k)</text>

      {/* Labels above/below AP ↔ Issuer */}
      <text x={(ap.x + boxW + issuer.x) / 2} y={arrowUp - 18} textAnchor="middle" fontSize={10} fontWeight="700" fill="#22c55e">CREATION</text>

      {/* Redemption right: Issuer → Basket (cash) */}
      <line
        x1={issuer.x + boxW} y1={arrowUp}
        x2={basket.x}         y2={arrowUp}
        stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arr-redeem)"
      />
      <text x={(issuer.x + boxW + basket.x) / 2} y={arrowUp - 6} textAnchor="middle" fontSize={9.5} fill="#f59e0b">cash / basket</text>

      {/* Redemption right: Basket → Issuer (ETF shares back) */}
      <line
        x1={basket.x}         y1={arrowDown}
        x2={issuer.x + boxW}  y2={arrowDown}
        stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arr-cash)"
      />
      <text x={(issuer.x + boxW + basket.x) / 2} y={arrowDown + 14} textAnchor="middle" fontSize={9.5} fill="#f59e0b">ETF shares returned</text>

      <text x={(issuer.x + boxW + basket.x) / 2} y={arrowUp - 18} textAnchor="middle" fontSize={10} fontWeight="700" fill="#f59e0b">REDEMPTION</text>

      {/* Caption */}
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={9} fill="hsl(var(--muted-foreground))">
        Creation Unit = 50,000 shares minimum  ·  In-kind exchange maintains tax efficiency
      </text>
    </svg>
  );
}

// ── Premium/Discount Chart SVG ─────────────────────────────────────────────────
function PremiumDiscountChart({ data }: { data: PremDiscPoint[] }) {
  const W = 680;
  const H = 220;
  const PAD = { l: 48, r: 16, t: 20, b: 32 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const allPrices = data.flatMap((d) => [d.nav, d.price]);
  const minP = Math.min(...allPrices) - 0.3;
  const maxP = Math.max(...allPrices) + 0.3;

  const scaleX = (i: number) => PAD.l + (i / (data.length - 1)) * chartW;
  const scaleY = (v: number) => PAD.t + chartH - ((v - minP) / (maxP - minP)) * chartH;

  const navPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(d.nav).toFixed(1)}`).join(" ");
  const pricePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${scaleX(i).toFixed(1)},${scaleY(d.price).toFixed(1)}`).join(" ");

  // Find arbitrage moments (|diff| > 0.2)
  const arbPoints = data.filter((d) => Math.abs(d.diff) > 0.2);

  // Y axis ticks
  const ticks = 5;
  const tickVals: number[] = Array.from({ length: ticks }, (_, i) => minP + ((maxP - minP) / (ticks - 1)) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <rect width={W} height={H} rx={10} fill="hsl(var(--card))" />

      {/* Grid */}
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={scaleY(v)} x2={W - PAD.r} y2={scaleY(v)} stroke="hsl(var(--border))" strokeWidth={0.5} />
          <text x={PAD.l - 4} y={scaleY(v) + 3.5} textAnchor="end" fontSize={8} fill="hsl(var(--muted-foreground))">{v.toFixed(1)}</text>
        </g>
      ))}

      {/* X axis labels */}
      {[0, 15, 30, 45, 60, 75, 89].map((d) => (
        <text key={d} x={scaleX(d)} y={H - PAD.b + 14} textAnchor="middle" fontSize={8} fill="hsl(var(--muted-foreground))">
          D{d + 1}
        </text>
      ))}

      {/* NAV line */}
      <path d={navPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />

      {/* ETF Price line */}
      <path d={pricePath} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />

      {/* Arbitrage arrows */}
      {arbPoints.slice(0, 8).map((d, i) => {
        const x = scaleX(d.day);
        const yNav = scaleY(d.nav);
        const yPrice = scaleY(d.price);
        const isPremium = d.diff > 0;
        return (
          <g key={i}>
            <line
              x1={x} y1={isPremium ? yNav : yPrice}
              x2={x} y2={isPremium ? yPrice : yNav}
              stroke={isPremium ? "#22c55e" : "#ef4444"}
              strokeWidth={1.5}
              markerEnd={isPremium ? "url(#arr-up)" : "url(#arr-dn)"}
            />
          </g>
        );
      })}

      <defs>
        <marker id="arr-up" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
          <polygon points="0 6, 3 0, 6 6" fill="#22c55e" />
        </marker>
        <marker id="arr-dn" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto">
          <polygon points="0 0, 3 6, 6 0" fill="#ef4444" />
        </marker>
      </defs>

      {/* Legend */}
      <g transform={`translate(${PAD.l + 8}, ${PAD.t + 8})`}>
        <rect x={0} y={0} width={70} height={38} rx={4} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={0.5} />
        <line x1={6} y1={10} x2={20} y2={10} stroke="hsl(var(--primary))" strokeWidth={2} />
        <text x={24} y={13} fontSize={8} fill="hsl(var(--foreground))">NAV</text>
        <line x1={6} y1={24} x2={20} y2={24} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={24} y={27} fontSize={8} fill="hsl(var(--foreground))">ETF Price</text>
      </g>
    </svg>
  );
}

// ── ETF Comparison Table ───────────────────────────────────────────────────────
function ETFTable() {
  const [sortKey, setSortKey] = useState<keyof ETFRow>("avgPremiumDiscount");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...ETF_TABLE].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [sortKey, sortAsc]);

  const toggle = (k: keyof ETFRow) => {
    if (k === sortKey) setSortAsc(!sortAsc);
    else { setSortKey(k); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: keyof ETFRow }) =>
    sortKey === k
      ? sortAsc
        ? <ChevronUp className="h-3 w-3 inline ml-0.5" />
        : <ChevronDown className="h-3 w-3 inline ml-0.5" />
      : null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {(
              [
                ["ticker",             "Ticker"],
                ["assetClass",         "Asset Class"],
                ["aum",                "AUM ($B)"],
                ["avgPremiumDiscount", "Avg P/D (%)"],
                ["volume",             "Avg Vol"],
                ["spread",             "Bid-Ask ($)"],
                ["trackingError",      "Tracking Err (%)"],
              ] as [keyof ETFRow, string][]
            ).map(([k, label]) => (
              <th
                key={k}
                className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                onClick={() => toggle(k)}
              >
                {label}<SortIcon k={k} />
              </th>
            ))}
            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Intraday NAV</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const pd = row.avgPremiumDiscount;
            const pdColor = pd > 0.15 ? "text-amber-400" : pd > 0.05 ? "text-yellow-400" : "text-green-400";
            return (
              <tr key={row.ticker} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-3 py-2.5 font-bold text-primary">{row.ticker}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{row.assetClass}</td>
                <td className="px-3 py-2.5 font-medium">${row.aum}B</td>
                <td className={`px-3 py-2.5 font-semibold ${pdColor}`}>
                  {pd > 0 ? "+" : ""}{pd.toFixed(2)}%
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {row.volume >= 1_000_000 ? `${(row.volume / 1_000_000).toFixed(0)}M` : `${(row.volume / 1_000).toFixed(0)}K`}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">${row.spread.toFixed(2)}</td>
                <td className="px-3 py-2.5">
                  <span className={row.trackingError > 0.2 ? "text-amber-400" : "text-green-400"}>
                    {row.trackingError.toFixed(2)}%
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {row.intraday
                    ? <Badge variant="outline" className="text-green-400 border-green-400/50 text-xs">iNAV</Badge>
                    : <Badge variant="outline" className="text-muted-foreground text-xs">EOD only</Badge>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Arbitrage P&L Calculator ───────────────────────────────────────────────────
function ArbCalculator() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = ARB_SCENARIOS[scenarioIdx];

  const nav        = scenario.navPerShare;
  const price      = scenario.etfPrice;
  const cu         = scenario.cuSize;
  const isPremium  = price > nav;

  const grossPL    = Math.abs(price - nav) * cu;
  const tradingCost = 0.0005 * nav * cu;        // 0.05% round-trip assumption
  const netPL      = grossPL - tradingCost;
  const returnPct  = (netPL / (nav * cu)) * 100;

  const steps = isPremium
    ? [
        { step: 1, action: "Buy underlying stock basket", amount: `$${(nav * cu).toLocaleString()}`, dir: "pay" },
        { step: 2, action: "Deliver basket to ETF issuer", amount: `${cu.toLocaleString()} shares worth`, dir: "out" },
        { step: 3, action: "Receive ETF shares (creation)", amount: `${cu.toLocaleString()} ETF shares`, dir: "in" },
        { step: 4, action: "Sell ETF shares in market", amount: `$${(price * cu).toLocaleString()}`, dir: "in" },
      ]
    : [
        { step: 1, action: "Buy ETF shares in market", amount: `$${(price * cu).toLocaleString()}`, dir: "pay" },
        { step: 2, action: "Deliver ETF shares to issuer", amount: `${cu.toLocaleString()} ETF shares`, dir: "out" },
        { step: 3, action: "Receive stock basket (redemption)", amount: `${cu.toLocaleString()} shares worth`, dir: "in" },
        { step: 4, action: "Sell basket in open market", amount: `$${(nav * cu).toLocaleString()}`, dir: "in" },
      ];

  return (
    <div className="space-y-5">
      {/* Scenario picker */}
      <div className="flex flex-wrap gap-2">
        {ARB_SCENARIOS.map((sc, i) => (
          <Button
            key={i}
            size="sm"
            variant={i === scenarioIdx ? "default" : "outline"}
            onClick={() => setScenarioIdx(i)}
            className="text-xs text-muted-foreground"
          >
            {sc.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{scenario.description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "NAV/Share",  value: `$${nav.toFixed(2)}`,           color: "text-primary" },
          { label: "ETF Price",  value: `$${price.toFixed(2)}`,          color: isPremium ? "text-red-400" : "text-green-400" },
          { label: "Deviation",  value: `${isPremium ? "+" : ""}${((price - nav) / nav * 100).toFixed(3)}%`, color: isPremium ? "text-red-400" : "text-green-400" },
          { label: "CU Size",    value: cu.toLocaleString(),              color: "text-foreground" },
        ].map((m) => (
          <Card key={m.label} className="bg-muted/20 border-border">
            <CardContent className="pt-3 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-medium ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step-by-step */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Arbitrage Steps</p>
        {steps.map((st) => (
          <div key={st.step} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
              {st.step}
            </span>
            <span className="flex-1 text-sm text-foreground">{st.action}</span>
            <span className={`text-sm font-medium ${st.dir === "pay" || st.dir === "out" ? "text-red-400" : "text-green-400"}`}>
              {st.dir === "pay" || st.dir === "out" ? "▼" : "▲"} {st.amount}
            </span>
          </div>
        ))}
      </div>

      {/* P&L summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Gross P&L",      value: `$${grossPL.toFixed(0)}`,    color: "text-green-400" },
          { label: "Trading Costs",  value: `-$${tradingCost.toFixed(0)}`, color: "text-red-400" },
          { label: "Net P&L",        value: `$${netPL.toFixed(0)} (${returnPct.toFixed(3)}%)`, color: netPL > 0 ? "text-green-400" : "text-red-400" },
        ].map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardContent className="pt-3 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-base font-medium ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Fixed Income ETF section ───────────────────────────────────────────────────
function FixedIncomSection() {
  const points = [
    {
      title: "Why Bond ETF Premiums Persist",
      icon: AlertCircle,
      color: "text-amber-400",
      body: "Bond markets trade OTC with wide bid-ask spreads and stale prices. The ETF's intraday market price often reflects live price discovery that underlying bond prices do not. A premium doesn't always mean overvaluation — it may reflect accurate real-time pricing.",
    },
    {
      title: "Price Discovery Role",
      icon: TrendingUp,
      color: "text-green-400",
      body: "During the March 2020 credit shock, bond ETFs like LQD and HYG traded at significant discounts while underlying bond prices were stale. The ETF price was the true market signal, leading the underlying bonds by hours. APs eventually performed redemptions, which normalized both prices.",
    },
    {
      title: "In-Kind vs Cash Creation",
      icon: RefreshCw,
      color: "text-primary",
      body: "Equity ETFs typically use in-kind creation (no capital gains). Bond ETFs often use cash creation because bond lots are large and illiquid. Cash creation introduces more tracking error but allows APs to manage bond inventory risk more precisely.",
    },
    {
      title: "Stress Period Dynamics",
      icon: Zap,
      color: "text-red-400",
      body: "In market dislocations, bond ETF discounts can widen to 3–5% or more. This is not an arbitrage failure — it reflects the cost and risk of transacting in illiquid bond markets. APs demand a premium for risk. Retail investors who panic-sell exacerbate discounts.",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {points.map((p) => (
          <Card key={p.title} className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <p.icon className={`h-4 w-4 ${p.color}`} />
                {p.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mini chart: typical bond ETF premium/discount band */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Typical Premium/Discount Bands by Asset Class</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {[
            { label: "S&P 500 Equity (SPY/IVV)",  normal: 0.02, stress: 0.10, color: "#22c55e" },
            { label: "IG Corp Bond (LQD)",          normal: 0.15, stress: 1.20, color: "#3b82f6" },
            { label: "HY Corp Bond (HYG/JNK)",      normal: 0.22, stress: 3.50, color: "#f59e0b" },
            { label: "Emerging Market Equity (EEM)", normal: 0.18, stress: 0.85, color: "#a855f7" },
            { label: "Muni Bond (MUB)",              normal: 0.12, stress: 2.10, color: "#ef4444" },
          ].map((row) => {
            const barMax = 4.0;
            const normalW = (row.normal / barMax) * 100;
            const stressW = (row.stress / barMax) * 100;
            return (
              <div key={row.label} className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{row.label}</span>
                  <span className="text-xs text-muted-foreground">
                    Normal: <span style={{ color: row.color }}>{row.normal.toFixed(2)}%</span>
                    {" "}&nbsp; Stress: <span className="text-amber-400">{row.stress.toFixed(2)}%</span>
                  </span>
                </div>
                <div className="h-4 rounded-full bg-muted/30 relative overflow-hidden">
                  {/* Stress bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full opacity-20"
                    style={{ width: `${stressW}%`, backgroundColor: row.color }}
                  />
                  {/* Normal bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${normalW}%`, backgroundColor: row.color }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground mt-2">
            Normal = typical calm-market premium/discount. Stress = observed during acute market dislocations. Bars scaled to 4%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ETFArbPage() {
  const premDiscData = useMemo(() => generatePremDiscSeries(), []);

  const avgPD = useMemo(() => {
    const sum = ETF_TABLE.reduce((a, r) => a + Math.abs(r.avgPremiumDiscount), 0);
    return sum / ETF_TABLE.length;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              ETF Arbitrage &amp; Market Mechanics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              How authorized participants keep ETF prices aligned with NAV through creation and redemption
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-green-400 border-green-400/50">
              Live Mechanics
            </Badge>
            <Badge variant="outline" className="text-primary border-primary/50">
              AP Arbitrage
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics — Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="border-l-4 border-l-primary rounded-lg bg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <MetricCard
          icon={BarChart3}
          label="Avg Premium/Discount"
          value={`${avgPD.toFixed(2)}%`}
          sub="Across major ETFs"
          color="bg-primary"
        />
        <MetricCard
          icon={Building2}
          label="Creation Unit Size"
          value="50,000"
          sub="Shares minimum per CU"
          color="bg-primary"
        />
        <MetricCard
          icon={Users}
          label="Authorized Participants"
          value="~30–50"
          sub="Registered per major ETF"
          color="bg-primary"
        />
        <MetricCard
          icon={DollarSign}
          label="Typical Bid-Ask Spread"
          value="$0.01–$0.05"
          sub="Equity ETFs in normal markets"
          color="bg-green-700"
        />
      </motion.div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8"
      >
        <Tabs defaultValue="flow">
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1 bg-muted/30">
            <TabsTrigger value="flow">Creation/Redemption</TabsTrigger>
            <TabsTrigger value="premdisc">Premium/Discount</TabsTrigger>
            <TabsTrigger value="arb">Arbitrage P&amp;L</TabsTrigger>
            <TabsTrigger value="fi">Fixed Income ETFs</TabsTrigger>
          </TabsList>

          {/* Tab 1: Creation/Redemption Flow */}
          <TabsContent value="flow" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground/50" />
                    Creation &amp; Redemption Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <CreationRedemptionDiagram />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs font-medium text-green-400 mb-1">Creation (ETF Premium)</p>
                      <p className="text-xs text-muted-foreground">
                        When ETF price &gt; NAV, APs buy the underlying basket, deliver to issuer, receive new ETF shares, then sell them in the market — pushing ETF price down toward NAV.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-medium text-amber-400 mb-1">Redemption (ETF Discount)</p>
                      <p className="text-xs text-muted-foreground">
                        When ETF price &lt; NAV, APs buy cheap ETF shares, deliver to issuer, receive the underlying basket, sell it in the market — pushing ETF price up toward NAV.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ETF Comparison Table */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
                    ETF Universe: Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <ETFTable />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Premium/Discount */}
          <TabsContent value="premdisc" className="data-[state=inactive]:hidden">
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/50" />
                    ETF Price vs NAV — 90 Day Simulation
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <PremiumDiscountChart data={premDiscData} />
                  <p className="text-xs text-muted-foreground mt-3">
                    Colored arrows indicate arbitrage opportunities where deviation exceeds 0.20%. AP activity brings price back to NAV within hours or days.
                  </p>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(() => {
                  const diffs = premDiscData.map((d) => d.diff);
                  const maxPrem = Math.max(...diffs);
                  const maxDisc = Math.min(...diffs);
                  const avgAbs = diffs.reduce((a, b) => a + Math.abs(b), 0) / diffs.length;
                  const arbOpps = diffs.filter((d) => Math.abs(d) > 0.2).length;
                  return [
                    { label: "Max Premium",  value: `+${maxPrem.toFixed(3)}`, color: "text-red-400" },
                    { label: "Max Discount", value: `${maxDisc.toFixed(3)}`,  color: "text-green-400" },
                    { label: "Avg |P/D|",    value: `${avgAbs.toFixed(3)}`,   color: "text-foreground" },
                    { label: "Arb Signals",  value: `${arbOpps} days`,        color: "text-primary" },
                  ].map((m) => (
                    <Card key={m.label} className="bg-card border-border">
                      <CardContent className="pt-3 pb-3 px-4">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className={`text-lg font-medium ${m.color}`}>{m.value}</p>
                      </CardContent>
                    </Card>
                  ));
                })()}
              </div>

              {/* Explanation bullets */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm">What Causes Premiums &amp; Discounts?</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { dir: "Premium", icon: TrendingUp, color: "text-red-400", reasons: ["Strong retail demand surge", "Short-selling pressure on underlying", "International ETFs when local mkt closed", "Fast-moving market open minutes"] },
                    { dir: "Discount", icon: TrendingDown, color: "text-green-400", reasons: ["Market stress / flight to safety", "Illiquid underlying bonds or EM stocks", "APs withdrawing from market-making", "End-of-day institutional selling"] },
                  ].map((section) => (
                    <div key={section.dir} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <p className={`text-xs text-muted-foreground font-medium ${section.color} mb-2 flex items-center gap-1`}>
                        <section.icon className="h-3 w-3" /> {section.dir} Causes
                      </p>
                      <ul className="space-y-1">
                        {section.reasons.map((r) => (
                          <li key={r} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-0.5 flex-shrink-0 text-muted-foreground">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Arbitrage */}
          <TabsContent value="arb" className="data-[state=inactive]:hidden">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground/50" />
                  AP Arbitrage P&amp;L Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ArbCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Fixed Income */}
          <TabsContent value="fi" className="data-[state=inactive]:hidden">
            <FixedIncomSection />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
