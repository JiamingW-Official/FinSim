"use client";

import { useState, useMemo, useCallback } from "react";
import { Landmark, TrendingUp, TrendingDown, AlertTriangle, Info, BookOpen, Calculator, ShoppingCart, GraduationCap, DollarSign, Shield, BarChart3, Percent } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Bond math helpers ─────────────────────────────────────────────────────────

/** Price a bond given coupon rate (%), face value, maturity years, YTM %, frequency */
function bondPrice(
  faceValue: number,
  couponRate: number,
  maturityYears: number,
  ytm: number,
  freq: number = 2,
): number {
  const periods = maturityYears * freq;
  const coupon = (faceValue * (couponRate / 100)) / freq;
  const r = ytm / 100 / freq;
  if (r === 0) return faceValue + coupon * periods;
  const pv = coupon * (1 - Math.pow(1 + r, -periods)) / r + faceValue / Math.pow(1 + r, periods);
  return pv;
}

/** Macaulay duration in years */
function macaulayDuration(
  faceValue: number,
  couponRate: number,
  maturityYears: number,
  ytm: number,
  freq: number = 2,
): number {
  const periods = maturityYears * freq;
  const coupon = (faceValue * (couponRate / 100)) / freq;
  const r = ytm / 100 / freq;
  let weightedSum = 0;
  let price = 0;
  for (let t = 1; t <= periods; t++) {
    const cf = t === periods ? coupon + faceValue : coupon;
    const pv = cf / Math.pow(1 + r, t);
    weightedSum += (t / freq) * pv;
    price += pv;
  }
  return price > 0 ? weightedSum / price : 0;
}

/** Modified duration */
function modifiedDuration(mac: number, ytm: number, freq: number = 2): number {
  return mac / (1 + ytm / 100 / freq);
}

/** Convexity */
function convexity(
  faceValue: number,
  couponRate: number,
  maturityYears: number,
  ytm: number,
  freq: number = 2,
): number {
  const periods = maturityYears * freq;
  const coupon = (faceValue * (couponRate / 100)) / freq;
  const r = ytm / 100 / freq;
  let cvx = 0;
  let price = 0;
  for (let t = 1; t <= periods; t++) {
    const cf = t === periods ? coupon + faceValue : coupon;
    const pv = cf / Math.pow(1 + r, t);
    cvx += (t * (t + 1) * pv) / Math.pow(1 + r, 2);
    price += pv;
  }
  return price > 0 ? cvx / (price * freq * freq) : 0;
}

/** DV01: dollar value of 1 basis point */
function dv01(modDur: number, price: number): number {
  return modDur * price * 0.0001;
}

// ── Bond data ─────────────────────────────────────────────────────────────────

interface BondDefinition {
  id: string;
  name: string;
  coupon: number; // %
  maturityYears: number;
  baseYtm: number; // %
  creditRating: string;
  type: "treasury" | "corporate" | "high-yield" | "municipal";
}

const BOND_DEFS: BondDefinition[] = [
  { id: "us2y",   name: "US Treasury 2Y",   coupon: 4.75, maturityYears: 2,  baseYtm: 4.82, creditRating: "AAA", type: "treasury" },
  { id: "us5y",   name: "US Treasury 5Y",   coupon: 4.25, maturityYears: 5,  baseYtm: 4.45, creditRating: "AAA", type: "treasury" },
  { id: "us10y",  name: "US Treasury 10Y",  coupon: 4.00, maturityYears: 10, baseYtm: 4.30, creditRating: "AAA", type: "treasury" },
  { id: "us30y",  name: "US Treasury 30Y",  coupon: 4.50, maturityYears: 30, baseYtm: 4.65, creditRating: "AAA", type: "treasury" },
  { id: "aapl",   name: "AAPL Corp 2031",   coupon: 3.85, maturityYears: 7,  baseYtm: 4.20, creditRating: "AA+", type: "corporate" },
  { id: "msft",   name: "MSFT Corp 2033",   coupon: 3.45, maturityYears: 9,  baseYtm: 3.98, creditRating: "AAA", type: "corporate" },
  { id: "hy",     name: "HY Corp Bond",     coupon: 7.50, maturityYears: 8,  baseYtm: 8.25, creditRating: "BB",  type: "high-yield" },
  { id: "muni",   name: "Muni Bond CA",     coupon: 3.20, maturityYears: 15, baseYtm: 3.40, creditRating: "AA",  type: "municipal" },
];

interface BondRow extends BondDefinition {
  ytm: number;
  price: number;
  duration: number;
  yieldChange1d: number;
}

// Yield curve points for SVG
interface YieldPoint {
  maturity: number; // years
  label: string;
  ytm: number;
}

// ── Bond portfolio types ──────────────────────────────────────────────────────

interface BondHolding {
  bondId: string;
  face: number;
  quantity: number; // number of bonds (face=$1000 each)
  purchaseYtm: number;
  purchasePrice: number;
  purchaseDate: string;
}

interface BondPortfolio {
  cash: number;
  holdings: BondHolding[];
}

const INITIAL_PORTFOLIO: BondPortfolio = {
  cash: 100_000,
  holdings: [],
};

// ── Education cards ───────────────────────────────────────────────────────────

const EDU_CARDS = [
  {
    id: "basics",
    icon: BookOpen,
    title: "Bond Basics",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    points: [
      "A bond is a loan from investor to issuer (government/corporation).",
      "The issuer pays periodic coupon payments and returns face value at maturity.",
      "Bond prices move inversely to yields: when rates rise, prices fall.",
      "Face value (par) is typically $1,000 per bond.",
      "Yield to maturity (YTM) is the total return if held to maturity.",
    ],
  },
  {
    id: "duration",
    icon: BarChart3,
    title: "Duration & Convexity",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    points: [
      "Duration measures how sensitive a bond's price is to rate changes.",
      "A duration of 5 means a 1% rate rise causes ~5% price decline.",
      "Modified duration = Macaulay duration / (1 + YTM/freq).",
      "Convexity measures the curvature of the price-yield relationship.",
      "Higher convexity = more price gain when rates fall, less loss when rates rise.",
    ],
  },
  {
    id: "yield-curve",
    icon: TrendingUp,
    title: "Yield Curve",
    color: "text-green-400",
    bg: "bg-green-500/10",
    points: [
      "Normal: long-term yields > short-term yields (upward sloping).",
      "Inverted: short-term yields > long-term yields (recession signal).",
      "Flat: similar yields across all maturities (transition period).",
      "The 10Y-2Y spread is closely watched by economists and the Fed.",
      "An inverted yield curve has preceded most U.S. recessions.",
    ],
  },
  {
    id: "credit",
    icon: Shield,
    title: "Credit Risk",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    points: [
      "Credit rating reflects the issuer's ability to repay debt.",
      "AAA is highest (US Treasury, top corporations), D is default.",
      "Investment grade: BBB-/Baa3 and above.",
      "High yield ('junk') bonds: BB+/Ba1 and below — higher risk and reward.",
      "Credit spread = yield difference vs equivalent Treasury bond.",
    ],
  },
  {
    id: "etf",
    icon: DollarSign,
    title: "Bond ETFs vs Individual Bonds",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    points: [
      "Bond ETFs offer instant diversification and daily liquidity.",
      "ETFs have no fixed maturity date — price fluctuates indefinitely.",
      "Individual bonds give predictable cash flows and principal return at maturity.",
      "ETFs suit smaller investors; individual bonds suit larger portfolios.",
      "Popular ETFs: TLT (long-term Treasury), AGG (aggregate bond), HYG (high yield).",
    ],
  },
];

// ── Rating badge helper ───────────────────────────────────────────────────────

function ratingColor(rating: string): string {
  if (["AAA", "AA+", "AA", "AA-"].includes(rating)) return "text-green-400 bg-green-500/10";
  if (["A+", "A", "A-", "BBB+", "BBB", "BBB-"].includes(rating)) return "text-blue-400 bg-blue-500/10";
  if (["BB+", "BB", "BB-"].includes(rating)) return "text-amber-400 bg-amber-500/10";
  return "text-red-400 bg-red-500/10";
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BondsPage() {
  const [activeTab, setActiveTab] = useState("market");
  const [portfolio, setPortfolio] = useState<BondPortfolio>(INITIAL_PORTFOLIO);
  const [tradeQty, setTradeQty] = useState<Record<string, number>>({});
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("buy");

  // Calculator state
  const [calcFace, setCalcFace] = useState(1000);
  const [calcCoupon, setCalcCoupon] = useState(4.5);
  const [calcMaturity, setCalcMaturity] = useState(10);
  const [calcYtm, setCalcYtm] = useState(4.5);
  const [calcFreq, setCalcFreq] = useState<1 | 2>(2);

  // ── Generate bond rows with seeded daily variation ──────────────────────────
  const bonds: BondRow[] = useMemo(() => {
    const rng = seededRandom(dateSeed());
    return BOND_DEFS.map((def) => {
      // daily yield change: ±15bps
      const dailyChange = (rng() - 0.5) * 0.3;
      const ytm = Math.max(0.1, def.baseYtm + dailyChange);
      const price = bondPrice(1000, def.coupon, def.maturityYears, ytm);
      const mac = macaulayDuration(1000, def.coupon, def.maturityYears, ytm);
      return {
        ...def,
        ytm,
        price,
        duration: mac,
        yieldChange1d: dailyChange,
      };
    });
  }, []);

  // ── Yield curve data ────────────────────────────────────────────────────────
  const yieldCurve: YieldPoint[] = useMemo(() => {
    const rng = seededRandom(dateSeed() + 1);
    return [
      { maturity: 0.5, label: "6M", ytm: Math.max(0.1, 5.05 + (rng() - 0.5) * 0.2) },
      { maturity: 1,   label: "1Y", ytm: Math.max(0.1, 4.95 + (rng() - 0.5) * 0.2) },
      { maturity: 2,   label: "2Y", ytm: bonds[0].ytm },
      { maturity: 5,   label: "5Y", ytm: bonds[1].ytm },
      { maturity: 10,  label: "10Y", ytm: bonds[2].ytm },
      { maturity: 30,  label: "30Y", ytm: bonds[3].ytm },
    ];
  }, [bonds]);

  const spread10y2y = yieldCurve[4].ytm - yieldCurve[2].ytm;
  const isInverted = spread10y2y < 0;

  // ── Calculator outputs ──────────────────────────────────────────────────────
  const calcOutputs = useMemo(() => {
    const price = bondPrice(calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq);
    const mac = macaulayDuration(calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq);
    const modDur = modifiedDuration(mac, calcYtm, calcFreq);
    const cvx = convexity(calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq);
    const dv = dv01(modDur, price);
    const pricePlus1pct = bondPrice(calcFace, calcCoupon, calcMaturity, calcYtm + 1, calcFreq);
    const lossPer1pct = pricePlus1pct - price;
    return { price, mac, modDur, cvx, dv01: dv, lossPer1pct };
  }, [calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq]);

  // Price-yield curve: ±300bps from current yield
  const priceYieldCurve = useMemo(() => {
    const points: { ytm: number; price: number }[] = [];
    for (let delta = -300; delta <= 300; delta += 25) {
      const y = Math.max(0.01, calcYtm + delta / 100);
      points.push({ ytm: y, price: bondPrice(calcFace, calcCoupon, calcMaturity, y, calcFreq) });
    }
    return points;
  }, [calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq]);

  // ── Portfolio helpers ───────────────────────────────────────────────────────
  const portfolioRows = useMemo(() => {
    return portfolio.holdings.map((h) => {
      const def = bonds.find((b) => b.id === h.bondId)!;
      if (!def) return null;
      const currentPrice = def.price;
      const marketValue = currentPrice * h.quantity;
      const costBasis = h.purchasePrice * h.quantity;
      const pnl = marketValue - costBasis;
      const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      const accruedInterest = (def.coupon / 100 * h.face * h.quantity) / 365 * 30; // approx 30d accrued
      const modDur = modifiedDuration(
        macaulayDuration(h.face, def.coupon, def.maturityYears, def.ytm),
        def.ytm,
      );
      return { ...h, def, currentPrice, marketValue, costBasis, pnl, pnlPct, accruedInterest, modDur };
    }).filter(Boolean);
  }, [portfolio, bonds]);

  const portfolioMktValue = portfolioRows.reduce((s, r) => s + (r?.marketValue ?? 0), 0);
  const totalEquity = portfolio.cash + portfolioMktValue;
  const weightedDuration = portfolioRows.reduce((s, r) => {
    if (!r) return s;
    const w = portfolioMktValue > 0 ? r.marketValue / portfolioMktValue : 0;
    return s + r.modDur * w;
  }, 0);

  const handleBuy = useCallback((bond: BondRow) => {
    const qty = tradeQty[bond.id] || 1;
    const cost = bond.price * qty;
    if (cost > portfolio.cash) return;
    setPortfolio((prev) => {
      const existing = prev.holdings.find((h) => h.bondId === bond.id);
      if (existing) {
        return {
          ...prev,
          cash: prev.cash - cost,
          holdings: prev.holdings.map((h) =>
            h.bondId === bond.id
              ? {
                  ...h,
                  quantity: h.quantity + qty,
                  purchasePrice: (h.purchasePrice * h.quantity + cost) / (h.quantity + qty),
                }
              : h,
          ),
        };
      }
      return {
        ...prev,
        cash: prev.cash - cost,
        holdings: [
          ...prev.holdings,
          {
            bondId: bond.id,
            face: 1000,
            quantity: qty,
            purchaseYtm: bond.ytm,
            purchasePrice: bond.price,
            purchaseDate: new Date().toISOString().split("T")[0],
          },
        ],
      };
    });
  }, [tradeQty, portfolio.cash]);

  const handleSell = useCallback((bond: BondRow) => {
    const qty = tradeQty[bond.id] || 1;
    const holding = portfolio.holdings.find((h) => h.bondId === bond.id);
    if (!holding || holding.quantity < qty) return;
    const proceeds = bond.price * qty;
    setPortfolio((prev) => ({
      ...prev,
      cash: prev.cash + proceeds,
      holdings: prev.holdings
        .map((h) => h.bondId === bond.id ? { ...h, quantity: h.quantity - qty } : h)
        .filter((h) => h.quantity > 0),
    }));
  }, [tradeQty, portfolio.holdings]);

  // ── Yield curve SVG ─────────────────────────────────────────────────────────
  function YieldCurveSVG() {
    const W = 500, H = 180, padL = 48, padR = 16, padT = 16, padB = 32;
    const maturities = yieldCurve.map((p) => p.maturity);
    const yields = yieldCurve.map((p) => p.ytm);
    const minY = Math.min(...yields) - 0.3;
    const maxY = Math.max(...yields) + 0.3;

    const toX = (m: number) => padL + ((m - 0) / (30 - 0)) * (W - padL - padR);
    const toY = (y: number) => padT + ((maxY - y) / (maxY - minY)) * (H - padT - padB);

    const pts = yieldCurve.map((p) => `${toX(p.maturity)},${toY(p.ytm)}`).join(" ");

    // Y-axis ticks
    const yTicks: number[] = [];
    const step = 0.25;
    for (let y = Math.ceil(minY / step) * step; y <= maxY; y = Math.round((y + step) * 100) / 100) {
      yTicks.push(y);
    }

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
        {/* Grid lines */}
        {yTicks.map((y) => (
          <line
            key={y}
            x1={padL} y1={toY(y)} x2={W - padR} y2={toY(y)}
            stroke="currentColor" strokeOpacity={0.08} strokeWidth={1}
          />
        ))}
        {/* Y-axis labels */}
        {yTicks.map((y) => (
          <text
            key={y}
            x={padL - 6} y={toY(y) + 4}
            fontSize={9} fill="currentColor" fillOpacity={0.5} textAnchor="end"
          >
            {y.toFixed(2)}%
          </text>
        ))}
        {/* X-axis labels */}
        {yieldCurve.map((p) => (
          <text
            key={p.label}
            x={toX(p.maturity)} y={H - 4}
            fontSize={9} fill="currentColor" fillOpacity={0.5} textAnchor="middle"
          >
            {p.label}
          </text>
        ))}
        {/* Curve fill */}
        <polygon
          points={`${padL},${toY(minY)} ${pts} ${W - padR},${toY(minY)}`}
          fill={isInverted ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)"}
        />
        {/* Curve line */}
        <polyline
          points={pts}
          fill="none"
          stroke={isInverted ? "#ef4444" : "#22c55e"}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Points */}
        {yieldCurve.map((p) => (
          <circle
            key={p.label}
            cx={toX(p.maturity)} cy={toY(p.ytm)} r={3.5}
            fill={isInverted ? "#ef4444" : "#22c55e"}
          />
        ))}
      </svg>
    );
  }

  // ── Price-yield SVG ─────────────────────────────────────────────────────────
  function PriceYieldSVG() {
    const W = 500, H = 200, padL = 60, padR = 16, padT = 16, padB = 32;
    const prices = priceYieldCurve.map((p) => p.price);
    const ytms = priceYieldCurve.map((p) => p.ytm);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const minY = Math.min(...ytms);
    const maxY = Math.max(...ytms);

    const toX = (y: number) => padL + ((y - minY) / (maxY - minY)) * (W - padL - padR);
    const toY = (p: number) => padT + ((maxP - p) / (maxP - minP)) * (H - padT - padB);

    const pts = priceYieldCurve.map((p) => `${toX(p.ytm)},${toY(p.price)}`).join(" ");

    // Current yield vertical line
    const cx = toX(calcYtm);

    // Y-axis ticks (price)
    const pStep = Math.ceil((maxP - minP) / 5 / 10) * 10;
    const pTicks: number[] = [];
    for (let p = Math.ceil(minP / pStep) * pStep; p <= maxP; p += pStep) pTicks.push(p);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
        {/* Grid */}
        {pTicks.map((p) => (
          <line
            key={p}
            x1={padL} y1={toY(p)} x2={W - padR} y2={toY(p)}
            stroke="currentColor" strokeOpacity={0.08} strokeWidth={1}
          />
        ))}
        {/* Y labels */}
        {pTicks.map((p) => (
          <text
            key={p}
            x={padL - 6} y={toY(p) + 4}
            fontSize={9} fill="currentColor" fillOpacity={0.5} textAnchor="end"
          >
            ${p.toFixed(0)}
          </text>
        ))}
        {/* X labels */}
        {priceYieldCurve.filter((_, i) => i % 4 === 0).map((p) => (
          <text
            key={p.ytm}
            x={toX(p.ytm)} y={H - 4}
            fontSize={9} fill="currentColor" fillOpacity={0.5} textAnchor="middle"
          >
            {p.ytm.toFixed(1)}%
          </text>
        ))}
        {/* Current yield vertical */}
        <line
          x1={cx} y1={padT} x2={cx} y2={H - padB}
          stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3"
        />
        {/* Curve */}
        <polyline
          points={pts}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Current point */}
        <circle
          cx={toX(calcYtm)} cy={toY(calcOutputs.price)} r={4}
          fill="#f59e0b" stroke="#1e1e2e" strokeWidth={1.5}
        />
        <text
          x={toX(calcYtm) + 6} y={toY(calcOutputs.price) - 4}
          fontSize={9} fill="#f59e0b"
        >
          ${calcOutputs.price.toFixed(2)}
        </text>
      </svg>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
        <Landmark className="h-5 w-5 text-primary" />
        <div>
          <h1 className="text-base font-semibold leading-none">Bond Market</h1>
          <p className="mt-1 text-xs text-muted-foreground">Fixed income simulator — Treasuries, corporates, high yield & munis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col min-h-0">
        <TabsList className="shrink-0 mx-6 mt-3 w-fit">
          <TabsTrigger value="market" className="text-xs gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Bond Market
          </TabsTrigger>
          <TabsTrigger value="calculator" className="text-xs gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="trade" className="text-xs gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            Trade Bonds
          </TabsTrigger>
          <TabsTrigger value="education" className="text-xs gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Education
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Bond Market ─────────────────────────────────────────────── */}
        <TabsContent
          value="market"
          className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden"
        >
          {/* Yield curve + spread info */}
          <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Yield Curve SVG */}
            <div className="col-span-2 rounded-lg border border-border/50 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">US Treasury Yield Curve</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", isInverted ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400")}>
                  {isInverted ? "Inverted" : "Normal"}
                </span>
              </div>
              <YieldCurveSVG />
            </div>

            {/* Spread + indicators */}
            <div className="flex flex-col gap-3">
              <div className={cn("rounded-lg border p-4", isInverted ? "border-red-500/30 bg-red-500/5" : "border-green-500/30 bg-green-500/5")}>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">10Y – 2Y Spread</div>
                <div className={cn("text-2xl font-bold tabular-nums", isInverted ? "text-red-400" : "text-green-400")}>
                  {spread10y2y >= 0 ? "+" : ""}{(spread10y2y * 100).toFixed(1)}bps
                </div>
                {isInverted && (
                  <div className="mt-2 flex items-start gap-1.5 text-[10px] text-red-400">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    Yield curve inverted — historically precedes recession by 12–18 months.
                  </div>
                )}
              </div>

              {yieldCurve.map((p) => (
                <div key={p.label} className="flex items-center justify-between rounded-md border border-border/40 bg-card px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">{p.label} Treasury</span>
                  <span className="text-xs font-semibold tabular-nums text-foreground">{p.ytm.toFixed(3)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bond table */}
          <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    {["Name", "Coupon", "Maturity", "YTM", "Price", "Duration", "Rating", "Yield Chg (1d)"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bonds.map((b, i) => (
                    <tr
                      key={b.id}
                      className={cn("border-b border-border/30 transition-colors hover:bg-accent/30", i % 2 === 0 ? "" : "bg-muted/10")}
                    >
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase", {
                            "bg-blue-500/10 text-blue-400": b.type === "treasury",
                            "bg-purple-500/10 text-purple-400": b.type === "corporate",
                            "bg-red-500/10 text-red-400": b.type === "high-yield",
                            "bg-teal-500/10 text-teal-400": b.type === "municipal",
                          })}>
                            {b.type === "treasury" ? "GOVT" : b.type === "corporate" ? "CORP" : b.type === "high-yield" ? "HY" : "MUNI"}
                          </span>
                          {b.name}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{b.coupon.toFixed(2)}%</td>
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{b.maturityYears}Y</td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold text-foreground">{b.ytm.toFixed(3)}%</td>
                      <td className="px-3 py-2.5 tabular-nums text-foreground">${b.price.toFixed(2)}</td>
                      <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{b.duration.toFixed(2)}yr</td>
                      <td className="px-3 py-2.5">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", ratingColor(b.creditRating))}>
                          {b.creditRating}
                        </span>
                      </td>
                      <td className={cn("px-3 py-2.5 tabular-nums font-medium", b.yieldChange1d >= 0 ? "text-red-400" : "text-green-400")}>
                        {b.yieldChange1d >= 0 ? "+" : ""}{(b.yieldChange1d * 100).toFixed(1)}bps
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground/50">
            Yield change note: yield rise = price falls (inverse relationship). Prices shown per $1,000 face value.
          </p>
        </TabsContent>

        {/* ── Tab 2: Calculator ──────────────────────────────────────────────── */}
        <TabsContent
          value="calculator"
          className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Inputs */}
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Bond Parameters</h3>
              <div className="space-y-4">
                {/* Face value */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Face Value ($)</label>
                  <input
                    type="number"
                    value={calcFace}
                    onChange={(e) => setCalcFace(Math.max(100, Number(e.target.value)))}
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                {/* Coupon rate */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Annual Coupon Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcCoupon}
                    onChange={(e) => setCalcCoupon(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                {/* Maturity */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Maturity (years)</label>
                  <input
                    type="number"
                    value={calcMaturity}
                    onChange={(e) => setCalcMaturity(Math.max(0.5, Number(e.target.value)))}
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                {/* YTM */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Current Yield / YTM (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcYtm}
                    onChange={(e) => setCalcYtm(Math.max(0.01, Number(e.target.value)))}
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                {/* Payment frequency */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Payment Frequency</label>
                  <div className="flex gap-2">
                    {([1, 2] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setCalcFreq(f)}
                        className={cn(
                          "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                          calcFreq === f
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {f === 1 ? "Annual" : "Semi-Annual"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Outputs */}
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border/50 bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Calculated Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Bond Price", value: `$${calcOutputs.price.toFixed(4)}`, highlight: true },
                    { label: "Macaulay Duration", value: `${calcOutputs.mac.toFixed(4)} yrs` },
                    { label: "Modified Duration", value: `${calcOutputs.modDur.toFixed(4)} yrs` },
                    { label: "DV01 (per $)", value: `$${calcOutputs.dv01.toFixed(4)}` },
                    { label: "Convexity", value: calcOutputs.cvx.toFixed(4) },
                    { label: "Price vs Par", value: `${((calcOutputs.price / calcFace - 1) * 100).toFixed(2)}%` },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className={cn("rounded-md border p-3", highlight ? "border-primary/30 bg-primary/5" : "border-border/40 bg-muted/20")}>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
                      <div className={cn("mt-1 text-base font-bold tabular-nums", highlight ? "text-primary" : "text-foreground")}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rate rise scenario */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-amber-400">If rates rise 1%:</div>
                    <div className="mt-1 text-sm font-bold text-foreground">
                      Bond {calcOutputs.lossPer1pct < 0 ? "loses" : "gains"} ${Math.abs(calcOutputs.lossPer1pct).toFixed(2)} per bond
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      ({((calcOutputs.lossPer1pct / calcOutputs.price) * 100).toFixed(2)}% change in price)
                      — approx: modified duration × price × 1%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price-yield chart */}
          <div className="mt-5 rounded-lg border border-border/50 bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price–Yield Relationship (±300 bps)</span>
              <span className="text-[10px] text-muted-foreground">Amber dashed = current yield</span>
            </div>
            <PriceYieldSVG />
          </div>
        </TabsContent>

        {/* ── Tab 3: Trade Bonds ─────────────────────────────────────────────── */}
        <TabsContent
          value="trade"
          className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden"
        >
          {/* Portfolio summary */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Cash", value: `$${portfolio.cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: "Market Value", value: `$${portfolioMktValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: "Total Equity", value: `$${totalEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
              { label: "Portfolio Duration", value: `${weightedDuration.toFixed(2)} yrs` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border/50 bg-card px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="mt-1 text-sm font-bold tabular-nums text-foreground">{value}</div>
              </div>
            ))}
          </div>

          {/* Trade panel */}
          <div className="mb-5 rounded-lg border border-border/50 bg-card p-5">
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold">Place Order</h3>
              <div className="flex gap-1">
                {(["buy", "sell"] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setTradeSide(side)}
                    className={cn(
                      "rounded px-3 py-1 text-xs font-semibold transition-colors",
                      tradeSide === side
                        ? side === "buy"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {side.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    {["Bond", "YTM", "Price (per $1k)", "Qty", "Total Cost", "Action"].map((h) => (
                      <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bonds.map((b) => {
                    const qty = tradeQty[b.id] || 1;
                    const totalCost = b.price * qty;
                    const holding = portfolio.holdings.find((h) => h.bondId === b.id);
                    const canSell = holding && holding.quantity >= qty;
                    const canBuy = portfolio.cash >= totalCost;
                    return (
                      <tr key={b.id} className="border-b border-border/20 hover:bg-accent/20">
                        <td className="px-2 py-2.5 font-medium text-foreground">{b.name}</td>
                        <td className="px-2 py-2.5 tabular-nums text-muted-foreground">{b.ytm.toFixed(3)}%</td>
                        <td className="px-2 py-2.5 tabular-nums text-foreground">${b.price.toFixed(2)}</td>
                        <td className="px-2 py-2.5">
                          <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => setTradeQty((prev) => ({ ...prev, [b.id]: Math.max(1, Number(e.target.value)) }))}
                            className="w-14 rounded border border-border/50 bg-background px-1.5 py-0.5 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-2.5 tabular-nums font-medium text-foreground">
                          ${totalCost.toFixed(2)}
                        </td>
                        <td className="px-2 py-2.5">
                          {tradeSide === "buy" ? (
                            <button
                              onClick={() => handleBuy(b)}
                              disabled={!canBuy}
                              className={cn(
                                "rounded px-2.5 py-1 text-[10px] font-bold transition-colors",
                                canBuy
                                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                  : "cursor-not-allowed opacity-40 bg-muted text-muted-foreground",
                              )}
                            >
                              BUY
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSell(b)}
                              disabled={!canSell}
                              className={cn(
                                "rounded px-2.5 py-1 text-[10px] font-bold transition-colors",
                                canSell
                                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  : "cursor-not-allowed opacity-40 bg-muted text-muted-foreground",
                              )}
                            >
                              SELL {holding ? `(${holding.quantity})` : ""}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Holdings */}
          {portfolioRows.length > 0 ? (
            <div className="rounded-lg border border-border/50 bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Current Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50">
                      {["Bond", "Qty", "Avg Price", "Current", "Mkt Value", "P&L", "P&L %", "~Accrued Int.", "Mod. Dur"].map((h) => (
                        <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioRows.map((r) => {
                      if (!r) return null;
                      return (
                        <tr key={r.bondId} className="border-b border-border/20 hover:bg-accent/20">
                          <td className="px-2 py-2.5 font-medium text-foreground">{r.def.name}</td>
                          <td className="px-2 py-2.5 tabular-nums text-muted-foreground">{r.quantity}</td>
                          <td className="px-2 py-2.5 tabular-nums text-muted-foreground">${r.purchasePrice.toFixed(2)}</td>
                          <td className="px-2 py-2.5 tabular-nums text-foreground">${r.currentPrice.toFixed(2)}</td>
                          <td className="px-2 py-2.5 tabular-nums font-medium text-foreground">${r.marketValue.toFixed(2)}</td>
                          <td className={cn("px-2 py-2.5 tabular-nums font-semibold", r.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                            {r.pnl >= 0 ? "+" : ""}${r.pnl.toFixed(2)}
                          </td>
                          <td className={cn("px-2 py-2.5 tabular-nums font-semibold", r.pnlPct >= 0 ? "text-green-400" : "text-red-400")}>
                            {r.pnlPct >= 0 ? "+" : ""}{r.pnlPct.toFixed(2)}%
                          </td>
                          <td className="px-2 py-2.5 tabular-nums text-muted-foreground">${r.accruedInterest.toFixed(2)}</td>
                          <td className="px-2 py-2.5 tabular-nums text-muted-foreground">{r.modDur.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/50">
                P&L is mark-to-market based on yield changes. Accrued interest is approximate (30-day estimate).
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/50 bg-card/50 p-10 text-center">
              <Landmark className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">No holdings yet</p>
              <p className="mt-1 text-xs text-muted-foreground/60">Buy bonds above to start your fixed income portfolio.</p>
            </div>
          )}
        </TabsContent>

        {/* ── Tab 4: Education ───────────────────────────────────────────────── */}
        <TabsContent
          value="education"
          className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {EDU_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.id} className="rounded-lg border border-border/50 bg-card p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={cn("rounded-md p-2", card.bg)}>
                      <Icon className={cn("h-4 w-4", card.color)} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {card.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", card.color.replace("text-", "bg-"))} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Quick reference table */}
          <div className="mt-5 rounded-lg border border-border/50 bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold">Credit Rating Quick Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    {["Category", "S&P / Fitch", "Moody's", "Risk Level", "Typical Spread over Treasury"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: "Prime",       sp: "AAA",         m: "Aaa",     risk: "Minimal",    spread: "0–30 bps",   color: "text-green-400" },
                    { cat: "High Grade",  sp: "AA+/AA/AA-",  m: "Aa",      risk: "Very Low",   spread: "30–80 bps",  color: "text-green-400" },
                    { cat: "Upper Medium",sp: "A+/A/A-",     m: "A",       risk: "Low",        spread: "80–150 bps", color: "text-blue-400"  },
                    { cat: "Lower Medium",sp: "BBB+/BBB/BBB-",m: "Baa",   risk: "Moderate",   spread: "150–300 bps",color: "text-blue-400"  },
                    { cat: "Speculative", sp: "BB",          m: "Ba",      risk: "High",       spread: "300–500 bps",color: "text-amber-400" },
                    { cat: "Highly Spec.",sp: "B/CCC",       m: "B/Caa",   risk: "Very High",  spread: "500–1000bps",color: "text-red-400"   },
                    { cat: "Default",     sp: "D",           m: "C",       risk: "In Default", spread: "N/A",        color: "text-red-500"   },
                  ].map((row) => (
                    <tr key={row.cat} className="border-b border-border/20 hover:bg-accent/20">
                      <td className={cn("px-3 py-2 font-semibold", row.color)}>{row.cat}</td>
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.sp}</td>
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.m}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.risk}</td>
                      <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.spread}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
