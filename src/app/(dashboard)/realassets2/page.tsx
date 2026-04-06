"use client";


import {
 TreePine,
 Wheat,
 Gem,
 Music,
 Building2,
 TrendingUp,
 DollarSign,
 Droplets,
 Globe,
 BarChart2,
 ShieldCheck,
 Activity,
 Layers,
 AlertTriangle,
 Info,
 Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 964;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const _sv = () => _vals[_vi++ % _vals.length];
void _sv;

// ── Format helpers ──────────────────────────────────────────────────────────
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");

// ── NCREIF Timberland Index ──────────────────────────────────────────────────
const TIMBER_DATA: { year: string; total: number; bio: number; price: number; land: number }[] = [
 { year: "2015", total: 3.4, bio: 4.1, price: -1.8, land: 1.1 },
 { year: "2016", total: 5.2, bio: 4.2, price: -0.3, land: 1.3 },
 { year: "2017", total: 8.6, bio: 4.3, price: 2.8, land: 1.5 },
 { year: "2018", total: 4.3, bio: 4.2, price: -1.4, land: 1.5 },
 { year: "2019", total: 7.1, bio: 4.3, price: 1.2, land: 1.6 },
 { year: "2020", total: 6.2, bio: 4.4, price: 0.1, land: 1.7 },
 { year: "2021", total: 12.8, bio: 4.4, price: 6.3, land: 2.1 },
 { year: "2022", total: 9.7, bio: 4.5, price: 3.2, land: 2.0 },
 { year: "2023", total: 7.3, bio: 4.4, price: 1.4, land: 1.5 },
 { year: "2024", total: 8.5, bio: 4.5, price: 2.4, land: 1.6 },
];

function TimberReturnChart() {
 const W = 520;
 const H = 180;
 const PAD = { l: 40, r: 16, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const maxV = 14;
 const toX = (i: number) => PAD.l + (i / (TIMBER_DATA.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - ((v + 2) / (maxV + 2)) * chartH;
 const totalPts = TIMBER_DATA.map((d, i) => `${toX(i)},${toY(d.total)}`).join("");
 const totalArea = [
 `${toX(0)},${toY(0)}`,
 ...TIMBER_DATA.map((d, i) => `${toX(i)},${toY(d.total)}`),
 `${toX(TIMBER_DATA.length - 1)},${toY(0)}`,
 ].join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
 <defs>
 <linearGradient id="timberGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
 <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {[0, 4, 8, 12].map((v) => (
 <line key={`tgl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 ))}
 {[0, 4, 8, 12].map((v) => (
 <text key={`tgt-${v}`} x={PAD.l - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">{v}%</text>
 ))}
 <polygon points={totalArea} fill="url(#timberGrad)" />
 <polyline points={totalPts} fill="none" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
 {/* Biological growth bars */}
 {TIMBER_DATA.map((d, i) => (
 <rect
 key={`bio-${i}`}
 x={toX(i) - 6}
 y={toY(d.bio)}
 width={6}
 height={toY(0) - toY(d.bio)}
 fill="#a78bfa"
 opacity="0.5"
 />
 ))}
 {TIMBER_DATA.map((d, i) => (
 <text key={`tyl-${i}`} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">{d.year.slice(2)}</text>
 ))}
 {/* Legend */}
 <rect x={PAD.l + 4} y={PAD.t + 2} width={8} height={8} fill="#34d399" rx="1" />
 <text x={PAD.l + 16} y={PAD.t + 10} fontSize="9" fill="#a1a1aa">Total Return</text>
 <rect x={PAD.l + 80} y={PAD.t + 2} width={8} height={8} fill="#a78bfa" opacity="0.7" rx="1" />
 <text x={PAD.l + 92} y={PAD.t + 10} fontSize="9" fill="#a1a1aa">Biological Growth</text>
 </svg>
 );
}

// ── US Farmland Price Chart ──────────────────────────────────────────────────
const FARMLAND_PRICE: { year: string; price: number }[] = [
 { year: "2010", price: 2150 },
 { year: "2011", price: 2360 },
 { year: "2012", price: 2650 },
 { year: "2013", price: 2900 },
 { year: "2014", price: 3020 },
 { year: "2015", price: 2960 },
 { year: "2016", price: 2980 },
 { year: "2017", price: 3010 },
 { year: "2018", price: 3140 },
 { year: "2019", price: 3160 },
 { year: "2020", price: 3160 },
 { year: "2021", price: 3380 },
 { year: "2022", price: 3800 },
 { year: "2023", price: 3900 },
 { year: "2024", price: 4050 },
];

function FarmlandPriceChart() {
 const W = 520;
 const H = 160;
 const PAD = { l: 48, r: 16, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const minP = 1800;
 const maxP = 4400;
 const toX = (i: number) => PAD.l + (i / (FARMLAND_PRICE.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - ((v - minP) / (maxP - minP)) * chartH;
 const pts = FARMLAND_PRICE.map((d, i) => `${toX(i)},${toY(d.price)}`).join("");
 const area = [
 `${toX(0)},${PAD.t + chartH}`,
 ...FARMLAND_PRICE.map((d, i) => `${toX(i)},${toY(d.price)}`),
 `${toX(FARMLAND_PRICE.length - 1)},${PAD.t + chartH}`,
 ].join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 <defs>
 <linearGradient id="farmGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.02" />
 </linearGradient>
 </defs>
 {[2000, 2500, 3000, 3500, 4000].map((v) => (
 <line key={`fgl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke="#27272a" strokeWidth="1" />
 ))}
 {[2000, 2500, 3000, 3500, 4000].map((v) => (
 <text key={`fgt-${v}`} x={PAD.l - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">${(v / 1000).toFixed(1)}k</text>
 ))}
 <polygon points={area} fill="url(#farmGrad)" />
 <polyline points={pts} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinejoin="round" />
 {FARMLAND_PRICE.filter((_, i) => i % 3 === 0).map((d, i) => (
 <text key={`fyl-${i}`} x={toX(i * 3)} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">{d.year}</text>
 ))}
 </svg>
 );
}

// ── Mei Moses Art Index ──────────────────────────────────────────────────────
const ART_INDEX: { year: string; art: number; stocks: number }[] = [
 { year: "2012", art: 6.2, stocks: 15.1 },
 { year: "2013", art: 4.8, stocks: 32.2 },
 { year: "2014", art: 5.1, stocks: 13.6 },
 { year: "2015", art: 3.2, stocks: 1.4 },
 { year: "2016", art: -2.1, stocks: 12.0 },
 { year: "2017", art: 5.9, stocks: 21.8 },
 { year: "2018", art: 4.7, stocks: -4.4 },
 { year: "2019", art: 6.1, stocks: 31.4 },
 { year: "2020", art: 1.8, stocks: 18.4 },
 { year: "2021", art: 8.3, stocks: 28.7 },
 { year: "2022", art: 7.2, stocks: -18.1 },
 { year: "2023", art: 5.4, stocks: 26.3 },
];

function ArtIndexChart() {
 const W = 520;
 const H = 180;
 const PAD = { l: 44, r: 16, t: 16, b: 32 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const minV = -25;
 const maxV = 40;
 const toX = (i: number) => PAD.l + (i / (ART_INDEX.length - 1)) * chartW;
 const toY = (v: number) => PAD.t + chartH - ((v - minV) / (maxV - minV)) * chartH;
 const zeroY = toY(0);
 const artPts = ART_INDEX.map((d, i) => `${toX(i)},${toY(d.art)}`).join("");
 const stockPts = ART_INDEX.map((d, i) => `${toX(i)},${toY(d.stocks)}`).join("");
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
 {[-20, -10, 0, 10, 20, 30].map((v) => (
 <line key={`agl-${v}`} x1={PAD.l} x2={W - PAD.r} y1={toY(v)} y2={toY(v)} stroke={v === 0 ? "#52525b" : "#27272a"} strokeWidth={v === 0 ? 1.5 : 1} />
 ))}
 {[-20, -10, 0, 10, 20, 30].map((v) => (
 <text key={`agt-${v}`} x={PAD.l - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="#71717a">{v}%</text>
 ))}
 <line x1={PAD.l} x2={W - PAD.r} y1={zeroY} y2={zeroY} stroke="#52525b" strokeWidth="1.5" strokeDasharray="4 3" />
 <polyline points={artPts} fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinejoin="round" />
 <polyline points={stockPts} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" strokeDasharray="6 3" />
 {ART_INDEX.filter((_, i) => i % 2 === 0).map((d, i) => (
 <text key={`ayl-${i}`} x={toX(i * 2)} y={H - 6} textAnchor="middle" fontSize="9" fill="#71717a">{d.year}</text>
 ))}
 <rect x={PAD.l + 4} y={PAD.t + 2} width={12} height={3} fill="#f472b6" rx="1" />
 <text x={PAD.l + 20} y={PAD.t + 10} fontSize="9" fill="#a1a1aa">Mei Moses Art</text>
 <line x1={PAD.l + 100} y1={PAD.t + 5} x2={PAD.l + 112} y2={PAD.t + 5} stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 2" />
 <text x={PAD.l + 116} y={PAD.t + 10} fontSize="9" fill="#a1a1aa">S&amp;P 500</text>
 </svg>
 );
}

// ── Royalty Revenue Streams SVG ─────────────────────────────────────────────
const ROYALTY_STREAMS: { label: string; pct: number; color: string }[] = [
 { label: "Streaming", pct: 38, color: "#34d399" },
 { label: "Sync (TV/Film)", pct: 22, color: "#60a5fa" },
 { label: "Performance", pct: 18, color: "#fbbf24" },
 { label: "Mechanical", pct: 12, color: "#f472b6" },
 { label: "Print/Other", pct: 10, color: "#a78bfa" },
];

function RoyaltyDonut() {
 const cx = 80;
 const cy = 80;
 const r = 55;
 const inner = 30;
 let cumAngle = -Math.PI / 2;
 const slices = ROYALTY_STREAMS.map((seg) => {
 const angle = (seg.pct / 100) * 2 * Math.PI;
 const x1 = cx + r * Math.cos(cumAngle);
 const y1 = cy + r * Math.sin(cumAngle);
 const x2 = cx + r * Math.cos(cumAngle + angle);
 const y2 = cy + r * Math.sin(cumAngle + angle);
 const ix1 = cx + inner * Math.cos(cumAngle);
 const iy1 = cy + inner * Math.sin(cumAngle);
 const ix2 = cx + inner * Math.cos(cumAngle + angle);
 const iy2 = cy + inner * Math.sin(cumAngle + angle);
 const large = angle > Math.PI ? 1 : 0;
 const midAngle = cumAngle + angle / 2;
 const lx = cx + (r + 14) * Math.cos(midAngle);
 const ly = cy + (r + 14) * Math.sin(midAngle);
 const path = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${inner},${inner} 0 ${large},0 ${ix1},${iy1} Z`;
 cumAngle += angle;
 return { path, lx, ly, seg, midAngle };
 });
 return (
 <svg viewBox="0 0 240 160" className="w-full h-40">
 {slices.map(({ path, seg }, i) => (
 <path key={`rs-${i}`} d={path} fill={seg.color} opacity="0.85" />
 ))}
 <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#e4e4e7" fontWeight="600">Music</text>
 <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#71717a">Royalties</text>
 {/* Legend */}
 {ROYALTY_STREAMS.map((seg, i) => (
 <g key={`rl-${i}`} transform={`translate(170, ${10 + i * 28})`}>
 <rect width={10} height={10} fill={seg.color} rx="2" opacity="0.85" />
 <text x={14} y={9} fontSize="9" fill="#a1a1aa">{seg.label}</text>
 <text x={14} y={20} fontSize="8" fill="#71717a">{seg.pct}%</text>
 </g>
 ))}
 </svg>
 );
}

// ── Liquidity Spectrum ───────────────────────────────────────────────────────
const LIQUIDITY_ITEMS = [
 { label: "Listed REITs", sub: "Intraday liquidity", x: 10, color: "#34d399" },
 { label: "Direct Real Estate", sub: "3–12 months", x: 28, color: "#60a5fa" },
 { label: "Infrastructure", sub: "5–10 year lockup", x: 50, color: "#fbbf24" },
 { label: "Timberland / Farmland", sub: "7–15 year lockup", x: 72, color: "#f97316" },
 { label: "Art & Collectibles", sub: "Highly illiquid", x: 90, color: "#f472b6" },
];

function LiquiditySpectrum() {
 const W = 520;
 const H = 120;
 const trackY = 50;
 const trackX1 = 20;
 const trackX2 = W - 20;
 const trackW = trackX2 - trackX1;
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
 {/* Track gradient */}
 <defs>
 <linearGradient id="liqGrad" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0%" stopColor="#34d399" />
 <stop offset="100%" stopColor="#f472b6" />
 </linearGradient>
 </defs>
 <rect x={trackX1} y={trackY - 3} width={trackW} height={6} rx="3" fill="url(#liqGrad)" opacity="0.5" />
 <text x={trackX1} y={trackY + 16} fontSize="9" fill="#71717a">High Liquidity</text>
 <text x={trackX2} y={trackY + 16} textAnchor="end" fontSize="9" fill="#71717a">Low Liquidity</text>
 {LIQUIDITY_ITEMS.map((item, i) => {
 const cx = trackX1 + (item.x / 100) * trackW;
 const above = i % 2 === 0;
 return (
 <g key={`li-${i}`}>
 <circle cx={cx} cy={trackY} r={5} fill={item.color} />
 <line x1={cx} x2={cx} y1={above ? trackY - 6 : trackY + 6} y2={above ? trackY - 22 : trackY + 22} stroke={item.color} strokeWidth="1" strokeDasharray="2 2" />
 <text x={cx} y={above ? trackY - 26 : trackY + 32} textAnchor="middle" fontSize="8.5" fill={item.color} fontWeight="600">{item.label}</text>
 <text x={cx} y={above ? trackY - 16 : trackY + 42} textAnchor="middle" fontSize="7.5" fill="#71717a">{item.sub}</text>
 </g>
 );
 })}
 </svg>
 );
}

// ── Correlation Matrix ───────────────────────────────────────────────────────
const CORR_ASSETS = ["Stocks", "Bonds", "Timber", "Farmland", "Art", "Infra"];
const CORR_DATA: number[][] = [
 [1.00, -0.12, 0.02, 0.05, 0.08, 0.28],
 [-0.12, 1.00, 0.04, 0.02, -0.03, 0.18],
 [0.02, 0.04, 1.00, 0.42, 0.07, 0.31],
 [0.05, 0.02, 0.42, 1.00, 0.09, 0.35],
 [0.08, -0.03, 0.07, 0.09, 1.00, 0.06],
 [0.28, 0.18, 0.31, 0.35, 0.06, 1.00],
];

function CorrMatrix() {
 const cell = 44;
 const labelW = 60;
 const W = labelW + CORR_ASSETS.length * cell;
 const H = labelW + CORR_ASSETS.length * cell;
 const getColor = (v: number) => {
 if (v === 1) return "#374151";
 if (v > 0.5) return "#065f46";
 if (v > 0.2) return "#166534";
 if (v > 0) return "#14532d";
 if (v < -0.1) return "#7f1d1d";
 return "#1c1c1e";
 };
 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: `${H}px`, maxHeight: 300 }}>
 {CORR_ASSETS.map((a, i) => (
 <text key={`crl-${i}`} x={labelW + i * cell + cell / 2} y={labelW - 8} textAnchor="middle" fontSize="9" fill="#a1a1aa" transform={`rotate(-30, ${labelW + i * cell + cell / 2}, ${labelW - 8})`}>{a}</text>
 ))}
 {CORR_ASSETS.map((a, i) => (
 <text key={`crc-${i}`} x={labelW - 4} y={labelW + i * cell + cell / 2 + 4} textAnchor="end" fontSize="9" fill="#a1a1aa">{a}</text>
 ))}
 {CORR_DATA.map((row, i) =>
 row.map((v, j) => (
 <g key={`cc-${i}-${j}`}>
 <rect
 x={labelW + j * cell + 1}
 y={labelW + i * cell + 1}
 width={cell - 2}
 height={cell - 2}
 rx="2"
 fill={getColor(v)}
 />
 <text
 x={labelW + j * cell + cell / 2}
 y={labelW + i * cell + cell / 2 + 4}
 textAnchor="middle"
 fontSize="9"
 fill={v === 1 ? "#71717a" : v > 0.3 ? "#86efac" : v < -0.05 ? "#fca5a5" : "#d4d4d8"}
 >
 {v.toFixed(2)}
 </text>
 </g>
 ))
 )}
 </svg>
 );
}

// ── Real Assets Comparison Matrix ────────────────────────────────────────────
const COMP_ROWS = [
 { label: "Typical Return", data: ["8–12%", "7–10%", "9–13%", "4–6%", "5–7%", "6–9%"] },
 { label: "Income Yield", data: ["1–3%", "3–5%", "4–7%", "Low", "None", "4–6%"] },
 { label: "Inflation Link", data: ["Weak", "Strong", "Strong", "Strong", "Moderate", "Strong"] },
 { label: "Liquidity", data: ["Medium", "Low", "Low", "Very Low", "Very Low", "Low"] },
 { label: "Correlation (Stocks)", data: ["0.02", "0.05", "0.28", "0.08", ">0.3", "−0.12"] },
 { label: "Leverage Used", data: ["Low", "Moderate", "High", "None", "None", "None"] },
 { label: "Min Investment", data: ["$1M+", "$500k+", "$10M+", "$50k+", "$5k+", "$250k+"] },
];
const COMP_COLS = ["Timber", "Farmland", "Real Estate", "Art", "Listed REIT", "Infrastructure"];

function ComparisonMatrix() {
 return (
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground border-collapse">
 <thead>
 <tr>
 <th className="text-left py-2 px-3 text-muted-foreground font-medium border-b border-border min-w-[120px]">Category</th>
 {COMP_COLS.map((c) => (
 <th key={c} className="text-center py-2 px-2 text-muted-foreground font-medium border-b border-border min-w-[90px]">{c}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {COMP_ROWS.map((row, ri) => (
 <tr key={`cr-${ri}`} className={ri % 2 === 0 ? "bg-card/40" : ""}>
 <td className="py-2 px-3 text-muted-foreground font-medium border-b border-border">{row.label}</td>
 {row.data.map((cell, ci) => (
 <td key={`cc-${ri}-${ci}`} className="py-2 px-2 text-center text-muted-foreground border-b border-border">{cell}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}

// ── Return Attribution Bar ───────────────────────────────────────────────────
const RETURN_ATTR: { asset: string; income: number; capital: number; color: string }[] = [
 { asset: "Timber", income: 4.3, capital: 4.2, color: "#34d399" },
 { asset: "Farmland", income: 4.8, capital: 3.9, color: "#fbbf24" },
 { asset: "Real Estate", income: 5.2, capital: 4.1, color: "#60a5fa" },
 { asset: "Infrastructure", income: 5.8, capital: 2.4, color: "#a78bfa" },
 { asset: "Art", income: 0.0, capital: 6.1, color: "#f472b6" },
];

function ReturnAttrChart() {
 const W = 480;
 const H = 160;
 const PAD = { l: 88, r: 16, t: 24, b: 16 };
 const chartW = W - PAD.l - PAD.r;
 const chartH = H - PAD.t - PAD.b;
 const barH = (chartH / RETURN_ATTR.length) * 0.6;
 const gap = (chartH / RETURN_ATTR.length) * 0.4;
 const maxVal = 12;
 const toW = (v: number) => (v / maxVal) * chartW;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
 {[0, 3, 6, 9, 12].map((v) => (
 <g key={`rag-${v}`}>
 <line x1={PAD.l + toW(v)} x2={PAD.l + toW(v)} y1={PAD.t} y2={H - PAD.b} stroke="#27272a" strokeWidth="1" />
 <text x={PAD.l + toW(v)} y={PAD.t - 6} textAnchor="middle" fontSize="9" fill="#71717a">{v}%</text>
 </g>
 ))}
 {RETURN_ATTR.map((d, i) => {
 const y = PAD.t + i * (barH + gap);
 const incW = toW(d.income);
 const capW = toW(d.capital);
 return (
 <g key={`ra-${i}`}>
 <text x={PAD.l - 4} y={y + barH / 2 + 4} textAnchor="end" fontSize="9" fill="#a1a1aa">{d.asset}</text>
 <rect x={PAD.l} y={y} width={incW} height={barH / 2 - 1} rx="1" fill={d.color} opacity="0.8" />
 <rect x={PAD.l} y={y + barH / 2} width={capW} height={barH / 2 - 1} rx="1" fill={d.color} opacity="0.4" />
 </g>
 );
 })}
 <rect x={PAD.l + 4} y={PAD.t} width={8} height={6} fill="#71717a" opacity="0.8" rx="1" />
 <text x={PAD.l + 16} y={PAD.t + 6} fontSize="8" fill="#a1a1aa">Income</text>
 <rect x={PAD.l + 60} y={PAD.t} width={8} height={6} fill="#71717a" opacity="0.4" rx="1" />
 <text x={PAD.l + 72} y={PAD.t + 6} fontSize="8" fill="#a1a1aa">Capital</text>
 </svg>
 );
}

// ── Timberland / Farmland comparison table ───────────────────────────────────
const TF_COMPARE = [
 { factor: "Primary Return Driver", timber: "Biological growth + timber price", farmland: "Crop income + land appreciation" },
 { factor: "Income Profile", timber: "Lumpy (harvest timing)", farmland: "Annual lease/crop income" },
 { factor: "Harvest Flexibility", timber: "High — can defer 2–5 years", farmland: "Low — seasonal necessity" },
 { factor: "Carbon Revenue", timber: "Significant optionality", farmland: "Emerging (cover crops)" },
 { factor: "Water Rights", timber: "Incidental", farmland: "Embedded core value" },
 { factor: "Inflation Hedge", timber: "Strong (commodity + land)", farmland: "Very strong (food + land)" },
 { factor: "Key Manager", timber: "Manulife/Hancock/BTG Pactual", farmland: "Nuveen/TIAA/Farmland Partners" },
];

// ── Art Cost Stack ───────────────────────────────────────────────────────────
const ART_COSTS: { label: string; pct: number; color: string }[] = [
 { label: "Buyer's Premium (auction)", pct: 12, color: "#f472b6" },
 { label: "Seller's Commission", pct: 8, color: "#fb923c" },
 { label: "Annual Storage/Insurance", pct: 1, color: "#fbbf24" },
 { label: "Transport/Handling", pct: 2, color: "#60a5fa" },
 { label: "Authentication/Provenance", pct: 2, color: "#a78bfa" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RealAssets2Page() {
 return (
 <div className="max-w-5xl px-6 py-8 mx-auto space-y-6">
 {/* Header */}
 <div>
 <div className="flex items-center gap-3 mb-1">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">Real Assets Deep Dive</h1>
 <p className="text-sm text-muted-foreground">Timberland, farmland, art, royalties, and infrastructure — beyond bricks and mortar</p>
 </div>
 </div>
 <div className="flex gap-2 mt-3 flex-wrap">
 {[
 { label: "Timberland Avg Return", value: "8–10% p.a.", color: "bg-emerald-500/5 text-emerald-400" },
 { label: "US Farmland CAGR (2010–24)", value: "+4.8%", color: "bg-amber-500/10 text-amber-400" },
 { label: "Mei Moses Art Real Return", value: "5–7%", color: "bg-pink-500/10 text-pink-400" },
 { label: "Music Royalty Market", value: "$30B+", color: "bg-muted/10 text-foreground" },
 ].map((chip) => (
 <div key={chip.label} className={cn("px-3 py-1.5 rounded-full text-xs text-muted-foreground font-medium", chip.color)}>
 <span className="text-muted-foreground mr-1">{chip.label}:</span>{chip.value}
 </div>
 ))}
 </div>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="timber">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="timber" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-3 py-2 text-xs text-muted-foreground">
 Timberland &amp; Farmland
 </TabsTrigger>
 <TabsTrigger value="art" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-3 py-2 text-xs text-muted-foreground">
 Art &amp; Collectibles
 </TabsTrigger>
 <TabsTrigger value="royalties" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-3 py-2 text-xs text-muted-foreground">
 Royalties &amp; IP
 </TabsTrigger>
 <TabsTrigger value="comparison" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent px-3 py-2 text-xs text-muted-foreground">
 Infra vs Real Estate
 </TabsTrigger>
 </TabsList>

 {/* ── Tab 1: Timberland & Farmland ───────────────────────────────── */}
 <TabsContent value="timber" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* NCREIF Timberland Returns */}
 <Card className="bg-card border-border border-l-4 border-l-primary">
 <CardHeader className="p-4 pb-2">
 <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
 NCREIF Timberland Index Annual Returns
 </CardTitle>
 </CardHeader>
 <CardContent>
 <TimberReturnChart />
 <p className="text-xs text-muted-foreground mt-2">Biological growth (purple bars) provides a stable ~4–5% annual floor regardless of timber prices. Total returns averaged ~7.3% over the period.</p>
 </CardContent>
 </Card>

 {/* Return Components */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Timberland Return Components
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {[
 { label: "Biological Growth", desc: "Trees physically grow 4–5% per year in volume — the 'coupon' of timberland investing. This return is independent of market prices.", pct: 45, color: "#a78bfa" },
 { label: "Timber Price Change", desc: "Lumber and pulp prices driven by housing starts, global demand, and trade policy. High volatility but mean-reverting.", pct: 35, color: "#34d399" },
 { label: "Land Appreciation", desc: "Underlying land value typically appreciates 1–2% annually, providing inflation protection and optionality for sale/conversion.", pct: 20, color: "#fbbf24" },
 ].map((item) => (
 <div key={item.label}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className="text-muted-foreground font-medium">{item.label}</span>
 <span style={{ color: item.color }}>{item.pct}% of return</span>
 </div>
 <div className="h-2 rounded-full bg-muted">
 <div className="h-2 rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color, opacity: 0.8 }} />
 </div>
 <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
 </div>
 ))}
 <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
 <p className="text-xs text-emerald-300 font-medium">Harvest Flexibility Advantage</p>
 <p className="text-xs text-muted-foreground mt-1">Unlike crops, timber can stand unharvested for 2–5 extra years if prices are depressed. This inventory optionality is a unique biological asset feature — the forest acts as a natural price-averaging mechanism.</p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Carbon & Water */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Carbon Credit Optionality
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 <p>Forests sequester CO₂ and can generate carbon offsets (REDD+, IFM protocols) sold on voluntary or compliance carbon markets. At $15–$30/tonne and 2–5 tonnes CO₂/acre/year, a 100,000-acre forest generates $3M–$15M in annual carbon revenue — a meaningful option layer on top of timber income.</p>
 <div className="grid grid-cols-2 gap-2 mt-3">
 {[
 { k: "VCM Price Range", v: "$5–$50/t CO₂" },
 { k: "Avg Sequestration", v: "2–5 t CO₂/acre/yr" },
 { k: "CA Cap-and-Trade", v: "$30–$40/t" },
 { k: "Forest Credit Term", v: "30–100 years" },
 ].map((s) => (
 <div key={s.k} className="p-2 rounded bg-muted/60">
 <p className="text-muted-foreground">{s.k}</p>
 <p className="text-foreground font-medium mt-0.5">{s.v}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Water Rights &amp; Vertical Integration
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2 text-xs text-muted-foreground">
 <p>In western US states, water rights appurtenant to farmland can be worth more than the land itself ($5,000–$50,000/acre-foot in California). Vertical integration in agriculture — owning processing, storage, and distribution alongside land — can double income yield versus bare leasehold returns.</p>
 <div className="grid grid-cols-1 gap-2 mt-3">
 {[
 { k: "Bare land lease yield", v: "3–4%" },
 { k: "+ processing/storage", v: "+2–3% additional yield" },
 { k: "CA water rights range", v: "$5k–$50k/acre-foot" },
 ].map((s) => (
 <div key={s.k} className="flex justify-between p-2 rounded bg-muted/60">
 <span className="text-muted-foreground">{s.k}</span>
 <span className="text-amber-300 font-medium">{s.v}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* US Farmland Price Chart */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 US Average Farmland Price per Acre (2010–2024)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <FarmlandPriceChart />
 <p className="text-xs text-muted-foreground mt-2">USDA data: US average cropland value rose from ~$2,150/acre in 2010 to $4,050/acre in 2024 — an 88% cumulative gain. Prime Iowa corn belt land trades above $15,000/acre. Managed by Nuveen Natural Capital, TIAA, and Farmland Partners (FPI).</p>
 </CardContent>
 </Card>

 {/* Timber vs Farmland Table */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Timberland vs Farmland — Investor Comparison
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground border-collapse">
 <thead>
 <tr>
 <th className="text-left py-2 px-3 text-muted-foreground border-b border-border min-w-[160px]">Factor</th>
 <th className="text-left py-2 px-3 text-emerald-400 border-b border-border min-w-[180px]">Timberland</th>
 <th className="text-left py-2 px-3 text-amber-400 border-b border-border min-w-[180px]">Farmland</th>
 </tr>
 </thead>
 <tbody>
 {TF_COMPARE.map((row, i) => (
 <tr key={`tf-${i}`} className={i % 2 === 0 ? "bg-card/40" : ""}>
 <td className="py-2 px-3 text-muted-foreground font-medium border-b border-border">{row.factor}</td>
 <td className="py-2 px-3 text-muted-foreground border-b border-border">{row.timber}</td>
 <td className="py-2 px-3 text-muted-foreground border-b border-border">{row.farmland}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Tab 2: Art & Collectibles ───────────────────────────────────── */}
 <TabsContent value="art" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Mei Moses vs Stocks */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Mei Moses Art Index vs S&amp;P 500 (Annual Returns)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ArtIndexChart />
 <p className="text-xs text-muted-foreground mt-2">Art provides diversification (low correlation to equities) but with high transaction costs. The Mei Moses index shows 5–7% real returns on repeat-sale auction data, masking survivorship bias from unsold or privately-traded pieces.</p>
 </CardContent>
 </Card>

 {/* Transaction Costs */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Art Round-Trip Transaction Costs (25%+)
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 {ART_COSTS.map((cost) => (
 <div key={cost.label}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className="text-muted-foreground">{cost.label}</span>
 <span style={{ color: cost.color }} className="font-medium">{cost.pct}%</span>
 </div>
 <div className="h-1.5 rounded-full bg-muted">
 <div className="h-1.5 rounded-full" style={{ width: `${(cost.pct / 15) * 100}%`, backgroundColor: cost.color, opacity: 0.8 }} />
 </div>
 </div>
 ))}
 <div className="mt-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
 <p className="text-xs text-amber-300 font-medium">Total Round-Trip Cost: ~25–30%</p>
 <p className="text-xs text-muted-foreground mt-1">A piece must appreciate 25–30% just to break even on transaction costs. This means art needs to be held for 5–10 years minimum to earn an acceptable net return, reinforcing its extreme illiquidity.</p>
 </div>
 <div className="mt-2 p-3 rounded-lg bg-muted/50">
 <p className="text-xs text-muted-foreground font-medium">US Tax Treatment</p>
 <p className="text-xs text-muted-foreground mt-1">Collectibles (art, wine, stamps, coins) face a 28% federal long-term capital gains rate — vs 20% for securities. Additional 3.8% NIIT applies, making effective rate up to 31.8% for high earners.</p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Collectible Categories */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {[
 {
 icon: <Gem className="w-4 h-4 text-pink-400" />,
 title: "Fine Wine",
 index: "Liv-ex Fine Wine 100",
 return: "~8% avg (10yr)",
 note: "Investment-grade Bordeaux, Burgundy, Champagne. Requires temperature-controlled storage. En primeur (futures) buying offers access. Berry Bros & Rudd and Sotheby's Wine are major platforms.",
 badge: "Physical Asset",
 badgeColor: "text-pink-400 bg-pink-500/10",
 },
 {
 icon: <Activity className="w-4 h-4 text-sky-400" />,
 title: "Classic Cars",
 index: "HAGI Top Index",
 return: "~9% avg (10yr)",
 note: "Pre-1980 Ferrari, Porsche, Aston Martin dominate auction results. Maintenance costs can run 2–4% annually. RM Sotheby's and Gooding &amp; Company conduct major sales. Volatile — boom-bust cycles.",
 badge: "Physical / Usage",
 badgeColor: "text-sky-400 bg-sky-500/10",
 },
 {
 icon: <DollarSign className="w-4 h-4 text-amber-400" />,
 title: "Luxury Watches",
 index: "WatchCharts 1000",
 return: "~6% avg (5yr)",
 note: "Rolex Daytona and Patek Philippe Nautilus have outperformed equities in 2018–2022 bull market. Inflation hedge due to limited production. Market softened 15–25% in 2023 from pandemic peaks.",
 badge: "Inflation Hedge",
 badgeColor: "text-amber-400 bg-amber-500/10",
 },
 {
 icon: <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />,
 title: "NFTs / Digital Art",
 index: "NFT Market Cap",
 return: "−80% from 2021 peak",
 note: "Beeple's 'Everydays' sold for $69M at Christie's (March 2021). NFT market peaked at $25B monthly volume (Jan 2022), crashed to ~$400M by 2023. Authentication risk replaced by smart contract provenance — but speculative bubble dynamics dominated.",
 badge: "High Risk",
 badgeColor: "text-red-400 bg-red-500/5",
 },
 {
 icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
 title: "Art Lending",
 index: "Athena / Sotheby's FS",
 return: "6–8% lender yield",
 note: "Art-secured lending ($20B+ market). Lenders advance 40–50% LTV against appraised value. Athena Art Finance and Sotheby's Financial Services are major players. Art is held as collateral; owner retains economic upside.",
 badge: "Credit Product",
 badgeColor: "text-emerald-400 bg-emerald-500/5",
 },
 {
 icon: <Package className="w-4 h-4 text-orange-400" />,
 title: "Art Funds",
 index: "Fractional / Fund",
 return: "Varies widely",
 note: "Masterworks offers fractional art ownership. Fund structure pools capital to buy blue-chip works. Issues: management fees (1.5–2%), performance fees (20%), multi-year lock-ups, and difficulty valuing interim NAV.",
 badge: "Fractional",
 badgeColor: "text-orange-400 bg-orange-500/10",
 },
 ].map((cat) => (
 <Card key={cat.title} className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 {cat.icon}{cat.title}
 <Badge className={cn("ml-auto text-xs text-muted-foreground", cat.badgeColor)}>{cat.badge}</Badge>
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-2">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{cat.index}</span>
 <span className={posColor(parseFloat(cat.return))}>{cat.return}</span>
 </div>
 <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: cat.note }} />
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Authentication Risk */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Authentication, Provenance &amp; Key Risks
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
 <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
 <p className="text-red-300 font-medium mb-1">Authentication Risk</p>
 <p>Forgeries represent ~10% of artworks on market per some estimates. Scientific analysis (dendrochronology, pigment testing, UV fluorescence) and catalogue raisonné verification are essential. Forger Wolfgang Beltracchi fooled major auction houses for decades.</p>
 </div>
 <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
 <p className="text-amber-300 font-medium mb-1">Provenance Risk</p>
 <p>Nazi-looted art repatriation claims have voided titles on $1B+ of artworks. Clear chain of ownership from 1933–1945 is mandatory for auction houses. AAMD Task Force registers claims; Hector Feliciano's research exposed hundreds of cases.</p>
 </div>
 <div className="p-3 rounded-lg bg-muted/5 border border-border">
 <p className="text-foreground font-medium mb-1">Liquidity Risk</p>
 <p>Even blue-chip works can fail to sell at auction ('bought-in' at ~30–40% of lots). Reserve prices protect sellers but create false price signals. Illiquidity premium of 2–4% versus equities compensates patient capital — but forced sellers face severe discounts.</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Tab 3: Royalties & IP ───────────────────────────────────────── */}
 <TabsContent value="royalties" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Music Royalty Donut */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Music Publishing Revenue Streams
 </CardTitle>
 </CardHeader>
 <CardContent>
 <RoyaltyDonut />
 <p className="text-xs text-muted-foreground mt-2">Streaming (Spotify, Apple Music, YouTube) now dominates at ~38% of publishing revenues. Sync licensing (TV/film placements) commands premium rates — a single Netflix placement can generate $10k–$100k. Performance rights (radio, live) remain significant.</p>
 </CardContent>
 </Card>

 {/* Streaming Economics */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Streaming Economics &amp; Royalty Valuation
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 <div className="grid grid-cols-2 gap-2">
 {[
 { k: "Spotify rate/stream", v: "$0.003–$0.005" },
 { k: "Apple Music rate/stream", v: "$0.007–$0.01" },
 { k: "Publishing split (writer)", v: "50% of royalty" },
 { k: "Publishing split (publisher)", v: "50% of royalty" },
 { k: "DCF discount rate", v: "8–12% typical" },
 { k: "Catalog multiple", v: "15–25× NPS" },
 ].map((s) => (
 <div key={s.k} className="p-2 rounded bg-muted/60">
 <p className="text-muted-foreground">{s.k}</p>
 <p className="text-foreground font-medium mt-0.5">{s.v}</p>
 </div>
 ))}
 </div>
 <div className="p-3 rounded-lg bg-muted/5 border border-border">
 <p className="text-foreground font-medium mb-1">Royalty DCF Model</p>
 <p>A song generating $100k NPS (Net Publisher Share) annually, valued at 20× = $2M catalog value. Hipgnosis Songs Fund paid ~$300M for Bob Dylan's entire catalog in late 2020. Streaming growth rate and decline curve assumptions drive valuation variance significantly.</p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Royalty Categories */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {[
 {
 icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
 title: "Pharmaceutical Royalties",
 model: "Royalty Pharma Model",
 content: "Royalty Pharma (RPRX) buys royalty interests from universities, research institutions, and biotech companies that discover drugs but lack capital to develop them. RPRX paid $1.1B for the royalty on Pfizer's Ibrance (palbociclib). Returns depend on drug sales; royalties are typically 2–8% of net sales with no development risk post-acquisition.",
 stats: [
 { k: "RPRX portfolio yield", v: "~8% royalty" },
 { k: "Typical royalty rate", v: "2–8% of net sales" },
 { k: "Risk", v: "Drug obsolescence" },
 ],
 color: "emerald",
 },
 {
 icon: <Globe className="w-4 h-4 text-amber-400" />,
 title: "Natural Resource Royalties",
 model: "Franco-Nevada / Wheaton Streaming",
 content: "Streaming companies provide upfront capital to miners in exchange for the right to buy a fixed percentage of production at a pre-set price (gold streams at $400/oz vs spot $2,000+). This gives mining exposure without operating risk. Franco-Nevada (FNV) owns 400+ royalties across precious metals, oil, gas, and other minerals.",
 stats: [
 { k: "FNV revenue CAGR", v: "~15% (10yr)" },
 { k: "Typical stream rate", v: "5–20% of production" },
 { k: "Operating risk", v: "None (royalty only)" },
 ],
 color: "amber",
 },
 {
 icon: <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/50" />,
 title: "Technology Licensing",
 model: "Patent Portfolio Monetization",
 content: "Technology companies monetize patent portfolios through cross-licensing agreements, patent assertion entities (PAEs), and standard-essential patents (SEPs). QUALCOMM earns ~30% of revenues from licensing its CDMA/LTE patents. InterDigital, VIA Technologies specialize in wireless patent licensing. Royalty rate setting governed by FRAND principles for SEPs.",
 stats: [
 { k: "QCOM licensing revenue", v: "~$5B/yr" },
 { k: "FRAND royalty range", v: "1–5% of device price" },
 { k: "Portfolio size matters", v: "Scale = leverage" },
 ],
 color: "blue",
 },
 {
 icon: <Music className="w-4 h-4 text-pink-400" />,
 title: "Music Catalog Auctions",
 model: "High-Profile Song Deals",
 content: "The music royalty asset class exploded 2019–2022 as ultra-low rates made long-duration royalty streams attractive. Bob Dylan sold to Universal Music for ~$300M. David Bowie catalog sold to Warner Music for ~$250M. Taylor Swift recatalog dispute highlighted distinction between master recordings (artist/label) vs publishing rights (songwriter/publisher). Hipgnosis paid up to 25× NPS at peak; values compressed as rates rose in 2022.",
 stats: [
 { k: "Bob Dylan deal", v: "~$300M (2020)" },
 { k: "Peak catalog multiple", v: "25–30× NPS" },
 { k: "2023 multiple (post-rate hike)", v: "15–18× NPS" },
 ],
 color: "pink",
 },
 ].map((cat) => (
 <Card key={cat.title} className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 {cat.icon}{cat.title}
 </CardTitle>
 <p className="text-xs text-muted-foreground">{cat.model}</p>
 </CardHeader>
 <CardContent className="space-y-3">
 <p className="text-xs text-muted-foreground">{cat.content}</p>
 <div className="grid grid-cols-3 gap-2">
 {cat.stats.map((s) => (
 <div key={s.k} className="p-2 rounded bg-muted/60">
 <p className="text-muted-foreground text-xs">{s.k}</p>
 <p className={`text-${cat.color}-300 font-medium text-xs text-muted-foreground mt-0.5`}>{s.v}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Royalty vs Working Interest */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Royalty vs Working Interest — Key Distinction
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
 <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
 <p className="text-emerald-300 font-medium mb-2">Royalty Interest</p>
 <ul className="space-y-1 text-muted-foreground">
 <li>• Receives % of gross production revenue</li>
 <li>• NO obligation to fund capital expenditures</li>
 <li>• NO liability for operating costs</li>
 <li>• First-in-priority payment before working interest</li>
 <li>• Lower risk, lower upside — pure revenue stream</li>
 <li>• Example: Franco-Nevada receives $400/oz on gold streams</li>
 </ul>
 </div>
 <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
 <p className="text-amber-300 font-medium mb-2">Working Interest</p>
 <ul className="space-y-1 text-muted-foreground">
 <li>• Owns a % of production AFTER costs</li>
 <li>• Must fund proportionate share of capex &amp; opex</li>
 <li>• Bears full operational and environmental liability</li>
 <li>• Higher risk, higher potential upside</li>
 <li>• Dominant structure for oil &amp; gas operators</li>
 <li>• Example: Pioneer Natural Resources develops wells</li>
 </ul>
 </div>
 </div>
 <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
 <span className="text-muted-foreground font-medium">Royalty perpetuity valuation: </span>
 For a perpetual royalty stream, value = Annual royalty income ÷ discount rate. At $1M/year and 8% discount rate, value = $12.5M. Streaming royalties are not perpetual — they decay as songs age — so a multi-stage DCF model with a long-term growth rate near 0% is standard.
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* ── Tab 4: Infrastructure vs Real Estate ───────────────────────── */}
 <TabsContent value="comparison" className="mt-4 space-y-4 data-[state=inactive]:hidden">
 {/* Comparison Matrix */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Real Assets Comparison Matrix (7 Dimensions × 6 Asset Types)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ComparisonMatrix />
 </CardContent>
 </Card>

 {/* Liquidity Spectrum */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Real Asset Liquidity Spectrum
 </CardTitle>
 </CardHeader>
 <CardContent>
 <LiquiditySpectrum />
 <p className="text-xs text-muted-foreground mt-2">Listed REITs offer daily liquidity at the cost of equity-market correlation (beta ~0.6 to broad market). Unlisted direct real estate and core infrastructure require 3–10+ year commitments but offer lower volatility and higher income yields due to illiquidity premium (estimated 1–3% vs listed equivalents).</p>
 </CardContent>
 </Card>

 {/* Return Attribution + Correlation */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Return Attribution: Income vs Capital Appreciation
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ReturnAttrChart />
 <p className="text-xs text-muted-foreground mt-2">Infrastructure has the highest income yield (5–7%) with modest capital appreciation — hence bond-like duration. Art is pure capital appreciation with zero yield. Farmland balances steady lease income with land value growth.</p>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Correlation Matrix with Traditional Assets
 </CardTitle>
 </CardHeader>
 <CardContent>
 <CorrMatrix />
 <p className="text-xs text-muted-foreground mt-2">Art shows near-zero correlation with all financial assets — the strongest diversifier. Timber and farmland correlate moderately with each other but minimally with stocks and bonds. Infrastructure has moderate equity exposure through economic sensitivity.</p>
 </CardContent>
 </Card>
 </div>

 {/* Inflation Linkage */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Inflation Linkage Mechanisms by Asset Type
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-muted-foreground">
 {[
 {
 asset: "Infrastructure",
 color: "purple",
 mechanism: "Contractual CPI escalators",
 detail: "Regulated utilities (power, water, gas) have returns directly linked to CPI via rate reviews. Toll roads often have contractual annual price increases of CPI + 0–2%. Airport charges are set by regulators with inflation pass-through. Near-perfect inflation hedge for core assets.",
 perf2022: "+8.4%",
 },
 {
 asset: "Farmland",
 color: "amber",
 mechanism: "Food prices + land scarcity",
 detail: "Commodity prices (corn, soybeans, wheat) rise with inflation. Farmland is finite; population growth drives food demand. 2022 saw crop prices surge 30–50% on Ukraine war disruption, boosting farmland returns to 12%+. Strong hedge over 3–5 year horizons.",
 perf2022: "+12.1%",
 },
 {
 asset: "Timberland",
 color: "emerald",
 mechanism: "Lumber prices + land value",
 detail: "Housing construction demand drives lumber prices. Inflation drives input costs for competing materials (steel, cement), increasing wood substitution. Biological growth provides inflation-independent return layer. Land itself appreciates with general price level.",
 perf2022: "+9.7%",
 },
 {
 asset: "Real Estate",
 color: "blue",
 mechanism: "Rent escalations + replacement cost",
 detail: "Commercial leases include annual CPI rent bumps (1–3%). Rising construction costs increase replacement value. Industrial/logistics real estate especially strong as supply chains repriced. Office underperformed as remote work structurally impacted demand.",
 perf2022: "-5.1% (ODCE)",
 },
 {
 asset: "Art / Collectibles",
 color: "pink",
 mechanism: "Store of value + wealth effect",
 detail: "Ultra-high-net-worth demand for tangible assets increases in inflationary periods. Art priced in multiple currencies provides USD hedge. However, rising interest rates in 2022–23 compressed art multiples as discounted cash flow valuations fell. Net performance mixed.",
 perf2022: "+7.2% (Mei Moses)",
 },
 {
 asset: "Listed REITs",
 color: "sky",
 mechanism: "Rent + equity correlation",
 detail: "Short-term: poor (−20% in 2022 as rates rose). Long-term: good inflation hedge over 5+ years as rents re-price. REITs face dual headwind of cap-rate expansion and financing cost increases in rising rate environments. Better hedge than nominal bonds, worse than direct real estate.",
 perf2022: "-24.9% (MSCI REIT)",
 },
 ].map((item) => (
 <div key={item.asset} className={`p-3 rounded-lg bg-${item.color}-500/5 border border-${item.color}-500/20`}>
 <div className="flex justify-between items-start mb-1">
 <p className={`text-${item.color}-300 font-medium`}>{item.asset}</p>
 <span className={cn("text-xs font-medium", parseFloat(item.perf2022) >= 0 ? "text-emerald-400" : "text-red-400")}>{item.perf2022} (2022)</span>
 </div>
 <p className="text-muted-foreground mb-1 italic">{item.mechanism}</p>
 <p className="text-muted-foreground">{item.detail}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Yale Endowment + Listed vs Unlisted */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Institutional Real Assets Allocation
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 <p>The Yale Endowment model (pioneered by David Swensen) allocates 30%+ to real assets and private markets, delivering 11.3% annualised returns over 20 years vs 7.6% for a 60/40 portfolio. Other large endowments have followed suit.</p>
 <div className="space-y-2">
 {[
 { inst: "Yale Endowment", alloc: "33%", detail: "Real estate 9.5%, natural resources 4.5%, other real assets 19%" },
 { inst: "Harvard Management", alloc: "28%", detail: "Natural resources 14%, real estate 14%" },
 { inst: "CPPIB (Canada)", alloc: "22%", detail: "Infrastructure 8%, real estate 9%, energy resources 5%" },
 { inst: "APG (Netherlands)", alloc: "18%", detail: "Infrastructure 5.8%, real estate 12.2%" },
 ].map((r) => (
 <div key={r.inst} className="flex gap-3 p-2 rounded bg-muted/60">
 <div className="w-32 shrink-0">
 <p className="text-muted-foreground font-medium">{r.inst}</p>
 <p className="text-emerald-400 font-semibold">{r.alloc} real assets</p>
 </div>
 <p className="text-muted-foreground">{r.detail}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Listed vs Unlisted Premium &amp; Leverage
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3 text-xs text-muted-foreground">
 <div className="p-3 rounded-lg bg-muted/50">
 <p className="text-muted-foreground font-medium mb-1">Illiquidity Premium</p>
 <p>Unlisted real assets command a 1–3% annual premium vs listed equivalents for accepting illiquidity. For infrastructure: core unlisted infrastructure returns ~7–8% vs listed infrastructure equity ~5–6%. For real estate: private ODCE funds target 6–8% vs REIT total returns of 4–6% in normal markets.</p>
 </div>
 <div className="p-3 rounded-lg bg-muted/50">
 <p className="text-muted-foreground font-medium mb-1">Leverage by Asset Class</p>
 <div className="space-y-1.5 mt-2">
 {[
 { a: "Core Real Estate", lev: "40–50% LTV" },
 { a: "Value-Add Real Estate", lev: "55–70% LTV" },
 { a: "Core Infrastructure", lev: "50–65% LTV" },
 { a: "Timberland / Farmland", lev: "0–20% LTV" },
 { a: "Art / Collectibles", lev: "0% (no leverage)" },
 ].map((l) => (
 <div key={l.a} className="flex justify-between">
 <span className="text-muted-foreground">{l.a}</span>
 <span className="text-amber-300 font-medium">{l.lev}</span>
 </div>
 ))}
 </div>
 </div>
 <p className="text-muted-foreground">Higher leverage amplifies both returns and risk. Infrastructure's regulated cash flows support higher debt loads; art/collectibles have no income to service debt, hence zero leverage is standard.</p>
 </CardContent>
 </Card>
 </div>

 {/* Key Takeaways */}
 <Card className="bg-card border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 Key Takeaways for Real Asset Investors
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
 {[
 { point: "Biological assets offer harvest optionality", detail: "Timber and farmland have unique feature of deferring production when prices are unfavorable — acting as natural volatility dampeners unavailable in any financial asset.", color: "emerald" },
 { point: "Transaction costs determine holding period", detail: "Art's 25–30% round-trip cost means 10+ year minimum holds to justify returns. Infrastructure and real estate at 5–10% costs require 5–7 years. Only listed REITs have sub-1% transaction costs.", color: "blue" },
 { point: "Inflation linkage varies by contract structure", detail: "Infrastructure's contractual CPI escalators provide the most reliable inflation hedge. Farmland and timber hedge through commodity price linkage — slower and noisier but historically effective over 3+ year horizons.", color: "amber" },
 { point: "Royalties provide pure income without operational risk", detail: "Streaming companies and pharmaceutical royalty funds offer commodity-like income exposure with no capex, opex, or operational liability. The trade-off: no upside from operational efficiency improvements.", color: "purple" },
 { point: "Institutional allocation signals maturity", detail: "Yale/Harvard/CPPIB allocating 20–33% to real assets validates the asset class. Democratization via REITs, farmland REITs (FPI, LAND), and art platforms (Masterworks) brings access to retail investors.", color: "pink" },
 { point: "2022 validated the inflation hedge thesis", detail: "When equities fell 18% and bonds fell 13%, infrastructure returned +8%, farmland +12%, and timber +10%. Real assets provided the portfolio diversification they promised — but only for patient capital not forced to mark-to-market.", color: "sky" },
 ].map((item) => (
 <div key={item.point} className={`p-3 rounded-lg bg-${item.color}-500/5 border border-${item.color}-500/20`}>
 <p className={`text-${item.color}-300 font-medium mb-1`}>{item.point}</p>
 <p className="text-muted-foreground">{item.detail}</p>
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
