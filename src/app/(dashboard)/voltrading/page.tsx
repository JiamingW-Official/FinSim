"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart2,
  AlertTriangle,
  Layers,
  Target,
  Zap,
  Shield,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 953;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Vol Surface Data ───────────────────────────────────────────────────────────
interface SurfacePoint {
  moneyness: number;
  expiry: number;
  iv: number;
}

const MONEYNESS = [0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15, 1.20];
const EXPIRIES = [1, 2, 3, 6, 9, 12];

function buildSurface(): SurfacePoint[] {
  const points: SurfacePoint[] = [];
  for (const m of MONEYNESS) {
    for (const exp of EXPIRIES) {
      const atmVol = 18 + Math.sqrt(exp) * 1.2;
      const skew = m < 1.0 ? (1.0 - m) * 28 : (m - 1.0) * 10;
      const noise = (sv() - 0.5) * 1.5;
      points.push({ moneyness: m, expiry: exp, iv: Math.max(10, atmVol + skew + noise) });
    }
  }
  return points;
}

const SURFACE_DATA = buildSurface();

// ── Isometric Vol Surface SVG ──────────────────────────────────────────────────
function VolSurfaceSVG() {
  const W = 520;
  const H = 260;
  const isoX = (mx: number, ey: number) => {
    const nx = (mx - 0.80) / 0.40;
    const ny = (ey - 1) / 11;
    return 60 + nx * 180 - ny * 80;
  };
  const isoY = (mx: number, ey: number, iv: number) => {
    const nx = (mx - 0.80) / 0.40;
    const ny = (ey - 1) / 11;
    const nz = (iv - 10) / 45;
    return 220 + nx * 60 + ny * 60 - nz * 120;
  };

  const ivAt = (m: number, e: number): number => {
    const pt = SURFACE_DATA.find((p) => p.moneyness === m && p.expiry === e);
    return pt ? pt.iv : 20;
  };

  const colorForIV = (iv: number): string => {
    const t = Math.min(1, Math.max(0, (iv - 12) / 35));
    if (t < 0.5) {
      const u = t * 2;
      const r = Math.round(99 + u * (139 - 99));
      const g = Math.round(102 + u * (92 - 102));
      const b = Math.round(241 + u * (246 - 241));
      return `rgb(${r},${g},${b})`;
    } else {
      const u = (t - 0.5) * 2;
      const r = Math.round(139 + u * (239 - 139));
      const g = Math.round(92 + u * (68 - 92));
      const b = Math.round(246 + u * (68 - 246));
      return `rgb(${r},${g},${b})`;
    }
  };

  const quads: { key: string; pts: string; fill: string }[] = [];
  for (let ei = 0; ei < EXPIRIES.length - 1; ei++) {
    for (let mi = 0; mi < MONEYNESS.length - 1; mi++) {
      const m0 = MONEYNESS[mi]; const m1 = MONEYNESS[mi + 1];
      const e0 = EXPIRIES[ei]; const e1 = EXPIRIES[ei + 1];
      const iv00 = ivAt(m0, e0); const iv10 = ivAt(m1, e0);
      const iv01 = ivAt(m0, e1); const iv11 = ivAt(m1, e1);
      const avgIV = (iv00 + iv10 + iv01 + iv11) / 4;
      const p00 = `${isoX(m0, e0)},${isoY(m0, e0, iv00)}`;
      const p10 = `${isoX(m1, e0)},${isoY(m1, e0, iv10)}`;
      const p11 = `${isoX(m1, e1)},${isoY(m1, e1, iv11)}`;
      const p01 = `${isoX(m0, e1)},${isoY(m0, e1, iv01)}`;
      quads.push({
        key: `q-${ei}-${mi}`,
        pts: `${p00} ${p10} ${p11} ${p01}`,
        fill: colorForIV(avgIV),
      });
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-64">
      {quads.map((q) => (
        <polygon key={q.key} points={q.pts} fill={q.fill} fillOpacity="0.82" stroke="#0f0f14" strokeWidth="0.7" />
      ))}
      <text x="58" y="240" fill="#71717a" fontSize="9" textAnchor="middle">0.80</text>
      <text x="238" y="240" fill="#71717a" fontSize="9" textAnchor="middle">1.00</text>
      <text x="248" y="250" fill="#a1a1aa" fontSize="9" textAnchor="middle">Moneyness (K/S)</text>
      <text x="30" y="180" fill="#71717a" fontSize="9" textAnchor="middle">12m</text>
      <text x="30" y="220" fill="#71717a" fontSize="9" textAnchor="middle">1m</text>
      <text x="18" y="200" fill="#a1a1aa" fontSize="8" textAnchor="middle" transform="rotate(-90,18,200)">Expiry</text>
      <text x="460" y="110" fill="#6366f1" fontSize="9" textAnchor="middle">High IV</text>
      <text x="460" y="200" fill="#3b82f6" fontSize="9" textAnchor="middle">Low IV</text>
      <text x="260" y="16" fill="#a1a1aa" fontSize="10" textAnchor="middle" fontWeight="bold">Implied Volatility Surface</text>
    </svg>
  );
}

// ── Term Structure Chart ───────────────────────────────────────────────────────
interface TermStructureShape {
  label: string;
  color: string;
  ivs: number[];
  description: string;
}

const TERM_EXPS = [1, 2, 3, 6, 9, 12];
const TERM_SHAPES: TermStructureShape[] = [
  { label: "Contango", color: "#34d399", ivs: [14, 15.5, 17, 19, 20.5, 22], description: "Normal market: near-term vol < long-term vol. Time uncertainty premium." },
  { label: "Backwardation", color: "#f87171", ivs: [32, 28, 24, 20, 18, 17], description: "Crisis/event: near-term vol spike. Elevated near-dated uncertainty." },
  { label: "Humped", color: "#f59e0b", ivs: [18, 22, 25, 21, 19, 18], description: "Earnings or macro event in mid-term; vol peaks around event date." },
];

function TermStructureSVG() {
  const W = 480; const H = 180;
  const PAD = { l: 36, r: 16, t: 20, b: 32 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const minIV = 10; const maxIV = 36;
  const toX = (i: number) => PAD.l + (i / (TERM_EXPS.length - 1)) * cW;
  const toY = (iv: number) => PAD.t + cH - ((iv - minIV) / (maxIV - minIV)) * cH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
      {[10, 15, 20, 25, 30, 35].map((v) => (
        <g key={`tsg-${v}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 4} y={toY(v) + 3} fill="#71717a" fontSize="8" textAnchor="end">{v}%</text>
        </g>
      ))}
      {TERM_EXPS.map((e, i) => (
        <text key={`tsx-${i}`} x={toX(i)} y={H - 6} fill="#71717a" fontSize="8" textAnchor="middle">{e}m</text>
      ))}
      {TERM_SHAPES.map((shape) => {
        const pts = shape.ivs.map((iv, i) => `${toX(i)},${toY(iv)}`).join(" ");
        return (
          <g key={shape.label}>
            <polyline points={pts} fill="none" stroke={shape.color} strokeWidth="2" strokeLinejoin="round" />
            {shape.ivs.map((iv, i) => (
              <circle key={`c-${shape.label}-${i}`} cx={toX(i)} cy={toY(iv)} r="3" fill={shape.color} />
            ))}
          </g>
        );
      })}
      {TERM_SHAPES.map((shape, i) => (
        <g key={`leg-${i}`}>
          <line x1={W - PAD.r - 80} y1={PAD.t + 12 + i * 16} x2={W - PAD.r - 60} y2={PAD.t + 12 + i * 16} stroke={shape.color} strokeWidth="2" />
          <text x={W - PAD.r - 56} y={PAD.t + 16 + i * 16} fill={shape.color} fontSize="8">{shape.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Skew Chart ─────────────────────────────────────────────────────────────────
function SkewSVG() {
  const W = 480; const H = 160;
  const PAD = { l: 36, r: 16, t: 16, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const strikes = [0.80, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15, 1.20];
  const normalSkew = [32, 28, 24, 20, 17, 16, 16.5, 17, 18];
  const postCrashSkew = [45, 40, 34, 27, 20, 17, 16, 16.5, 17.5];
  const symmetricSkew = [18, 17.5, 17, 17, 17, 17, 17.5, 18, 19];
  const minIV = 12; const maxIV = 50;
  const toX = (i: number) => PAD.l + (i / (strikes.length - 1)) * cW;
  const toY = (iv: number) => PAD.t + cH - ((iv - minIV) / (maxIV - minIV)) * cH;
  const toPts = (ivs: number[]) => ivs.map((iv, i) => `${toX(i)},${toY(iv)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {[15, 25, 35, 45].map((v) => (
        <g key={`sg-${v}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 4} y={toY(v) + 3} fill="#71717a" fontSize="8" textAnchor="end">{v}%</text>
        </g>
      ))}
      {strikes.map((k, i) => (
        <text key={`kx-${i}`} x={toX(i)} y={H - 5} fill="#71717a" fontSize="8" textAnchor="middle">{k.toFixed(2)}</text>
      ))}
      <polyline points={toPts(normalSkew)} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={toPts(postCrashSkew)} fill="none" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
      <polyline points={toPts(symmetricSkew)} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" strokeDasharray="2,3" />
      <line x1={toX(4)} y1={PAD.t} x2={toX(4)} y2={H - PAD.b} stroke="#71717a" strokeWidth="1" strokeDasharray="3,3" />
      <text x={toX(4)} y={PAD.t + 8} fill="#71717a" fontSize="8" textAnchor="middle">ATM</text>
      <line x1={W - 110} y1={PAD.t + 10} x2={W - 90} y2={PAD.t + 10} stroke="#6366f1" strokeWidth="2" />
      <text x={W - 86} y={PAD.t + 14} fill="#a5b4fc" fontSize="8">Normal skew</text>
      <line x1={W - 110} y1={PAD.t + 24} x2={W - 90} y2={PAD.t + 24} stroke="#f87171" strokeWidth="2" strokeDasharray="5,3" />
      <text x={W - 86} y={PAD.t + 28} fill="#fca5a5" fontSize="8">Post-crisis</text>
      <line x1={W - 110} y1={PAD.t + 38} x2={W - 90} y2={PAD.t + 38} stroke="#34d399" strokeWidth="2" strokeDasharray="2,3" />
      <text x={W - 86} y={PAD.t + 42} fill="#6ee7b7" fontSize="8">FX smile</text>
    </svg>
  );
}

// ── Local Vol vs Stochastic Vol diagram ────────────────────────────────────────
function LocalVsStochVolSVG() {
  return (
    <svg viewBox="0 0 480 130" className="w-full h-32">
      <rect x="10" y="30" width="200" height="70" rx="8" fill="#1e1e2e" stroke="#6366f1" strokeWidth="1.5" />
      <text x="110" y="50" fill="#a5b4fc" fontSize="10" textAnchor="middle" fontWeight="bold">Local Volatility</text>
      <text x="110" y="65" fill="#71717a" fontSize="8" textAnchor="middle">{"σ(S,t) — deterministic function"}</text>
      <text x="110" y="78" fill="#71717a" fontSize="8" textAnchor="middle">of spot and time</text>
      <text x="110" y="91" fill="#71717a" fontSize="8" textAnchor="middle">Dupire formula: fits surface exactly</text>
      <rect x="270" y="30" width="200" height="70" rx="8" fill="#1e1e2e" stroke="#34d399" strokeWidth="1.5" />
      <text x="370" y="50" fill="#6ee7b7" fontSize="10" textAnchor="middle" fontWeight="bold">Stochastic Volatility</text>
      <text x="370" y="65" fill="#71717a" fontSize="8" textAnchor="middle">{"vol-of-vol (ν), mean reversion (κ)"}</text>
      <text x="370" y="78" fill="#71717a" fontSize="8" textAnchor="middle">{"correlation (ρ) — random vol process"}</text>
      <text x="370" y="91" fill="#71717a" fontSize="8" textAnchor="middle">Heston / SABR — realistic dynamics</text>
      <text x="240" y="70" fill="#f59e0b" fontSize="14" textAnchor="middle" fontWeight="bold">vs</text>
      <text x="110" y="115" fill="#4ade80" fontSize="7.5" textAnchor="middle">{"✓ Simple   ✗ Unrealistic dynamics"}</text>
      <text x="370" y="115" fill="#4ade80" fontSize="7.5" textAnchor="middle">{"✓ Rich dynamics   ✗ More params"}</text>
    </svg>
  );
}

// ── Arbitrage conditions ────────────────────────────────────────────────────────
interface ArbCondition {
  name: string;
  condition: string;
  violation: string;
  color: string;
}
const ARB_CONDITIONS: ArbCondition[] = [
  { name: "No Calendar Spread Arb", condition: "Total variance must increase with expiry", violation: "Vol surface slopes down in time → free calendar spread", color: "#6366f1" },
  { name: "No Butterfly Arb", condition: "Local vol density must be non-negative", violation: "Vol smile too steep → negative transition density", color: "#34d399" },
  { name: "Call/Put Parity", condition: "C - P = Se^{-qT} - Ke^{-rT}", violation: "Mismatch implies riskless arbitrage across strikes", color: "#f59e0b" },
  { name: "No Static Arb", condition: "Convexity: ∂²C/∂K² ≥ 0 for all K", violation: "Butterfly spread has negative value", color: "#f87171" },
];

// ── Expandable section ─────────────────────────────────────────────────────────
interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}
function ExpandableSection({ title, children, defaultOpen = false, accent = "#6366f1" }: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card/50 hover:bg-card transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
            style={{ borderTop: `1px solid ${accent}22` }}
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Info pill ──────────────────────────────────────────────────────────────────
function InfoPill({ label, value, sub, color = "text-foreground" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col items-center bg-card border border-border rounded-lg px-3 py-2 min-w-[90px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={cn("text-sm font-bold", color)}>{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ── Gamma scalp P&L chart ──────────────────────────────────────────────────────
function GammaScalpPnLSVG() {
  const W = 480; const H = 160;
  const PAD = { l: 36, r: 16, t: 16, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const days = Array.from({ length: 30 }, (_, i) => i);
  const realizedIV = 22;
  const impliedIV = 18;
  const gamma = 0.04;
  const dt = 1 / 252;
  const S = 100;
  const dailyPnL = 0.5 * gamma * S * S * ((realizedIV / 100) ** 2 - (impliedIV / 100) ** 2) * dt;
  let cumpnl = 0;
  const pnlSeries = days.map(() => {
    const noise = (sv() - 0.5) * dailyPnL * 6;
    cumpnl += dailyPnL * 252 + noise;
    return cumpnl;
  });
  const minP = Math.min(0, ...pnlSeries) - 10;
  const maxP = Math.max(...pnlSeries) + 10;
  const toX = (i: number) => PAD.l + (i / (days.length - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - ((v - minP) / (maxP - minP)) * cH;
  const zeroY = toY(0);
  const pts = pnlSeries.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const area = [`${toX(0)},${zeroY}`, ...pnlSeries.map((v, i) => `${toX(i)},${toY(v)}`), `${toX(days.length - 1)},${zeroY}`].join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <defs>
        <linearGradient id="gspGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke="#52525b" strokeWidth="1" strokeDasharray="4,3" />
      {[minP, (minP + maxP) / 2, maxP].map((v) => (
        <g key={`gsg-${v.toFixed(0)}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 4} y={toY(v) + 3} fill="#71717a" fontSize="8" textAnchor="end">{v.toFixed(0)}</text>
        </g>
      ))}
      {[0, 10, 20, 29].map((d) => (
        <text key={`gsx-${d}`} x={toX(d)} y={H - 5} fill="#71717a" fontSize="8" textAnchor="middle">D{d + 1}</text>
      ))}
      <polygon points={area} fill="url(#gspGrad)" />
      <polyline points={pts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
      <text x={PAD.l + 8} y={PAD.t + 10} fill="#a1a1aa" fontSize="8.5">Gamma Scalp P&amp;L (Realized {realizedIV}% vs Implied {impliedIV}%)</text>
    </svg>
  );
}

// ── Long Vol strategies table ──────────────────────────────────────────────────
interface LongVolStrategy {
  name: string;
  structure: string;
  outlook: string;
  risk: string;
  reward: string;
  theta: string;
  gamma: string;
}
const LONG_VOL_STRATEGIES: LongVolStrategy[] = [
  { name: "Long Straddle", structure: "Buy ATM call + put", outlook: "Large move either direction", risk: "Theta decay, no move", reward: "Unlimited both ways", theta: "Negative", gamma: "High positive" },
  { name: "Long Strangle", structure: "Buy OTM call + OTM put", outlook: "Very large move", risk: "Cheaper but wider BEs", reward: "Unlimited both ways", theta: "Negative", gamma: "Positive" },
  { name: "Long Calendar", structure: "Sell near / Buy far term", outlook: "Low near-term vol, higher long-term", risk: "Near-term vol spike", reward: "Vol contango capture", theta: "Slightly positive", gamma: "Near-term short" },
  { name: "1x2x1 Butterfly", structure: "Buy 1 center, sell 2 wings (inv)", outlook: "ATM vol rich vs wing vol", risk: "Large gap move", reward: "Wings rally more than center", theta: "Positive at center", gamma: "Short at center" },
  { name: "Variance Swap (L)", structure: "Pay fixed vol, receive realized", outlook: "Realized > Implied vol", risk: "Realized < implied", reward: "Pure vol, no delta hedge", theta: "N/A (OTC)", gamma: "Constant dollar gamma" },
  { name: "Long UVXY", structure: "1.5x leveraged VIX futures ETP", outlook: "Vol spike imminent", risk: "Extreme contango decay", reward: "Explosive VIX spike", theta: "Very negative (roll)", gamma: "N/A (ETP)" },
];

// ── Straddle breakeven display ─────────────────────────────────────────────────
function BreakevenDisplay() {
  const S = 100; const callPremium = 3.2; const putPremium = 3.0;
  const totalPremium = callPremium + putPremium;
  const upBreakeven = S + totalPremium;
  const downBreakeven = S - totalPremium;
  const W = 480; const H = 120;
  const PAD = { l: 36, r: 36, t: 20, b: 24 };
  const cW = W - PAD.l - PAD.r;
  const minS = 85; const maxS = 115;
  const toX = (price: number) => PAD.l + ((price - minS) / (maxS - minS)) * cW;
  const pnl = (price: number) => Math.max(Math.abs(price - S) - totalPremium, -totalPremium);
  const pnlMin = -totalPremium; const pnlMax = 10;
  const cH = H - PAD.t - PAD.b;
  const toY = (p: number) => PAD.t + cH - ((p - pnlMin) / (pnlMax - pnlMin)) * cH;
  const zeroY = toY(0);
  const pts = Array.from({ length: 60 }, (_, i) => {
    const price = minS + (i / 59) * (maxS - minS);
    return `${toX(price)},${toY(pnl(price))}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      <defs>
        <linearGradient id="beLoss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke="#52525b" strokeWidth="1" strokeDasharray="4,3" />
      <rect x={toX(downBreakeven)} y={zeroY} width={toX(upBreakeven) - toX(downBreakeven)} height={toY(-totalPremium) - zeroY} fill="url(#beLoss)" />
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1={toX(upBreakeven)} y1={PAD.t} x2={toX(upBreakeven)} y2={H - PAD.b} stroke="#34d399" strokeWidth="1" strokeDasharray="3,3" />
      <line x1={toX(downBreakeven)} y1={PAD.t} x2={toX(downBreakeven)} y2={H - PAD.b} stroke="#34d399" strokeWidth="1" strokeDasharray="3,3" />
      <text x={toX(upBreakeven)} y={PAD.t + 8} fill="#34d399" fontSize="8" textAnchor="middle">BE {upBreakeven.toFixed(1)}</text>
      <text x={toX(downBreakeven)} y={PAD.t + 8} fill="#34d399" fontSize="8" textAnchor="middle">BE {downBreakeven.toFixed(1)}</text>
      <circle cx={toX(S)} cy={toY(0)} r="3" fill="#f59e0b" />
      <text x={toX(S)} y={H - 6} fill="#f59e0b" fontSize="8" textAnchor="middle">S={S}</text>
      <text x={PAD.l - 4} y={toY(0) + 3} fill="#71717a" fontSize="8" textAnchor="end">0</text>
      <text x={PAD.l - 4} y={toY(-totalPremium) + 3} fill="#f87171" fontSize="8" textAnchor="end">-{totalPremium.toFixed(1)}</text>
    </svg>
  );
}

// ── Short vol strategies ───────────────────────────────────────────────────────
interface ShortVolStrategy {
  name: string;
  structure: string;
  maxGain: string;
  maxLoss: string;
  idealEnv: string;
  risk: string;
}
const SHORT_VOL_STRATEGIES: ShortVolStrategy[] = [
  { name: "Covered Call", structure: "Long stock + Sell call", maxGain: "Premium + (K-S)", maxLoss: "S - premium", idealEnv: "Flat to mild rally", risk: "Capped upside, full downside" },
  { name: "Cash-Secured Put", structure: "Sell put + hold cash", maxGain: "Premium received", maxLoss: "K - premium", idealEnv: "Flat to mild dip", risk: "Assignment at elevated K" },
  { name: "Iron Condor", structure: "Sell call spread + put spread", maxGain: "Net premium", maxLoss: "Wing width - premium", idealEnv: "Low vol, rangebound", risk: "Gap through short strikes" },
  { name: "Credit Spread", structure: "Sell near OTM, Buy far OTM", maxGain: "Net credit", maxLoss: "Width - credit", idealEnv: "Directional + IV contraction", risk: "Spread widens to max loss" },
  { name: "Short SVXY", structure: "Short 0.5× inverse VIX ETF", maxGain: "ETF decline", maxLoss: "Unlimited (short)", idealEnv: "Rising VIX / vol spike", risk: "Decay on short side" },
  { name: "VRP Harvest", structure: "Sell 1m var swap / delta hedge", maxGain: "IV - RV spread ~2-3 vols", maxLoss: "Spike: RV >> IV", idealEnv: "IV persistently > RV", risk: "Black swan / tail events" },
];

// ── VRP bar chart ──────────────────────────────────────────────────────────────
function VRPBarChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const vrp = [2.1, -8.4, 3.2, 2.8, 1.9, 2.5, 3.1, -4.2, 2.7, 1.8, 3.0, 2.4];
  const W = 480; const H = 140;
  const PAD = { l: 36, r: 12, t: 16, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const barW = (cW / months.length) * 0.7;
  const barGap = cW / months.length;
  const minV = -10; const maxV = 5;
  const zeroY = PAD.t + cH - ((0 - minV) / (maxV - minV)) * cH;
  const toX = (i: number) => PAD.l + i * barGap + (barGap - barW) / 2;
  const toY = (v: number) => PAD.t + cH - ((v - minV) / (maxV - minV)) * cH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
      {[-8, -4, 0, 3].map((v) => (
        <g key={`vg-${v}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 4} y={toY(v) + 3} fill="#71717a" fontSize="8" textAnchor="end">{v > 0 ? `+${v}` : v}</text>
        </g>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke="#52525b" strokeWidth="1.5" />
      {vrp.map((v, i) => {
        const barColor = v >= 0 ? "#34d399" : "#f87171";
        const barY = v >= 0 ? toY(v) : zeroY;
        const barH = Math.abs(toY(v) - zeroY);
        return (
          <g key={`vrb-${i}`}>
            <rect x={toX(i)} y={barY} width={barW} height={barH} fill={barColor} fillOpacity="0.75" rx="2" />
            <text x={toX(i) + barW / 2} y={H - 6} fill="#71717a" fontSize="7.5" textAnchor="middle">{months[i]}</text>
          </g>
        );
      })}
      <text x={PAD.l + 8} y={PAD.t + 10} fill="#a1a1aa" fontSize="8.5">Vol Risk Premium (IV − Realized Vol)</text>
    </svg>
  );
}

// ── Feb 2018 VIX spike timeline ────────────────────────────────────────────────
function VixSpikeSVG() {
  const events = [
    { label: "Jan 26\nSPX ATH", x: 60, y: 60, color: "#34d399" },
    { label: "Feb 2\nJobs data\nVIX +30%", x: 140, y: 78, color: "#f59e0b" },
    { label: "Feb 5\nVIX 37→50\nAftermarket", x: 230, y: 44, color: "#f87171" },
    { label: "Feb 6\nXIV implosion\n-90%", x: 320, y: 28, color: "#ef4444" },
    { label: "Feb 9\nVIX peaks ~50\nSPX -10%", x: 410, y: 48, color: "#f87171" },
  ];
  return (
    <svg viewBox="0 0 480 130" className="w-full h-32">
      <line x1="40" y1="100" x2="440" y2="100" stroke="#27272a" strokeWidth="2" />
      {events.map((ev, i) => (
        <g key={`vix-ev-${i}`}>
          <circle cx={ev.x} cy="100" r="5" fill={ev.color} />
          <line x1={ev.x} y1={ev.y + 22} x2={ev.x} y2="95" stroke={ev.color} strokeWidth="1" strokeDasharray="3,2" />
          <rect x={ev.x - 38} y={ev.y - 4} width="76" height={ev.label.split("\n").length * 13 + 4} rx="4" fill="#1c1c28" stroke={ev.color} strokeWidth="1" />
          {ev.label.split("\n").map((line, j) => (
            <text key={`evl-${i}-${j}`} x={ev.x} y={ev.y + j * 13 + 7} fill={ev.color} fontSize="7.5" textAnchor="middle">{line}</text>
          ))}
        </g>
      ))}
      <text x="240" y="120" fill="#71717a" fontSize="8.5" textAnchor="middle">February 2018: VIX Spike + XIV/SVXY Implosion</text>
    </svg>
  );
}

// ── Dispersion trade diagram ───────────────────────────────────────────────────
function DispersionSVG() {
  return (
    <svg viewBox="0 0 480 160" className="w-full h-40">
      <defs>
        <marker id="dspA2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
        </marker>
      </defs>
      <rect x="10" y="55" width="110" height="50" rx="7" fill="#1e1e2e" stroke="#f87171" strokeWidth="1.5" />
      <text x="65" y="75" fill="#fca5a5" fontSize="10" textAnchor="middle" fontWeight="bold">INDEX</text>
      <text x="65" y="90" fill="#f87171" fontSize="8.5" textAnchor="middle">Short Vol</text>
      <text x="65" y="101" fill="#71717a" fontSize="8" textAnchor="middle">Sell index variance</text>
      <text x="148" y="74" fill="#f59e0b" fontSize="8" textAnchor="middle">DISPERSION</text>
      <text x="148" y="86" fill="#71717a" fontSize="7.5" textAnchor="middle">corr. risk premium</text>
      <rect x="180" y="20" width="90" height="36" rx="6" fill="#1e1e2e" stroke="#34d399" strokeWidth="1.5" />
      <text x="225" y="35" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">Stock A</text>
      <text x="225" y="47" fill="#34d399" fontSize="8" textAnchor="middle">Long Vol</text>
      <rect x="180" y="62" width="90" height="36" rx="6" fill="#1e1e2e" stroke="#34d399" strokeWidth="1.5" />
      <text x="225" y="77" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">Stock B</text>
      <text x="225" y="89" fill="#34d399" fontSize="8" textAnchor="middle">Long Vol</text>
      <rect x="180" y="104" width="90" height="36" rx="6" fill="#1e1e2e" stroke="#34d399" strokeWidth="1.5" />
      <text x="225" y="119" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontWeight="bold">Stock C</text>
      <text x="225" y="131" fill="#34d399" fontSize="8" textAnchor="middle">Long Vol</text>
      <line x1="120" y1="70" x2="180" y2="38" stroke="#34d399" strokeWidth="1" markerEnd="url(#dspA2)" />
      <line x1="120" y1="80" x2="180" y2="80" stroke="#34d399" strokeWidth="1" markerEnd="url(#dspA2)" />
      <line x1="120" y1="90" x2="180" y2="122" stroke="#34d399" strokeWidth="1" markerEnd="url(#dspA2)" />
      <rect x="310" y="40" width="160" height="80" rx="7" fill="#0f1220" stroke="#6366f1" strokeWidth="1" />
      <text x="390" y="58" fill="#a5b4fc" fontSize="9" textAnchor="middle" fontWeight="bold">P&amp;L DRIVERS</text>
      <text x="320" y="73" fill="#6ee7b7" fontSize="8">+ Stock vols &gt; index vol</text>
      <text x="320" y="86" fill="#6ee7b7" fontSize="8">+ Realized corr drops</text>
      <text x="320" y="99" fill="#f87171" fontSize="8">− Index vol spikes alone</text>
      <text x="320" y="112" fill="#f87171" fontSize="8">− Correlation crisis</text>
    </svg>
  );
}

// ── Implied correlation chart ──────────────────────────────────────────────────
function ImpliedCorrSVG() {
  const W = 480; const H = 160;
  const PAD = { l: 36, r: 16, t: 20, b: 28 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const months = 24;
  const impliedCorr: number[] = [];
  const realizedCorr: number[] = [];
  let baseCorr = 0.45;
  for (let i = 0; i < months; i++) {
    const shock = i === 15 ? 0.35 : 0;
    baseCorr = Math.max(0.2, Math.min(0.85, baseCorr + (sv() - 0.52) * 0.06 + shock));
    impliedCorr.push(Math.min(0.92, baseCorr + 0.08 + sv() * 0.04));
    realizedCorr.push(Math.max(0.1, baseCorr - 0.04 + (sv() - 0.5) * 0.06));
  }
  const minC = 0.1; const maxC = 0.95;
  const toX = (i: number) => PAD.l + (i / (months - 1)) * cW;
  const toY = (c: number) => PAD.t + cH - ((c - minC) / (maxC - minC)) * cH;
  const iPts = impliedCorr.map((c, i) => `${toX(i)},${toY(c)}`).join(" ");
  const rPts = realizedCorr.map((c, i) => `${toX(i)},${toY(c)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      {[0.2, 0.4, 0.6, 0.8].map((v) => (
        <g key={`icg-${v}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
          <text x={PAD.l - 4} y={toY(v) + 3} fill="#71717a" fontSize="8" textAnchor="end">{v.toFixed(1)}</text>
        </g>
      ))}
      {[0, 6, 12, 18, 23].map((m) => (
        <text key={`icx-${m}`} x={toX(m)} y={H - 6} fill="#71717a" fontSize="8" textAnchor="middle">M{m + 1}</text>
      ))}
      <polyline points={iPts} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={rPts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
      <line x1={toX(15)} y1={PAD.t} x2={toX(15)} y2={H - PAD.b} stroke="#f87171" strokeWidth="1" strokeDasharray="3,3" />
      <text x={toX(15)} y={PAD.t + 8} fill="#f87171" fontSize="8" textAnchor="middle">Crisis</text>
      <line x1={PAD.l + 10} y1={PAD.t + 10} x2={PAD.l + 30} y2={PAD.t + 10} stroke="#6366f1" strokeWidth="2" />
      <text x={PAD.l + 34} y={PAD.t + 14} fill="#a5b4fc" fontSize="8">Implied corr</text>
      <line x1={PAD.l + 100} y1={PAD.t + 10} x2={PAD.l + 120} y2={PAD.t + 10} stroke="#34d399" strokeWidth="2" strokeDasharray="5,3" />
      <text x={PAD.l + 124} y={PAD.t + 14} fill="#6ee7b7" fontSize="8">Realized corr</text>
    </svg>
  );
}

// ── Dispersion P&L decomposition ───────────────────────────────────────────────
interface DispersionPnL {
  driver: string;
  value: number;
  sign: "pos" | "neg";
}
const DISPERSION_PNL: DispersionPnL[] = [
  { driver: "Index vol short (theta collected)", value: 4.2, sign: "pos" },
  { driver: "Single-stock vol long (theta paid)", value: -3.1, sign: "neg" },
  { driver: "Realized correlation drop", value: 6.8, sign: "pos" },
  { driver: "Idiosyncratic stock moves", value: 2.3, sign: "pos" },
  { driver: "Delta hedging slippage", value: -0.9, sign: "neg" },
  { driver: "Transaction costs & financing", value: -0.7, sign: "neg" },
  { driver: "Net P&L (vol pts)", value: 8.6, sign: "pos" },
];

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function VolTradingPage() {
  const [activeTab, setActiveTab] = useState("surface");
  const [expandedSabrParam, setExpandedSabrParam] = useState<string | null>(null);

  const sabrParams = [
    { param: "α (alpha)", meaning: "ATM volatility level", effect: "Shifts entire surface up/down uniformly", color: "#6366f1" },
    { param: "β (beta)", meaning: "Backbone shape (0=normal, 1=log-normal)", effect: "Controls slope of ATM vol vs spot", color: "#34d399" },
    { param: "ρ (rho)", meaning: "Spot-vol correlation", effect: "Generates skew; negative ρ creates put skew", color: "#f59e0b" },
    { param: "ν (nu)", meaning: "Vol-of-vol", effect: "Curvature and smile convexity", color: "#f87171" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-1 border-l-4 border-l-primary p-6 rounded-lg bg-card/40"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-border">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Volatility Trading</h1>
            <p className="text-sm text-muted-foreground">
              Vol surface dynamics, long/short vol strategies, and dispersion trading
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {[
            { label: "VIX", value: "18.4", sub: "spot", color: "text-primary" },
            { label: "VIX1M", value: "19.1", sub: "1-month", color: "text-primary" },
            { label: "VIX3M", value: "20.8", sub: "3-month", color: "text-muted-foreground" },
            { label: "VVIX", value: "94.2", sub: "vol-of-vol", color: "text-amber-400" },
            { label: "IV-RV", value: "+2.3", sub: "VRP", color: "text-emerald-400" },
            { label: "Imp Corr", value: "0.54", sub: "index", color: "text-pink-400" },
          ].map((m) => (
            <InfoPill key={m.label} label={m.label} value={m.value} sub={m.sub} color={m.color} />
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border w-full justify-start flex-wrap h-auto gap-1 p-1">
          {[
            { value: "surface", label: "Volatility Surface", icon: <Layers className="w-3.5 h-3.5" /> },
            { value: "longvol", label: "Long Vol Strategies", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { value: "shortvol", label: "Short Vol Strategies", icon: <TrendingDown className="w-3.5 h-3.5" /> },
            { value: "dispersion", label: "Dispersion & Correlation", icon: <BarChart2 className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary/30 data-[state=active]:text-primary"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── TAB 1: Volatility Surface ───────────────────────────────────────────── */}
        <TabsContent value="surface" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Implied Volatility Surface (Isometric)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VolSurfaceSVG />
                <p className="text-xs text-muted-foreground mt-2">
                  The vol surface maps implied volatility across strike (moneyness) and expiry. Put skew from
                  investor hedging demand elevates OTM put IVs. Term structure shows contango in calm markets.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Term Structure Shapes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TermStructureSVG />
                <div className="space-y-2 mt-3">
                  {TERM_SHAPES.map((shape) => (
                    <div key={shape.label} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: shape.color }} />
                      <div>
                        <span className="text-xs font-medium" style={{ color: shape.color }}>{shape.label}: </span>
                        <span className="text-xs text-muted-foreground">{shape.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Volatility Skew Dynamics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SkewSVG />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="font-medium text-primary mb-1">Put Skew Origin</p>
                  <p className="text-muted-foreground">Institutional investors systematically buy OTM puts for portfolio insurance, creating persistent demand that inflates put IV vs call IV — a structural risk premium.</p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="font-medium text-primary mb-1">Sticky Strike vs Sticky Delta</p>
                  <p className="text-muted-foreground">Sticky strike: same absolute strike keeps its IV as spot moves. Sticky delta: vol follows the delta (25Δ put always has same IV). Equity tends sticky strike; FX tends sticky delta.</p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="font-medium text-muted-foreground mb-1">Post-Earnings Surface</p>
                  <p className="text-muted-foreground">Near-dated vol collapses dramatically post-earnings (vol crush). Far-dated vol barely moves. The surface flattens in the front end as event uncertainty resolves.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SABR Model */}
          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                SABR Model Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                SABR (Stochastic Alpha Beta Rho) is the industry-standard model for interest rate and FX options. It produces a closed-form IV approximation as a function of strike, making surface calibration tractable.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sabrParams.map((p) => (
                  <button
                    key={p.param}
                    onClick={() => setExpandedSabrParam(expandedSabrParam === p.param ? null : p.param)}
                    className="text-left bg-card border border-border rounded-lg p-3 hover:border-border transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: p.color }}>{p.param}</span>
                      {expandedSabrParam === p.param ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.meaning}</p>
                    <AnimatePresence>
                      {expandedSabrParam === p.param && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-muted-foreground mt-2 overflow-hidden"
                        >
                          {p.effect}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SVI + Arbitrage + Local vs Stoch */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ExpandableSection title="SVI Parameterization" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">SVI (Stochastic Volatility Inspired)</span> parameterizes the smile as:
                </p>
                <div className="bg-card rounded p-3 font-mono text-muted-foreground text-[11px]">
                  w(k) = a + b [rho(k-m) + sqrt((k-m)^2 + sigma^2)]
                </div>
                <p>where k = log(K/F), w is total variance, and {"(a, b, rho, m, sigma)"} are 5 free parameters. SVI automatically satisfies the no-butterfly-arbitrage condition when calibrated correctly.</p>
                <p className="text-muted-foreground">Key property: SVI is asymptotically linear in log-moneyness, consistent with Roger Lee moment formula bounding IV growth at large strikes.</p>
              </div>
            </ExpandableSection>

            <ExpandableSection title="Vol Surface Arbitrage Conditions" defaultOpen>
              <div className="space-y-3">
                {ARB_CONDITIONS.map((c) => (
                  <div key={c.name} className="border-l-2 pl-3" style={{ borderColor: c.color }}>
                    <p className="text-xs font-medium" style={{ color: c.color }}>{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.condition}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Violation: {c.violation}</p>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          </div>

          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                Local Vol vs Stochastic Vol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocalVsStochVolSVG />
              <p className="text-xs text-muted-foreground mt-3">
                Vanna-volga pricing (popular in FX) adds Greeks-based corrections to Black-Scholes using market prices of the 25-delta strangle and risk reversal, capturing smile effects analytically without full stochastic model calibration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Long Vol Strategies ───────────────────────────────────────────── */}
        <TabsContent value="longvol" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Long Straddle: Payoff at Expiry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BreakevenDisplay />
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <p className="font-medium text-emerald-300 mb-1">Breakeven Formula</p>
                    <p className="text-muted-foreground">Upside BE = Strike + Total Premium</p>
                    <p className="text-muted-foreground">Downside BE = Strike − Total Premium</p>
                    <p className="text-muted-foreground mt-1">ATM S=100, Call=3.2, Put=3.0 → BEs: 93.8 / 106.2</p>
                  </div>
                  <div className="bg-card rounded-lg p-3 border border-border">
                    <p className="font-medium text-primary mb-1">Pay Theta, Own Gamma</p>
                    <p className="text-muted-foreground">Long straddle: negative theta (time decay enemy) but long gamma (big moves profit). Profitability depends on realized vol exceeding implied vol over the holding period.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Gamma Scalping P&L Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GammaScalpPnLSVG />
                <div className="space-y-2 mt-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Gamma scalping condition: </span>
                    Daily P&L approx 0.5 x Gamma x S^2 x (sigma_realized^2 - sigma_implied^2) x dt. Positive when realized exceeds implied.
                  </p>
                  <p>
                    The trader delta-hedges periodically (e.g., hourly), collecting P&L from realized moves. The straddle breaks even when sigma_realized equals sigma_implied over option life.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Long Vol Strategy Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["Strategy", "Structure", "Market Outlook", "Max Risk", "Max Reward", "Theta", "Gamma"].map((h) => (
                        <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LONG_VOL_STRATEGIES.map((st, i) => (
                      <tr key={st.name} className={cn("border-b border-border", i % 2 === 0 ? "bg-background" : "bg-card/30")}>
                        <td className="py-2 px-2 font-medium text-primary">{st.name}</td>
                        <td className="py-2 px-2 text-muted-foreground">{st.structure}</td>
                        <td className="py-2 px-2 text-muted-foreground">{st.outlook}</td>
                        <td className="py-2 px-2 text-red-400">{st.risk}</td>
                        <td className="py-2 px-2 text-emerald-400">{st.reward}</td>
                        <td className="py-2 px-2 text-amber-400">{st.theta}</td>
                        <td className="py-2 px-2 text-primary">{st.gamma}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExpandableSection title="Variance Swap: Pure Vol Exposure" defaultOpen>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>A variance swap pays <span className="text-foreground font-medium">(sigma_realized^2 - K_var) x Notional</span> at expiry. Unlike options, it has no delta and no need for dynamic hedging.</p>
                <div className="bg-card rounded p-3 space-y-1.5">
                  <p className="font-medium text-muted-foreground">Key mechanics:</p>
                  <p>Fair strike K_var is replicated via a log-contract (infinite strip of OTM options)</p>
                  <p>Vega notional = Variance notional x 2 x K_var</p>
                  <p>Convexity: long var swap benefits from very large vol moves (sigma^2 is convex in sigma)</p>
                  <p>Variance has linear payoff in realized variance, unlike straddle which is linear in |sigma|</p>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="UVXY Mechanics & Decay" defaultOpen>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>UVXY targets 1.5x daily return of the S&P 500 short-term VIX futures index (blend of 1st and 2nd month futures).</p>
                <div className="bg-card rounded p-3 space-y-1.5">
                  <p className="font-medium text-muted-foreground">Why UVXY decays chronically:</p>
                  <p>Contango roll cost: rolling near-term futures into higher-priced later contracts</p>
                  <p>Average roll cost: 5-7% per month in normal contango markets</p>
                  <p>Leverage decay: daily rebalancing causes compounding drag</p>
                  <p>Long-run expected return strongly negative outside VIX spikes</p>
                </div>
                <p className="text-amber-400 font-medium">VVIX (vol of VIX) signals when vol-of-vol is elevated — better timing for long UVXY entries.</p>
              </div>
            </ExpandableSection>
          </div>
        </TabsContent>

        {/* ── TAB 3: Short Vol Strategies ──────────────────────────────────────────── */}
        <TabsContent value="shortvol" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Volatility Risk Premium (Historical)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VRPBarChart />
                <p className="text-xs text-muted-foreground mt-2">
                  Historically implied vol exceeds realized vol by 2-3 vol points on average, creating a persistent risk premium for option sellers. February spike shows the key exception.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  February 2018: XIV/SVXY Implosion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VixSpikeSVG />
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-red-300">What happened: </span>
                    VIX spiked from ~14 to ~50 in a single afternoon. XIV (inverse VIX ETP) was designed to reset daily — a 90%+ VIX move triggered the acceleration clause, terminating the product.
                  </p>
                  <p>
                    <span className="font-medium text-amber-300">Lesson: </span>
                    Short vol strategies carry embedded tail risk. Position sizing, stop-losses, and stress scenario analysis are mandatory — not optional — risk management tools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Short Vol Strategy Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["Strategy", "Structure", "Max Gain", "Max Loss", "Ideal Environment", "Key Risk"].map((h) => (
                        <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SHORT_VOL_STRATEGIES.map((st, i) => (
                      <tr key={st.name} className={cn("border-b border-border", i % 2 === 0 ? "bg-background" : "bg-card/30")}>
                        <td className="py-2 px-2 font-medium text-red-300">{st.name}</td>
                        <td className="py-2 px-2 text-muted-foreground">{st.structure}</td>
                        <td className="py-2 px-2 text-emerald-400">{st.maxGain}</td>
                        <td className="py-2 px-2 text-red-400">{st.maxLoss}</td>
                        <td className="py-2 px-2 text-muted-foreground">{st.idealEnv}</td>
                        <td className="py-2 px-2 text-amber-400">{st.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExpandableSection title="Iron Condor Mechanics" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Iron condor = bear call spread + bull put spread. Collects premium from both wings. Profitable if underlying stays within the short strikes at expiry.</p>
                <div className="bg-card rounded p-3 space-y-1">
                  <p className="font-medium text-muted-foreground">P&L formula:</p>
                  <p>Max gain = net premium collected</p>
                  <p>Max loss = wing width minus premium</p>
                  <p>Break-evens = short strikes plus/minus net premium</p>
                </div>
                <p className="text-muted-foreground">Best entered at 30-45 DTE; closed at 50% profit target to avoid accelerating gamma risk near expiry.</p>
              </div>
            </ExpandableSection>

            <ExpandableSection title="VIX Futures Roll Yield" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Short VIX futures captures roll yield when VIX futures trade above spot VIX (contango). As time passes, futures converge down to spot — the short position profits from this convergence.</p>
                <div className="bg-card rounded p-3 space-y-1">
                  <p className="font-medium text-muted-foreground">Annualized roll yield approx:</p>
                  <p className="font-mono text-xs">(VIX_futures - VIX_spot) / VIX_spot x 252/DTE</p>
                </div>
                <p className="text-amber-400 font-medium">Risk: VIX spot can spike above futures during stress, destroying the trade instantly with unlimited theoretical loss.</p>
              </div>
            </ExpandableSection>

            <ExpandableSection title="Normalized VRP Selling" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>VRP (Vol Risk Premium) = Implied Vol minus Expected Realized Vol. Normalized VRP = (IV - HV20) / HV20.</p>
                <div className="bg-card rounded p-3 space-y-1.5">
                  <p className="font-medium text-muted-foreground">Signal thresholds:</p>
                  <p className="text-emerald-400">nVRP &gt; 0.15: sell premium (IV expensive)</p>
                  <p className="text-red-400">nVRP &lt; -0.05: avoid or go long vol</p>
                  <p className="text-muted-foreground">IV Rank &gt; 50: premium selling regime</p>
                </div>
              </div>
            </ExpandableSection>
          </div>
        </TabsContent>

        {/* ── TAB 4: Dispersion & Correlation ─────────────────────────────────────── */}
        <TabsContent value="dispersion" className="mt-4 space-y-5 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  Dispersion Trade Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DispersionSVG />
                <p className="text-xs text-muted-foreground mt-2">
                  Dispersion trades short index volatility and long individual stock volatility. The edge comes from the correlation risk premium — implied correlation exceeds realized correlation historically.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Implied vs Realized Correlation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImpliedCorrSVG />
                <p className="text-xs text-muted-foreground mt-2">
                  Implied correlation (derived from index vs component vols) persistently exceeds realized correlation except during crises, creating a systematic risk premium harvestable via dispersion.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Implied Correlation Formula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-card/60 rounded-lg p-4 border border-border">
                <div className="font-mono text-muted-foreground text-sm mb-2">
                  rho_implied = (sigma_index^2 - sum_i(wi^2 * sigmai^2)) / (2 * sum_ij(wi * wj * sigmai * sigmaj))
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-3">
                  {[
                    { sym: "sigma_index", def: "Index implied vol (from ATM straddle)", color: "text-primary" },
                    { sym: "wi", def: "Component weight in index", color: "text-primary" },
                    { sym: "sigmai", def: "Component i implied vol", color: "text-emerald-300" },
                    { sym: "rho_implied", def: "Market-implied average pairwise correlation", color: "text-amber-300" },
                  ].map((item) => (
                    <div key={item.sym} className="bg-background rounded p-2 border border-border">
                      <code className={cn("font-mono font-medium text-sm", item.color)}>{item.sym}</code>
                      <p className="text-muted-foreground mt-1">{item.def}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Dispersion P&L Decomposition (Illustrative, vol pts)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DISPERSION_PNL.map((item, i) => {
                  const isLast = i === DISPERSION_PNL.length - 1;
                  const color = item.sign === "pos" ? "text-emerald-400" : "text-red-400";
                  const barColor = item.sign === "pos" ? "bg-emerald-500" : "bg-red-500";
                  const maxAbs = 8.6;
                  const barW = Math.abs(item.value) / maxAbs * 60;
                  return (
                    <div key={item.driver} className={cn("flex items-center gap-3", isLast && "border-t border-border pt-2 mt-1")}>
                      <div className="flex-1 text-xs text-muted-foreground">{item.driver}</div>
                      <div className="w-16 flex items-center">
                        <div className={cn("h-2 rounded", barColor)} style={{ width: `${barW}%` }} />
                      </div>
                      <div className={cn("text-xs font-medium w-12 text-right", color, isLast && "text-sm")}>
                        {item.value > 0 ? "+" : ""}{item.value.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExpandableSection title="Variance Dispersion vs Vega Dispersion" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card rounded p-3">
                    <p className="font-medium text-primary mb-1">Variance Dispersion</p>
                    <p>Use variance swaps on index and components. Pure volatility exposure, no delta hedging needed. Payoff scales with realized variance (sigma^2), rewarding large moves convexly.</p>
                  </div>
                  <div className="bg-card rounded p-3">
                    <p className="font-medium text-muted-foreground mb-1">Vega Dispersion</p>
                    <p>Use options (ATM straddles) on index and components. Requires continuous delta hedging. Payoff linear in vol. More gamma exposure, path-dependent P&L.</p>
                  </div>
                </div>
                <p className="text-muted-foreground">Variance dispersion is cleaner theoretically; vega dispersion is more accessible in practice for options books.</p>
              </div>
            </ExpandableSection>

            <ExpandableSection title="Correlation Regimes & Crisis Behavior" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>In normal regimes, average pairwise stock correlations are 0.3-0.5. During crises, correlations spike to 0.7-0.9 as macro factors dominate all individual names.</p>
                <div className="bg-card rounded p-3 space-y-1.5">
                  <p className="font-medium text-muted-foreground">Dispersion trade crisis P&L:</p>
                  <p className="text-red-400">Index vol spikes — short index vega hurts badly</p>
                  <p className="text-red-400">Correlation spike — individual stocks move together</p>
                  <p className="text-muted-foreground">Long individual vol gains, but insufficient to offset</p>
                  <p className="text-muted-foreground mt-1">Crisis is the primary scenario where dispersion trades lose money. Size accordingly.</p>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="Sector vs Full Index Dispersion" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Dispersion can be implemented at sector level (e.g., XLK vs mega-cap tech) or full index level (SPX vs S&P 500 components).</p>
                <div className="bg-card rounded p-3 space-y-1.5">
                  <p className="font-medium text-muted-foreground">Sector advantages:</p>
                  <p>Higher intra-sector correlation tracking, fewer legs (10-30 vs 500 stocks), sector events drive larger divergence</p>
                  <p className="font-medium text-muted-foreground mt-2">Full index advantages:</p>
                  <p>Deeper liquidity on SPX options, more diversified correlation exposure across the market</p>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection title="Cross-Asset Vol Correlation" defaultOpen>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Volatility regimes are correlated across asset classes but not perfectly, creating cross-asset vol trading opportunities.</p>
                <div className="space-y-1.5 bg-card rounded p-3">
                  {[
                    { pair: "Equity vol (VIX) vs FX vol (EURUSD)", corr: "+0.55", note: "Risk-off drives both up" },
                    { pair: "Equity vol (VIX) vs Rates vol (MOVE)", corr: "+0.42", note: "Fed uncertainty spills over" },
                    { pair: "Equity vol vs Credit spreads", corr: "+0.72", note: "Very tight in stress" },
                    { pair: "EM FX vol vs DM equity vol", corr: "+0.63", note: "Dollar strength / EM outflows" },
                  ].map((item) => (
                    <div key={item.pair} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground flex-1 text-[11px]">{item.pair}</span>
                      <Badge className="bg-muted/60 text-primary border-border text-xs">{item.corr}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </ExpandableSection>
          </div>

          <Card className="bg-background border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Practical Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  {
                    title: "Via Variance Swaps",
                    color: "text-primary",
                    points: [
                      "OTC instruments, ISDA documentation required",
                      "Sell variance swap on index (pay K_var, receive realized variance)",
                      "Buy variance swaps on major components (vega-weighted)",
                      "No delta hedging needed — pure vol exposure",
                      "Typical tenor: 1m, 3m, 6m rolls",
                    ],
                  },
                  {
                    title: "Via Options Books",
                    color: "text-primary",
                    points: [
                      "Sell ATM straddle on index (SPX/SPY)",
                      "Buy ATM straddles on components (delta-hedged)",
                      "Maintain dollar vega neutrality across book",
                      "Continuous delta hedging required — labor intensive",
                      "Execution via exchange-listed options",
                    ],
                  },
                  {
                    title: "Risk Management",
                    color: "text-emerald-300",
                    points: [
                      "Monitor realized vs implied correlation daily",
                      "Pre-define stop-loss at 2x expected monthly P&L",
                      "Stress test for correlation = 0.9 scenario",
                      "Limit gross vega per single name to 5% of book",
                      "Reduce position before major macro events",
                    ],
                  },
                ].map((section) => (
                  <div key={section.title} className="bg-card rounded-lg p-3 border border-border">
                    <p className={cn("font-medium mb-2", section.color)}>{section.title}</p>
                    <ul className="space-y-1">
                      {section.points.map((pt, i) => (
                        <li key={i} className="text-muted-foreground flex items-start gap-1.5">
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
