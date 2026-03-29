"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  BarChart3,
  Calculator,
  AlertTriangle,
  Info,
  DollarSign,
  Percent,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 850;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

const RAND_VALUES: number[] = [];
for (let i = 0; i < 2000; i++) {
  RAND_VALUES.push(rand());
}
let randIdx = 0;
const sr = () => RAND_VALUES[randIdx++ % RAND_VALUES.length];

// ── ABS Math Helpers ──────────────────────────────────────────────────────────

/** CPR to SMM conversion */
function cprToSmm(cpr: number): number {
  return 1 - Math.pow(1 - cpr / 100, 1 / 12);
}

/** PSA speed → CPR at month t (PSA ramp: 0.2%/month for 30 months, then 6%) */
function psaCpr(month: number, psaSpeed: number): number {
  const baseCpr = month <= 30 ? (month * 0.2) : 6.0;
  return baseCpr * (psaSpeed / 100);
}

/** Weighted Average Life calculation given monthly cashflows */
function computeWAL(principalCFs: number[]): number {
  let num = 0;
  let denom = 0;
  for (let t = 0; t < principalCFs.length; t++) {
    const mo = t + 1;
    num += mo * principalCFs[t];
    denom += principalCFs[t];
  }
  return denom > 0 ? num / 12 / denom : 0;
}

/** Discount margin for floating-rate ABS */
function computeDiscountMargin(
  price: number,
  margin: number,
  indexRate: number,
  wal: number
): number {
  // Simplified: DM = (coupon - (price - 100) / WAL) - index
  const coupon = (indexRate + margin) / 100;
  const annualizedPriceDiff = (price - 100) / wal / 100;
  return (coupon - annualizedPriceDiff - indexRate / 100) * 10000;
}

/** Z-spread (simplified): spread over flat Treasury curve that prices the bond */
function computeZSpread(
  price: number,
  couponRate: number,
  maturityYears: number,
  treasuryRate: number
): number {
  // Binary search for z-spread
  let lo = -500;
  let hi = 2000;
  for (let iter = 0; iter < 50; iter++) {
    const mid = (lo + hi) / 2;
    let pv = 0;
    const periods = maturityYears * 2;
    for (let t = 1; t <= periods; t++) {
      const r = (treasuryRate + mid / 100) / 200;
      const cf = t === periods ? 100 + (couponRate / 2) : couponRate / 2;
      pv += cf / Math.pow(1 + r, t);
    }
    if (pv > price) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ── Static Data ───────────────────────────────────────────────────────────────

interface Tranche {
  name: string;
  rating: string;
  size: number; // % of pool
  spread: number; // bps
  ce: number; // credit enhancement %
  coupon: number; // %
  wal: number; // years
  color: string;
}

const TRANCHES: Tranche[] = [
  { name: "Class A (Senior AAA)", rating: "AAA", size: 70, spread: 55, ce: 30, coupon: 5.05, wal: 3.2, color: "#3b82f6" },
  { name: "Class B (AA)", rating: "AA", size: 10, spread: 95, ce: 20, coupon: 5.45, wal: 4.1, color: "#8b5cf6" },
  { name: "Class C (Mezzanine A)", rating: "A", size: 7, spread: 175, ce: 13, coupon: 6.25, wal: 5.0, color: "#f59e0b" },
  { name: "Class D (BBB)", rating: "BBB", size: 8, spread: 310, ce: 5, coupon: 7.60, wal: 5.8, color: "#ef4444" },
  { name: "Class E (Equity)", rating: "NR", size: 5, spread: 800, ce: 0, coupon: 12.50, wal: 6.5, color: "#6b7280" },
];

interface PrepayScenario {
  label: string;
  psa: number;
  wal: number;
  price: number;
  yieldPct: number;
  spread?: number;
}

const PREPAY_SCENARIOS: PrepayScenario[] = [
  { label: "Slow (50 PSA)", psa: 50, wal: 6.8, price: 102.4, yieldPct: 4.62 },
  { label: "Base (150 PSA)", psa: 150, wal: 4.1, price: 100.0, yieldPct: 5.05 },
  { label: "Fast (300 PSA)", psa: 300, wal: 2.7, price: 97.8, yieldPct: 5.91 },
  { label: "Shock (700 PSA)", psa: 700, wal: 1.4, price: 95.2, yieldPct: 7.34 },
];

interface AssetClassLoss {
  assetClass: string;
  avgLoss: number;
  stressLoss: number;
  attachPt: number;
}

const ASSET_CLASS_LOSSES: AssetClassLoss[] = [
  { assetClass: "Prime Auto Loans", avgLoss: 0.8, stressLoss: 3.2, attachPt: 5.0 },
  { assetClass: "Subprime Auto", avgLoss: 3.5, stressLoss: 12.0, attachPt: 15.0 },
  { assetClass: "Credit Cards", avgLoss: 4.2, stressLoss: 14.5, attachPt: 18.0 },
  { assetClass: "Student Loans", avgLoss: 1.5, stressLoss: 6.0, attachPt: 8.0 },
  { assetClass: "Equipment Finance", avgLoss: 0.6, stressLoss: 2.8, attachPt: 4.5 },
  { assetClass: "Residential Mortgages", avgLoss: 2.1, stressLoss: 8.5, attachPt: 10.0 },
];

// ── Info Card ─────────────────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-foreground/5 p-4">
      <p className="mb-2 text-xs font-semibold text-foreground/40">{title}</p>
      {children}
    </div>
  );
}

// ── TAB 1: ABS Structure ──────────────────────────────────────────────────────

function ABSStructureTab() {
  const [showWaterfall, setShowWaterfall] = useState(false);

  // Securitization diagram dimensions
  const W = 700;
  const H = 200;

  const boxes = [
    { x: 20, y: 75, w: 120, h: 50, label: "Originator", sub: "Loans / Receivables", color: "#3b82f6" },
    { x: 200, y: 75, w: 120, h: 50, label: "SPV/Trust", sub: "Bankruptcy Remote", color: "#8b5cf6" },
    { x: 380, y: 10, w: 110, h: 38, label: "Class A", sub: "AAA 70%", color: "#3b82f6" },
    { x: 380, y: 55, w: 110, h: 38, label: "Class B", sub: "AA 10%", color: "#8b5cf6" },
    { x: 380, y: 100, w: 110, h: 38, label: "Class C", sub: "A 7%", color: "#f59e0b" },
    { x: 380, y: 145, w: 110, h: 38, label: "Class D", sub: "BBB 8%", color: "#ef4444" },
    { x: 515, y: 75, w: 100, h: 50, label: "Investors", sub: "Capital Markets", color: "#10b981" },
    { x: 560, y: 150, w: 90, h: 38, label: "Equity 5%", sub: "NR / Retained", color: "#6b7280" },
  ];

  return (
    <div className="space-y-4">
      {/* Securitization SVG */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Securitization Structure</p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" style={{ minWidth: 480 }}>
            {/* Originator → SPV arrow */}
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
              </marker>
            </defs>
            <line x1="140" y1="100" x2="196" y2="100" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arr)" />
            {/* SPV → Tranches arrows */}
            {[29, 74, 119, 164].map((ty, i) => (
              <line key={i} x1="320" y1="100" x2="376" y2={ty} stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arr)" />
            ))}
            {/* Tranche A-D → Investors */}
            {[29, 74, 119, 164].map((ty, i) => (
              <line key={i} x1="490" y1={ty} x2="511" y2={i < 2 ? 90 : i === 2 ? 100 : 110} stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arr)" />
            ))}
            {/* Boxes */}
            {boxes.map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={5} fill={b.color + "22"} stroke={b.color} strokeWidth="1.5" />
                <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 6} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">{b.label}</text>
                <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 9} textAnchor="middle" fill="#94a3b8" fontSize="8">{b.sub}</text>
              </g>
            ))}
            {/* Labels */}
            <text x="170" y="92" fill="#94a3b8" fontSize="8">Sale/True</text>
            <text x="168" y="102" fill="#94a3b8" fontSize="8">Sale</text>
            <text x="340" y="92" fill="#94a3b8" fontSize="8">Issues</text>
            <text x="337" y="102" fill="#94a3b8" fontSize="8">Tranches</text>
          </svg>
        </div>
      </div>

      {/* Tranches Table */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Tranche Summary</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-foreground/40">
                <th className="py-2 text-left font-medium">Class</th>
                <th className="py-2 text-center font-medium">Rating</th>
                <th className="py-2 text-center font-medium">Size %</th>
                <th className="py-2 text-center font-medium">Coupon</th>
                <th className="py-2 text-center font-medium">Spread (bps)</th>
                <th className="py-2 text-center font-medium">CE %</th>
                <th className="py-2 text-center font-medium">WAL (yr)</th>
              </tr>
            </thead>
            <tbody>
              {TRANCHES.map((t) => (
                <tr key={t.name} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="py-2 text-foreground/90">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </td>
                  <td className="py-2 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs text-muted-foreground",
                        t.rating === "AAA" ? "border-primary text-primary" :
                        t.rating === "AA" ? "border-primary text-primary" :
                        t.rating === "A" ? "border-amber-500 text-amber-400" :
                        t.rating === "BBB" ? "border-red-500 text-red-400" :
                        "border-muted-foreground text-muted-foreground"
                      )}
                    >{t.rating}</Badge>
                  </td>
                  <td className="py-2 text-center text-foreground/80">{t.size}%</td>
                  <td className="py-2 text-center text-foreground/80">{t.coupon.toFixed(2)}%</td>
                  <td className="py-2 text-center text-foreground/80">+{t.spread}</td>
                  <td className="py-2 text-center text-foreground/80">{t.ce}%</td>
                  <td className="py-2 text-center text-foreground/80">{t.wal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waterfall Toggle */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <button
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
          onClick={() => setShowWaterfall(!showWaterfall)}
        >
          <span>Payment Waterfall (Priority of Payments)</span>
          {showWaterfall ? <ChevronUp className="h-4 w-4 text-foreground/40" /> : <ChevronDown className="h-4 w-4 text-foreground/40" />}
        </button>
        <AnimatePresence>
          {showWaterfall && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                <svg viewBox="0 0 500 320" className="w-full max-w-lg">
                  {[
                    { label: "1. Servicer Fees & Expenses", color: "#64748b", w: 440 },
                    { label: "2. Class A Senior Interest", color: "#3b82f6", w: 380 },
                    { label: "3. Class A Principal (sequential)", color: "#3b82f6", w: 340 },
                    { label: "4. Class B Interest & Principal", color: "#8b5cf6", w: 280 },
                    { label: "5. Class C Interest & Principal", color: "#f59e0b", w: 220 },
                    { label: "6. Class D Interest & Principal", color: "#ef4444", w: 160 },
                    { label: "7. Equity / Residual Cashflows", color: "#6b7280", w: 100 },
                  ].map((item, i) => (
                    <g key={i}>
                      <rect x={30} y={20 + i * 40} width={item.w} height={28} rx={4} fill={item.color + "33"} stroke={item.color} strokeWidth="1.5" />
                      {i < 6 && (
                        <line x1={30 + item.w / 2} y1={48 + i * 40} x2={30 + item.w / 2} y2={56 + i * 40} stroke={item.color} strokeWidth="1.5" strokeDasharray="3,2" />
                      )}
                      <text x={40} y={38 + i * 40} fill="white" fontSize="10" fontWeight="500">{item.label}</text>
                    </g>
                  ))}
                  <text x={30} y={310} fill="#94a3b8" fontSize="9">Cashflows flow top-to-bottom; lower tranches receive payments only after senior classes are paid in full.</text>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OC and Reserve Fund */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard title="Over-Collateralization (OC)">
          <p className="text-xs text-foreground/70 mb-2">Pool principal exceeds note balance, providing a buffer against losses.</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between"><span className="text-foreground/50">Collateral Pool Value</span><span className="text-foreground">$105.3M</span></div>
            <div className="flex justify-between"><span className="text-foreground/50">Total Note Balance</span><span className="text-foreground">$100.0M</span></div>
            <div className="flex justify-between"><span className="text-foreground/50">OC Amount</span><span className="text-green-400 font-medium">$5.3M (5.3%)</span></div>
            <div className="flex justify-between"><span className="text-foreground/50">Trigger Level</span><span className="text-amber-400">4.0%</span></div>
          </div>
        </InfoCard>
        <InfoCard title="Reserve Fund">
          <p className="text-xs text-foreground/70 mb-2">Cash reserve funded at closing, replenished from excess spread.</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between"><span className="text-foreground/50">Initial Balance</span><span className="text-foreground">$1.5M</span></div>
            <div className="flex justify-between"><span className="text-foreground/50">Required Floor</span><span className="text-foreground">$1.0M (1.0%)</span></div>
            <div className="flex justify-between"><span className="text-foreground/50">Current Balance</span><span className="text-green-400 font-medium">$1.48M</span></div>
            <div className="flex justify-between"><span className="text-foreground/50">Excess Spread</span><span className="text-primary">2.85% p.a.</span></div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

// ── TAB 2: Prepayment Models ──────────────────────────────────────────────────

function PrepaymentModelsTab() {
  const [psaSpeed, setPsaSpeed] = useState(150);

  // Generate PSA prepayment curve for months 1–360 (30 years)
  const prepayData = useMemo(() => {
    const points: { month: number; cpr: number; smm: number }[] = [];
    for (let m = 1; m <= 360; m++) {
      const cpr = psaCpr(m, psaSpeed);
      points.push({ month: m, cpr, smm: cprToSmm(cpr) });
    }
    return points;
  }, [psaSpeed]);

  // Monthly principal breakdown (scheduled vs unscheduled) for first 120 months
  const principalBreakdown = useMemo(() => {
    let balance = 1000000;
    const rate = 0.065 / 12; // 6.5% note rate
    const term = 360;
    const scheduledPmt = (balance * rate) / (1 - Math.pow(1 + rate, -term));
    const arr: { month: number; scheduled: number; prepay: number; total: number }[] = [];
    for (let m = 1; m <= 120; m++) {
      const interest = balance * rate;
      const scheduled = Math.min(scheduledPmt - interest, balance);
      const smm = cprToSmm(psaCpr(m, psaSpeed));
      const prepay = Math.min((balance - scheduled) * smm, balance - scheduled);
      arr.push({ month: m, scheduled, prepay, total: scheduled + prepay });
      balance -= scheduled + prepay;
      if (balance <= 0) break;
    }
    return arr;
  }, [psaSpeed]);

  // WAL computation
  const wal = useMemo(() => {
    const principals = principalBreakdown.map((d) => d.total);
    return computeWAL(principals);
  }, [principalBreakdown]);

  // SVG helpers
  const CURVE_W = 620;
  const CURVE_H = 180;
  const maxCpr = Math.max(...prepayData.filter((_, i) => i % 3 === 0).map((d) => d.cpr), 1);
  const curvePoints = prepayData
    .filter((_, i) => i % 3 === 0)
    .map((d, i) => {
      const x = 40 + (i / (prepayData.length / 3 - 1)) * (CURVE_W - 60);
      const y = CURVE_H - 20 - (d.cpr / maxCpr) * (CURVE_H - 40);
      return `${x},${y}`;
    })
    .join(" ");

  const BAR_W = 620;
  const BAR_H = 160;
  const barData = principalBreakdown.filter((_, i) => i % 4 === 0);
  const maxPrincipal = Math.max(...barData.map((d) => d.total), 1);
  const barWidth = (BAR_W - 60) / barData.length;

  return (
    <div className="space-y-4">
      {/* PSA Speed Slider */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">PSA Prepayment Speed</p>
          <Badge variant="outline" className="border-primary text-primary text-sm">
            {psaSpeed} PSA
          </Badge>
        </div>
        <input
          type="range"
          min={50}
          max={700}
          step={25}
          value={psaSpeed}
          onChange={(e) => setPsaSpeed(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-foreground/40 mt-1">
          <span>50 PSA (Slow)</span>
          <span>150 PSA (Base)</span>
          <span>700 PSA (Shock)</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="rounded bg-foreground/5 p-2 text-center">
            <p className="text-foreground/50">CPR at Month 1</p>
            <p className="text-foreground font-medium">{psaCpr(1, psaSpeed).toFixed(2)}%</p>
          </div>
          <div className="rounded bg-foreground/5 p-2 text-center">
            <p className="text-foreground/50">CPR at Month 30</p>
            <p className="text-foreground font-medium">{psaCpr(30, psaSpeed).toFixed(2)}%</p>
          </div>
          <div className="rounded bg-foreground/5 p-2 text-center">
            <p className="text-foreground/50">Computed WAL</p>
            <p className="text-primary font-medium">{wal.toFixed(2)} yrs</p>
          </div>
        </div>
      </div>

      {/* Prepayment Curve SVG */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-2 text-sm font-medium text-foreground">CPR Curve (Months 1–360, {psaSpeed} PSA)</p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CURVE_W} ${CURVE_H + 20}`} className="w-full max-w-2xl" style={{ minWidth: 400 }}>
            {/* Grid */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = CURVE_H - 20 - (pct / 100) * (CURVE_H - 40);
              return (
                <g key={pct}>
                  <line x1={40} y1={y} x2={CURVE_W - 20} y2={y} stroke="#ffffff10" strokeWidth="1" />
                  <text x={35} y={y + 4} fill="#94a3b8" fontSize="8" textAnchor="end">{(maxCpr * pct / 100).toFixed(1)}%</text>
                </g>
              );
            })}
            {/* Axes */}
            <line x1={40} y1={20} x2={40} y2={CURVE_H - 20} stroke="#94a3b8" strokeWidth="1" />
            <line x1={40} y1={CURVE_H - 20} x2={CURVE_W - 20} y2={CURVE_H - 20} stroke="#94a3b8" strokeWidth="1" />
            {/* Curve */}
            <polyline points={curvePoints} fill="none" stroke="#3b82f6" strokeWidth="2" />
            {/* PSA ramp label */}
            <line x1={40 + (30 / 120) * (CURVE_W - 60)} y1={20} x2={40 + (30 / 120) * (CURVE_W - 60)} y2={CURVE_H - 20} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
            <text x={40 + (30 / 120) * (CURVE_W - 60) + 3} y={30} fill="#f59e0b" fontSize="8">PSA Ramp End (Mo 30)</text>
            {/* X-axis labels */}
            {[1, 60, 120, 180, 240, 300, 360].map((mo) => {
              const x = 40 + ((mo - 1) / 359) * (CURVE_W - 60);
              return <text key={mo} x={x} y={CURVE_H + 12} fill="#94a3b8" fontSize="8" textAnchor="middle">{mo === 1 ? "1" : `${mo}m`}</text>;
            })}
            <text x={CURVE_W / 2} y={CURVE_H + 22} fill="#64748b" fontSize="8" textAnchor="middle">Month</text>
            <text x={12} y={CURVE_H / 2} fill="#64748b" fontSize="8" textAnchor="middle" transform={`rotate(-90, 12, ${CURVE_H / 2})`}>CPR %</text>
          </svg>
        </div>
      </div>

      {/* Scheduled vs Unscheduled Principal Bar Chart */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-2 text-sm font-medium text-foreground">Scheduled vs Unscheduled Principal (Months 1–120)</p>
        <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded" style={{ background: "#3b82f6" }} /> Scheduled</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded" style={{ background: "#f59e0b" }} /> Prepayment</span>
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${BAR_W} ${BAR_H + 20}`} className="w-full max-w-2xl" style={{ minWidth: 400 }}>
            <line x1={40} y1={BAR_H - 20} x2={BAR_W - 10} y2={BAR_H - 20} stroke="#94a3b8" strokeWidth="1" />
            {barData.map((d, i) => {
              const x = 40 + i * barWidth;
              const schedH = (d.scheduled / maxPrincipal) * (BAR_H - 30);
              const prepH = (d.prepay / maxPrincipal) * (BAR_H - 30);
              return (
                <g key={i}>
                  <rect x={x + 1} y={BAR_H - 20 - schedH - prepH} width={barWidth - 2} height={prepH} fill="#f59e0b99" />
                  <rect x={x + 1} y={BAR_H - 20 - schedH} width={barWidth - 2} height={schedH} fill="#3b82f699" />
                </g>
              );
            })}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = BAR_H - 20 - (pct / 100) * (BAR_H - 30);
              return <line key={pct} x1={40} y1={y} x2={BAR_W - 10} y2={y} stroke="#ffffff08" strokeWidth="1" />;
            })}
            {[1, 25, 50, 75, 100, 120].map((mo) => {
              const i = Math.floor((mo - 1) / 4);
              const x = 40 + i * barWidth + barWidth / 2;
              return <text key={mo} x={x} y={BAR_H + 10} fill="#94a3b8" fontSize="8" textAnchor="middle">{mo}m</text>;
            })}
          </svg>
        </div>
      </div>

      {/* Prepayment Sensitivity Table */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Prepayment Sensitivity — Class A Senior</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-foreground/40">
                <th className="py-2 text-left font-medium">Scenario</th>
                <th className="py-2 text-center font-medium">PSA Speed</th>
                <th className="py-2 text-center font-medium">WAL (yr)</th>
                <th className="py-2 text-center font-medium">Price</th>
                <th className="py-2 text-center font-medium">Yield</th>
                <th className="py-2 text-center font-medium">OAS (bps)</th>
              </tr>
            </thead>
            <tbody>
              {PREPAY_SCENARIOS.map((s, i) => (
                <tr key={i} className={cn("border-b border-border/20 hover:bg-muted/30 transition-colors", s.psa === psaSpeed ? "bg-muted/10" : "")}>
                  <td className="py-2 text-foreground/90">{s.label}</td>
                  <td className="py-2 text-center text-foreground/80">{s.psa}</td>
                  <td className="py-2 text-center text-foreground/80">{s.wal}</td>
                  <td className="py-2 text-center text-foreground/80">{s.price.toFixed(2)}</td>
                  <td className="py-2 text-center">
                    <span className={cn(s.yieldPct > 5.5 ? "text-red-400" : s.yieldPct > 5.0 ? "text-amber-400" : "text-green-400")}>
                      {s.yieldPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2 text-center text-primary">+{Math.round(s.spread ?? (s.yieldPct - 4.5) * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-foreground/40">Highlighted row corresponds to current PSA slider (nearest scenario).</p>
      </div>
    </div>
  );
}

// ── TAB 3: Pricing & Yield ────────────────────────────────────────────────────

function PricingYieldTab() {
  const [price, setPrice] = useState(100);
  const [margin, setMargin] = useState(125); // bps
  const [indexRate, setIndexRate] = useState(4.5); // SOFR %

  const wal = 4.1;
  const dm = useMemo(
    () => computeDiscountMargin(price, margin / 100, indexRate, wal),
    [price, margin, indexRate]
  );

  // Z-spread calculation
  const treasuryRate = 4.5;
  const couponRate = 5.05;
  const maturity = 5;
  const zSpread = useMemo(
    () => computeZSpread(price, couponRate, maturity, treasuryRate),
    [price]
  );
  const oasAdj = zSpread - 18; // OAS ≈ Z-spread minus option cost

  // Yield curve with ABS spread SVG
  const CHART_W = 620;
  const CHART_H = 200;
  const tenors = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30];
  const treasuryYields = [5.28, 5.22, 5.10, 4.82, 4.68, 4.50, 4.44, 4.40, 4.52, 4.55];
  const absYields = treasuryYields.map((y, i) => y + [0.45, 0.48, 0.52, 0.55, 0.58, 0.65, 0.72, 0.80, 0.88, 0.90][i]);
  const minY = Math.min(...treasuryYields) - 0.2;
  const maxY = Math.max(...absYields) + 0.2;
  const yScale = (v: number) => CHART_H - 30 - ((v - minY) / (maxY - minY)) * (CHART_H - 50);
  const xScale = (i: number) => 45 + (i / (tenors.length - 1)) * (CHART_W - 70);
  const tsvgPoints = tenors.map((_, i) => `${xScale(i)},${yScale(treasuryYields[i])}`).join(" ");
  const absvgPoints = tenors.map((_, i) => `${xScale(i)},${yScale(absYields[i])}`).join(" ");

  // Price/Yield sensitivity
  const PY_SPREADS = [25, 50, 75, 100, 125, 150, 175, 200, 250, 300];
  const pyData = PY_SPREADS.map((sp) => {
    const r = (treasuryRate + sp / 100) / 200;
    const periods = maturity * 2;
    let pv = 0;
    for (let t = 1; t <= periods; t++) {
      const cf = t === periods ? 100 + couponRate / 2 : couponRate / 2;
      pv += cf / Math.pow(1 + r, t);
    }
    return { spread: sp, price: pv };
  });
  const maxPyPrice = Math.max(...pyData.map((d) => d.price));
  const minPyPrice = Math.min(...pyData.map((d) => d.price));
  const PY_W = 500;
  const PY_H = 160;
  const pyPoints = pyData
    .map((d, i) => {
      const x = 45 + (i / (pyData.length - 1)) * (PY_W - 60);
      const y = PY_H - 25 - ((d.price - minPyPrice) / (maxPyPrice - minPyPrice)) * (PY_H - 45);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      {/* Z-Spread vs OAS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard title="Z-Spread">
          <p className="text-2xl font-semibold text-primary">+{zSpread.toFixed(0)} bps</p>
          <p className="text-xs text-foreground/50 mt-1">Constant spread over interpolated Treasury curve that equates PV to market price.</p>
        </InfoCard>
        <InfoCard title="Option-Adjusted Spread">
          <p className="text-lg font-medium text-primary">+{oasAdj.toFixed(0)} bps</p>
          <p className="text-xs text-foreground/50 mt-1">Z-spread minus embedded option cost (~18 bps for prepayment optionality).</p>
        </InfoCard>
        <InfoCard title="Discount Margin (DM)">
          <p className="text-lg font-medium text-emerald-400">{dm.toFixed(0)} bps</p>
          <p className="text-xs text-foreground/50 mt-1">Spread over SOFR that equates floating-rate ABS cashflows to price {price.toFixed(1)}.</p>
        </InfoCard>
      </div>

      {/* Floating-rate DM calculator */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Discount Margin Calculator (Floating-Rate ABS)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs text-foreground/50 block mb-1">Price</label>
            <input
              type="range" min={94} max={106} step={0.5} value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <p className="text-xs text-foreground text-center mt-1">{price.toFixed(1)}</p>
          </div>
          <div>
            <label className="text-xs text-foreground/50 block mb-1">Stated Margin (bps)</label>
            <input
              type="range" min={50} max={400} step={5} value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <p className="text-xs text-foreground text-center mt-1">{margin} bps</p>
          </div>
          <div>
            <label className="text-xs text-foreground/50 block mb-1">SOFR Index (%)</label>
            <input
              type="range" min={2} max={7} step={0.1} value={indexRate}
              onChange={(e) => setIndexRate(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-xs text-foreground text-center mt-1">{indexRate.toFixed(1)}%</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-foreground/5 p-3 text-center">
          <p className="text-xs text-foreground/50">Computed Discount Margin</p>
          <p className={cn("text-lg font-medium mt-1", dm > margin ? "text-green-400" : dm < margin - 20 ? "text-red-400" : "text-primary")}>
            {dm.toFixed(0)} bps
          </p>
          <p className="text-xs text-foreground/40 mt-1">
            {dm > margin ? "Trading at discount — higher all-in yield than stated margin" : "Trading at premium — lower all-in yield than stated margin"}
          </p>
        </div>
      </div>

      {/* Yield Curve with ABS Spread */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-2 text-sm font-medium text-foreground">ABS Spread Over Treasuries</p>
        <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5" style={{ background: "#64748b" }} /> Treasury</span>
          <span className="flex items-center gap-1"><span className="inline-block w-4 h-0.5" style={{ background: "#3b82f6" }} /> ABS Yield</span>
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 10}`} className="w-full max-w-2xl" style={{ minWidth: 400 }}>
            {[4.0, 4.5, 5.0, 5.5, 6.0].map((v) => (
              <g key={v}>
                <line x1={45} y1={yScale(v)} x2={CHART_W - 25} y2={yScale(v)} stroke="#ffffff0a" strokeWidth="1" />
                <text x={40} y={yScale(v) + 4} fill="#94a3b8" fontSize="8" textAnchor="end">{v.toFixed(1)}%</text>
              </g>
            ))}
            <line x1={45} y1={20} x2={45} y2={CHART_H - 30} stroke="#94a3b8" strokeWidth="1" />
            <line x1={45} y1={CHART_H - 30} x2={CHART_W - 25} y2={CHART_H - 30} stroke="#94a3b8" strokeWidth="1" />
            {/* Shaded spread area */}
            <polygon
              points={[
                ...tenors.map((_, i) => `${xScale(i)},${yScale(absYields[i])}`),
                ...tenors.map((_, i) => `${xScale(tenors.length - 1 - i)},${yScale(treasuryYields[tenors.length - 1 - i])}`),
              ].join(" ")}
              fill="#3b82f622"
            />
            <polyline points={tsvgPoints} fill="none" stroke="#64748b" strokeWidth="2" />
            <polyline points={absvgPoints} fill="none" stroke="#3b82f6" strokeWidth="2" />
            {tenors.map((t, i) => (
              <text key={i} x={xScale(i)} y={CHART_H - 18} fill="#94a3b8" fontSize="8" textAnchor="middle">{t < 1 ? `${t * 12}m` : `${t}y`}</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Price/Yield Sensitivity + Duration */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-foreground/5 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Price / Spread Sensitivity</p>
          <svg viewBox={`0 0 ${PY_W} ${PY_H + 10}`} className="w-full max-w-sm">
            <line x1={45} y1={20} x2={45} y2={PY_H - 25} stroke="#94a3b8" strokeWidth="1" />
            <line x1={45} y1={PY_H - 25} x2={PY_W - 15} y2={PY_H - 25} stroke="#94a3b8" strokeWidth="1" />
            {[minPyPrice, (minPyPrice + maxPyPrice) / 2, maxPyPrice].map((v) => (
              <text key={v} x={40} y={PY_H - 25 - ((v - minPyPrice) / (maxPyPrice - minPyPrice)) * (PY_H - 45) + 4} fill="#94a3b8" fontSize="8" textAnchor="end">{v.toFixed(1)}</text>
            ))}
            <polyline points={pyPoints} fill="none" stroke="#8b5cf6" strokeWidth="2" />
            {PY_SPREADS.filter((_, i) => i % 3 === 0).map((sp, idx) => {
              const i = PY_SPREADS.indexOf(sp);
              const x = 45 + (i / (pyData.length - 1)) * (PY_W - 60);
              return <text key={idx} x={x} y={PY_H} fill="#94a3b8" fontSize="8" textAnchor="middle">+{sp}</text>;
            })}
            <text x={PY_W / 2} y={PY_H + 10} fill="#64748b" fontSize="8" textAnchor="middle">Spread (bps)</text>
          </svg>
        </div>
        <div className="space-y-3">
          <InfoCard title="Effective Duration vs Nominal">
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span className="text-foreground/50">Nominal Duration (no prepay)</span><span className="text-foreground">4.52 yrs</span></div>
              <div className="flex justify-between"><span className="text-foreground/50">Effective Duration (150 PSA)</span><span className="text-primary font-medium">3.18 yrs</span></div>
              <div className="flex justify-between"><span className="text-foreground/50">Extension Risk (50 PSA)</span><span className="text-amber-400">+1.8 yrs</span></div>
              <div className="flex justify-between"><span className="text-foreground/50">Contraction Risk (700 PSA)</span><span className="text-red-400">-1.9 yrs</span></div>
            </div>
          </InfoCard>
          <InfoCard title="Convexity">
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span className="text-foreground/50">Nominal Convexity</span><span className="text-foreground">+0.22</span></div>
              <div className="flex justify-between"><span className="text-foreground/50">Effective Convexity</span><span className="text-red-400">-0.38</span></div>
              <p className="text-foreground/40 mt-1">Negative convexity: prepayments accelerate as rates fall (call risk), hurting price appreciation.</p>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

// ── TAB 4: Credit Enhancement ─────────────────────────────────────────────────

function CreditEnhancementTab() {
  const [defaultRate, setDefaultRate] = useState(3.0);

  // Stress test: loss rate scenarios vs tranche attachment points
  const attachPoints = TRANCHES.map((t) => t.ce);
  const stressLevels = [1, 2, 3, 5, 8, 12, 18, 25];

  // Determine which tranches are impaired at each loss level
  const getImpairColor = (ce: number, loss: number) =>
    loss > ce ? "#ef4444" : loss > ce * 0.7 ? "#f59e0b" : "#22c55e";

  const STRESS_W = 620;
  const STRESS_H = 200;
  const barW = (STRESS_W - 60) / stressLevels.length;
  const maxLoss = 25;

  return (
    <div className="space-y-4">
      {/* CE Mechanisms */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Layers, title: "Subordination", desc: "Junior tranches absorb losses before senior classes. Class E (5%) must lose entirely before Class D is touched.", color: "text-primary" },
          { icon: Percent, title: "Excess Spread", desc: "Coupon income > note interest → forms first-loss protection buffer. Currently 2.85% p.a.", color: "text-primary" },
          { icon: DollarSign, title: "Reserve Account", desc: "Cash reserve of $1.5M held by trustee, funded at closing and replenished from excess spread.", color: "text-emerald-400" },
          { icon: Activity, title: "OC Ratio", desc: "Over-collateralization: pool value exceeds note balance by 5.3%. Trigger at 4% causes lock-out of junior principal.", color: "text-amber-400" },
          { icon: ShieldCheck, title: "Insurance Wrap", desc: "Third-party financial guarantee covers senior tranche up to 70% LTV; provides AAA floor rating.", color: "text-muted-foreground" },
          { icon: BarChart3, title: "Spread Account", desc: "Trap for excess spread if OC ratio falls below trigger. Prevents cash leakage to equity.", color: "text-rose-400" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-lg border border-border bg-foreground/5 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={cn("h-4 w-4", item.color)} />
              <p className="text-xs font-medium text-foreground">{item.title}</p>
            </div>
            <p className="text-xs text-foreground/50">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Stress Test SVG */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">Stress Test: Default Rate vs Attachment Points</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground/50">Default Rate:</span>
            <Badge variant="outline" className="border-red-500 text-red-400 text-xs">{defaultRate.toFixed(1)}%</Badge>
          </div>
        </div>
        <input
          type="range" min={0} max={25} step={0.5} value={defaultRate}
          onChange={(e) => setDefaultRate(Number(e.target.value))}
          className="w-full mb-3 accent-red-500"
        />
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${STRESS_W} ${STRESS_H + 20}`} className="w-full max-w-2xl" style={{ minWidth: 400 }}>
            {/* Tranche attachment lines */}
            {attachPoints.map((ap, i) => {
              const y = STRESS_H - 20 - (ap / maxLoss) * (STRESS_H - 40);
              return (
                <g key={i}>
                  <line x1={45} y1={y} x2={STRESS_W - 10} y2={y} stroke={TRANCHES[i].color} strokeWidth="1" strokeDasharray="4,3" opacity={0.6} />
                  <text x={STRESS_W - 8} y={y + 4} fill={TRANCHES[i].color} fontSize="8" textAnchor="start">{TRANCHES[i].rating}</text>
                </g>
              );
            })}
            {/* Current default rate line */}
            {(() => {
              const y = STRESS_H - 20 - (defaultRate / maxLoss) * (STRESS_H - 40);
              return <line x1={45} y1={y} x2={STRESS_W - 10} y2={y} stroke="#ef4444" strokeWidth="2" />;
            })()}
            {/* Bars */}
            {stressLevels.map((loss, i) => {
              const barH = (loss / maxLoss) * (STRESS_H - 40);
              const x = 45 + i * barW;
              const impaired = attachPoints.filter((ap) => loss > ap).length;
              const barColor = impaired >= 4 ? "#ef4444" : impaired >= 2 ? "#f59e0b" : "#22c55e";
              return (
                <g key={i}>
                  <rect x={x + 2} y={STRESS_H - 20 - barH} width={barW - 4} height={barH} fill={barColor + "55"} stroke={barColor} strokeWidth="1" rx={2} />
                  <text x={x + barW / 2} y={STRESS_H + 10} fill="#94a3b8" fontSize="9" textAnchor="middle">{loss}%</text>
                </g>
              );
            })}
            <line x1={45} y1={20} x2={45} y2={STRESS_H - 20} stroke="#94a3b8" strokeWidth="1" />
            <line x1={45} y1={STRESS_H - 20} x2={STRESS_W - 10} y2={STRESS_H - 20} stroke="#94a3b8" strokeWidth="1" />
            {[0, 5, 10, 15, 20, 25].map((v) => (
              <text key={v} x={40} y={STRESS_H - 20 - (v / maxLoss) * (STRESS_H - 40) + 4} fill="#94a3b8" fontSize="8" textAnchor="end">{v}%</text>
            ))}
            <text x={STRESS_W / 2} y={STRESS_H + 22} fill="#64748b" fontSize="8" textAnchor="middle">Cumulative Default Rate Scenario</text>
          </svg>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap text-xs text-muted-foreground">
          {TRANCHES.map((t) => (
            <span key={t.name} className={cn("px-2 py-1 rounded flex items-center gap-1", defaultRate > t.ce ? "bg-red-500/20 text-red-400" : "bg-green-500/10 text-green-400")}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: t.color }} />
              {t.rating}: {defaultRate > t.ce ? "IMPAIRED" : "Protected"}
            </span>
          ))}
        </div>
      </div>

      {/* Rating Agency Inputs */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Rating Agency Key Assumptions (Auto ABS Example)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Base Case Cumulative Loss", value: "1.80%", note: "Historical pool average" },
            { label: "AAA Stress Multiple", value: "6.0×", note: "10.8% stressed loss" },
            { label: "AA Stress Multiple", value: "4.5×", note: "8.1% stressed loss" },
            { label: "A Stress Multiple", value: "3.0×", note: "5.4% stressed loss" },
            { label: "BBB Stress Multiple", value: "2.0×", note: "3.6% stressed loss" },
            { label: "Recovery Rate Assumption", value: "45%", note: "On defaulted receivables" },
            { label: "Excess Spread Credit", value: "50%", note: "Of projected spread" },
            { label: "Servicing Continuity", value: "Assumed", note: "Backup servicer required" },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between rounded bg-foreground/5 p-2 text-xs text-muted-foreground">
              <span className="text-foreground/70">{row.label}</span>
              <div className="text-right">
                <span className="text-foreground font-medium">{row.value}</span>
                <p className="text-foreground/30">{row.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Loss Rates by Asset Class */}
      <div className="rounded-md border border-border bg-foreground/5 p-4">
        <p className="mb-3 text-sm font-medium text-foreground">Historical Loss Rates by Asset Class</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-muted-foreground">
            <thead>
              <tr className="border-b border-border text-foreground/40">
                <th className="py-2 text-left font-medium">Asset Class</th>
                <th className="py-2 text-center font-medium">Avg Annual Loss</th>
                <th className="py-2 text-center font-medium">Stress Loss (GFC)</th>
                <th className="py-2 text-center font-medium">Typical Attach Pt</th>
                <th className="py-2 text-center font-medium">Buffer</th>
              </tr>
            </thead>
            <tbody>
              {ASSET_CLASS_LOSSES.map((row, i) => (
                <tr key={i} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="py-2 text-foreground/90">{row.assetClass}</td>
                  <td className="py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-16 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(row.avgLoss / 5) * 100}%` }} />
                      </div>
                      <span className="text-foreground/80">{row.avgLoss.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-2 text-center text-red-400">{row.stressLoss.toFixed(1)}%</td>
                  <td className="py-2 text-center text-amber-400">{row.attachPt.toFixed(1)}%</td>
                  <td className="py-2 text-center">
                    <span className={cn("font-medium", (row.attachPt - row.stressLoss) > 0 ? "text-green-400" : "text-red-400")}>
                      {(row.attachPt - row.stressLoss).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-foreground/40">Buffer = Attachment Point − Stress Loss. Negative buffer indicates potential senior impairment under GFC-level stress.</p>
      </div>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function ABSPricingPage() {
  const [activeTab, setActiveTab] = useState("structure");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-muted/10 p-2">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-foreground">Asset-Backed Securities Pricing</h1>
              <p className="text-sm text-foreground/50">
                ABS structure, prepayment models, tranching, WAL/duration, and credit enhancement
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Pool Size", value: "$100M", icon: DollarSign },
              { label: "Asset Class", value: "Auto Loans", icon: Activity },
              { label: "Collateral Rate", value: "8.90%", icon: Percent },
              { label: "Note Rate (Class A)", value: "5.05%", icon: TrendingUp },
              { label: "Excess Spread", value: "2.85%", icon: TrendingDown },
              { label: "CE Level (AAA)", value: "30%", icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-full border border-border bg-foreground/5 px-3 py-1 text-xs text-muted-foreground">
                <stat.icon className="h-3 w-3 text-foreground/40" />
                <span className="text-foreground/50">{stat.label}:</span>
                <span className="text-foreground font-medium">{stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full grid-cols-4 bg-foreground/5 border border-border">
            <TabsTrigger value="structure" className="data-[state=active]:bg-foreground/10 text-xs text-muted-foreground sm:text-sm">
              <Layers className="h-3.5 w-3.5 mr-1.5" />
              ABS Structure
            </TabsTrigger>
            <TabsTrigger value="prepayment" className="data-[state=active]:bg-foreground/10 text-xs text-muted-foreground sm:text-sm">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Prepayment
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-foreground/10 text-xs text-muted-foreground sm:text-sm">
              <Calculator className="h-3.5 w-3.5 mr-1.5" />
              Pricing & Yield
            </TabsTrigger>
            <TabsTrigger value="credit" className="data-[state=active]:bg-foreground/10 text-xs text-muted-foreground sm:text-sm">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Credit Enhancement
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TabsContent value="structure" className="data-[state=inactive]:hidden">
                <ABSStructureTab />
              </TabsContent>
              <TabsContent value="prepayment" className="data-[state=inactive]:hidden">
                <PrepaymentModelsTab />
              </TabsContent>
              <TabsContent value="pricing" className="data-[state=inactive]:hidden">
                <PricingYieldTab />
              </TabsContent>
              <TabsContent value="credit" className="data-[state=inactive]:hidden">
                <CreditEnhancementTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Footer info */}
        <div className="mt-8 rounded-md border border-border/20 bg-foreground/[0.03] p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-foreground/30 mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/30">
              Illustrative auto ABS transaction. Prepayment models use PSA standard ramp (0.2% × month for first 30 months, 6% thereafter).
              Z-spreads and OAS are calculated using simplified flat-curve pricing. Credit enhancement percentages represent cumulative subordination plus
              reserve fund. Rating agency stress multiples are indicative and vary by methodology and asset class. Not financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
