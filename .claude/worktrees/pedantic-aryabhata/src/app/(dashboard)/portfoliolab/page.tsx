"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
 TrendingUp,
 BarChart3,
 Activity,
 Scale,
 RefreshCw,
 Target,
 DollarSign,
 Info,
 ChevronUp,
 ChevronDown,
 Sliders,
 PieChart,
} from "lucide-react";
import {
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
} from "@/components/ui/tabs";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────
let s = 830;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface Portfolio {
 vol: number;
 ret: number;
 sharpe: number;
 weights: number[];
}

interface EfficientPoint {
 vol: number;
 ret: number;
}

interface Asset {
 name: string;
 ticker: string;
 color: string;
 expectedReturn: number; // %
 vol: number; // %
 marketCapWeight: number; // %
}

interface BLView {
 asset: string;
 expectedReturn: number; // user's view in %
 confidence: number; // 0–100
}

interface RiskBudgetAsset {
 name: string;
 ticker: string;
 color: string;
 weight: number;
 riskBudget: number;
 marginalRisk: number;
 riskContrib: number;
}

interface RebalancePoint {
 month: number;
 thresholdWeight: number;
 calendarWeight: number;
 driftWeight: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ASSETS: Asset[] = [
 { name: "US Equities", ticker: "VTI", color: "#6366f1", expectedReturn: 9.2, vol: 16.1, marketCapWeight: 42 },
 { name: "Intl Equities", ticker: "VXUS", color: "#8b5cf6", expectedReturn: 7.8, vol: 18.4, marketCapWeight: 28 },
 { name: "US Bonds", ticker: "BND", color: "#06b6d4", expectedReturn: 3.6, vol: 5.8, marketCapWeight: 18 },
 { name: "Real Estate", ticker: "VNQ", color: "#10b981", expectedReturn: 7.1, vol: 20.2, marketCapWeight: 7 },
 { name: "Commodities", ticker: "GSG", color: "#f59e0b", expectedReturn: 4.9, vol: 22.7, marketCapWeight: 5 },
];

// ── Data Generation ───────────────────────────────────────────────────────────

function generatePortfolios(): Portfolio[] {
 const portfolios: Portfolio[] = [];
 for (let i = 0; i < 50; i++) {
 const raw = ASSETS.map(() => rand());
 const sum = raw.reduce((a, b) => a + b, 0);
 const weights = raw.map(w => w / sum);

 const ret = weights.reduce((acc, w, j) => acc + w * ASSETS[j].expectedReturn, 0);
 // Simplified vol: weighted avg + diversification discount
 const baseVol = weights.reduce((acc, w, j) => acc + w * ASSETS[j].vol, 0);
 const diversification = 0.65 + rand() * 0.2;
 const vol = baseVol * diversification;
 const sharpe = (ret - 3.5) / vol;

 portfolios.push({ vol, ret, sharpe, weights });
 }
 return portfolios;
}

function generateEfficientFrontier(): EfficientPoint[] {
 const points: EfficientPoint[] = [];
 // Min-variance to max-return, roughly parabolic
 for (let i = 0; i <= 20; i++) {
 const t = i / 20;
 const vol = 5.5 + t * 18.5; // 5.5% to 24%
 // Efficient frontier shape: concave curve
 const ret = 3.8 + 8.2 * Math.sqrt(Math.max(0, (vol - 5.5) / 18.5));
 points.push({ vol, ret });
 }
 return points;
}

function generateBLData() {
 // Prior (market implied) returns
 const prior = ASSETS.map(a => a.expectedReturn);

 // BL posterior with views blended in
 const posterior = prior.map((p, i) => {
 const viewAdj = (rand() - 0.5) * 2.5;
 return parseFloat((p + viewAdj).toFixed(2));
 });

 // Optimal BL weights vs market cap
 const blWeights = ASSETS.map((a, i) => {
 const adj = (posterior[i] - prior[i]) / prior[i];
 return parseFloat(Math.max(2, Math.min(50, a.marketCapWeight * (1 + adj))).toFixed(1));
 });
 const total = blWeights.reduce((a, b) => a + b, 0);
 const normBLWeights = blWeights.map(w => parseFloat((w / total * 100).toFixed(1)));

 return { prior, posterior, blWeights: normBLWeights };
}

function generateRiskBudgetData(): RiskBudgetAsset[] {
 const assets = ASSETS.map((a, i) => {
 const weight = a.marketCapWeight / 100;
 const marginalRisk = a.vol * (0.7 + rand() * 0.6);
 const riskContrib = weight * marginalRisk;
 return {
 name: a.name,
 ticker: a.ticker,
 color: a.color,
 weight: a.marketCapWeight,
 riskBudget: 0, // set below
 marginalRisk: parseFloat(marginalRisk.toFixed(2)),
 riskContrib: parseFloat(riskContrib.toFixed(2)),
 };
 });

 const totalRisk = assets.reduce((s, a) => s + a.riskContrib, 0);
 assets.forEach(a => {
 a.riskBudget = parseFloat((a.riskContrib / totalRisk * 100).toFixed(1));
 });

 return assets;
}

function generateRebalanceData(): RebalancePoint[] {
 const points: RebalancePoint[] = [];
 let threshold = 60;
 let calendar = 60;
 let drift = 60;

 for (let m = 0; m <= 24; m++) {
 const mktMove = (rand() - 0.48) * 4;
 drift += mktMove;

 // Calendar rebalances every 12 months
 if (m > 0 && m % 12 === 0) {
 calendar = 60 + (rand() - 0.5) * 2;
 } else {
 calendar += mktMove * 0.9;
 }

 // Threshold rebalances when drift > 5%
 threshold += mktMove * 0.85;
 if (Math.abs(threshold - 60) > 5) {
 threshold = 60 + (threshold > 60 ? 1.5 : -1.5);
 }

 points.push({
 month: m,
 thresholdWeight: parseFloat(threshold.toFixed(2)),
 calendarWeight: parseFloat(calendar.toFixed(2)),
 driftWeight: parseFloat(drift.toFixed(2)),
 });
 }
 return points;
}

// ── Pre-generate data (stable across renders) ─────────────────────────────────
const PORTFOLIOS = generatePortfolios();
const EFFICIENT_FRONTIER = generateEfficientFrontier();
const BL_DATA = generateBLData();
const RISK_BUDGET_DATA = generateRiskBudgetData();
const REBALANCE_DATA = generateRebalanceData();

// ── Derived metrics ───────────────────────────────────────────────────────────
const MIN_VAR_PORT = PORTFOLIOS.reduce((best, p) => p.vol < best.vol ? p : best, PORTFOLIOS[0]);
const MAX_SHARPE_PORT = PORTFOLIOS.reduce((best, p) => p.sharpe > best.sharpe ? p : best, PORTFOLIOS[0]);
const CURRENT_PORT: Portfolio = {
 vol: 11.4,
 ret: 7.2,
 sharpe: (7.2 - 3.5) / 11.4,
 weights: [0.4, 0.2, 0.25, 0.1, 0.05],
};
const CML_SLOPE = (MAX_SHARPE_PORT.ret - 3.5) / MAX_SHARPE_PORT.vol;

// ── SVG helpers ───────────────────────────────────────────────────────────────
const W = 480;
const H = 300;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };

function toX(vol: number, minV: number, maxV: number) {
 return PAD.left + ((vol - minV) / (maxV - minV)) * (W - PAD.left - PAD.right);
}
function toY(ret: number, minR: number, maxR: number) {
 return H - PAD.bottom - ((ret - minR) / (maxR - minR)) * (H - PAD.top - PAD.bottom);
}

// ── Components ────────────────────────────────────────────────────────────────

function EfficientFrontierTab() {
 const [hovered, setHovered] = useState<number | null>(null);

 const allVols = [...PORTFOLIOS.map(p => p.vol), ...EFFICIENT_FRONTIER.map(p => p.vol)];
 const allRets = [...PORTFOLIOS.map(p => p.ret), ...EFFICIENT_FRONTIER.map(p => p.ret)];
 const minV = Math.min(...allVols) - 1;
 const maxV = Math.max(...allVols) + 1;
 const minR = Math.min(...allRets) - 0.5;
 const maxR = Math.max(...allRets) + 0.5;

 const frontierPath = EFFICIENT_FRONTIER.map((p, i) =>
 `${i === 0 ? "M" : "L"}${toX(p.vol, minV, maxV).toFixed(1)},${toY(p.ret, minR, maxR).toFixed(1)}`
 ).join(" ");

 // CML: from risk-free rate at vol=0 through max-Sharpe
 const cmlStart = { vol: 0, ret: 3.5 };
 const cmlEnd = { vol: maxV, ret: 3.5 + CML_SLOPE * maxV };
 const x1 = toX(cmlStart.vol, minV, maxV);
 const y1 = toY(cmlStart.ret, minR, maxR);
 const x2 = toX(cmlEnd.vol, minV, maxV);
 const y2 = toY(cmlEnd.ret, minR, maxR);

 // Y-axis ticks
 const yTicks = [4, 6, 8, 10, 12];
 // X-axis ticks
 const xTicks = [5, 10, 15, 20, 25];

 const hoveredPort = hovered !== null ? PORTFOLIOS[hovered] : null;

 return (
 <div className="space-y-4">
 {/* Metrics row */}
 <div className="grid grid-cols-3 gap-3">
 {[
 { label: "Current Sharpe", value: CURRENT_PORT.sharpe.toFixed(2), sub: "Your portfolio", color: "text-primary" },
 { label: "Max Sharpe", value: MAX_SHARPE_PORT.sharpe.toFixed(2), sub: `Vol ${MAX_SHARPE_PORT.vol.toFixed(1)}% / Ret ${MAX_SHARPE_PORT.ret.toFixed(1)}%`, color: "text-emerald-400" },
 { label: "Min Variance", value: `${MIN_VAR_PORT.vol.toFixed(1)}%`, sub: `Return ${MIN_VAR_PORT.ret.toFixed(1)}%`, color: "text-primary" },
 ].map(m => (
 <Card key={m.label} className="bg-muted/30 border-border">
 <CardContent className="p-3">
 <p className="text-xs text-muted-foreground">{m.label}</p>
 <p className={`text-lg font-semibold ${m.color}`}>{m.value}</p>
 <p className="text-xs text-muted-foreground">{m.sub}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* SVG chart */}
 <Card className="mt-8 bg-muted/30 border-border border-l-4 border-l-primary">
 <CardHeader className="pb-2 p-4">
 <CardTitle className="text-lg font-medium flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-indigo-400" />
 Efficient Frontier — Risk vs Return
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="relative">
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
 {/* Grid lines */}
 {yTicks.map(r => (
 <line
 key={r}
 x1={PAD.left} y1={toY(r, minR, maxR)}
 x2={W - PAD.right} y2={toY(r, minR, maxR)}
 stroke="rgba(255,255,255,0.06)" strokeWidth={1}
 />
 ))}
 {xTicks.map(v => (
 <line
 key={v}
 x1={toX(v, minV, maxV)} y1={PAD.top}
 x2={toX(v, minV, maxV)} y2={H - PAD.bottom}
 stroke="rgba(255,255,255,0.06)" strokeWidth={1}
 />
 ))}

 {/* Axis labels */}
 {yTicks.map(r => (
 <text key={r} x={PAD.left - 6} y={toY(r, minR, maxR) + 4} textAnchor="end" fontSize={9} fill="rgba(255,255,255,0.4)">{r}%</text>
 ))}
 {xTicks.map(v => (
 <text key={v} x={toX(v, minV, maxV)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">{v}%</text>
 ))}

 <text x={PAD.left - 38} y={H / 2} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)" transform={`rotate(-90,${PAD.left - 38},${H / 2})`}>Return</text>
 <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.4)">Volatility</text>

 {/* CML */}
 <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.7} />

 {/* Efficient frontier curve */}
 <path d={frontierPath} fill="none" stroke="#6366f1" strokeWidth={2.5} />

 {/* Random portfolios */}
 {PORTFOLIOS.map((p, i) => {
 const cx = toX(p.vol, minV, maxV);
 const cy = toY(p.ret, minR, maxR);
 const isHov = hovered === i;
 return (
 <circle
 key={i}
 cx={cx} cy={cy} r={isHov ? 6 : 4}
 fill={`hsl(${220 + p.sharpe * 40},70%,60%)`}
 fillOpacity={isHov ? 1 : 0.6}
 stroke={isHov ? "white" : "none"}
 strokeWidth={1.5}
 style={{ cursor: "pointer" }}
 onMouseEnter={() => setHovered(i)}
 onMouseLeave={() => setHovered(null)}
 />
 );
 })}

 {/* Min-variance dot */}
 <circle cx={toX(MIN_VAR_PORT.vol, minV, maxV)} cy={toY(MIN_VAR_PORT.ret, minR, maxR)} r={7} fill="none" stroke="#a78bfa" strokeWidth={2} />
 <circle cx={toX(MIN_VAR_PORT.vol, minV, maxV)} cy={toY(MIN_VAR_PORT.ret, minR, maxR)} r={4} fill="#a78bfa" />

 {/* Max-Sharpe dot */}
 <circle cx={toX(MAX_SHARPE_PORT.vol, minV, maxV)} cy={toY(MAX_SHARPE_PORT.ret, minR, maxR)} r={7} fill="none" stroke="#10b981" strokeWidth={2} />
 <circle cx={toX(MAX_SHARPE_PORT.vol, minV, maxV)} cy={toY(MAX_SHARPE_PORT.ret, minR, maxR)} r={4} fill="#10b981" />

 {/* Current portfolio dot */}
 <circle cx={toX(CURRENT_PORT.vol, minV, maxV)} cy={toY(CURRENT_PORT.ret, minR, maxR)} r={7} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
 <circle cx={toX(CURRENT_PORT.vol, minV, maxV)} cy={toY(CURRENT_PORT.ret, minR, maxR)} r={4} fill="#3b82f6" />
 </svg>

 {/* Hover tooltip */}
 {hoveredPort && (
 <div className="absolute top-2 right-2 bg-background/90 border border-border rounded p-2 text-xs text-muted-foreground space-y-1 pointer-events-none">
 <p className="font-semibold text-foreground">Portfolio</p>
 <p className="text-muted-foreground">Vol: <span className="text-foreground">{hoveredPort.vol.toFixed(1)}%</span></p>
 <p className="text-muted-foreground">Ret: <span className="text-foreground">{hoveredPort.ret.toFixed(1)}%</span></p>
 <p className="text-muted-foreground">Sharpe: <span className="text-emerald-400">{hoveredPort.sharpe.toFixed(2)}</span></p>
 </div>
 )}
 </div>

 {/* Legend */}
 <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
 {[
 { color: "#6366f1", label: "Efficient Frontier" },
 { color: "#f59e0b", label: "Capital Market Line", dash: true },
 { color: "#3b82f6", label: "Current Portfolio" },
 { color: "#10b981", label: "Max Sharpe" },
 { color: "#a78bfa", label: "Min Variance" },
 ].map(l => (
 <span key={l.label} className="flex items-center gap-1.5">
 <span
 className="inline-block rounded-full"
 style={{
 width: 10, height: 10,
 background: l.color,
 border: l.dash ? `2px dashed ${l.color}` : undefined,
 opacity: l.dash ? 0.8 : 1,
 }}
 />
 {l.label}
 </span>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Asset allocation table */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Max-Sharpe Portfolio Weights</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {ASSETS.map((a, i) => {
 const w = MAX_SHARPE_PORT.weights[i] * 100;
 return (
 <div key={a.ticker} className="flex items-center gap-3">
 <span className="w-28 text-xs font-medium text-foreground truncate">{a.name}</span>
 <div className="flex-1 bg-muted rounded-full h-2">
 <div className="h-2 rounded-full" style={{ width: `${w}%`, background: a.color }} />
 </div>
 <span className="w-12 text-xs text-right text-muted-foreground">{w.toFixed(1)}%</span>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

function BlackLittermanTab() {
 const [views, setViews] = useState<BLView[]>([
 { asset: "US Equities", expectedReturn: 11.0, confidence: 70 },
 { asset: "Intl Equities", expectedReturn: 6.5, confidence: 50 },
 { asset: "Real Estate", expectedReturn: 8.5, confidence: 40 },
 ]);

 // Compute blended posterior given views
 const blended = useMemo(() => {
 return ASSETS.map((a, i) => {
 const view = views.find(v => v.asset === a.name);
 if (!view) return { prior: BL_DATA.prior[i], posterior: BL_DATA.posterior[i] };
 const conf = view.confidence / 100;
 const posterior = a.expectedReturn * (1 - conf) + view.expectedReturn * conf;
 return { prior: a.expectedReturn, posterior: parseFloat(posterior.toFixed(2)) };
 });
 }, [views]);

 const maxRet = Math.max(...blended.map(b => Math.max(b.prior, b.posterior))) + 1;
 const BAR_W = 340;
 const BAR_H = 200;
 const barPad = { top: 16, right: 16, bottom: 28, left: 90 };
 const barWidth = (BAR_W - barPad.left - barPad.right) / (ASSETS.length * 2 + ASSETS.length - 1);
 const groupWidth = barWidth * 2 + barWidth; // 2 bars + gap

 function retToY(v: number) {
 return BAR_H - barPad.bottom - (v / maxRet) * (BAR_H - barPad.top - barPad.bottom);
 }
 function retToHeight(v: number) {
 return (v / maxRet) * (BAR_H - barPad.top - barPad.bottom);
 }

 return (
 <div className="space-y-4">
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Info className="h-4 w-4 text-indigo-400" />
 Black-Litterman Model
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-muted-foreground leading-relaxed">
 The Black-Litterman model combines market equilibrium (CAPM) returns with investor views to produce
 a posterior estimate. Adjust views and confidence below — the model blends your views with market-implied returns.
 </p>
 </CardContent>
 </Card>

 {/* Views input */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Sliders className="h-3.5 w-3.5 text-muted-foreground/50" />
 Investor Views
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-5">
 {views.map((view, vi) => (
 <div key={view.asset} className="space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-foreground">{view.asset}</span>
 <div className="flex items-center gap-3">
 <Badge variant="outline" className="text-xs text-muted-foreground">
 View: {view.expectedReturn.toFixed(1)}%
 </Badge>
 <Badge variant="outline" className="text-xs text-primary border-primary/40">
 Conf: {view.confidence}%
 </Badge>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-xs text-muted-foreground mb-1.5">Expected Return ({view.expectedReturn.toFixed(1)}%)</p>
 <Slider
 value={[view.expectedReturn]}
 min={0}
 max={20}
 step={0.5}
 onValueChange={([v]) => setViews(prev => prev.map((vw, i) => i === vi ? { ...vw, expectedReturn: v } : vw))}
 className="w-full"
 />
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-1.5">Confidence ({view.confidence}%)</p>
 <Slider
 value={[view.confidence]}
 min={0}
 max={100}
 step={5}
 onValueChange={([v]) => setViews(prev => prev.map((vw, i) => i === vi ? { ...vw, confidence: v } : vw))}
 className="w-full"
 />
 </div>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Prior vs Posterior bar chart */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Prior vs Posterior Expected Returns</CardTitle>
 </CardHeader>
 <CardContent>
 <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} className="w-full" style={{ maxHeight: 220 }}>
 {/* Y-axis ticks */}
 {[0, 3, 6, 9, 12].map(r => {
 const y = retToY(r);
 return (
 <g key={r}>
 <line x1={barPad.left} y1={y} x2={BAR_W - barPad.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
 <text x={barPad.left - 6} y={y + 4} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.4)">{r}%</text>
 </g>
 );
 })}

 {/* Bars */}
 {ASSETS.map((a, i) => {
 const { prior, posterior } = blended[i];
 const gx = barPad.left + i * groupWidth;
 const bw = barWidth * 0.9;
 return (
 <g key={a.ticker}>
 {/* Prior bar */}
 <rect
 x={gx}
 y={retToY(prior)}
 width={bw}
 height={retToHeight(prior)}
 fill={a.color}
 opacity={0.5}
 rx={2}
 />
 {/* Posterior bar */}
 <rect
 x={gx + barWidth}
 y={retToY(posterior)}
 width={bw}
 height={retToHeight(posterior)}
 fill={a.color}
 opacity={0.9}
 rx={2}
 />
 {/* Asset label */}
 <text
 x={gx + barWidth}
 y={BAR_H - barPad.bottom + 12}
 textAnchor="middle"
 fontSize={7.5}
 fill="rgba(255,255,255,0.5)"
 >
 {a.ticker}
 </text>
 </g>
 );
 })}
 </svg>

 <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
 <span className="flex items-center gap-1.5">
 <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500 opacity-50" />
 Prior (CAPM)
 </span>
 <span className="flex items-center gap-1.5">
 <span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" />
 Posterior (BL)
 </span>
 </div>
 </CardContent>
 </Card>

 {/* Optimal weights */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium">Optimal BL Weights vs Market-Cap Weights</CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {ASSETS.map((a, i) => {
 const blW = BL_DATA.blWeights[i];
 const mcW = a.marketCapWeight;
 const diff = blW - mcW;
 return (
 <div key={a.ticker} className="space-y-1">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span className="font-medium text-foreground">{a.name}</span>
 <div className="flex items-center gap-2">
 <span className="text-muted-foreground">MktCap: {mcW}%</span>
 <span className="font-semibold" style={{ color: a.color }}>BL: {blW}%</span>
 <span className={`flex items-center ${diff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
 {diff >= 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
 {Math.abs(diff).toFixed(1)}%
 </span>
 </div>
 </div>
 <div className="relative h-2 bg-muted rounded-full">
 <div
 className="absolute h-2 rounded-full opacity-40"
 style={{ width: `${mcW}%`, background: a.color }}
 />
 <div
 className="absolute h-2 rounded-full"
 style={{ width: `${blW}%`, background: a.color }}
 />
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>
 </div>
 );
}

function RiskBudgetingTab() {
 const [budgets, setBudgets] = useState(
 RISK_BUDGET_DATA.map(a => ({ name: a.name, budget: 20 })) // equal risk budget
 );

 const totalRiskContrib = RISK_BUDGET_DATA.reduce((s, a) => s + a.riskContrib, 0);

 // Pie chart
 const PIE_R = 80;
 const PIE_CX = 120;
 const PIE_CY = 110;

 function buildPieSlices() {
 let startAngle = -Math.PI / 2;
 return RISK_BUDGET_DATA.map(a => {
 const pct = a.riskContrib / totalRiskContrib;
 const angle = pct * 2 * Math.PI;
 const endAngle = startAngle + angle;
 const x1 = PIE_CX + PIE_R * Math.cos(startAngle);
 const y1 = PIE_CY + PIE_R * Math.sin(startAngle);
 const x2 = PIE_CX + PIE_R * Math.cos(endAngle);
 const y2 = PIE_CY + PIE_R * Math.sin(endAngle);
 const largeArc = angle > Math.PI ? 1 : 0;
 const d = `M ${PIE_CX} ${PIE_CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${PIE_R} ${PIE_R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
 const midAngle = startAngle + angle / 2;
 const labelR = PIE_R * 0.68;
 const lx = PIE_CX + labelR * Math.cos(midAngle);
 const ly = PIE_CY + labelR * Math.sin(midAngle);
 startAngle = endAngle;
 return { d, color: a.color, lx, ly, pct, name: a.name };
 });
 }

 const slices = buildPieSlices();

 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Risk Contribution Pie */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <PieChart className="h-4 w-4 text-emerald-400" />
 Risk Contribution Breakdown
 </CardTitle>
 </CardHeader>
 <CardContent>
 <svg viewBox="0 0 240 220" className="w-full" style={{ maxHeight: 220 }}>
 {slices.map((sl, i) => (
 <g key={i}>
 <path d={sl.d} fill={sl.color} opacity={0.85} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
 {sl.pct > 0.08 && (
 <text x={sl.lx} y={sl.ly} textAnchor="middle" fontSize={8} fill="white" fontWeight="bold">
 {(sl.pct * 100).toFixed(0)}%
 </text>
 )}
 </g>
 ))}
 {/* Legend */}
 {RISK_BUDGET_DATA.map((a, i) => (
 <g key={a.ticker}>
 <rect x={168} y={30 + i * 22} width={10} height={10} fill={a.color} rx={2} />
 <text x={182} y={39 + i * 22} fontSize={8.5} fill="rgba(255,255,255,0.7)">
 {a.ticker} {a.riskBudget.toFixed(1)}%
 </text>
 </g>
 ))}
 </svg>
 </CardContent>
 </Card>

 {/* Marginal Risk Contribution */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Activity className="h-3.5 w-3.5 text-muted-foreground/50" />
 Marginal Risk Contribution
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {RISK_BUDGET_DATA.map(a => (
 <div key={a.ticker} className="space-y-1">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span className="font-medium text-foreground">{a.ticker}</span>
 <span className="text-muted-foreground">MRC: <span className="text-foreground font-semibold">{a.marginalRisk.toFixed(2)}%</span></span>
 </div>
 <div className="flex items-center gap-2">
 <Progress value={a.marginalRisk / 0.25} className="flex-1 h-1.5" />
 <span className="text-xs text-muted-foreground w-14 text-right">
 RC: {a.riskContrib.toFixed(2)}%
 </span>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>

 {/* Equal risk contribution vs equal weight */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Scale className="h-3.5 w-3.5 text-muted-foreground/50" />
 Equal Risk Contribution vs Equal Weight
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 {RISK_BUDGET_DATA.map(a => {
 const eqW = 20; // equal weight 20%
 const ercW = (1 / (a.marginalRisk / RISK_BUDGET_DATA.reduce((s, x) => s + 1 / x.marginalRisk, 0) / 100));
 const normalizedERC = Math.min(60, Math.max(5, ercW));
 return (
 <div key={a.ticker} className="space-y-0.5">
 <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
 <span className="font-medium text-foreground w-24">{a.name}</span>
 <div className="flex gap-3">
 <span className="text-muted-foreground">EW: {eqW}%</span>
 <span style={{ color: a.color }}>ERC: {normalizedERC.toFixed(1)}%</span>
 </div>
 </div>
 <div className="relative h-3 bg-muted rounded-full overflow-hidden">
 <div
 className="absolute h-3 rounded-full opacity-35"
 style={{ width: `${eqW}%`, background: a.color }}
 />
 <div
 className="absolute h-3 rounded-full"
 style={{ width: `${normalizedERC}%`, background: a.color }}
 />
 </div>
 </div>
 );
 })}
 </CardContent>
 </Card>

 {/* Risk budget sliders */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Sliders className="h-4 w-4 text-amber-400" />
 Custom Risk Budget
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {budgets.map((b, i) => {
 const a = RISK_BUDGET_DATA[i];
 return (
 <div key={b.name} className="space-y-1.5">
 <div className="flex items-center justify-between text-xs text-muted-foreground">
 <span className="font-medium text-foreground">{b.name}</span>
 <Badge variant="outline" style={{ borderColor: a.color + "66", color: a.color }} className="text-xs">
 {b.budget}% risk budget
 </Badge>
 </div>
 <Slider
 value={[b.budget]}
 min={5}
 max={50}
 step={5}
 onValueChange={([v]) => setBudgets(prev => prev.map((bx, j) => j === i ? { ...bx, budget: v } : bx))}
 className="w-full"
 />
 </div>
 );
 })}
 <div className="text-xs text-muted-foreground text-right">
 Total: <span className={budgets.reduce((s, b) => s + b.budget, 0) !== 100 ? "text-amber-400" : "text-emerald-400"}>
 {budgets.reduce((s, b) => s + b.budget, 0)}%
 </span>
 {budgets.reduce((s, b) => s + b.budget, 0) !== 100 && " (must sum to 100%)"}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

function RebalancingTab() {
 const [selectedStrategy, setSelectedStrategy] = useState<"threshold" | "calendar" | "drift">("threshold");

 const svgW = 480;
 const svgH = 220;
 const linePad = { top: 16, right: 20, bottom: 36, left: 46 };

 const allWeights = REBALANCE_DATA.flatMap(p => [p.thresholdWeight, p.calendarWeight, p.driftWeight]);
 const minW = Math.min(...allWeights) - 2;
 const maxW = Math.max(...allWeights) + 2;

 function mx(month: number) {
 return linePad.left + (month / 24) * (svgW - linePad.left - linePad.right);
 }
 function mw(w: number) {
 return svgH - linePad.bottom - ((w - minW) / (maxW - minW)) * (svgH - linePad.top - linePad.bottom);
 }

 function buildLinePath(key: keyof RebalancePoint) {
 return REBALANCE_DATA.map((p, i) =>
 `${i === 0 ? "M" : "L"}${mx(p.month).toFixed(1)},${mw(p[key] as number).toFixed(1)}`
 ).join(" ");
 }

 const STRATEGIES = [
 { key: "threshold" as const, label: "Threshold", color: "#6366f1", desc: "Rebalance when drift exceeds ±5%" },
 { key: "calendar" as const, label: "Calendar", color: "#10b981", desc: "Rebalance every 12 months" },
 { key: "drift" as const, label: "No Rebal", color: "#ef4444", desc: "Allow portfolio to drift freely" },
 ];

 const yTicks = [55, 60, 65, 70, 75].filter(t => t >= minW - 1 && t <= maxW + 1);
 const monthLabels = [0, 6, 12, 18, 24];

 // Transaction cost analysis
 const txCosts = [
 { strategy: "Threshold", trades: 7, costBps: 14, annualDrag: 0.14 },
 { strategy: "Calendar", trades: 2, costBps: 4, annualDrag: 0.04 },
 { strategy: "Monthly", trades: 24, costBps: 48, annualDrag: 0.48 },
 { strategy: "No Rebal", trades: 0, costBps: 0, annualDrag: 0.00 },
 ];

 return (
 <div className="space-y-4">
 {/* Strategy selector */}
 <div className="flex gap-2 flex-wrap">
 {STRATEGIES.map(s => (
 <Button
 key={s.key}
 variant={selectedStrategy === s.key ? "default" : "outline"}
 size="sm"
 className="text-xs text-muted-foreground"
 style={selectedStrategy === s.key ? { background: s.color, borderColor: s.color } : {}}
 onClick={() => setSelectedStrategy(s.key)}
 >
 {s.label}
 </Button>
 ))}
 </div>

 {/* Drift simulation chart */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <RefreshCw className="h-4 w-4 text-indigo-400" />
 Portfolio Weight Drift — 24 Month Simulation
 </CardTitle>
 </CardHeader>
 <CardContent>
 <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 240 }}>
 {/* Grid */}
 {yTicks.map(t => (
 <g key={t}>
 <line x1={linePad.left} y1={mw(t)} x2={svgW - linePad.right} y2={mw(t)}
 stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
 <text x={linePad.left - 6} y={mw(t) + 4} textAnchor="end" fontSize={8.5} fill="rgba(255,255,255,0.4)">{t}%</text>
 </g>
 ))}
 {monthLabels.map(m => (
 <g key={m}>
 <line x1={mx(m)} y1={linePad.top} x2={mx(m)} y2={svgH - linePad.bottom}
 stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
 <text x={mx(m)} y={svgH - linePad.bottom + 14} textAnchor="middle" fontSize={8.5} fill="rgba(255,255,255,0.4)">M{m}</text>
 </g>
 ))}

 {/* Target line at 60% */}
 <line x1={linePad.left} y1={mw(60)} x2={svgW - linePad.right} y2={mw(60)}
 stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4,3" />
 <text x={linePad.left + 4} y={mw(60) - 4} fontSize={8} fill="rgba(255,255,255,0.4)">Target 60%</text>

 {/* ±5% bands */}
 <rect x={linePad.left} y={mw(65)} width={svgW - linePad.left - linePad.right} height={mw(55) - mw(65)}
 fill="rgba(99,102,241,0.06)" />

 {/* Lines — all dims except selected */}
 {STRATEGIES.map(s => {
 const isActive = selectedStrategy === s.key;
 return (
 <path
 key={s.key}
 d={buildLinePath(s.key === "threshold" ? "thresholdWeight" : s.key === "calendar" ? "calendarWeight" : "driftWeight")}
 fill="none"
 stroke={s.color}
 strokeWidth={isActive ? 2.5 : 1.2}
 opacity={isActive ? 1 : 0.25}
 />
 );
 })}
 </svg>

 <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
 {STRATEGIES.map(s => (
 <span key={s.key} className="flex items-center gap-1.5">
 <span className="inline-block w-6 h-0.5 rounded" style={{ background: s.color }} />
 <span style={{ color: selectedStrategy === s.key ? s.color : undefined }}>
 {s.label}: {s.desc}
 </span>
 </span>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Transaction cost analysis */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <DollarSign className="h-4 w-4 text-amber-400" />
 Transaction Cost Analysis
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-2 text-muted-foreground font-medium">Strategy</th>
 <th className="text-right py-2 text-muted-foreground font-medium">Trades/2yr</th>
 <th className="text-right py-2 text-muted-foreground font-medium">Total Cost (bps)</th>
 <th className="text-right py-2 text-muted-foreground font-medium">Ann. Drag</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {txCosts.map(row => (
 <tr key={row.strategy} className="hover:bg-muted/20">
 <td className="py-2 font-medium text-foreground">{row.strategy}</td>
 <td className="py-2 text-right text-muted-foreground">{row.trades}</td>
 <td className="py-2 text-right text-muted-foreground">{row.costBps}</td>
 <td className={`py-2 text-right font-semibold ${row.annualDrag === 0 ? "text-emerald-400" : row.annualDrag < 0.2 ? "text-primary" : "text-amber-400"}`}>
 {row.annualDrag.toFixed(2)}%
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Tax-aware rebalancing tips */}
 <Card className="bg-muted/30 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium flex items-center gap-2">
 <Target className="h-4 w-4 text-emerald-400" />
 Tax-Aware Rebalancing
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {[
 {
 label: "Tax-Loss Harvesting Offset",
 value: "1.2%",
 desc: "Realized losses available to offset rebalancing gains",
 positive: true,
 },
 {
 label: "Estimated Capital Gains Tax",
 value: "$1,840",
 desc: "If fully rebalancing today (long-term rate assumed)",
 positive: false,
 },
 {
 label: "Optimal Rebal Method",
 value: "Cash Flow",
 desc: "Redirect dividends and new contributions to underweight assets",
 positive: true,
 },
 {
 label: "After-Tax Cost Savings",
 value: "0.31%",
 desc: "Annual alpha from tax-aware vs naive rebalancing",
 positive: true,
 },
 ].map(tip => (
 <div key={tip.label} className="flex items-start justify-between gap-4 p-2.5 rounded-lg bg-muted/40">
 <div className="flex-1 min-w-0">
 <p className="text-xs font-medium text-foreground">{tip.label}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
 </div>
 <Badge
 variant="outline"
 className={`shrink-0 text-xs ${tip.positive ? "text-emerald-400 border-emerald-400/40" : "text-amber-400 border-amber-400/40"}`}
 >
 {tip.value}
 </Badge>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PortfolioLabPage() {
 return (
 <div className="min-h-screen bg-background text-foreground">
 <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="space-y-1"
 >
 <div className="flex items-center gap-3">
 <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
 <BarChart3 className="h-5 w-5 text-indigo-400" />
 </div>
 <div>
 <h1 className="text-xl font-semibold text-foreground">Portfolio Construction Lab</h1>
 <p className="text-sm text-muted-foreground">
 Mean-variance optimization · Black-Litterman · Risk budgeting · Rebalancing
 </p>
 </div>
 </div>
 <div className="flex flex-wrap gap-2 pt-1">
 {[
 { label: "Efficient Frontier", icon: TrendingUp, color: "text-indigo-400" },
 { label: "Black-Litterman", icon: Activity, color: "text-primary" },
 { label: "Risk Budgeting", icon: Scale, color: "text-emerald-400" },
 { label: "Rebalancing", icon: RefreshCw, color: "text-amber-400" },
 ].map(({ label, icon: Icon, color }) => (
 <Badge key={label} variant="outline" className="text-xs text-muted-foreground gap-1">
 <Icon className={`h-3 w-3 ${color}`} />
 {label}
 </Badge>
 ))}
 </div>
 </motion.div>

 {/* Tabs */}
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 >
 <Tabs defaultValue="frontier" className="space-y-4">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="frontier" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Efficient Frontier</TabsTrigger>
 <TabsTrigger value="bl" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Black-Litterman</TabsTrigger>
 <TabsTrigger value="risk" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Risk Budgeting</TabsTrigger>
 <TabsTrigger value="rebal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Rebalancing</TabsTrigger>
 </TabsList>

 <TabsContent value="frontier" className="data-[state=inactive]:hidden">
 <EfficientFrontierTab />
 </TabsContent>
 <TabsContent value="bl" className="data-[state=inactive]:hidden">
 <BlackLittermanTab />
 </TabsContent>
 <TabsContent value="risk" className="data-[state=inactive]:hidden">
 <RiskBudgetingTab />
 </TabsContent>
 <TabsContent value="rebal" className="data-[state=inactive]:hidden">
 <RebalancingTab />
 </TabsContent>
 </Tabs>
 </motion.div>
 </div>
 </div>
 );
}
