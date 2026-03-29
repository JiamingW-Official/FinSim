"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Calculator,
  ShieldCheck,
  BarChart3,
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG (mulberry32) ───────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── Bond math helpers ─────────────────────────────────────────────────────────

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
  return (
    (coupon * (1 - Math.pow(1 + r, -periods))) / r +
    faceValue / Math.pow(1 + r, periods)
  );
}

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

function modifiedDuration(mac: number, ytm: number, freq: number = 2): number {
  return mac / (1 + ytm / 100 / freq);
}

function convexityCalc(
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

// ── Bond universe (12 bonds) ──────────────────────────────────────────────────

interface BondDef {
  id: string;
  name: string;
  ticker: string;
  coupon: number;
  maturityYears: number;
  baseYtm: number;
  creditRating: string;
  sector: string;
  type: "treasury" | "corporate-ig" | "high-yield";
  maturityDate: string;
}

const BOND_UNIVERSE: BondDef[] = [
  // US Treasuries
  { id: "us2y",  ticker: "UST2Y",  name: "US Treasury 2Y",        coupon: 4.75, maturityYears: 2,  baseYtm: 4.82, creditRating: "AAA", sector: "Government",   type: "treasury",     maturityDate: "2026-03-15" },
  { id: "us5y",  ticker: "UST5Y",  name: "US Treasury 5Y",        coupon: 4.25, maturityYears: 5,  baseYtm: 4.50, creditRating: "AAA", sector: "Government",   type: "treasury",     maturityDate: "2029-03-15" },
  { id: "us10y", ticker: "UST10Y", name: "US Treasury 10Y",       coupon: 4.00, maturityYears: 10, baseYtm: 4.20, creditRating: "AAA", sector: "Government",   type: "treasury",     maturityDate: "2034-03-15" },
  { id: "us30y", ticker: "UST30Y", name: "US Treasury 30Y",       coupon: 4.50, maturityYears: 30, baseYtm: 4.40, creditRating: "AAA", sector: "Government",   type: "treasury",     maturityDate: "2054-03-15" },
  // Investment grade corporates
  { id: "aapl",  ticker: "AAPL31", name: "Apple Inc 2031",        coupon: 3.85, maturityYears: 7,  baseYtm: 4.35, creditRating: "AA+", sector: "Technology",   type: "corporate-ig", maturityDate: "2031-08-05" },
  { id: "msft",  ticker: "MSFT33", name: "Microsoft Corp 2033",   coupon: 3.45, maturityYears: 9,  baseYtm: 4.15, creditRating: "AAA", sector: "Technology",   type: "corporate-ig", maturityDate: "2033-11-15" },
  { id: "jpm",   ticker: "JPM32",  name: "JPMorgan Chase 2032",   coupon: 4.20, maturityYears: 8,  baseYtm: 4.60, creditRating: "A+",  sector: "Financials",   type: "corporate-ig", maturityDate: "2032-06-01" },
  { id: "xom",   ticker: "XOM30",  name: "ExxonMobil Corp 2030",  coupon: 4.10, maturityYears: 6,  baseYtm: 4.45, creditRating: "AA-", sector: "Energy",       type: "corporate-ig", maturityDate: "2030-04-15" },
  // High yield
  { id: "hy1",   ticker: "HY-A",   name: "Frontier Comms 2029",   coupon: 8.75, maturityYears: 5,  baseYtm: 9.20, creditRating: "B+",  sector: "Telecom",      type: "high-yield",   maturityDate: "2029-09-15" },
  { id: "hy2",   ticker: "HY-B",   name: "Carnival Corp 2031",    coupon: 7.625,maturityYears: 7,  baseYtm: 8.10, creditRating: "BB-", sector: "Consumer Disc",type: "high-yield",   maturityDate: "2031-03-01" },
  { id: "hy3",   ticker: "HY-C",   name: "Cheesecake Factory 2028",coupon:9.50, maturityYears: 4,  baseYtm:10.25, creditRating: "B",   sector: "Restaurants",  type: "high-yield",   maturityDate: "2028-12-15" },
  { id: "hy4",   ticker: "HY-D",   name: "Bed Bath Holdings 2027", coupon:12.00,maturityYears: 3,  baseYtm:13.80, creditRating: "CCC", sector: "Retail",       type: "high-yield",   maturityDate: "2027-06-15" },
];

interface BondRow extends BondDef {
  ytm: number;
  price: number;
  duration: number;
  modDur: number;
  yieldChange1d: number;
}

function ratingColor(rating: string): string {
  if (["AAA", "AA+", "AA", "AA-"].includes(rating)) return "text-green-400 bg-green-500/10";
  if (["A+", "A", "A-", "BBB+", "BBB", "BBB-"].includes(rating)) return "text-primary bg-muted/10";
  if (["BB+", "BB", "BB-", "B+"].includes(rating)) return "text-amber-400 bg-amber-500/10";
  return "text-red-400 bg-red-500/5";
}

function typeLabel(type: BondDef["type"]) {
  if (type === "treasury") return { label: "GOVT", cls: "bg-muted/10 text-primary" };
  if (type === "corporate-ig") return { label: "IG", cls: "bg-muted/10 text-primary" };
  return { label: "HY", cls: "bg-red-500/5 text-red-400" };
}

// ── Credit analysis data ──────────────────────────────────────────────────────

interface CreditMetrics {
  bondId: string;
  revenue: number;      // $B
  ebitda: number;       // $B
  totalDebt: number;    // $B
  fcf: number;          // $B
  interestCoverage: number; // EBITDA/Interest
  debtEbitda: number;       // Debt/EBITDA
  equityBuffer: number;  // 0-100 score input
}

const CREDIT_DATA: CreditMetrics[] = [
  { bondId: "aapl",  revenue: 394, ebitda: 130, totalDebt: 109, fcf: 112, interestCoverage: 28.4, debtEbitda: 0.84, equityBuffer: 92 },
  { bondId: "msft",  revenue: 227, ebitda: 103, totalDebt: 47,  fcf: 74,  interestCoverage: 44.1, debtEbitda: 0.46, equityBuffer: 96 },
  { bondId: "jpm",   revenue: 162, ebitda: 55,  totalDebt: 310, fcf: 38,  interestCoverage: 6.2,  debtEbitda: 5.64, equityBuffer: 71 },
  { bondId: "xom",   revenue: 398, ebitda: 68,  totalDebt: 41,  fcf: 18,  interestCoverage: 14.8, debtEbitda: 0.60, equityBuffer: 78 },
  { bondId: "hy1",   revenue: 5.8, ebitda: 2.1, totalDebt: 12,  fcf: 0.4, interestCoverage: 2.8,  debtEbitda: 5.71, equityBuffer: 32 },
  { bondId: "hy2",   revenue: 21,  ebitda: 4.2, totalDebt: 16,  fcf: 1.1, interestCoverage: 3.4,  debtEbitda: 3.81, equityBuffer: 45 },
];

// Simplified Altman Z-score (Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 1.0*X5)
// We approximate with the data we have
function altmanZScore(cm: CreditMetrics): number {
  const x1 = 0.15; // working capital / total assets (approximate)
  const x2 = cm.fcf / (cm.totalDebt * 3 + cm.revenue * 0.5); // retained earnings proxy
  const x3 = cm.ebitda / (cm.totalDebt * 3 + cm.revenue * 0.5); // EBIT / assets
  const x4 = cm.ebitda * 8 / cm.totalDebt; // market value equity / debt
  const x5 = cm.revenue / (cm.totalDebt * 3 + cm.revenue * 0.5); // revenue / assets
  return Math.min(10, Math.max(0, 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + x5));
}

function creditScore(cm: CreditMetrics, zScore: number): number {
  // 0-100 scale
  const icScore = Math.min(40, cm.interestCoverage * 2); // max 40 pts
  const levScore = Math.max(0, 30 - cm.debtEbitda * 4); // max 30 pts (lower leverage better)
  const fcfScore = Math.min(20, (cm.fcf / cm.ebitda) * 100 * 0.2); // FCF/EBITDA * 20pts
  const zScore_n = Math.min(10, zScore * 1.2); // up to 10 pts
  return Math.round(Math.min(100, icScore + levScore + fcfScore + zScore_n));
}

// ── Portfolio builder types ───────────────────────────────────────────────────

interface PortfolioHolding {
  bondId: string;
  weight: number; // 0-100 %
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BondsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculator state
  const [calcFace, setCalcFace] = useState(1000);
  const [calcCoupon, setCalcCoupon] = useState(4.5);
  const [calcMaturity, setCalcMaturity] = useState(10);
  const [calcYtm, setCalcYtm] = useState(4.5);
  const [calcFreq, setCalcFreq] = useState<1 | 2>(2);

  // Portfolio builder state
  const [targetDuration, setTargetDuration] = useState(5);
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);

  // ── Generate bond rows ────────────────────────────────────────────────────
  const bonds: BondRow[] = useMemo(() => {
    const rng = mulberry32(dateSeed());
    return BOND_UNIVERSE.map((def) => {
      const dailyChange = (rng() - 0.5) * 0.3;
      const ytm = Math.max(0.1, def.baseYtm + dailyChange);
      const price = bondPrice(1000, def.coupon, def.maturityYears, ytm);
      const mac = macaulayDuration(1000, def.coupon, def.maturityYears, ytm);
      const modDur = modifiedDuration(mac, ytm);
      return { ...def, ytm, price, duration: mac, modDur, yieldChange1d: dailyChange };
    });
  }, []);

  // ── Yield curve points ────────────────────────────────────────────────────
  const yieldCurve = useMemo(() => {
    const rng = mulberry32(dateSeed() + 77);
    const base = [
      { mat: 0.25, label: "3M", ytm: 5.28 },
      { mat: 0.5,  label: "6M", ytm: 5.10 },
      { mat: 1,    label: "1Y", ytm: 4.95 },
      { mat: 2,    label: "2Y", ytm: bonds.find(b => b.id === "us2y")!.ytm },
      { mat: 5,    label: "5Y", ytm: bonds.find(b => b.id === "us5y")!.ytm },
      { mat: 10,   label: "10Y",ytm: bonds.find(b => b.id === "us10y")!.ytm },
      { mat: 30,   label: "30Y",ytm: bonds.find(b => b.id === "us30y")!.ytm },
    ];
    // Historical curves
    const ago6m = base.map(p => ({ ...p, ytm: Math.max(0.1, p.ytm + (rng() - 0.5) * 0.6 + 0.3) }));
    const ago1y  = base.map(p => ({ ...p, ytm: Math.max(0.1, p.ytm + (rng() - 0.5) * 0.5 + 0.7) }));
    return { current: base, ago6m, ago1y };
  }, [bonds]);

  const spread10y2y = yieldCurve.current[5].ytm - yieldCurve.current[3].ytm;
  const isInverted = spread10y2y < -0.05;
  const isFlat = Math.abs(spread10y2y) <= 0.05;

  const curveRegime = isInverted ? "Inverted" : isFlat ? "Flat" : "Normal";

  // ── Calculator outputs ────────────────────────────────────────────────────
  const calcOutputs = useMemo(() => {
    const price = bondPrice(calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq);
    const mac = macaulayDuration(calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq);
    const modDur = modifiedDuration(mac, calcYtm, calcFreq);
    const cvx = convexityCalc(calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq);
    const dv = modDur * price * 0.0001;
    const accruedInterest = (calcFace * (calcCoupon / 100)) / 365 * 30;
    const pricePlus1 = bondPrice(calcFace, calcCoupon, calcMaturity, calcYtm + 1, calcFreq);
    const priceMinus1 = bondPrice(calcFace, calcCoupon, calcMaturity, Math.max(0.01, calcYtm - 1), calcFreq);
    return { price, mac, modDur, cvx, dv01: dv, accruedInterest, pricePlus1, priceMinus1 };
  }, [calcFace, calcCoupon, calcMaturity, calcYtm, calcFreq]);

  // Price-yield curve (1% to 15%)
  const priceYieldPoints = useMemo(() => {
    const pts: { ytm: number; price: number }[] = [];
    for (let i = 0; i <= 20; i++) {
      const y = 1 + i * 0.7;
      pts.push({ ytm: y, price: bondPrice(calcFace, calcCoupon, calcMaturity, y, calcFreq) });
    }
    return pts;
  }, [calcFace, calcCoupon, calcMaturity, calcFreq]);

  // ── Spread data ───────────────────────────────────────────────────────────
  const spreads = useMemo(() => {
    const rng = mulberry32(dateSeed() + 99);
    const igBonds = bonds.filter(b => b.type === "corporate-ig");
    const hyBonds = bonds.filter(b => b.type === "high-yield");
    const avgIgYtm = igBonds.reduce((s, b) => s + b.ytm, 0) / igBonds.length;
    const avgHyYtm = hyBonds.reduce((s, b) => s + b.ytm, 0) / hyBonds.length;
    const treasuryAvg = (yieldCurve.current[3].ytm + yieldCurve.current[5].ytm) / 2;
    return {
      spread10y2y: spread10y2y * 100, // bps
      igCreditSpread: (avgIgYtm - treasuryAvg) * 100,
      hyCreditSpread: (avgHyYtm - treasuryAvg) * 100,
      tedSpread: Math.abs(5.28 - 5.18) * 100 + (rng() - 0.5) * 5,
      oasIg: 85 + (rng() - 0.5) * 30,
      oasHy: 380 + (rng() - 0.5) * 80,
    };
  }, [bonds, yieldCurve, spread10y2y]);

  // ── Portfolio builder ─────────────────────────────────────────────────────
  const addBondToPortfolio = useCallback((bondId: string) => {
    setPortfolio(prev => {
      if (prev.find(h => h.bondId === bondId)) return prev;
      const n = prev.length + 1;
      const equalWeight = Math.round(100 / n);
      const updated = prev.map(h => ({ ...h, weight: equalWeight }));
      return [...updated, { bondId, weight: equalWeight }];
    });
  }, []);

  const removeBondFromPortfolio = useCallback((bondId: string) => {
    setPortfolio(prev => {
      const filtered = prev.filter(h => h.bondId !== bondId);
      if (filtered.length === 0) return [];
      const equalWeight = Math.round(100 / filtered.length);
      return filtered.map(h => ({ ...h, weight: equalWeight }));
    });
  }, []);

  const updateWeight = useCallback((bondId: string, weight: number) => {
    setPortfolio(prev => prev.map(h => h.bondId === bondId ? { ...h, weight } : h));
  }, []);

  const portfolioMetrics = useMemo(() => {
    const totalWeight = portfolio.reduce((s, h) => s + h.weight, 0);
    if (totalWeight === 0 || portfolio.length === 0) return null;
    let wAvgYtm = 0;
    let wAvgDuration = 0;
    let totalCouponPer100k = 0;
    for (const h of portfolio) {
      const bond = bonds.find(b => b.id === h.bondId);
      if (!bond) continue;
      const w = h.weight / totalWeight;
      wAvgYtm += bond.ytm * w;
      wAvgDuration += bond.modDur * w;
      totalCouponPer100k += (bond.coupon / 100) * 1000 * (h.weight / 100) * (100_000 / 1000);
    }
    return { wAvgYtm, wAvgDuration, totalCouponPer100k, totalWeight };
  }, [portfolio, bonds]);

  // ── Credit analysis ───────────────────────────────────────────────────────
  const creditAnalysis = useMemo(() => {
    return CREDIT_DATA.map(cm => {
      const bond = bonds.find(b => b.id === cm.bondId);
      const zScore = altmanZScore(cm);
      const score = creditScore(cm, zScore);
      const isFallenAngel = bond && bond.type === "corporate-ig" && bond.creditRating.startsWith("BB");
      const atRisk = score < 50;
      return { ...cm, bond, zScore, score, isFallenAngel, atRisk };
    });
  }, [bonds]);

  // ── SVG helpers ───────────────────────────────────────────────────────────

  function YieldCurveSVG({ showHistorical = false }: { showHistorical?: boolean }) {
    const W = 560, H = 200, padL = 48, padR = 20, padT = 20, padB = 36;
    const allYtms = [
      ...yieldCurve.current.map(p => p.ytm),
      ...(showHistorical ? [...yieldCurve.ago6m.map(p => p.ytm), ...yieldCurve.ago1y.map(p => p.ytm)] : []),
    ];
    const minY = Math.min(...allYtms) - 0.2;
    const maxY = Math.max(...allYtms) + 0.2;
    const mats = yieldCurve.current.map(p => p.mat);
    const minM = 0; const maxM = 30;

    const toX = (m: number) => padL + ((m - minM) / (maxM - minM)) * (W - padL - padR);
    const toY = (y: number) => padT + ((maxY - y) / (maxY - minY)) * (H - padT - padB);

    const curvePts = (data: { mat: number; ytm: number }[]) =>
      data.map(p => `${toX(p.mat)},${toY(p.ytm)}`).join(" ");

    const yTicks = [Math.ceil(minY * 4) / 4];
    while (yTicks[yTicks.length - 1] + 0.25 <= maxY) yTicks.push(Math.round((yTicks[yTicks.length - 1] + 0.25) * 100) / 100);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {yTicks.map(y => (
          <line key={y} x1={padL} y1={toY(y)} x2={W - padR} y2={toY(y)}
            stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
        ))}
        {yTicks.map(y => (
          <text key={y} x={padL - 6} y={toY(y) + 4} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="end">
            {y.toFixed(2)}%
          </text>
        ))}
        {yieldCurve.current.map(p => (
          <text key={p.label} x={toX(p.mat)} y={H - 8} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="middle">
            {p.label}
          </text>
        ))}
        {/* Area fill */}
        <polygon
          points={`${toX(mats[0])},${toY(minY)} ${curvePts(yieldCurve.current)} ${toX(mats[mats.length - 1])},${toY(minY)}`}
          fill={isInverted ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)"}
        />
        {/* Historical curves */}
        {showHistorical && (
          <>
            <polyline points={curvePts(yieldCurve.ago1y)} fill="none"
              stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4,3" strokeOpacity={0.5} strokeLinejoin="round" />
            <polyline points={curvePts(yieldCurve.ago6m)} fill="none"
              stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" strokeOpacity={0.6} strokeLinejoin="round" />
          </>
        )}
        {/* Current curve */}
        <polyline points={curvePts(yieldCurve.current)} fill="none"
          stroke={isInverted ? "#ef4444" : "#22c55e"} strokeWidth={2.5} strokeLinejoin="round" />
        {yieldCurve.current.map(p => (
          <circle key={p.label} cx={toX(p.mat)} cy={toY(p.ytm)} r={3.5}
            fill={isInverted ? "#ef4444" : "#22c55e"} />
        ))}
        {/* Legend for historical */}
        {showHistorical && (
          <g>
            <line x1={W - 130} y1={padT + 8} x2={W - 115} y2={padT + 8} stroke="#22c55e" strokeWidth={2.5} />
            <text x={W - 112} y={padT + 12} fontSize={8} fill="currentColor" fillOpacity={0.6}>Current</text>
            <line x1={W - 130} y1={padT + 20} x2={W - 115} y2={padT + 20} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
            <text x={W - 112} y={padT + 24} fontSize={8} fill="currentColor" fillOpacity={0.6}>6M ago</text>
            <line x1={W - 130} y1={padT + 32} x2={W - 115} y2={padT + 32} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4,3" />
            <text x={W - 112} y={padT + 36} fontSize={8} fill="currentColor" fillOpacity={0.6}>1Y ago</text>
          </g>
        )}
      </svg>
    );
  }

  function PriceYieldSVG() {
    const W = 560, H = 220, padL = 64, padR = 20, padT = 16, padB = 36;
    const prices = priceYieldPoints.map(p => p.price);
    const ytms = priceYieldPoints.map(p => p.ytm);
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const minYtm = Math.min(...ytms), maxYtm = Math.max(...ytms);

    const toX = (y: number) => padL + ((y - minYtm) / (maxYtm - minYtm)) * (W - padL - padR);
    const toY = (p: number) => padT + ((maxP - p) / (maxP - minP)) * (H - padT - padB);
    const pts = priceYieldPoints.map(p => `${toX(p.ytm)},${toY(p.price)}`).join(" ");

    const pStep = Math.ceil((maxP - minP) / 5 / 50) * 50;
    const pTicks: number[] = [];
    for (let p = Math.ceil(minP / pStep) * pStep; p <= maxP + pStep; p += pStep) pTicks.push(p);

    const cx = toX(calcYtm);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {pTicks.map(p => (
          <line key={p} x1={padL} y1={toY(p)} x2={W - padR} y2={toY(p)}
            stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
        ))}
        {pTicks.map(p => (
          <text key={p} x={padL - 6} y={toY(p) + 4} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="end">
            ${p.toFixed(0)}
          </text>
        ))}
        {priceYieldPoints.filter((_, i) => i % 4 === 0).map(p => (
          <text key={p.ytm} x={toX(p.ytm)} y={H - 8} fontSize={9} fill="currentColor" fillOpacity={0.45} textAnchor="middle">
            {p.ytm.toFixed(1)}%
          </text>
        ))}
        {/* Axis label */}
        <text x={padL - 4} y={padT - 6} fontSize={8} fill="currentColor" fillOpacity={0.4}>Price ($)</text>
        <text x={W / 2} y={H} fontSize={8} fill="currentColor" fillOpacity={0.4} textAnchor="middle">Yield to Maturity (%)</text>
        {/* Curve fill */}
        <polygon points={`${padL},${toY(minP)} ${pts} ${W - padR},${toY(minP)}`} fill="rgba(99,102,241,0.06)" />
        {/* Curve */}
        <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" />
        {/* Current yield marker */}
        <line x1={cx} y1={padT} x2={cx} y2={H - padB} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
        <circle cx={toX(calcYtm)} cy={toY(calcOutputs.price)} r={5}
          fill="#f59e0b" stroke="#000" strokeWidth={1.5} />
        <text x={toX(calcYtm) + 8} y={toY(calcOutputs.price) - 6} fontSize={9} fill="#f59e0b">
          ${calcOutputs.price.toFixed(2)}
        </text>
      </svg>
    );
  }

  function SpreadBarSVG() {
    const W = 440, H = 130, padL = 120, padR = 60, padT = 12, padB = 12;
    const bars = [
      { label: "10Y-2Y Spread", value: spreads.spread10y2y, color: spreads.spread10y2y < 0 ? "#ef4444" : "#22c55e" },
      { label: "IG Credit Spread", value: spreads.igCreditSpread, color: "#6366f1" },
      { label: "HY Credit Spread", value: spreads.hyCreditSpread, color: "#f59e0b" },
      { label: "TED Spread", value: spreads.tedSpread, color: "#06b6d4" },
    ];
    const maxVal = Math.max(...bars.map(b => Math.abs(b.value)), 10);
    const barH = (H - padT - padB) / bars.length - 4;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {bars.map((bar, i) => {
          const y = padT + i * ((H - padT - padB) / bars.length);
          const barW = (Math.abs(bar.value) / maxVal) * (W - padL - padR);
          return (
            <g key={bar.label}>
              <text x={padL - 6} y={y + barH / 2 + 4} fontSize={9} fill="currentColor" fillOpacity={0.6} textAnchor="end">
                {bar.label}
              </text>
              <rect x={padL} y={y} width={barW} height={barH} rx={2} fill={bar.color} fillOpacity={0.7} />
              <text x={padL + barW + 5} y={y + barH / 2 + 4} fontSize={9} fill={bar.color}>
                {bar.value >= 0 ? "+" : ""}{bar.value.toFixed(1)} bps
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  function MaturityLadderSVG() {
    if (portfolio.length === 0) return null;
    const W = 480, H = 140, padL = 16, padR = 16, padT = 16, padB = 28;
    const items = portfolio
      .map(h => {
        const bond = bonds.find(b => b.id === h.bondId);
        return bond ? { mat: bond.maturityYears, label: bond.ticker, weight: h.weight, type: bond.type } : null;
      })
      .filter(Boolean) as { mat: number; label: string; weight: number; type: BondDef["type"] }[];

    if (items.length === 0) return null;
    const maxW = Math.max(...items.map(i => i.weight));
    const barW = (W - padL - padR) / items.length - 6;

    const typeColor = (t: BondDef["type"]) =>
      t === "treasury" ? "#60a5fa" : t === "corporate-ig" ? "#a78bfa" : "#f87171";

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {items.map((item, i) => {
          const barH = ((item.weight / maxW) * (H - padT - padB)) || 2;
          const x = padL + i * (barW + 6);
          const y = H - padB - barH;
          return (
            <g key={item.label}>
              <rect x={x} y={y} width={barW} height={barH} rx={2} fill={typeColor(item.type)} fillOpacity={0.7} />
              <text x={x + barW / 2} y={H - padB + 10} fontSize={8} fill="currentColor" fillOpacity={0.6} textAnchor="middle">
                {item.mat}Y
              </text>
              <text x={x + barW / 2} y={H - padB + 20} fontSize={7} fill="currentColor" fillOpacity={0.4} textAnchor="middle">
                {item.label}
              </text>
              <text x={x + barW / 2} y={y - 3} fontSize={8} fill={typeColor(item.type)} textAnchor="middle">
                {item.weight}%
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  function CreditGaugeSVG({ score }: { score: number }) {
    const r = 36, cx = 50, cy = 50;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const angle = startAngle + ((score / 100) * (endAngle - startAngle));
    const arcX = cx + r * Math.cos(angle);
    const arcY = cy + r * Math.sin(angle);
    const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

    // Background arc
    const bgX1 = cx + r * Math.cos(startAngle);
    const bgY1 = cy + r * Math.sin(startAngle);
    const bgX2 = cx + r * Math.cos(endAngle);
    const bgY2 = cy + r * Math.sin(endAngle);

    return (
      <svg viewBox="0 0 100 70" width={80} height={56}>
        <path
          d={`M ${bgX1} ${bgY1} A ${r} ${r} 0 1 1 ${bgX2} ${bgY2}`}
          fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={6} strokeLinecap="round"
        />
        <path
          d={`M ${bgX1} ${bgY1} A ${r} ${r} 0 ${score > 66 ? 1 : 0} 1 ${arcX} ${arcY}`}
          fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        />
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={14} fontWeight="bold" fill={color}>
          {score}
        </text>
      </svg>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* HERO Header */}
      <div className="flex items-center gap-3 border-b border-border/20 border-l-4 border-l-primary px-6 py-4">
        <Landmark className="h-3.5 w-3.5 text-muted-foreground/50" />
        <div>
          <h1 className="text-lg font-semibold leading-none">Fixed Income Simulator</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Bonds, yield curves, credit analysis &amp; portfolio construction
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn(
            "rounded-full px-2.5 py-1 text-xs text-muted-foreground font-semibold",
            isInverted ? "bg-red-500/15 text-red-400" :
            isFlat ? "bg-amber-500/15 text-amber-400" :
            "bg-green-500/15 text-green-400",
          )}>
            {curveRegime} Yield Curve
          </span>
          <span className="text-xs text-muted-foreground/50">
            10Y-2Y: {spread10y2y >= 0 ? "+" : ""}{(spread10y2y * 100).toFixed(0)} bps
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col min-h-0">
        <TabsList className="shrink-0 mx-6 mt-3 w-fit">
          <TabsTrigger value="overview" className="text-xs text-muted-foreground gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Bond Market
          </TabsTrigger>
          <TabsTrigger value="calculator" className="text-xs text-muted-foreground gap-1.5">
            <Calculator className="h-3.5 w-3.5" />
            Pricing Calculator
          </TabsTrigger>
          <TabsTrigger value="yieldcurve" className="text-xs text-muted-foreground gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Yield Curve
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs text-muted-foreground gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Portfolio Builder
          </TabsTrigger>
          <TabsTrigger value="credit" className="text-xs text-muted-foreground gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Credit Analysis
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Bond Market Overview ──────────────────────────────────────── */}
        <TabsContent value="overview" className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Yield curve card */}
            <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="col-span-2 rounded-lg border border-border/20 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    US Treasury Yield Curve
                  </span>
                  <div className="flex items-center gap-2">
                    {isInverted && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        Inverted — recession signal
                      </span>
                    )}
                  </div>
                </div>
                <YieldCurveSVG />
              </div>
              <div className="flex flex-col gap-2">
                <div className={cn(
                  "rounded-lg border p-4",
                  isInverted ? "border-red-500/30 bg-red-500/5" :
                  isFlat ? "border-amber-500/30 bg-amber-500/5" :
                  "border-green-500/30 bg-green-500/5",
                )}>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    10Y – 2Y Spread
                  </div>
                  <div className={cn("text-2xl font-semibold tabular-nums",
                    isInverted ? "text-red-400" : isFlat ? "text-amber-400" : "text-green-400")}>
                    {spread10y2y >= 0 ? "+" : ""}{(spread10y2y * 100).toFixed(1)} bps
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    {isInverted ? "Historically precedes recession by 12-18 months." :
                     isFlat ? "Transition — watch for further inversion." :
                     "Healthy growth expectation embedded."}
                  </div>
                </div>
                {yieldCurve.current.map(p => (
                  <div key={p.label} className="flex items-center justify-between rounded-md border border-border/20 bg-card px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">{p.label} Treasury</span>
                    <span className="text-xs font-medium tabular-nums text-foreground">{p.ytm.toFixed(3)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bond grid — 3 sections */}
            {(["treasury", "corporate-ig", "high-yield"] as const).map(type => {
              const sectionBonds = bonds.filter(b => b.type === type);
              const sectionTitle =
                type === "treasury" ? "US Treasuries" :
                type === "corporate-ig" ? "Investment Grade Corporates" :
                "High Yield Bonds";
              return (
                <div key={type} className="mb-5">
                  <h3 className={cn("mb-3 text-xs text-muted-foreground font-medium",
                    type === "treasury" ? "text-primary" :
                    type === "corporate-ig" ? "text-primary" :
                    "text-red-400"
                  )}>
                    {sectionTitle}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {sectionBonds.map(b => {
                      const tl = typeLabel(b.type);
                      const rc = ratingColor(b.creditRating);
                      const isRising = b.yieldChange1d > 0;
                      return (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className="rounded-lg border border-border/20 bg-card p-4"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">{b.ticker}</div>
                              <div className="mt-0.5 text-xs font-medium text-foreground leading-tight">{b.name}</div>
                            </div>
                            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", rc)}>
                              {b.creditRating}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Coupon</span>
                              <span className="font-medium text-foreground">{b.coupon.toFixed(2)}%</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">YTM</span>
                              <span className="font-medium text-primary">{b.ytm.toFixed(3)}%</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Price</span>
                              <span className="font-medium text-foreground">${b.price.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-medium text-foreground">{b.duration.toFixed(2)}yr</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Maturity</span>
                              <span className="font-medium text-foreground">{b.maturityDate.slice(0, 7)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Yield Chg</span>
                              <span className={cn("font-medium tabular-nums flex items-center gap-0.5",
                                isRising ? "text-red-400" : "text-green-400")}>
                                {isRising ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                {b.yieldChange1d >= 0 ? "+" : ""}{(b.yieldChange1d * 100).toFixed(1)} bps
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <p className="mt-1 text-xs text-muted-foreground/40">
              Prices per $1,000 face value. Yield change (bps): yield rise = price falls. Synthetic data for educational purposes.
            </p>
          </motion.div>
        </TabsContent>

        {/* ── Tab 2: Bond Pricing Calculator ───────────────────────────────────── */}
        <TabsContent value="calculator" className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Inputs */}
              <div className="rounded-lg border border-border/20 bg-card p-5">
                <h3 className="mb-4 text-sm font-medium">Bond Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Face Value ($)</label>
                    <input type="number" value={calcFace}
                      onChange={e => setCalcFace(Math.max(100, Number(e.target.value)))}
                      className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Annual Coupon Rate (%)</label>
                    <input type="number" step="0.01" value={calcCoupon}
                      onChange={e => setCalcCoupon(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Years to Maturity</label>
                    <input type="number" value={calcMaturity}
                      onChange={e => setCalcMaturity(Math.max(0.5, Number(e.target.value)))}
                      className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Current Market Yield / YTM (%)</label>
                    <input type="number" step="0.01" value={calcYtm}
                      onChange={e => setCalcYtm(Math.max(0.01, Number(e.target.value)))}
                      className="w-full rounded-md border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Payment Frequency</label>
                    <div className="flex gap-2">
                      {([1, 2] as const).map(f => (
                        <button key={f} onClick={() => setCalcFreq(f)} className={cn(
                          "flex-1 rounded-md border px-3 py-1.5 text-xs text-muted-foreground font-medium transition-colors",
                          calcFreq === f
                            ? "border-primary bg-muted/10 text-primary"
                            : "border-border/60 text-muted-foreground hover:border-primary/40",
                        )}>
                          {f === 1 ? "Annual" : "Semi-Annual"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Outputs */}
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-border/20 bg-card p-5">
                  <h3 className="mb-4 text-sm font-medium">Calculated Metrics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Bond Price", value: `$${calcOutputs.price.toFixed(4)}`, highlight: true, sub: `${calcOutputs.price > calcFace ? "Premium" : calcOutputs.price < calcFace ? "Discount" : "At Par"}` },
                      { label: "Accrued Interest", value: `$${calcOutputs.accruedInterest.toFixed(2)}`, sub: "~30d accrued" },
                      { label: "Macaulay Duration", value: `${calcOutputs.mac.toFixed(4)} yrs`, sub: "Weighted avg CF timing" },
                      { label: "Modified Duration", value: `${calcOutputs.modDur.toFixed(4)} yrs`, sub: "Price sensitivity" },
                      { label: "Convexity", value: calcOutputs.cvx.toFixed(4), sub: "Curvature of P/Y" },
                      { label: "DV01", value: `$${calcOutputs.dv01.toFixed(4)}`, sub: "$ value of 1 bp" },
                    ].map(({ label, value, highlight, sub }) => (
                      <div key={label} className={cn("rounded-md border p-3",
                        highlight ? "border-primary/30 bg-muted/5" : "border-border/20 bg-muted/20")}>
                        <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
                        <div className={cn("mt-1 text-sm font-medium tabular-nums", highlight ? "text-primary" : "text-foreground")}>
                          {value}
                        </div>
                        {sub && <div className="mt-0.5 text-[11px] text-muted-foreground/60">{sub}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duration visual explainer */}
                <div className="rounded-lg border border-border/20 bg-card p-4">
                  <h4 className="mb-3 text-xs font-medium text-muted-foreground">
                    Duration Impact — Rate Scenarios
                  </h4>
                  <div className="space-y-2">
                    {[
                      { delta: -1, label: "Rates fall 1%", price: calcOutputs.priceMinus1 },
                      { delta: 0, label: "Current", price: calcOutputs.price },
                      { delta: +1, label: "Rates rise 1%", price: calcOutputs.pricePlus1 },
                    ].map(({ delta, label, price }) => {
                      const chg = ((price - calcOutputs.price) / calcOutputs.price) * 100;
                      const barW = Math.abs(chg) * 3;
                      return (
                        <div key={delta} className="flex items-center gap-3">
                          <div className="w-28 text-xs text-muted-foreground">{label}</div>
                          <div className="flex flex-1 items-center gap-1.5">
                            <div className="h-4 rounded-sm" style={{
                              width: `${Math.min(barW, 100)}%`,
                              background: delta < 0 ? "rgba(34,197,94,0.4)" : delta > 0 ? "rgba(239,68,68,0.4)" : "rgba(99,102,241,0.4)",
                            }} />
                          </div>
                          <div className={cn("w-24 text-right text-xs text-muted-foreground font-medium tabular-nums",
                            chg > 0 ? "text-green-400" : chg < 0 ? "text-red-400" : "text-primary")}>
                            ${price.toFixed(2)} ({chg >= 0 ? "+" : ""}{chg.toFixed(2)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground/50">
                    Price change ≈ −ModDuration × ΔYield × Price. Convexity provides a second-order correction.
                  </p>
                </div>
              </div>
            </div>

            {/* Price-yield chart */}
            <div className="mt-5 rounded-lg border border-border/20 bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Price–Yield Relationship (Convex Curve, 1%–15%)
                </span>
                <span className="text-xs text-muted-foreground/60">
                  Amber dot = current yield | Convexity = bond outperforms linear estimate
                </span>
              </div>
              <PriceYieldSVG />
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Tab 3: Yield Curve Analysis ───────────────────────────────────────── */}
        <TabsContent value="yieldcurve" className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Historical curves */}
            <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="col-span-2 rounded-lg border border-border/20 bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Yield Curve — Historical Comparison
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-0.5 w-5 bg-green-400" /> Current
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-0.5 w-5 border-t border-dashed border-amber-400" /> 6M ago
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block h-0.5 w-5 border-t border-dashed border-indigo-400" /> 1Y ago
                    </span>
                  </div>
                </div>
                <YieldCurveSVG showHistorical />
              </div>

              {/* Regime indicator */}
              <div className="flex flex-col gap-3">
                <div className={cn("rounded-lg border p-4",
                  isInverted ? "border-red-500/30 bg-red-500/5" :
                  isFlat ? "border-amber-500/30 bg-amber-500/5" :
                  "border-green-500/30 bg-green-500/5")}>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Current Regime
                  </div>
                  <div className={cn("text-xl font-medium",
                    isInverted ? "text-red-400" : isFlat ? "text-amber-400" : "text-green-400")}>
                    {curveRegime}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {isInverted
                      ? "Short-term rates exceed long-term rates. Historically predicts recession within 12-18 months. Fed policy likely too tight."
                      : isFlat
                      ? "Similar yields across maturities. Transition phase — market is uncertain about growth outlook."
                      : "Upward-sloping curve. Normal growth environment. Borrowers pay premium for longer duration."}
                  </div>
                </div>

                {/* Curve shape guide */}
                <div className="rounded-lg border border-border/20 bg-card p-4">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Shape Guide</div>
                  <div className="space-y-2.5">
                    {[
                      { shape: "Normal", color: "text-green-400", bg: "bg-green-500", desc: "Long > Short — growth & inflation expected" },
                      { shape: "Flat", color: "text-amber-400", bg: "bg-amber-500", desc: "Equal yields — uncertainty or transition" },
                      { shape: "Inverted", color: "text-red-400", bg: "bg-red-500", desc: "Short > Long — recession risk signal" },
                      { shape: "Humped", color: "text-primary", bg: "bg-primary", desc: "Mid-term peak — complex growth dynamics" },
                    ].map(s => (
                      <div key={s.shape} className="flex items-start gap-2">
                        <div className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", s.bg)} />
                        <div>
                          <span className={cn("text-xs text-muted-foreground font-medium", s.color)}>{s.shape}</span>
                          <span className="ml-1.5 text-[11px] text-muted-foreground">{s.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Spread analysis */}
            <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-lg border border-border/20 bg-card p-5">
                <h3 className="mb-4 text-sm font-medium">Spread Analysis (bps)</h3>
                <SpreadBarSVG />
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {[
                    { label: "10Y–2Y Spread", value: `${spreads.spread10y2y >= 0 ? "+" : ""}${spreads.spread10y2y.toFixed(1)} bps`, color: spreads.spread10y2y < 0 ? "text-red-400" : "text-green-400" },
                    { label: "IG Credit Spread", value: `+${spreads.igCreditSpread.toFixed(1)} bps`, color: "text-primary" },
                    { label: "HY Credit Spread", value: `+${spreads.hyCreditSpread.toFixed(1)} bps`, color: "text-amber-400" },
                    { label: "TED Spread", value: `${spreads.tedSpread.toFixed(1)} bps`, color: "text-muted-foreground" },
                    { label: "OAS (IG)", value: `${spreads.oasIg.toFixed(0)} bps`, color: "text-primary" },
                    { label: "OAS (HY)", value: `${spreads.oasHy.toFixed(0)} bps`, color: "text-amber-400" },
                  ].map(s => (
                    <div key={s.label} className="rounded-md border border-border/20 bg-muted/20 px-3 py-2">
                      <div className="text-muted-foreground">{s.label}</div>
                      <div className={cn("mt-0.5 font-medium tabular-nums", s.color)}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border/20 bg-card p-5">
                <h3 className="mb-4 text-sm font-medium">Spread Interpretation</h3>
                <div className="space-y-3">
                  {[
                    {
                      title: "10Y–2Y Spread",
                      icon: TrendingUp,
                      desc: "The most-watched recession indicator. Negative (inverted) = short rates exceed long rates, signaling tight monetary conditions and near-term recession risk. Each post-WWII recession was preceded by inversion.",
                      color: "text-green-400",
                    },
                    {
                      title: "Credit Spread",
                      icon: AlertTriangle,
                      desc: "Yield premium over equivalent Treasury. Widening spreads = risk aversion rising, credit stress. IG < 200 bps is healthy; > 300 bps = stress. HY > 700 bps = distress.",
                      color: "text-amber-400",
                    },
                    {
                      title: "TED Spread",
                      icon: Info,
                      desc: "Difference between 3M LIBOR (or SOFR) and 3M Treasury. Measures interbank credit risk. Spike = banking stress (2008 TED reached 465 bps). Normal: 10–50 bps.",
                      color: "text-muted-foreground",
                    },
                    {
                      title: "OAS (Option-Adjusted Spread)",
                      icon: BarChart3,
                      desc: "Spread after stripping embedded option value from callable bonds. Cleaner measure of credit premium. IG OAS < 150 bps healthy; HY OAS > 500 bps = elevated risk.",
                      color: "text-primary",
                    },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-2.5">
                        <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", item.color)} />
                        <div>
                          <div className={cn("text-xs text-muted-foreground font-medium", item.color)}>{item.title}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Tab 4: Portfolio Builder ──────────────────────────────────────────── */}
        <TabsContent value="portfolio" className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Bond selector */}
              <div className="rounded-lg border border-border/20 bg-card p-5">
                <h3 className="mb-3 text-sm font-medium">Bond Universe</h3>

                {/* Target duration slider */}
                <div className="mb-4 rounded-md border border-border/20 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">Target Portfolio Duration</span>
                    <span className="font-medium text-primary">{targetDuration.toFixed(1)} yrs</span>
                  </div>
                  <input
                    type="range" min={1} max={15} step={0.5} value={targetDuration}
                    onChange={e => setTargetDuration(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground/50">
                    <span>1yr (short)</span><span>8yr (mid)</span><span>15yr (long)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {bonds.map(b => {
                    const inPortfolio = portfolio.some(h => h.bondId === b.id);
                    const tl = typeLabel(b.type);
                    return (
                      <div key={b.id} className={cn(
                        "flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
                        inPortfolio ? "border-primary/40 bg-muted/5" : "border-border/20 bg-card hover:bg-muted/20",
                      )}>
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded px-1 py-0.5 text-[11px] font-medium", tl.cls)}>{tl.label}</span>
                          <div>
                            <div className="text-xs font-medium text-foreground">{b.ticker}</div>
                            <div className="text-[11px] text-muted-foreground">{b.maturityYears}yr · {b.ytm.toFixed(2)}% YTM</div>
                          </div>
                        </div>
                        <button
                          onClick={() => inPortfolio ? removeBondFromPortfolio(b.id) : addBondToPortfolio(b.id)}
                          className={cn(
                            "rounded p-1 transition-colors",
                            inPortfolio
                              ? "text-red-400 hover:bg-red-500/5"
                              : "text-primary hover:bg-muted/10",
                          )}
                        >
                          {inPortfolio ? <Trash2 className="h-3.5 w-3.5" /> : <PlusCircle className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Portfolio table + metrics */}
              <div className="col-span-2 flex flex-col gap-4">
                {/* Metrics */}
                {portfolioMetrics ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Weighted Avg Yield", value: `${portfolioMetrics.wAvgYtm.toFixed(3)}%`, color: "text-primary" },
                      { label: "Portfolio Duration", value: `${portfolioMetrics.wAvgDuration.toFixed(2)} yrs`,
                        color: Math.abs(portfolioMetrics.wAvgDuration - targetDuration) < 1 ? "text-green-400" : "text-amber-400" },
                      { label: "Annual Coupon / $100k", value: `$${portfolioMetrics.totalCouponPer100k.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, color: "text-foreground" },
                    ].map(m => (
                      <div key={m.label} className="rounded-lg border border-border/20 bg-card px-4 py-3">
                        <div className="text-[11px] font-medium text-muted-foreground">{m.label}</div>
                        <div className={cn("mt-1 text-base font-medium tabular-nums", m.color)}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/20 bg-card/50 p-4 text-center">
                    <Landmark className="mx-auto h-7 w-7 text-muted-foreground/30" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">Add bonds to build your portfolio</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Click the + icon on any bond in the universe.</p>
                  </div>
                )}

                {/* Portfolio table */}
                {portfolio.length > 0 && (
                  <div className="rounded-lg border border-border/20 bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-muted-foreground">
                        <thead>
                          <tr className="border-b border-border/20 bg-muted/30">
                            {["Bond", "Weight %", "Dur Contrib", "Yield Contrib", "Remove"].map(h => (
                              <th key={h} className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {portfolio.map(h => {
                            const bond = bonds.find(b => b.id === h.bondId);
                            if (!bond) return null;
                            const totalW = portfolio.reduce((s, x) => s + x.weight, 0);
                            const w = totalW > 0 ? h.weight / totalW : 0;
                            const durContrib = bond.modDur * w;
                            const yldContrib = bond.ytm * w;
                            return (
                              <tr key={h.bondId} className="border-b border-border/20 hover:bg-muted/10">
                                <td className="px-3 py-2.5">
                                  <div className="font-medium text-foreground">{bond.ticker}</div>
                                  <div className="text-[11px] text-muted-foreground">{bond.name}</div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <input
                                    type="number" min={0} max={100} value={h.weight}
                                    onChange={e => updateWeight(h.bondId, Math.max(0, Math.min(100, Number(e.target.value))))}
                                    className="w-16 rounded border border-border/20 bg-background px-1.5 py-0.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                  />
                                </td>
                                <td className="px-3 py-2.5 tabular-nums text-primary">{durContrib.toFixed(3)}</td>
                                <td className="px-3 py-2.5 tabular-nums text-green-400">{(yldContrib * 100).toFixed(3)}%</td>
                                <td className="px-3 py-2.5">
                                  <button onClick={() => removeBondFromPortfolio(h.bondId)}
                                    className="rounded p-1 text-muted-foreground hover:bg-red-500/5 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Maturity ladder SVG */}
                {portfolio.length > 0 && (
                  <div className="rounded-lg border border-border/20 bg-card p-5">
                    <h4 className="mb-3 text-xs font-medium text-muted-foreground">
                      Bond Maturity Ladder
                    </h4>
                    <MaturityLadderSVG />
                    <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground/60">
                      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-primary" /> Treasury</span>
                      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-primary" /> IG Corp</span>
                      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-red-400" /> High Yield</span>
                    </div>
                  </div>
                )}

                {/* Target duration indicator */}
                {portfolioMetrics && (
                  <div className={cn("rounded-lg border p-4",
                    Math.abs(portfolioMetrics.wAvgDuration - targetDuration) < 0.5
                      ? "border-green-500/30 bg-green-500/5"
                      : Math.abs(portfolioMetrics.wAvgDuration - targetDuration) < 2
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-red-500/30 bg-red-500/5",
                  )}>
                    <div className="flex items-center gap-2">
                      {Math.abs(portfolioMetrics.wAvgDuration - targetDuration) < 0.5
                        ? <ShieldCheck className="h-4 w-4 text-green-400" />
                        : <AlertTriangle className="h-4 w-4 text-amber-400" />}
                      <div>
                        <div className="text-xs font-medium text-foreground">
                          Duration Gap: {(portfolioMetrics.wAvgDuration - targetDuration).toFixed(2)} yrs
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Portfolio duration {portfolioMetrics.wAvgDuration.toFixed(2)}yr vs target {targetDuration.toFixed(1)}yr.
                          {Math.abs(portfolioMetrics.wAvgDuration - targetDuration) < 0.5
                            ? " On target."
                            : portfolioMetrics.wAvgDuration > targetDuration
                            ? " Add shorter-duration bonds to reduce duration."
                            : " Add longer-duration bonds to increase duration."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Tab 5: Credit Analysis ────────────────────────────────────────────── */}
        <TabsContent value="credit" className="flex-1 overflow-y-auto px-6 pb-6 pt-4 data-[state=inactive]:hidden">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Fallen angel alert */}
            {creditAnalysis.some(c => c.atRisk && c.bond?.type === "corporate-ig") && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-amber-400">Fallen Angel Risk Detected</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    One or more investment-grade bonds have deteriorating credit metrics and may be at risk of downgrade to high yield.
                    "Fallen angels" can trigger forced selling by index funds, causing price dislocation.
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {creditAnalysis.map(ca => {
                const bond = ca.bond;
                if (!bond) return null;
                const rc = ratingColor(bond.creditRating);
                const tl = typeLabel(bond.type);
                const zColor = ca.zScore >= 2.99 ? "text-green-400" : ca.zScore >= 1.23 ? "text-amber-400" : "text-red-400";
                const zLabel = ca.zScore >= 2.99 ? "Safe Zone" : ca.zScore >= 1.23 ? "Gray Zone" : "Distress Zone";

                return (
                  <motion.div
                    key={ca.bondId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-lg border bg-card p-4",
                      ca.atRisk ? "border-red-500/30" : "border-border/20",
                    )}
                  >
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CreditGaugeSVG score={ca.score} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={cn("rounded px-1 py-0.5 text-[11px] font-medium", tl.cls)}>{tl.label}</span>
                            <span className={cn("rounded px-1 py-0.5 text-[11px] font-medium", rc)}>{bond.creditRating}</span>
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-foreground leading-tight">{bond.name}</div>
                          <div className="text-[11px] text-muted-foreground">{bond.sector}</div>
                        </div>
                      </div>
                      {ca.atRisk && (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">
                          AT RISK
                        </span>
                      )}
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {[
                        { label: "Revenue", value: `$${ca.revenue}B` },
                        { label: "EBITDA", value: `$${ca.ebitda}B` },
                        { label: "Total Debt", value: `$${ca.totalDebt}B` },
                        { label: "Free Cash Flow", value: `$${ca.fcf}B`, color: ca.fcf < 0 ? "text-red-400" : "text-green-400" },
                        {
                          label: "Interest Coverage",
                          value: `${ca.interestCoverage.toFixed(1)}x`,
                          color: ca.interestCoverage > 5 ? "text-green-400" : ca.interestCoverage > 2 ? "text-amber-400" : "text-red-400",
                        },
                        {
                          label: "Debt/EBITDA",
                          value: `${ca.debtEbitda.toFixed(2)}x`,
                          color: ca.debtEbitda < 2 ? "text-green-400" : ca.debtEbitda < 4 ? "text-amber-400" : "text-red-400",
                        },
                      ].map(m => (
                        <div key={m.label} className="rounded border border-border/20 bg-muted/20 px-2 py-1.5">
                          <div className="text-muted-foreground">{m.label}</div>
                          <div className={cn("mt-0.5 font-medium tabular-nums", m.color || "text-foreground")}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Altman Z-score */}
                    <div className="mt-3 rounded border border-border/20 bg-muted/20 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Altman Z-Score</span>
                        <span className={cn("text-xs text-muted-foreground font-medium tabular-nums", zColor)}>
                          {ca.zScore.toFixed(2)} — {zLabel}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-colors", zColor.replace("text-", "bg-"))}
                          style={{ width: `${Math.min(100, (ca.zScore / 5) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground/50">
                        <span>0 (Distress)</span><span>1.23</span><span>2.99</span><span>5+</span>
                      </div>
                    </div>

                    {/* Credit score bar */}
                    <div className="mt-2">
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Credit Score</span>
                        <span className={cn("font-medium", ca.score >= 70 ? "text-green-400" : ca.score >= 50 ? "text-amber-400" : "text-red-400")}>
                          {ca.score}/100
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", ca.score >= 70 ? "bg-green-500" : ca.score >= 50 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${ca.score}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Credit metric legend */}
            <div className="mt-5 rounded-lg border border-border/20 bg-card p-5">
              <h3 className="mb-3 text-sm font-medium">Credit Metric Benchmarks</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    metric: "Interest Coverage (EBITDA/Interest)",
                    thresholds: [
                      { label: "> 5x", color: "text-green-400", desc: "Strong — comfortably covers interest" },
                      { label: "2–5x", color: "text-amber-400", desc: "Moderate — watch for earnings compression" },
                      { label: "< 2x", color: "text-red-400", desc: "Weak — potential distress if earnings fall" },
                    ],
                  },
                  {
                    metric: "Leverage (Debt/EBITDA)",
                    thresholds: [
                      { label: "< 2x", color: "text-green-400", desc: "Conservative — lots of deleveraging capacity" },
                      { label: "2–4x", color: "text-amber-400", desc: "Moderate — common for IG corporates" },
                      { label: "> 4x", color: "text-red-400", desc: "High — HY territory, refinancing risk" },
                    ],
                  },
                  {
                    metric: "Altman Z-Score",
                    thresholds: [
                      { label: "> 2.99", color: "text-green-400", desc: "Safe Zone — low bankruptcy probability" },
                      { label: "1.23–2.99", color: "text-amber-400", desc: "Gray Zone — monitor closely" },
                      { label: "< 1.23", color: "text-red-400", desc: "Distress Zone — high default risk" },
                    ],
                  },
                ].map(g => (
                  <div key={g.metric}>
                    <div className="mb-2 text-xs font-medium text-muted-foreground">{g.metric}</div>
                    <div className="space-y-1.5">
                      {g.thresholds.map(t => (
                        <div key={t.label} className="flex items-start gap-2">
                          <span className={cn("mt-0.5 text-xs text-muted-foreground font-medium w-14 shrink-0 tabular-nums", t.color)}>{t.label}</span>
                          <span className="text-[11px] text-muted-foreground">{t.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
