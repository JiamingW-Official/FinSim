"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";
import { INITIAL_CAPITAL } from "@/types/trading";
import { formatCurrency, cn } from "@/lib/utils";
import {
 AlertTriangle,
 ChevronDown,
 ChevronUp,
 TrendingDown,
 BarChart2,
 Info,
 Shield,
 Zap,
 BookOpen,
 Activity,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TickerBorrowInfo {
 ticker: string;
 borrowRatePct: number;
 shortFloatPct: number;
 avgDailyVolumeMil: number;
 squeezeScore: number;
 daysToCover: number;
}

interface ShockScenario {
 label: string;
 year: number;
 maxDrop: number;
 description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MARGIN_APR = 0.08; // 8% APR on borrowed amount

// Extended borrow rates for display/education (seeded PRNG seed=9999)
function prng9999(n: number): number {
 let s = 9999 + n * 2654435761;
 s = (s ^ (s >>> 16)) * 0x45d9f3b;
 s = (s ^ (s >>> 16)) * 0x45d9f3b;
 s = s ^ (s >>> 16);
 return (s >>> 0) / 0xffffffff;
}

const DISPLAY_TICKERS = [
 { ticker: "AAPL", shortFloatPct: 0.9, avgDailyVolumeMil: 58 },
 { ticker: "TSLA", shortFloatPct: 3.2, avgDailyVolumeMil: 82 },
 { ticker: "MSFT", shortFloatPct: 0.7, avgDailyVolumeMil: 21 },
 { ticker: "GOOGL", shortFloatPct: 1.1, avgDailyVolumeMil: 25 },
 { ticker: "AMZN", shortFloatPct: 1.4, avgDailyVolumeMil: 38 },
 { ticker: "META", shortFloatPct: 1.6, avgDailyVolumeMil: 17 },
 { ticker: "NVDA", shortFloatPct: 2.8, avgDailyVolumeMil: 41 },
 { ticker: "SPY", shortFloatPct: 0.4, avgDailyVolumeMil: 82 },
 { ticker: "QQQ", shortFloatPct: 0.5, avgDailyVolumeMil: 44 },
 { ticker: "BTC", shortFloatPct: 4.1, avgDailyVolumeMil: 12 },
];

// Fixed borrow rate overrides for known tickers (manually set for realism)
const HARDCODED_RATES: Record<string, number> = {
 AAPL: 0.5,
 TSLA: 2.1,
 MSFT: 0.3,
 GOOGL: 0.4,
 AMZN: 0.6,
 META: 0.8,
 NVDA: 1.2,
 SPY: 0.25,
 QQQ: 0.3,
 BTC: 3.5,
};

function getBorrowRate(ticker: string, idx: number): number {
 if (HARDCODED_RATES[ticker] !== undefined) return HARDCODED_RATES[ticker];
 return +(0.5 + prng9999(idx) * 4.5).toFixed(2);
}

const TICKER_BORROW_INFO: TickerBorrowInfo[] = DISPLAY_TICKERS.map((t, i) => {
 const rate = getBorrowRate(t.ticker, i);
 // sharesShort = float * shortFloatPct / 100 * sharesOutstanding — simplified
 const sharesShortMil = (t.avgDailyVolumeMil * 30 * t.shortFloatPct) / 100;
 const daysToCover =
 t.avgDailyVolumeMil > 0 ? sharesShortMil / t.avgDailyVolumeMil : 0;
 const squeezeScore = Math.min(10, (daysToCover * t.shortFloatPct) / 2);
 return {
 ticker: t.ticker,
 borrowRatePct: rate,
 shortFloatPct: t.shortFloatPct,
 avgDailyVolumeMil: t.avgDailyVolumeMil,
 squeezeScore: +squeezeScore.toFixed(1),
 daysToCover: +daysToCover.toFixed(2),
 };
});

const SHOCK_SCENARIOS: ShockScenario[] = [
 {
 label: "COVID Crash",
 year: 2020,
 maxDrop: 34,
 description:
 "S&P 500 fell 34% in 33 days (Feb–Mar 2020). Highly leveraged accounts faced margin calls within days.",
 },
 {
 label: "Rate Shock",
 year: 2022,
 maxDrop: 25,
 description:
 "Nasdaq fell ~33%, S&P 500 ~25% during 2022 rate hike cycle. Growth stocks dropped 60–80%.",
 },
 {
 label: "China Crash",
 year: 2015,
 maxDrop: 40,
 description:
 "Chinese markets lost 40%+ in weeks after regulatory changes. Leveraged retail accounts wiped out.",
 },
];

// Generate synthetic 30-day leverage history (seeded)
function generateLeverageHistory(
 baseEquity: number,
 baseExposure: number,
): { day: number; leverage: number }[] {
 const data: { day: number; leverage: number }[] = [];
 const baseLev = baseExposure > 0 ? baseExposure / baseEquity : 1;
 for (let i = 0; i < 30; i++) {
 const noise = prng9999(i * 7 + 3) * 0.6 - 0.3;
 const leverage = Math.max(1, baseLev + noise);
 data.push({ day: i + 1, leverage: +leverage.toFixed(3) });
 }
 // Last point = current
 data[29] = { day: 30, leverage: +Math.max(1, baseLev).toFixed(3) };
 return data;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({
 icon: Icon,
 title,
 expanded,
 onToggle,
}: {
 icon: React.ElementType;
 title: string;
 expanded: boolean;
 onToggle: () => void;
}) {
 return (
 <button
 type="button"
 onClick={onToggle}
 className="flex w-full items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors"
 >
 <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
 <Icon className="h-3.5 w-3.5" />
 {title}
 </span>
 {expanded ? (
 <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
 ) : (
 <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
 )}
 </button>
 );
}

// Speedometer-style SVG risk meter
function RiskMeter({ score }: { score: number }) {
 // score 0–10
 const clamped = Math.min(10, Math.max(0, score));
 const angle = -135 + (clamped / 10) * 270; // -135° to +135°
 const rad = (angle * Math.PI) / 180;
 const cx = 28;
 const cy = 28;
 const r = 20;
 const nx = cx + r * Math.cos(rad);
 const ny = cy + r * Math.sin(rad);

 const color =
 clamped >= 7
 ? "#ef4444"
 : clamped >= 4
 ? "#f59e0b"
 : "#10b981";

 return (
 <svg width={56} height={40} viewBox="0 0 56 40" className="shrink-0">
 {/* Background arc */}
 <path
 d="M 8 34 A 20 20 0 1 1 48 34"
 fill="none"
 stroke="#27272a"
 strokeWidth={5}
 strokeLinecap="round"
 />
 {/* Colored fill arc */}
 <path
 d="M 8 34 A 20 20 0 1 1 48 34"
 fill="none"
 stroke={color}
 strokeWidth={5}
 strokeLinecap="round"
 strokeDasharray={`${(clamped / 10) * 94.2} 94.2`}
 opacity={0.35}
 />
 {/* Needle */}
 <line
 x1={cx}
 y1={cy}
 x2={nx}
 y2={ny}
 stroke={color}
 strokeWidth={2}
 strokeLinecap="round"
 />
 <circle cx={cx} cy={cy} r={2.5} fill={color} />
 {/* Score text */}
 <text
 x={cx}
 y={38}
 textAnchor="middle"
 fontSize={8}
 fill={color}
 fontFamily="monospace"
 fontWeight="bold"
 >
 {clamped.toFixed(1)}
 </text>
 </svg>
 );
}

// Large account overview SVG bar
function AccountBar({
 equity,
 marginUsed,
 maintenanceReq,
 buyingPowerTotal,
}: {
 equity: number;
 marginUsed: number;
 maintenanceReq: number;
 buyingPowerTotal: number;
}) {
 const total = buyingPowerTotal;
 const usedPct = total > 0 ? Math.min(100, (marginUsed / total) * 100) : 0;
 const maintPct = total > 0 ? Math.min(100, (maintenanceReq / total) * 100) : 0;
 const equityPct = total > 0 ? Math.min(100, (equity / total) * 100) : 100;

 return (
 <div className="space-y-1.5">
 {/* Visual bar */}
 <div className="relative h-5 w-full overflow-hidden rounded bg-muted">
 {/* Equity portion */}
 <div
 className="absolute left-0 top-0 h-full bg-profit/70 flex items-center justify-center"
 style={{ width: `${equityPct}%` }}
 >
 {equityPct > 10 && (
 <span className="text-[11px] font-semibold text-foreground/90 px-1 truncate">
 Equity
 </span>
 )}
 </div>
 {/* Margin used portion */}
 {usedPct > 0 && (
 <div
 className="absolute top-0 h-full bg-short/60"
 style={{ left: `${equityPct}%`, width: `${usedPct}%` }}
 />
 )}
 {/* Maintenance threshold marker */}
 {maintPct > 0 && (
 <div
 className="absolute top-0 h-full w-0.5 bg-loss"
 style={{ left: `${maintPct}%` }}
 />
 )}
 </div>
 <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
 <span className="flex items-center gap-1">
 <span className="inline-block h-2 w-2 rounded-sm bg-profit/70" />
 Equity
 </span>
 <span className="flex items-center gap-1">
 <span className="inline-block h-2 w-2 rounded-sm bg-short/60" />
 Margin Used
 </span>
 <span className="flex items-center gap-1">
 <span className="inline-block h-0.5 w-3 bg-loss" />
 Maint. Floor
 </span>
 </div>
 </div>
 );
}

// 30-day leverage line chart
function LeverageChart({
 data,
}: {
 data: { day: number; leverage: number }[];
}) {
 const W = 240;
 const H = 60;
 const pad = { l: 28, r: 8, t: 6, b: 16 };
 const iW = W - pad.l - pad.r;
 const iH = H - pad.t - pad.b;

 const levs = data.map((d) => d.leverage);
 const minL = Math.max(0, Math.min(...levs) - 0.2);
 const maxL = Math.max(...levs) + 0.2;

 function x(i: number) {
 return pad.l + (i / (data.length - 1)) * iW;
 }
 function y(v: number) {
 return pad.t + iH - ((v - minL) / (maxL - minL)) * iH;
 }

 const points = data.map((d, i) => `${x(i)},${y(d.leverage)}`).join(" ");

 // Fill area
 const fillPoints = [
 `${x(0)},${pad.t + iH}`,
 ...data.map((d, i) => `${x(i)},${y(d.leverage)}`),
 `${x(data.length - 1)},${pad.t + iH}`,
 ].join(" ");

 const current = data[data.length - 1]?.leverage ?? 1;
 const color =
 current >= 4 ? "#ef4444" : current >= 2.5 ? "#f59e0b" : "#10b981";

 return (
 <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
 {/* Grid lines */}
 {[1, 2, 3, 4].map((v) => {
 if (v < minL || v > maxL) return null;
 const yv = y(v);
 return (
 <g key={v}>
 <line
 x1={pad.l}
 y1={yv}
 x2={W - pad.r}
 y2={yv}
 stroke="#27272a"
 strokeWidth={0.5}
 />
 <text
 x={pad.l - 3}
 y={yv + 3}
 textAnchor="end"
 fontSize={7}
 fill="#71717a"
 >
 {v}x
 </text>
 </g>
 );
 })}
 {/* Fill */}
 <polygon
 points={fillPoints}
 fill={color}
 opacity={0.1}
 />
 {/* Line */}
 <polyline
 points={points}
 fill="none"
 stroke={color}
 strokeWidth={1.5}
 strokeLinejoin="round"
 strokeLinecap="round"
 />
 {/* Current dot */}
 <circle
 cx={x(data.length - 1)}
 cy={y(current)}
 r={2.5}
 fill={color}
 />
 {/* X labels */}
 <text
 x={pad.l}
 y={H - 3}
 fontSize={7}
 fill="#71717a"
 >
 30d ago
 </text>
 <text
 x={W - pad.r}
 y={H - 3}
 textAnchor="end"
 fontSize={7}
 fill="#71717a"
 >
 Now
 </text>
 </svg>
 );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function MarginDashboard() {
 const cash = useTradingStore((s) => s.cash);
 const positions = useTradingStore((s) => s.positions);
 const portfolioValue = useTradingStore((s) => s.portfolioValue);
 const marginUsed = useTradingStore((s) => s.marginUsed);
 const borrowRates = useTradingStore((s) => s.borrowRates);
 const accrueMarginInterest = useTradingStore((s) => s.accrueMarginInterest);

 // Section expansion state
 const [expandedSections, setExpandedSections] = useState<
 Record<string, boolean>
 >({
 overview: true,
 shorts: true,
 leverage: false,
 simulator: false,
 education: false,
 });

 // Margin call simulator shock slider
 const [shockPct, setShockPct] = useState(0); // 0 = no shock, -50 = -50%

 function toggleSection(key: string) {
 setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
 }

 // ── Computed values ──────────────────────────────────────────────────────

 const shortPositions = useMemo(
 () => positions.filter((p) => p.side === "short"),
 [positions],
 );
 const longPositions = useMemo(
 () => positions.filter((p) => p.side === "long"),
 [positions],
 );

 const equity = portfolioValue;
 const startingEquity = INITIAL_CAPITAL;

 // Reg-T 2:1 buying power
 const buyingPowerRegT = equity * 2;
 // Portfolio margin 6:1
 const buyingPowerPortfolio = equity * 6;
 // Remaining buying power (RegT)
 const totalExposure =
 longPositions.reduce((s, p) => s + p.quantity * p.currentPrice, 0) +
 shortPositions.reduce((s, p) => s + p.quantity * p.currentPrice, 0);
 const buyingPowerRemaining = Math.max(0, buyingPowerRegT - totalExposure);

 const shortNotional = shortPositions.reduce(
 (s, p) => s + p.quantity * p.currentPrice,
 0,
 );
 const maintenanceReq = shortNotional * 0.25;
 const isMarginCall = equity < maintenanceReq && shortNotional > 0;
 const isMarginWarning =
 !isMarginCall && shortNotional > 0 && equity < maintenanceReq * 1.5;

 // Borrowed amount = short notional (cash received from short sale)
 const borrowedAmount = shortNotional;
 const dailyInterest = borrowedAmount * (MARGIN_APR / 365);

 // Current leverage
 const currentLeverage = equity > 0 ? totalExposure / equity : 1;

 // Sharpe-like: return per unit leverage
 const totalReturn = equity - startingEquity;
 const returnPct = totalReturn / startingEquity;
 const riskAdjReturn =
 currentLeverage > 1 ? returnPct / currentLeverage : returnPct;

 // Kelly: f = mu/sigma^2 — simplified with synthetic sigma
 const mu = returnPct; // expected return estimate
 const sigma = 0.18; // assumed annual vol 18%
 const kellyFull = mu / (sigma * sigma);
 const kellyFractional = kellyFull * 0.25; // quarter-Kelly recommended

 // 30-day leverage history
 const leverageHistory = useMemo(
 () => generateLeverageHistory(equity, totalExposure),
 // eslint-disable-next-line react-hooks/exhaustive-deps
 [Math.round(currentLeverage * 100)],
 );

 // ── Margin call simulator ────────────────────────────────────────────────

 const shockedEquity = useMemo(() => {
 if (shockPct === 0) return equity;
 // Shock applies to long positions value
 const longValue = longPositions.reduce(
 (s, p) => s + p.quantity * p.currentPrice,
 0,
 );
 const shockedLongValue = longValue * (1 + shockPct / 100);
 // Short positions gain value when prices drop
 const shockedShortPnL = shortPositions.reduce(
 (s, p) =>
 s +
 (p.avgPrice - p.currentPrice * (1 + shockPct / 100)) * p.quantity,
 0,
 );
 return (
 cash + shockedLongValue - longValue + shockedShortPnL - equity + equity
 );
 // Simplified: equity delta = (shockedLongValue - longValue) for longs
 }, [shockPct, equity, longPositions, shortPositions, cash]);

 const correctedShockedEquity = useMemo(() => {
 const longValue = longPositions.reduce(
 (s, p) => s + p.quantity * p.currentPrice,
 0,
 );
 const shockedLongValue = longValue * (1 + shockPct / 100);
 const longDelta = shockedLongValue - longValue;
 // Short P&L improves when prices fall
 const shortDelta = shortPositions.reduce(
 (s, p) => s - p.quantity * p.currentPrice * (shockPct / 100),
 0,
 );
 return equity + longDelta + shortDelta;
 }, [shockPct, equity, longPositions, shortPositions]);

 // At what drop does margin call trigger?
 const marginCallDrop = useMemo(() => {
 if (maintenanceReq <= 0 || longPositions.length === 0) return null;
 // equity - loss >= maintenanceReq
 // loss = longValue * drop%
 const longValue = longPositions.reduce(
 (s, p) => s + p.quantity * p.currentPrice,
 0,
 );
 if (longValue <= 0) return null;
 const maxLoss = equity - maintenanceReq;
 const triggerDrop = -(maxLoss / longValue) * 100;
 return Math.max(-100, Math.min(0, triggerDrop));
 }, [equity, maintenanceReq, longPositions]);

 // Liquidation order: sort positions by size desc
 const liquidationOrder = useMemo(
 () =>
 [...positions]
 .sort(
 (a, b) =>
 b.quantity * b.currentPrice - a.quantity * a.currentPrice,
 )
 .slice(0, 5),
 [positions],
 );

 // ── Interest per position ─────────────────────────────────────────────────

 const perPositionInterest = useMemo(
 () =>
 shortPositions.map((p) => {
 const rate = borrowRates[p.ticker] ?? HARDCODED_RATES[p.ticker] ?? 1.0;
 const notional = p.quantity * p.currentPrice;
 const daily = notional * (rate / 100 / 365);
 const annualized = notional * (rate / 100);
 return { ...p, rate, daily, annualized };
 }),
 [shortPositions, borrowRates],
 );

 // ── Active short by ticker in TICKER_BORROW_INFO ──────────────────────────
 const activeShortTickers = useMemo(
 () => new Set(shortPositions.map((p) => p.ticker)),
 [shortPositions],
 );

 return (
 <div className="rounded-md border border-border bg-card overflow-hidden">
 {/* ── Dashboard Header ── */}
 <div
 className={cn(
 "flex items-center justify-between px-3 py-2 border-b border-border",
 isMarginCall ? "bg-loss/10" : "bg-muted/10",
 )}
 >
 <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground">
 <BarChart2 className="h-4 w-4 text-primary" />
 Margin Dashboard
 </span>
 <div className="flex items-center gap-1.5">
 {isMarginCall && (
 <motion.span
 animate={{ scale: [1, 1.05, 1] }}
 transition={{ repeat: Infinity, duration: 1.2 }}
 className="rounded bg-loss px-1.5 py-0.5 text-[11px] font-semibold text-foreground"
 >
 MARGIN CALL
 </motion.span>
 )}
 {isMarginWarning && (
 <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[11px] font-semibold text-warning">
 WARN
 </span>
 )}
 <span className="text-xs text-muted-foreground">
 {currentLeverage.toFixed(2)}x leverage
 </span>
 </div>
 </div>

 {/* ═══════════════════════════════════════════════════════
 SECTION 1: Account Overview
 ═══════════════════════════════════════════════════════ */}
 <div className="border-b border-border">
 <SectionHeader
 icon={Shield}
 title="Account Overview"
 expanded={expandedSections.overview}
 onToggle={() => toggleSection("overview")}
 />
 <AnimatePresence initial={false}>
 {expandedSections.overview && (
 <motion.div
 key="overview"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="px-3 pb-3 space-y-3">
 {/* Margin Call alert */}
 {isMarginCall && (
 <div className="flex items-start gap-1.5 rounded-md bg-loss/10 border border-loss/30 px-2 py-2 text-xs text-loss">
 <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
 <span>
 Equity ({formatCurrency(equity)}) is below 25%
 maintenance ({formatCurrency(maintenanceReq)}). Cover
 short positions immediately to avoid forced liquidation.
 </span>
 </div>
 )}

 {/* Visual bar */}
 <AccountBar
 equity={equity}
 marginUsed={marginUsed}
 maintenanceReq={maintenanceReq}
 buyingPowerTotal={buyingPowerRegT}
 />

 {/* Key metrics grid */}
 <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
 <div className="flex items-center justify-between col-span-2">
 <span className="text-muted-foreground">Account Equity</span>
 <span
 className={cn(
 "tabular-nums font-semibold",
 equity < 0 ? "text-loss" : "text-foreground",
 )}
 >
 {formatCurrency(equity)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Buying Power (RegT 2×)
 </span>
 <span className="tabular-nums text-xs text-profit">
 {formatCurrency(buyingPowerRegT)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Portfolio Margin (6×)
 </span>
 <span className="tabular-nums text-xs text-short">
 {formatCurrency(buyingPowerPortfolio)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Margin Used
 </span>
 <span className="tabular-nums text-xs">
 {formatCurrency(marginUsed)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Maint. Req (25%)
 </span>
 <span
 className={cn(
 "tabular-nums text-xs",
 isMarginCall ? "text-loss" : "text-muted-foreground",
 )}
 >
 {formatCurrency(maintenanceReq)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Buying Power Left
 </span>
 <span className="tabular-nums text-xs text-profit">
 {formatCurrency(buyingPowerRemaining)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Daily Interest (8% APR)
 </span>
 <span className="tabular-nums text-xs text-warning">
 {formatCurrency(dailyInterest)}/day
 </span>
 </div>
 <div className="flex items-center justify-between col-span-2">
 <span className="text-muted-foreground text-xs">
 Cash Available
 </span>
 <span className="tabular-nums text-xs">
 {formatCurrency(cash)}
 </span>
 </div>
 </div>

 {/* Accrue interest button */}
 {shortNotional > 0 && (
 <button
 type="button"
 onClick={accrueMarginInterest}
 className="w-full rounded border border-border py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
 >
 Simulate 1-Day Interest Accrual (
 {formatCurrency(dailyInterest)})
 </button>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* ═══════════════════════════════════════════════════════
 SECTION 2: Short Selling Panel
 ═══════════════════════════════════════════════════════ */}
 <div className="border-b border-border">
 <SectionHeader
 icon={TrendingDown}
 title="Short Selling Panel"
 expanded={expandedSections.shorts}
 onToggle={() => toggleSection("shorts")}
 />
 <AnimatePresence initial={false}>
 {expandedSections.shorts && (
 <motion.div
 key="shorts"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="px-3 pb-3 space-y-3">
 {/* Active short positions */}
 {shortPositions.length === 0 ? (
 <p className="text-xs text-muted-foreground italic">
 No short positions open. Use "Sell Short" in Order Entry to
 borrow and sell shares.
 </p>
 ) : (
 <div className="space-y-2">
 <div className="text-xs font-medium text-muted-foreground">
 Active Short Positions
 </div>
 {perPositionInterest.map((p) => {
 const pnlColor =
 p.unrealizedPnL >= 0 ? "#10b981" : "#ef4444";
 const info = TICKER_BORROW_INFO.find(
 (t) => t.ticker === p.ticker,
 );
 const squeezeScore = info?.squeezeScore ?? 0;
 return (
 <div
 key={`short-${p.ticker}`}
 className="rounded-md border border-border bg-muted/20 p-2 space-y-2"
 >
 <div className="flex items-center justify-between">
 <span className="font-semibold text-xs text-short">
 {p.ticker}
 </span>
 <RiskMeter score={squeezeScore} />
 </div>
 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Shares
 </span>
 <span className="tabular-nums">{p.quantity}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Entry
 </span>
 <span className="tabular-nums">
 {formatCurrency(p.avgPrice)}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Current
 </span>
 <span className="tabular-nums">
 {formatCurrency(p.currentPrice)}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">P&L</span>
 <span
 className="tabular-nums font-semibold"
 style={{ color: pnlColor }}
 >
 {formatCurrency(p.unrealizedPnL)}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Borrow Rate
 </span>
 <span className="tabular-nums text-warning">
 {p.rate.toFixed(2)}%/yr
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Daily Cost
 </span>
 <span className="tabular-nums text-warning">
 {formatCurrency(p.daily)}/d
 </span>
 </div>
 {info && (
 <>
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Days-to-Cover
 </span>
 <span
 className={cn(
 "tabular-nums",
 info.daysToCover >= 5
 ? "text-loss"
 : info.daysToCover >= 2
 ? "text-warning"
 : "",
 )}
 >
 {info.daysToCover.toFixed(1)}d
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Squeeze Risk
 </span>
 <span
 className={cn(
 "tabular-nums font-semibold",
 squeezeScore >= 7
 ? "text-loss"
 : squeezeScore >= 4
 ? "text-warning"
 : "text-profit",
 )}
 >
 {squeezeScore.toFixed(1)}/10
 </span>
 </div>
 </>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Borrow rate table for all tickers */}
 <div>
 <div className="text-xs font-medium text-muted-foreground mb-1.5">
 Market Borrow Rates
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-xs border-collapse">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-0.5 text-muted-foreground font-normal">
 Ticker
 </th>
 <th className="text-right py-0.5 text-muted-foreground font-normal">
 Rate/yr
 </th>
 <th className="text-right py-0.5 text-muted-foreground font-normal">
 Sh. Float
 </th>
 <th className="text-right py-0.5 text-muted-foreground font-normal">
 DTC
 </th>
 <th className="text-right py-0.5 text-muted-foreground font-normal">
 Squeeze
 </th>
 </tr>
 </thead>
 <tbody>
 {TICKER_BORROW_INFO.map((info) => {
 const isActive = activeShortTickers.has(info.ticker);
 return (
 <tr
 key={info.ticker}
 className={cn(
 "border-b border-border",
 isActive && "bg-short/5",
 )}
 >
 <td
 className={cn(
 "py-0.5 font-semibold",
 isActive
 ? "text-short"
 : "text-muted-foreground",
 )}
 >
 {info.ticker}
 {isActive && (
 <span className="ml-1 text-[11px]">SHORT</span>
 )}
 </td>
 <td
 className={cn(
 "text-right tabular-nums",
 info.borrowRatePct >= 5
 ? "text-loss"
 : info.borrowRatePct >= 2
 ? "text-warning"
 : "text-muted-foreground",
 )}
 >
 {info.borrowRatePct.toFixed(2)}%
 </td>
 <td className="text-right tabular-nums text-muted-foreground">
 {info.shortFloatPct.toFixed(1)}%
 </td>
 <td
 className={cn(
 "text-right tabular-nums",
 info.daysToCover >= 3
 ? "text-warning"
 : "text-muted-foreground",
 )}
 >
 {info.daysToCover.toFixed(1)}d
 </td>
 <td
 className={cn(
 "text-right tabular-nums font-medium",
 info.squeezeScore >= 7
 ? "text-loss"
 : info.squeezeScore >= 4
 ? "text-warning"
 : "text-profit",
 )}
 >
 {info.squeezeScore.toFixed(1)}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <p className="text-[11px] text-muted-foreground/60 mt-1 italic">
 DTC = Days-to-Cover. Squeeze score 0–10 (higher = more risk
 of short squeeze).
 </p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* ═══════════════════════════════════════════════════════
 SECTION 3: Leverage Analytics
 ═══════════════════════════════════════════════════════ */}
 <div className="border-b border-border">
 <SectionHeader
 icon={Activity}
 title="Leverage Analytics"
 expanded={expandedSections.leverage}
 onToggle={() => toggleSection("leverage")}
 />
 <AnimatePresence initial={false}>
 {expandedSections.leverage && (
 <motion.div
 key="leverage"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="px-3 pb-3 space-y-3">
 {/* Current leverage */}
 <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
 <div className="flex items-center justify-between col-span-2">
 <span className="text-muted-foreground">
 Current Leverage
 </span>
 <span
 className={cn(
 "tabular-nums font-semibold",
 currentLeverage >= 4
 ? "text-loss"
 : currentLeverage >= 2.5
 ? "text-warning"
 : "text-profit",
 )}
 >
 {currentLeverage.toFixed(2)}×
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Total Exposure
 </span>
 <span className="tabular-nums text-xs">
 {formatCurrency(totalExposure)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Net Equity
 </span>
 <span className="tabular-nums text-xs">
 {formatCurrency(equity)}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Risk-Adj Return
 </span>
 <span
 className={cn(
 "tabular-nums text-xs",
 riskAdjReturn >= 0 ? "text-profit" : "text-loss",
 )}
 >
 {(riskAdjReturn * 100).toFixed(1)}%/×
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground text-xs">
 Total Return
 </span>
 <span
 className={cn(
 "tabular-nums text-xs",
 returnPct >= 0 ? "text-profit" : "text-loss",
 )}
 >
 {(returnPct * 100).toFixed(2)}%
 </span>
 </div>
 </div>

 {/* Kelly Criterion */}
 <div className="rounded-md bg-muted/30 border border-border p-2 space-y-1.5">
 <div className="text-xs font-semibold text-muted-foreground">
 Kelly Criterion — Optimal Leverage
 </div>
 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
 <div className="flex justify-between">
 <span className="text-muted-foreground">
 Full Kelly (f = μ/σ²)
 </span>
 <span className="tabular-nums font-semibold">
 {isFinite(kellyFull)
 ? `${(kellyFull * 100).toFixed(0)}%`
 : "N/A"}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground text-profit">
 1/4 Kelly (rec.)
 </span>
 <span className="tabular-nums font-semibold text-profit">
 {isFinite(kellyFractional)
 ? `${(kellyFractional * 100).toFixed(0)}%`
 : "N/A"}
 </span>
 </div>
 <div className="flex justify-between col-span-2">
 <span className="text-muted-foreground">
 Assumed Annual Vol (σ)
 </span>
 <span className="tabular-nums">18%</span>
 </div>
 </div>
 <p className="text-[11px] text-muted-foreground/70 leading-snug">
 Kelly formula: f = μ/σ² where μ is expected return and σ is
 volatility. Quarter-Kelly is safer — full Kelly is
 theoretically optimal but maximizes drawdown risk.
 </p>
 </div>

 {/* 30-day leverage chart */}
 <div>
 <div className="text-xs font-medium text-muted-foreground mb-1">
 30-Day Leverage History
 </div>
 <LeverageChart data={leverageHistory} />
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* ═══════════════════════════════════════════════════════
 SECTION 4: Margin Call Simulator
 ═══════════════════════════════════════════════════════ */}
 <div className="border-b border-border">
 <SectionHeader
 icon={Zap}
 title="Margin Call Simulator"
 expanded={expandedSections.simulator}
 onToggle={() => toggleSection("simulator")}
 />
 <AnimatePresence initial={false}>
 {expandedSections.simulator && (
 <motion.div
 key="simulator"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="px-3 pb-3 space-y-3">
 {/* Shock slider */}
 <div className="space-y-1.5">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground">
 Market Shock
 </span>
 <span
 className={cn(
 "tabular-nums font-semibold",
 shockPct < -20
 ? "text-loss"
 : shockPct < -10
 ? "text-warning"
 : "text-muted-foreground",
 )}
 >
 {shockPct === 0 ? "None" : `${shockPct.toFixed(0)}%`}
 </span>
 </div>
 <input
 type="range"
 min={-50}
 max={0}
 step={1}
 value={shockPct}
 onChange={(e) => setShockPct(Number(e.target.value))}
 className="w-full accent-primary"
 />
 <div className="flex justify-between text-[11px] text-muted-foreground/60">
 <span>-50% crash</span>
 <span>0% no change</span>
 </div>
 </div>

 {/* Shocked equity impact */}
 <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
 <div className="flex items-center justify-between col-span-2">
 <span className="text-muted-foreground">
 Equity After Shock
 </span>
 <span
 className={cn(
 "tabular-nums font-semibold",
 correctedShockedEquity < maintenanceReq &&
 maintenanceReq > 0
 ? "text-loss"
 : correctedShockedEquity < maintenanceReq * 1.5 &&
 maintenanceReq > 0
 ? "text-warning"
 : "text-profit",
 )}
 >
 {formatCurrency(correctedShockedEquity)}
 </span>
 </div>
 <div className="flex items-center justify-between col-span-2">
 <span className="text-muted-foreground">Loss</span>
 <span className="tabular-nums text-loss">
 {formatCurrency(
 Math.min(0, correctedShockedEquity - equity),
 )}
 </span>
 </div>
 {maintenanceReq > 0 && (
 <div className="flex items-center justify-between col-span-2">
 <span className="text-muted-foreground">Status</span>
 <span
 className={cn(
 "text-xs font-semibold px-1.5 py-0.5 rounded",
 correctedShockedEquity < maintenanceReq
 ? "bg-loss/20 text-loss"
 : correctedShockedEquity < maintenanceReq * 1.5
 ? "bg-warning/20 text-warning"
 : "bg-profit/20 text-profit",
 )}
 >
 {correctedShockedEquity < maintenanceReq
 ? "MARGIN CALL TRIGGERED"
 : correctedShockedEquity < maintenanceReq * 1.5
 ? "WARNING ZONE"
 : "SAFE"}
 </span>
 </div>
 )}
 </div>

 {/* Margin call trigger drop */}
 {marginCallDrop !== null && (
 <div className="rounded-md bg-loss/10 border border-loss/30 px-2 py-2 text-xs text-loss">
 <AlertTriangle className="inline h-3 w-3 mr-1" />
 Margin call triggers at approximately{" "}
 <span className="font-semibold">
 {marginCallDrop.toFixed(1)}%
 </span>{" "}
 market decline with current positions.
 </div>
 )}

 {/* Liquidation cascade */}
 {liquidationOrder.length > 0 && (
 <div>
 <div className="text-xs font-medium text-muted-foreground mb-1">
 Liquidation Order (largest first)
 </div>
 <div className="space-y-1">
 {liquidationOrder.map((p, i) => (
 <div
 key={`liq-${p.ticker}-${i}`}
 className="flex items-center justify-between rounded bg-muted/30 px-2 py-1 text-xs"
 >
 <span className="text-muted-foreground">
 #{i + 1}
 </span>
 <span
 className={cn(
 "font-semibold",
 p.side === "short"
 ? "text-short"
 : "text-foreground",
 )}
 >
 {p.ticker}{" "}
 <span className="text-[11px] text-muted-foreground">
 {p.side.toUpperCase()}
 </span>
 </span>
 <span className="tabular-nums">
 {formatCurrency(p.quantity * p.currentPrice)}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Historical margin call examples */}
 <div>
 <div className="text-xs font-medium text-muted-foreground mb-1.5">
 Historical Margin Events
 </div>
 <div className="space-y-1.5">
 {SHOCK_SCENARIOS.map((s) => (
 <div
 key={s.year}
 className="rounded-md border border-border bg-muted/20 p-2 text-xs"
 >
 <div className="flex items-center justify-between mb-0.5">
 <span className="font-semibold text-foreground">
 {s.label} ({s.year})
 </span>
 <span className="text-loss font-semibold">
 -{s.maxDrop}%
 </span>
 </div>
 <p className="text-muted-foreground leading-snug">
 {s.description}
 </p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* ═══════════════════════════════════════════════════════
 SECTION 5: Short Selling Education
 ═══════════════════════════════════════════════════════ */}
 <div>
 <SectionHeader
 icon={BookOpen}
 title="Short Selling Education"
 expanded={expandedSections.education}
 onToggle={() => toggleSection("education")}
 />
 <AnimatePresence initial={false}>
 {expandedSections.education && (
 <motion.div
 key="education"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="overflow-hidden"
 >
 <div className="px-3 pb-3 space-y-3 text-xs">
 {/* How short selling works */}
 <div className="space-y-1.5">
 <div className="font-semibold text-xs text-foreground">
 How Short Selling Works
 </div>
 <div className="flex flex-col gap-0.5">
 {[
 {
 step: "1. Borrow",
 desc: "Broker locates shares and lends them to you. You pay a daily borrow fee.",
 },
 {
 step: "2. Sell",
 desc: "You sell the borrowed shares at the current market price and receive cash.",
 },
 {
 step: "3. Wait",
 desc: "If the stock falls, your short position gains value. If it rises, you lose.",
 },
 {
 step: "4. Buy Back",
 desc: "You buy shares in the market to close (\"cover\") the short position.",
 },
 {
 step: "5. Return",
 desc: "The purchased shares are returned to the lender. P&L = entry - exit (minus fees).",
 },
 ].map((item) => (
 <div
 key={item.step}
 className="flex gap-2 rounded bg-muted/30 px-2 py-1.5"
 >
 <span className="font-semibold text-short shrink-0 w-12">
 {item.step}
 </span>
 <span className="text-muted-foreground leading-snug">
 {item.desc}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Unique risks */}
 <div className="space-y-1.5">
 <div className="font-semibold text-xs text-foreground flex items-center gap-1">
 <AlertTriangle className="h-3 w-3 text-warning" />
 Risks Unique to Short Selling
 </div>
 {[
 {
 risk: "Unlimited Downside",
 detail:
 "A long position can only lose 100%. A short position has theoretically unlimited loss — a stock can rise 500%, 1000%, or more.",
 },
 {
 risk: "Short Squeeze",
 detail:
 "When price rises, shorts must cover, which drives price higher, forcing more shorts to cover. This feedback loop can cause explosive vertical moves.",
 },
 {
 risk: "Borrow Recall",
 detail:
 "Your broker can recall the loaned shares at any time, forcing you to cover at the current market price regardless of your P&L.",
 },
 {
 risk: "Dividend Risk",
 detail:
 "If a company pays a dividend while you are short, you must pay that dividend to the lender out of pocket — adding to your cost.",
 },
 ].map((item) => (
 <div
 key={item.risk}
 className="rounded-md border border-warning/20 bg-warning/5 px-2 py-1.5"
 >
 <div className="font-semibold text-warning mb-0.5">
 {item.risk}
 </div>
 <p className="text-muted-foreground leading-snug">
 {item.detail}
 </p>
 </div>
 ))}
 </div>

 {/* The Big Short case study */}
 <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 space-y-1.5">
 <div className="font-semibold text-xs text-primary flex items-center gap-1">
 <Info className="h-3 w-3" />
 Case Study: The Big Short (2007–2008)
 </div>
 <p className="text-muted-foreground leading-snug">
 Michael Burry (Scion Capital) studied mortgage loan data in
 2005 and concluded the U.S. housing market was built on
 fraudulent, subprime loans set to default. Rather than
 shorting home-builder stocks (limited float, high borrow
 cost), he created <span className="text-foreground font-medium">Credit Default Swaps (CDS)</span> — essentially
 insurance on mortgage-backed securities (MBS).
 </p>
 <p className="text-muted-foreground leading-snug">
 Burry paid ~$100M in annual premiums for 2 years while
 markets continued rising and investors demanded he unwind.
 When the housing market collapsed in 2007–2008, his fund
 returned <span className="text-profit font-semibold">489%</span> — a
 $700M profit on a $1B fund.
 </p>
 <div className="flex gap-2 text-[11px]">
 <span className="rounded bg-muted/40 px-1.5 py-0.5 text-muted-foreground">
 Instrument: CDS on MBS tranches
 </span>
 <span className="rounded bg-profit/10 px-1.5 py-0.5 text-profit">
 +489% return
 </span>
 </div>
 </div>

 {/* Locate requirements */}
 <div className="rounded-md bg-muted/30 border border-border p-2 space-y-1">
 <div className="font-semibold text-foreground">
 Locate Requirements & Hard-to-Borrow
 </div>
 <p className="text-muted-foreground leading-snug">
 Before executing a short sale, your broker must locate
 shares to borrow (SEC Regulation SHO). Stocks are
 classified as:
 </p>
 <div className="space-y-1 mt-1">
 {[
 {
 label: "Easy-to-Borrow (ETB)",
 desc: "Readily available, low borrow rates (0.25–1%). Large-cap liquid stocks.",
 color: "#10b981",
 },
 {
 label: "Hard-to-Borrow (HTB)",
 desc: "Limited supply. Rates can reach 50–100%+/yr. Broker may not allow shorting.",
 color: "#f59e0b",
 },
 {
 label: "Threshold Securities",
 desc: "Stocks with persistent fail-to-deliver. SEC restricts short selling via Rule 203.",
 color: "#ef4444",
 },
 ].map((item) => (
 <div
 key={item.label}
 className="flex gap-2"
 >
 <span
 className="font-medium shrink-0"
 style={{ color: item.color }}
 >
 {item.label}:
 </span>
 <span className="text-muted-foreground leading-snug">
 {item.desc}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
}
