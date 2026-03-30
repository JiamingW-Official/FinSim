"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Image,
 TrendingUp,
 TrendingDown,
 BarChart3,
 DollarSign,
 Users,
 AlertTriangle,
 CheckCircle,
 Info,
 Layers,
 Lock,
 Percent,
 Zap,
 Award,
 ShieldCheck,
 Activity,
 ChevronDown,
 ChevronUp,
 Star,
 ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 652001;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

const NOISE = Array.from({ length: 300 }, () => rand());

// ── Interfaces ────────────────────────────────────────────────────────────────

interface NFTCollection {
 name: string;
 symbol: string;
 floorPrice: number;
 volume7d: number;
 holders: number;
 change7d: number;
 marketCap: number;
 blockchain: string;
 supply: number;
 listedPct: number;
}

interface TraitPricing {
 trait: string;
 rarity: number;
 floorMultiplier: number;
 avgSalePrice: number;
 sampleSize: number;
}

interface LendingProtocol {
 name: string;
 tvl: number;
 maxLtv: number;
 apy: number;
 collections: number;
 liquidations: number;
}

interface FractionProtocol {
 name: string;
 tvlM: number;
 collections: number;
 mechanism: string;
 avgFractionPrice: number;
}

interface FrameworkCriteria {
 category: string;
 criterion: string;
 weight: number;
 description: string;
 signals: string[];
}

interface WashSignal {
 signal: string;
 severity: "High" | "Medium" | "Low";
 description: string;
 detected: boolean;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const COLLECTIONS: NFTCollection[] = [
 {
 name: "CryptoPunks",
 symbol: "PUNK",
 floorPrice: 42.3,
 volume7d: 8740000,
 holders: 3812,
 change7d: 5.2,
 marketCap: 423000000,
 blockchain: "Ethereum",
 supply: 10000,
 listedPct: 2.1,
 },
 {
 name: "Bored Ape YC",
 symbol: "BAYC",
 floorPrice: 18.7,
 volume7d: 6120000,
 holders: 6392,
 change7d: -3.4,
 marketCap: 187000000,
 blockchain: "Ethereum",
 supply: 10000,
 listedPct: 3.4,
 },
 {
 name: "Azuki",
 symbol: "AZUKI",
 floorPrice: 8.9,
 volume7d: 3450000,
 holders: 5218,
 change7d: 11.7,
 marketCap: 89000000,
 blockchain: "Ethereum",
 supply: 10000,
 listedPct: 4.8,
 },
 {
 name: "DeGods",
 symbol: "DGOD",
 floorPrice: 5.4,
 volume7d: 2100000,
 holders: 4881,
 change7d: -8.1,
 marketCap: 54000000,
 blockchain: "Ethereum",
 supply: 10000,
 listedPct: 5.2,
 },
 {
 name: "Pudgy Penguins",
 symbol: "PPG",
 floorPrice: 11.2,
 volume7d: 4230000,
 holders: 7103,
 change7d: 14.3,
 marketCap: 112000000,
 blockchain: "Ethereum",
 supply: 8888,
 listedPct: 2.8,
 },
 {
 name: "Art Blocks",
 symbol: "AB",
 floorPrice: 3.1,
 volume7d: 1870000,
 holders: 9421,
 change7d: 2.6,
 marketCap: 31000000,
 blockchain: "Ethereum",
 supply: 10000,
 listedPct: 6.7,
 },
 {
 name: "Mad Lads",
 symbol: "MAD",
 floorPrice: 2.8,
 volume7d: 1340000,
 holders: 8234,
 change7d: -1.9,
 marketCap: 28000000,
 blockchain: "Solana",
 supply: 10000,
 listedPct: 8.3,
 },
 {
 name: "Tensorians",
 symbol: "TENS",
 floorPrice: 1.9,
 volume7d: 980000,
 holders: 5612,
 change7d: 6.8,
 marketCap: 19000000,
 blockchain: "Solana",
 supply: 10000,
 listedPct: 9.1,
 },
];

const VOLUME_DATA = [
 "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8",
 "W9", "W10", "W11", "W12",
].map((week, i) => ({
 week,
 volume: 4000000 + NOISE[i] * 8000000,
 washEstimate: (0.15 + NOISE[i + 20] * 0.2),
}));

const TRAIT_PRICING: TraitPricing[] = [
 { trait: "Gold Background", rarity: 0.8, floorMultiplier: 4.2, avgSalePrice: 178, sampleSize: 84 },
 { trait: "Laser Eyes", rarity: 1.1, floorMultiplier: 3.8, avgSalePrice: 160, sampleSize: 110 },
 { trait: "3D", rarity: 2.1, floorMultiplier: 2.9, avgSalePrice: 122, sampleSize: 210 },
 { trait: "Alien Skin", rarity: 0.4, floorMultiplier: 8.1, avgSalePrice: 342, sampleSize: 40 },
 { trait: "Zombie", rarity: 0.9, floorMultiplier: 5.3, avgSalePrice: 224, sampleSize: 90 },
 { trait: "Top Hat", rarity: 3.2, floorMultiplier: 1.7, avgSalePrice: 72, sampleSize: 320 },
 { trait: "None (Base)", rarity: 21.0, floorMultiplier: 1.0, avgSalePrice: 42, sampleSize: 2100 },
 { trait: "Blue Eyes", rarity: 5.8, floorMultiplier: 1.4, avgSalePrice: 59, sampleSize: 580 },
];

const LENDING_PROTOCOLS: LendingProtocol[] = [
 { name: "NFTfi", tvl: 87.4, maxLtv: 50, apy: 24.3, collections: 142, liquidations: 3.2 },
 { name: "BendDAO", tvl: 52.1, maxLtv: 40, apy: 18.7, collections: 12, liquidations: 8.7 },
 { name: "Arcade.xyz", tvl: 34.8, maxLtv: 45, apy: 21.0, collections: 89, liquidations: 2.1 },
 { name: "Drops.co", tvl: 21.3, maxLtv: 35, apy: 15.4, collections: 28, liquidations: 4.4 },
 { name: "Gondi", tvl: 16.9, maxLtv: 55, apy: 27.8, collections: 67, liquidations: 1.8 },
];

const FRACTION_PROTOCOLS: FractionProtocol[] = [
 { name: "Tessera", tvlM: 48.2, collections: 34, mechanism: "ERC-20 Vault", avgFractionPrice: 0.024 },
 { name: "PartyDAO", tvlM: 31.7, collections: 22, mechanism: "Governance Token", avgFractionPrice: 0.018 },
 { name: "NFTX", tvlM: 62.4, collections: 87, mechanism: "AMM Pool", avgFractionPrice: 0.041 },
 { name: "Unicly", tvlM: 11.8, collections: 15, mechanism: "uToken Baskets", avgFractionPrice: 0.009 },
];

const WASH_SIGNALS: WashSignal[] = [
 {
 signal: "Circular Wallet Trading",
 severity: "High",
 description: "Same wallet buys and sells within 48 hours across multiple accounts",
 detected: true,
 },
 {
 signal: "Volume/Holder Ratio Spike",
 severity: "High",
 description: "Volume exceeds 20% of total market cap in a single day",
 detected: false,
 },
 {
 signal: "Self-Financing Trades",
 severity: "High",
 description: "Buyer and seller traced to same funding source on-chain",
 detected: true,
 },
 {
 signal: "Zero-Fee DEX Exploits",
 severity: "Medium",
 description: "Trades routed through zero-royalty marketplaces to inflate volume",
 detected: true,
 },
 {
 signal: "Bid/Ask Spoofing",
 severity: "Medium",
 description: "Floor bids placed and quickly cancelled to manipulate price metrics",
 detected: false,
 },
 {
 signal: "Rapid Price Escalation",
 severity: "Low",
 description: "Price increases >200% in 7 days without organic social volume",
 detected: false,
 },
];

const FRAMEWORK_CRITERIA: FrameworkCriteria[] = [
 {
 category: "Creator Brand",
 criterion: "Creator Reputation",
 weight: 20,
 description: "Track record, public identity, prior successful projects",
 signals: ["Named team with history", "KYC verified", "Prior mint success", "Active development updates"],
 },
 {
 category: "Creator Brand",
 criterion: "IP & Licensing",
 weight: 10,
 description: "Commercial rights granted to holders, IP value potential",
 signals: ["CC0 license", "Commercial use rights", "Licensing revenue share", "Merchandise deals"],
 },
 {
 category: "Community",
 criterion: "Community Health",
 weight: 15,
 description: "Discord activity, Twitter engagement, organic growth metrics",
 signals: ["10k+ Discord members", "3%+ engagement rate", "Growing holder count", "IRL events"],
 },
 {
 category: "Community",
 criterion: "Whale Concentration",
 weight: 10,
 description: "Distribution of top holders; high concentration = manipulation risk",
 signals: ["No wallet >5% supply", "Top 10 < 20% supply", "Diverse geographic spread", "Low insider allocation"],
 },
 {
 category: "Utility",
 criterion: "On-chain Utility",
 weight: 20,
 description: "Staking, gaming integration, governance, yield generation",
 signals: ["Token staking rewards", "P2E integration", "DAO governance", "Protocol fee share"],
 },
 {
 category: "Utility",
 criterion: "Off-chain Utility",
 weight: 10,
 description: "Real-world perks, events, exclusive access, partnerships",
 signals: ["IRL events", "Brand partnerships", "Exclusive content", "Physical goods"],
 },
 {
 category: "Liquidity",
 criterion: "Market Depth",
 weight: 10,
 description: "Bid depth, listing depth, bid/ask spread, volume consistency",
 signals: [">50 bids at floor", "<10% listed supply", "<5% spread", "Consistent daily volume"],
 },
 {
 category: "Liquidity",
 criterion: "Wash Trade Risk",
 weight: 5,
 description: "Signals of artificial volume inflation reducing liquidity trust",
 signals: ["Chainalysis score > 80", "Diverse buyer wallets", "No circular trades", "Volume/holder ratio normal"],
 },
];

// ── Helper Functions ──────────────────────────────────────────────────────────

function fmtUSD(n: number, compact = true): string {
 if (compact && n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
 if (compact && n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
 return `$${n.toLocaleString()}`;
}

function fmtETH(n: number): string {
 return `${n.toFixed(2)} ETH`;
}

function clr(val: number): string {
 return val >= 0 ? "text-green-400" : "text-red-400";
}

function severityColor(s: "High" | "Medium" | "Low"): string {
 if (s === "High") return "bg-red-500/20 text-red-400 border-red-500/30";
 if (s === "Medium") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
 return "bg-muted/10 text-primary border-border";
}

// ── SVG Charts ────────────────────────────────────────────────────────────────

function VolumeBarChart() {
 const W = 600;
 const H = 180;
 const pad = { top: 16, right: 16, bottom: 32, left: 56 };
 const chartW = W - pad.left - pad.right;
 const chartH = H - pad.top - pad.bottom;

 const maxVol = Math.max(...VOLUME_DATA.map((d) => d.volume));
 const barW = chartW / VOLUME_DATA.length - 4;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
 {/* Grid lines */}
 {[0, 0.25, 0.5, 0.75, 1].map((t) => {
 const y = pad.top + chartH * (1 - t);
 const val = maxVol * t;
 return (
 <g key={t}>
 <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#334155" strokeWidth={1} />
 <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#64748b">
 {fmtUSD(val)}
 </text>
 </g>
 );
 })}
 {/* Bars */}
 {VOLUME_DATA.map((d, i) => {
 const x = pad.left + i * (chartW / VOLUME_DATA.length) + 2;
 const legitVol = d.volume * (1 - d.washEstimate);
 const washVol = d.volume * d.washEstimate;
 const legitH = (legitVol / maxVol) * chartH;
 const washH = (washVol / maxVol) * chartH;
 return (
 <g key={d.week}>
 <rect
 x={x}
 y={pad.top + chartH - legitH - washH}
 width={barW}
 height={legitH}
 fill="#3b82f6"
 rx={2}
 opacity={0.8}
 />
 <rect
 x={x}
 y={pad.top + chartH - washH}
 width={barW}
 height={washH}
 fill="#ef4444"
 rx={2}
 opacity={0.6}
 />
 <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="#64748b">
 {d.week}
 </text>
 </g>
 );
 })}
 {/* Legend */}
 <rect x={pad.left} y={4} width={10} height={8} fill="#3b82f6" rx={1} />
 <text x={pad.left + 13} y={11} fontSize={9} fill="#94a3b8">Organic Vol</text>
 <rect x={pad.left + 90} y={4} width={10} height={8} fill="#ef4444" rx={1} />
 <text x={pad.left + 103} y={11} fontSize={9} fill="#94a3b8">Est. Wash</text>
 </svg>
 );
}

function RarityHistogram() {
 const W = 600;
 const H = 200;
 const pad = { top: 16, right: 16, bottom: 36, left: 48 };
 const chartW = W - pad.left - pad.right;
 const chartH = H - pad.top - pad.bottom;

 // Generate rarity distribution (lognormal-ish)
 const buckets = 20;
 const counts = Array.from({ length: buckets }, (_, i) => {
 const t = i / buckets;
 // More common items at lower rarity scores, rare items at high end
 return Math.round(800 * Math.exp(-t * 4) * (0.7 + NOISE[i + 40] * 0.6));
 });
 const maxCount = Math.max(...counts);
 const barW = chartW / buckets - 2;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
 {[0, 0.25, 0.5, 0.75, 1].map((t) => {
 const y = pad.top + chartH * (1 - t);
 return (
 <g key={t}>
 <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#334155" strokeWidth={1} />
 <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#64748b">
 {Math.round(maxCount * t)}
 </text>
 </g>
 );
 })}
 {counts.map((count, i) => {
 const x = pad.left + i * (chartW / buckets) + 1;
 const h = (count / maxCount) * chartH;
 const rarityT = i / buckets;
 const hue = Math.round(220 - rarityT * 160); // blue → red for rarer items
 return (
 <rect
 key={i}
 x={x}
 y={pad.top + chartH - h}
 width={barW}
 height={h}
 fill={`hsl(${hue}, 70%, 55%)`}
 rx={1}
 opacity={0.85}
 />
 );
 })}
 {/* X-axis labels */}
 {[0, 25, 50, 75, 100].map((v) => {
 const x = pad.left + (v / 100) * chartW;
 return (
 <text key={v} x={x} y={H - 4} textAnchor="middle" fontSize={10} fill="#64748b">
 {v}
 </text>
 );
 })}
 <text x={W / 2} y={H - 0} textAnchor="middle" fontSize={11} fill="#94a3b8">
 Rarity Score (0 = Common, 100 = Legendary)
 </text>
 </svg>
 );
}

function ListingDepthChart() {
 const W = 600;
 const H = 180;
 const pad = { top: 16, right: 16, bottom: 32, left: 56 };
 const chartW = W - pad.left - pad.right;
 const chartH = H - pad.top - pad.bottom;

 // Cumulative listing depth — more listings appear at higher prices
 const points = Array.from({ length: 30 }, (_, i) => {
 const priceMult = 1 + i * 0.15;
 const cumListings = Math.round(i * i * 1.8 + NOISE[i + 60] * 20);
 return { priceMult, cumListings };
 });
 const maxListings = points[points.length - 1].cumListings;
 const maxMult = points[points.length - 1].priceMult;

 const toSvg = (priceMult: number, listings: number) => ({
 x: pad.left + ((priceMult - 1) / (maxMult - 1)) * chartW,
 y: pad.top + chartH - (listings / maxListings) * chartH,
 });

 const pathD = points
 .map((p, i) => {
 const { x, y } = toSvg(p.priceMult, p.cumListings);
 return `${i === 0 ? "M" : "L"} ${x} ${y}`;
 })
 .join(" ");

 const areaD =
 pathD +
 ` L ${pad.left + chartW} ${pad.top + chartH} L ${pad.left} ${pad.top + chartH} Z`;

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
 {[0, 0.25, 0.5, 0.75, 1].map((t) => {
 const y = pad.top + chartH * (1 - t);
 return (
 <g key={t}>
 <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#334155" strokeWidth={1} />
 <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#64748b">
 {Math.round(maxListings * t)}
 </text>
 </g>
 );
 })}
 <defs>
 <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
 <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
 </linearGradient>
 </defs>
 <path d={areaD} fill="url(#depthGrad)" />
 <path d={pathD} stroke="#8b5cf6" strokeWidth={2} fill="none" />
 {/* Floor price marker */}
 <line x1={pad.left} x2={pad.left} y1={pad.top} y2={pad.top + chartH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
 <text x={pad.left + 4} y={pad.top + 12} fontSize={9} fill="#f59e0b">Floor</text>
 {/* X axis labels */}
 {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((mult) => {
 const x = pad.left + ((mult - 1) / (maxMult - 1)) * chartW;
 return (
 <text key={mult} x={x} y={H - 4} textAnchor="middle" fontSize={9} fill="#64748b">
 {mult}x
 </text>
 );
 })}
 </svg>
 );
}

function HolderDistributionChart() {
 const W = 380;
 const H = 200;
 const cx = W / 2;
 const cy = H / 2 + 10;
 const r = 75;

 const segments = [
 { label: "Whales (>10)", pct: 12, color: "#8b5cf6" },
 { label: "Dolphins (3-10)", pct: 28, color: "#3b82f6" },
 { label: "Retail (1-2)", pct: 45, color: "#10b981" },
 { label: "Flippers (<30d)", pct: 15, color: "#f59e0b" },
 ];

 let cumAngle = -Math.PI / 2;
 const arcs = segments.map((seg) => {
 const angle = (seg.pct / 100) * 2 * Math.PI;
 const startAngle = cumAngle;
 const endAngle = cumAngle + angle;
 cumAngle = endAngle;
 const x1 = cx + r * Math.cos(startAngle);
 const y1 = cy + r * Math.sin(startAngle);
 const x2 = cx + r * Math.cos(endAngle);
 const y2 = cy + r * Math.sin(endAngle);
 const largeArc = angle > Math.PI ? 1 : 0;
 const midAngle = startAngle + angle / 2;
 const lx = cx + (r + 28) * Math.cos(midAngle);
 const ly = cy + (r + 28) * Math.sin(midAngle);
 return { ...seg, x1, y1, x2, y2, largeArc, lx, ly };
 });

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
 {arcs.map((a) => (
 <g key={a.label}>
 <path
 d={`M ${cx} ${cy} L ${a.x1} ${a.y1} A ${r} ${r} 0 ${a.largeArc} 1 ${a.x2} ${a.y2} Z`}
 fill={a.color}
 opacity={0.8}
 stroke="#0f172a"
 strokeWidth={1.5}
 />
 <text x={a.lx} y={a.ly} textAnchor="middle" fontSize={9} fill="#e2e8f0">
 {a.pct}%
 </text>
 </g>
 ))}
 {/* Center label */}
 <text x={cx} y={cy - 4} textAnchor="middle" fontSize={12} fill="#f1f5f9" fontWeight="bold">
 10k
 </text>
 <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill="#64748b">
 holders
 </text>
 {/* Legend */}
 {segments.map((seg, i) => (
 <g key={seg.label} transform={`translate(8, ${H - 56 + i * 13})`}>
 <rect width={10} height={8} fill={seg.color} rx={1} y={1} />
 <text x={14} y={9} fontSize={9} fill="#94a3b8">
 {seg.label}
 </text>
 </g>
 ))}
 </svg>
 );
}

function HedonicRegressionChart() {
 const W = 600;
 const H = 200;
 const pad = { top: 20, right: 24, bottom: 40, left: 56 };
 const chartW = W - pad.left - pad.right;
 const chartH = H - pad.top - pad.bottom;

 // Scatter: rarity score vs. sale price
 const scatter = Array.from({ length: 60 }, (_, i) => {
 const rarityScore = NOISE[i + 80] * 100;
 const basePrice = 42 * Math.exp(rarityScore * 0.018);
 const noise = (NOISE[i + 140] - 0.5) * basePrice * 0.4;
 return { x: rarityScore, y: Math.max(1, basePrice + noise) };
 });
 const maxX = 100;
 const maxY = 400;

 // Regression line points
 const regLine = [
 { x: 0, y: 42 },
 { x: 100, y: 42 * Math.exp(0.018 * 100) },
 ];

 return (
 <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52">
 {[0, 0.25, 0.5, 0.75, 1].map((t) => {
 const y = pad.top + chartH * (1 - t);
 return (
 <g key={t}>
 <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#334155" strokeWidth={1} />
 <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#64748b">
 {Math.round(maxY * t)}
 </text>
 </g>
 );
 })}
 {/* Scatter points */}
 {scatter.map((pt, i) => (
 <circle
 key={i}
 cx={pad.left + (pt.x / maxX) * chartW}
 cy={pad.top + chartH - Math.min((pt.y / maxY), 1) * chartH}
 r={3}
 fill="#3b82f6"
 opacity={0.5}
 />
 ))}
 {/* Regression line */}
 <line
 x1={pad.left + (regLine[0].x / maxX) * chartW}
 y1={pad.top + chartH - Math.min(regLine[0].y / maxY, 1) * chartH}
 x2={pad.left + (regLine[1].x / maxX) * chartW}
 y2={pad.top + chartH - Math.min(regLine[1].y / maxY, 1) * chartH}
 stroke="#f59e0b"
 strokeWidth={2}
 />
 {/* X axis */}
 {[0, 25, 50, 75, 100].map((v) => {
 const x = pad.left + (v / 100) * chartW;
 return (
 <g key={v}>
 <line x1={x} x2={x} y1={pad.top + chartH} y2={pad.top + chartH + 4} stroke="#475569" />
 <text x={x} y={pad.top + chartH + 14} textAnchor="middle" fontSize={10} fill="#64748b">{v}</text>
 </g>
 );
 })}
 <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#94a3b8">Rarity Score</text>
 <text x={8} y={pad.top + chartH / 2} textAnchor="middle" fontSize={10} fill="#94a3b8" transform={`rotate(-90, 8, ${pad.top + chartH / 2})`}>Price (ETH)</text>
 {/* Legend */}
 <circle cx={pad.left + 8} cy={pad.top + 8} r={3} fill="#3b82f6" opacity={0.5} />
 <text x={pad.left + 16} y={pad.top + 12} fontSize={9} fill="#94a3b8">Sales</text>
 <line x1={pad.left + 60} y1={pad.top + 8} x2={pad.left + 76} y2={pad.top + 8} stroke="#f59e0b" strokeWidth={2} />
 <text x={pad.left + 80} y={pad.top + 12} fontSize={9} fill="#94a3b8">Hedonic Fit</text>
 </svg>
 );
}

// ── Sub-Sections ──────────────────────────────────────────────────────────────

function MarketOverview() {
 const totalMcap = COLLECTIONS.reduce((acc, c) => acc + c.marketCap, 0);
 const totalVol = COLLECTIONS.reduce((acc, c) => acc + c.volume7d, 0);
 const avgChange = COLLECTIONS.reduce((acc, c) => acc + c.change7d, 0) / COLLECTIONS.length;

 return (
 <div className="space-y-4">
 {/* KPI chips */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 { label: "Total NFT Market Cap", value: fmtUSD(totalMcap), icon: DollarSign, color: "text-primary" },
 { label: "7d Trading Volume", value: fmtUSD(totalVol), icon: BarChart3, color: "text-primary" },
 { label: "Avg 7d Change", value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(1)}%`, icon: TrendingUp, color: avgChange >= 0 ? "text-green-400" : "text-red-400" },
 { label: "Active Collections", value: "94,200+", icon: Image, color: "text-amber-400" },
 ].map((kpi) => (
 <Card key={kpi.label} className="bg-muted/60 border-border">
 <CardContent className="pt-4 pb-4">
 <div className="flex items-center gap-2 mb-1">
 <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
 <span className="text-xs text-muted-foreground">{kpi.label}</span>
 </div>
 <p className={`text-xl font-semibold ${kpi.color}`}>{kpi.value}</p>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Collections table */}
 <Card className="bg-muted/60 border-border border-l-4 border-l-primary">
 <CardHeader className="pb-2">
 <CardTitle className="text-lg font-semibold text-foreground">Top NFT Collections</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Collection", "Floor", "7d Vol", "Holders", "7d Change", "Mkt Cap", "Listed %", "Chain"].map((h) => (
 <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {COLLECTIONS.map((c, i) => (
 <motion.tr
 key={c.name}
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.04 }}
 className="border-b border-border hover:bg-muted/30 transition-colors"
 >
 <td className="px-3 py-2 font-medium text-foreground">{c.name}</td>
 <td className="px-3 py-2 text-primary">{fmtETH(c.floorPrice)}</td>
 <td className="px-3 py-2 text-muted-foreground">{fmtUSD(c.volume7d)}</td>
 <td className="px-3 py-2 text-muted-foreground">{c.holders.toLocaleString()}</td>
 <td className={`px-3 py-2 font-medium ${clr(c.change7d)}`}>
 {c.change7d >= 0 ? "+" : ""}{c.change7d.toFixed(1)}%
 </td>
 <td className="px-3 py-2 text-muted-foreground">{fmtUSD(c.marketCap)}</td>
 <td className="px-3 py-2">
 <Progress value={c.listedPct * 4} className="h-1.5 w-16 bg-muted" />
 <span className="text-muted-foreground mt-0.5 block">{c.listedPct}%</span>
 </td>
 <td className="px-3 py-2">
 <Badge variant="outline" className="text-xs border-border text-muted-foreground">
 {c.blockchain}
 </Badge>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Volume chart */}
 <Card className="mt-8 bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-semibold text-foreground">Weekly Volume (12 Weeks) — Organic vs. Wash Estimate</CardTitle>
 <Badge variant="outline" className="text-xs border-red-500/40 text-red-400">
 Wash Trading ~18% Avg
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <VolumeBarChart />
 </CardContent>
 </Card>
 </div>
 );
}

function CollectionAnalysis() {
 return (
 <div className="space-y-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
 {/* Rarity histogram */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold text-foreground">Rarity Score Distribution</CardTitle>
 <p className="text-xs text-muted-foreground">Supply count by rarity tier — value accrues to right tail</p>
 </CardHeader>
 <CardContent>
 <RarityHistogram />
 </CardContent>
 </Card>

 {/* Holder distribution */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Holder Distribution</CardTitle>
 <p className="text-xs text-muted-foreground">Wallet concentration by holding size</p>
 </CardHeader>
 <CardContent>
 <HolderDistributionChart />
 </CardContent>
 </Card>
 </div>

 {/* Listing depth */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Listing Depth Chart — Cumulative Listings by Price Multiple</CardTitle>
 <p className="text-xs text-muted-foreground">
 Steeper curve near floor = thin liquidity wall; wide spread = deep market with low slippage risk
 </p>
 </CardHeader>
 <CardContent>
 <ListingDepthChart />
 </CardContent>
 </Card>

 {/* Whale concentration metrics */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Whale Concentration Metrics</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 { label: "Top 10 Wallets", value: "14.2%", sub: "of supply", status: "healthy" },
 { label: "Top 50 Wallets", value: "38.7%", sub: "of supply", status: "moderate" },
 { label: "Gini Coefficient", value: "0.71", sub: "concentration", status: "moderate" },
 { label: "Unique Holders", value: "6,392", sub: "/ 10,000 supply", status: "healthy" },
 ].map((m) => (
 <div key={m.label} className="bg-muted/40 rounded-lg p-3 text-center">
 <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
 <p className={`text-lg font-semibold ${m.status === "healthy" ? "text-green-400" : m.status === "moderate" ? "text-amber-400" : "text-red-400"}`}>
 {m.value}
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
 </div>
 ))}
 </div>
 <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
 <p className="text-xs text-amber-300">
 <strong>Interpretation:</strong> A Gini coefficient above 0.7 signals moderate concentration.
 Monitor large wallets for sell pressure — a single whale exit can crash floor prices 20-40% in illiquid collections.
 </p>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

function PricingModels() {
 return (
 <div className="space-y-4">
 {/* Hedonic regression concept */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Hedonic Regression — Trait-Adjusted Pricing Model</CardTitle>
 <p className="text-xs text-muted-foreground">
 Each trait contributes independently to price. Model: ln(Price) = α + β₁·Rarity + ε
 </p>
 </CardHeader>
 <CardContent>
 <HedonicRegressionChart />
 <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 {[
 { label: "R² (Fit Quality)", value: "0.78", color: "text-green-400" },
 { label: "Base Floor (α)", value: "42.3 ETH", color: "text-primary" },
 { label: "Rarity Coefficient (β₁)", value: "+0.018", color: "text-primary" },
 ].map((s) => (
 <div key={s.label} className="bg-muted/40 rounded-lg p-2 text-center">
 <p className="text-muted-foreground">{s.label}</p>
 <p className={`font-medium mt-0.5 ${s.color}`}>{s.value}</p>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Trait pricing table */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Trait-Based Price Premiums</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Trait", "Rarity %", "Floor Mult.", "Avg Sale (ETH)", "Sample Size", "Signal"].map((h) => (
 <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {TRAIT_PRICING.map((tp, i) => (
 <tr key={i} className="border-b border-border hover:bg-muted/30">
 <td className="px-3 py-2 font-medium text-foreground">{tp.trait}</td>
 <td className="px-3 py-2 text-muted-foreground">{tp.rarity}%</td>
 <td className={`px-3 py-2 font-medium ${tp.floorMultiplier > 3 ? "text-green-400" : tp.floorMultiplier > 1.5 ? "text-amber-400" : "text-muted-foreground"}`}>
 {tp.floorMultiplier.toFixed(1)}x
 </td>
 <td className="px-3 py-2 text-primary">{tp.avgSalePrice} ETH</td>
 <td className="px-3 py-2 text-muted-foreground">{tp.sampleSize}</td>
 <td className="px-3 py-2">
 {tp.sampleSize < 100 ? (
 <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs">Thin Data</Badge>
 ) : tp.floorMultiplier > 4 ? (
 <Badge variant="outline" className="border-green-500/40 text-green-400 text-xs">Strong Premium</Badge>
 ) : (
 <Badge variant="outline" className="border-border text-muted-foreground text-xs">Normal</Badge>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Wash trading signals */}
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Wash Trading Detection Signals</CardTitle>
 <p className="text-xs text-muted-foreground">On-chain heuristics for identifying artificial volume inflation</p>
 </CardHeader>
 <CardContent className="space-y-3">
 {WASH_SIGNALS.map((ws, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.06 }}
 className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg"
 >
 <div className={`mt-0.5 flex-shrink-0 ${ws.detected ? "text-red-400" : "text-green-400"}`}>
 {ws.detected ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-sm font-medium text-foreground">{ws.signal}</span>
 <Badge variant="outline" className={`text-xs text-muted-foreground border ${severityColor(ws.severity)}`}>
 {ws.severity}
 </Badge>
 {ws.detected && (
 <Badge variant="outline" className="text-xs border-red-500/40 text-red-400">Detected</Badge>
 )}
 </div>
 <p className="text-xs text-muted-foreground">{ws.description}</p>
 </div>
 </motion.div>
 ))}
 </CardContent>
 </Card>
 </div>
 );
}

function NFTFinancialization() {
 const [expandedSection, setExpandedSection] = useState<string | null>("lending");

 const sections = [
 {
 id: "lending",
 icon: Lock,
 title: "NFT Collateralized Lending",
 color: "text-primary",
 content: (
 <div className="space-y-4">
 <p className="text-xs text-muted-foreground leading-relaxed">
 NFT lending protocols allow holders to borrow ETH/stablecoins against their NFTs without selling. The NFT is locked in a smart contract escrow. If the borrower defaults, the lender claims the NFT. Key risk: floor price volatility can trigger liquidations rapidly.
 </p>
 <div className="grid grid-cols-1 gap-3">
 {LENDING_PROTOCOLS.map((lp) => (
 <div key={lp.name} className="bg-muted/40 rounded-lg p-3">
 <div className="flex items-center justify-between mb-2">
 <span className="font-medium text-foreground text-sm">{lp.name}</span>
 <div className="flex gap-2">
 <Badge variant="outline" className="text-xs border-primary/40 text-primary">
 {lp.maxLtv}% LTV
 </Badge>
 <Badge variant="outline" className="text-xs border-green-500/40 text-green-400">
 {lp.apy}% APY
 </Badge>
 </div>
 </div>
 <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
 <div>
 <p className="text-muted-foreground">TVL</p>
 <p className="text-muted-foreground font-medium">${lp.tvl}M</p>
 </div>
 <div>
 <p className="text-muted-foreground">Collections</p>
 <p className="text-muted-foreground font-medium">{lp.collections}</p>
 </div>
 <div>
 <p className="text-muted-foreground">Liquidation Rate</p>
 <p className={`font-medium ${lp.liquidations > 5 ? "text-red-400" : "text-green-400"}`}>
 {lp.liquidations}%
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="p-3 bg-muted/10 border border-border rounded-lg">
 <p className="text-xs text-primary">
 <strong>Key Risk:</strong> Peer-to-peer lending (NFTfi) shifts liquidation risk to individual lenders. Pool-based models (BendDAO) socialize risk but can suffer bank runs when floor prices crash — causing a liquidation spiral.
 </p>
 </div>
 </div>
 ),
 },
 {
 id: "fractions",
 icon: Layers,
 title: "Fractional NFT Ownership",
 color: "text-primary",
 content: (
 <div className="space-y-4">
 <p className="text-xs text-muted-foreground leading-relaxed">
 Fractionalization splits a high-value NFT into fungible ERC-20 tokens, enabling partial ownership. This democratizes access to blue-chip NFTs and creates liquid trading markets for otherwise illiquid assets.
 </p>
 <div className="grid grid-cols-2 gap-3">
 {FRACTION_PROTOCOLS.map((fp) => (
 <div key={fp.name} className="bg-muted/40 rounded-lg p-3">
 <p className="font-medium text-foreground text-sm mb-1">{fp.name}</p>
 <div className="space-y-1 text-xs text-muted-foreground">
 <div className="flex justify-between">
 <span className="text-muted-foreground">TVL</span>
 <span className="text-primary">${fp.tvlM}M</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Collections</span>
 <span className="text-muted-foreground">{fp.collections}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Mechanism</span>
 <span className="text-muted-foreground">{fp.mechanism}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-muted-foreground">Avg Fraction</span>
 <span className="text-muted-foreground">${fp.avgFractionPrice}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="p-3 bg-muted/10 border border-border rounded-lg">
 <p className="text-xs text-primary">
 <strong>Reconstruction Risk:</strong> When more than 50% of fraction holders vote to buy out the NFT, fractions are redeemed at a fixed price. This can cause arbitrage if the buyout price differs from the implied fraction market cap.
 </p>
 </div>
 </div>
 ),
 },
 {
 id: "royalties",
 icon: Percent,
 title: "Royalty Streams & Creator Economics",
 color: "text-green-400",
 content: (
 <div className="space-y-3">
 <p className="text-xs text-muted-foreground leading-relaxed">
 NFT creators historically earned 2.5–10% on every secondary sale. The rise of zero-royalty marketplaces (Blur, X2Y2) has disrupted this model, forcing projects to enforce on-chain royalties via transfer hooks.
 </p>
 <div className="grid grid-cols-2 gap-3">
 {[
 { label: "Typical Royalty", value: "5–7.5%", color: "text-green-400" },
 { label: "Blur Market Share", value: "~60%", color: "text-amber-400" },
 { label: "Royalty Bypass Rate", value: "~72%", color: "text-red-400" },
 { label: "Creator Revenue Loss", value: "$1.8B+", color: "text-red-400" },
 ].map((m) => (
 <div key={m.label} className="bg-muted/40 rounded p-3 text-center">
 <p className="text-xs text-muted-foreground">{m.label}</p>
 <p className={`font-medium text-lg mt-1 ${m.color}`}>{m.value}</p>
 </div>
 ))}
 </div>
 <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
 <p className="text-xs text-green-300">
 <strong>On-chain Enforcement:</strong> EIP-2981 standardizes royalty info. Operator filter registries (e.g., OpenSea&apos;s OFR) block non-compliant marketplaces at the contract level — but traders route around them using wrapper contracts.
 </p>
 </div>
 </div>
 ),
 },
 {
 id: "ip",
 icon: ShieldCheck,
 title: "IP Rights & Commercial Licensing",
 color: "text-amber-400",
 content: (
 <div className="space-y-3">
 <p className="text-xs text-muted-foreground leading-relaxed">
 IP rights in NFTs range from full CC0 (public domain) to limited personal use. Projects like BAYC grant holders full commercial rights — enabling merchandise, films, and brand licensing. This creates a &quot;brand equity floor&quot; independent of speculative trading.
 </p>
 <div className="space-y-2">
 {[
 { name: "CC0 (Public Domain)", desc: "Anyone can use freely. Builds culture but no IP moat.", example: "CryptoPunks, Nouns" },
 { name: "Commercial Rights", desc: "Holder retains commercial rights for their specific token.", example: "BAYC, MAYC" },
 { name: "Personal Use Only", desc: "Display/PFP use only; no commercialization.", example: "Most PFP projects" },
 { name: "Licensed IP", desc: "Project retains IP; holders get product revenue share.", example: "Azuki Elementals" },
 ].map((t) => (
 <div key={t.name} className="bg-muted/40 rounded-lg p-3">
 <div className="flex items-start justify-between">
 <p className="text-sm font-medium text-foreground">{t.name}</p>
 <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 ml-2 flex-shrink-0">{t.example}</Badge>
 </div>
 <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
 </div>
 ))}
 </div>
 </div>
 ),
 },
 ];

 return (
 <div className="space-y-3">
 {sections.map((sec) => {
 const isOpen = expandedSection === sec.id;
 return (
 <Card key={sec.id} className="bg-muted/60 border-border">
 <button
 onClick={() => setExpandedSection(isOpen ? null : sec.id)}
 className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors rounded-t-xl"
 >
 <div className="flex items-center gap-3">
 <sec.icon className={`w-4 h-4 ${sec.color}`} />
 <span className="font-medium text-foreground text-sm">{sec.title}</span>
 </div>
 {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
 </button>
 <AnimatePresence initial={false}>
 {isOpen && (
 <motion.div
 key="content"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.25, ease: "easeInOut" }}
 className="overflow-hidden"
 >
 <CardContent className="pt-0 pb-4">{sec.content}</CardContent>
 </motion.div>
 )}
 </AnimatePresence>
 </Card>
 );
 })}
 </div>
 );
}

function InvestmentFramework() {
 const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

 const categories = ["Creator Brand", "Community", "Utility", "Liquidity"];
 const categoryColors: Record<string, string> = {
 "Creator Brand": "text-primary",
 Community: "text-green-400",
 Utility: "text-primary",
 Liquidity: "text-amber-400",
 };

 const filtered = selectedCategory
 ? FRAMEWORK_CRITERIA.filter((c) => c.category === selectedCategory)
 : FRAMEWORK_CRITERIA;

 const totalWeight = FRAMEWORK_CRITERIA.reduce((a, c) => a + c.weight, 0);

 return (
 <div className="space-y-4">
 {/* Weight overview donut */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Scoring Weight Distribution</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {categories.map((cat) => {
 const catWeight = FRAMEWORK_CRITERIA.filter((c) => c.category === cat).reduce((a, c) => a + c.weight, 0);
 const pct = (catWeight / totalWeight) * 100;
 return (
 <div key={cat}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className={categoryColors[cat]}>{cat}</span>
 <span className="text-muted-foreground">{catWeight}%</span>
 </div>
 <Progress value={pct} className="h-2 bg-muted" />
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 <Card className="bg-muted/60 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-medium text-foreground">Quick Score — Example Rating</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {[
 { label: "Creator Brand", score: 78, max: 30 },
 { label: "Community", score: 41, max: 25 },
 { label: "Utility", score: 22, max: 30 },
 { label: "Liquidity", score: 12, max: 15 },
 ].map((row) => (
 <div key={row.label}>
 <div className="flex justify-between text-xs text-muted-foreground mb-1">
 <span className={categoryColors[row.label]}>{row.label}</span>
 <span className="text-muted-foreground">
 {row.score}/{row.max * (row.label === "Creator Brand" ? 1 : 1)} pts
 </span>
 </div>
 <Progress value={(row.score / row.max) * 100} className="h-1.5 bg-muted" />
 </div>
 ))}
 <div className="mt-3 p-3 bg-muted/60 rounded-lg flex items-center justify-between">
 <div>
 <p className="text-xs text-muted-foreground">Total Score</p>
 <p className="text-2xl font-semibold text-green-400">153<span className="text-sm text-muted-foreground">/200</span></p>
 </div>
 <div className="text-center">
 <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-sm px-3">
 B+ Rating
 </Badge>
 <p className="text-xs text-muted-foreground mt-1">Strong Buy Zone</p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Category filter */}
 <div className="flex gap-2 flex-wrap">
 <button
 onClick={() => setSelectedCategory(null)}
 className={`px-3 py-1.5 rounded-md text-xs text-muted-foreground font-medium transition-colors ${
 selectedCategory === null
 ? "bg-muted text-foreground"
 : "bg-muted/60 text-muted-foreground hover:bg-muted/60"
 }`}
 >
 All Criteria
 </button>
 {categories.map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
 className={`px-3 py-1.5 rounded-md text-xs text-muted-foreground font-medium transition-colors ${
 selectedCategory === cat
 ? "bg-muted text-foreground"
 : "bg-muted/60 text-muted-foreground hover:bg-muted/60"
 }`}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* Rubric table */}
 <Card className="bg-muted/60 border-border">
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 {["Category", "Criterion", "Weight", "Description", "Green-Flag Signals"].map((h) => (
 <th key={h} className="px-3 py-2.5 text-left text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((c, i) => (
 <motion.tr
 key={`${c.criterion}-${i}`}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: i * 0.05 }}
 className="border-b border-border hover:bg-muted/20 align-top"
 >
 <td className="px-3 py-3">
 <span className={`font-medium ${categoryColors[c.category]}`}>{c.category}</span>
 </td>
 <td className="px-3 py-3 font-medium text-foreground">{c.criterion}</td>
 <td className="px-3 py-3">
 <Badge variant="outline" className="border-border text-muted-foreground font-medium">
 {c.weight}%
 </Badge>
 </td>
 <td className="px-3 py-3 text-muted-foreground max-w-xs">{c.description}</td>
 <td className="px-3 py-3">
 <ul className="space-y-0.5">
 {c.signals.map((sig) => (
 <li key={sig} className="flex items-center gap-1.5">
 <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
 <span className="text-muted-foreground">{sig}</span>
 </li>
 ))}
 </ul>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Risk warning */}
 <Card className="bg-red-500/5 border-red-500/20">
 <CardContent className="pt-4">
 <div className="flex gap-3">
 <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
 <div>
 <p className="text-sm font-medium text-red-400 mb-1">NFT Investment Risk Disclosure</p>
 <p className="text-xs text-red-300/80 leading-relaxed">
 NFTs are highly speculative, illiquid assets with no guaranteed intrinsic value. Prices are driven by community sentiment and can decline 90%+ in bear markets. Smart contract bugs, marketplace failures, and key-person risk (creator abandonment) can cause total loss.
 The NFT market has historically exhibited extreme cyclicality. Liquidity can disappear overnight. Only allocate capital you can afford to lose entirely.
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function NFTPage() {
 const totalMcap = useMemo(
 () => COLLECTIONS.reduce((acc, c) => acc + c.marketCap, 0),
 []
 );

 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">NFT Markets</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">COLLECTIONS · FLOOR · VOLUME · RARITY</p>

 {/* Market ticker strip */}
 <div className="flex gap-3 overflow-x-auto pb-1 mb-4">
 {COLLECTIONS.slice(0, 6).map((c) => (
 <div
 key={c.name}
 className="flex-shrink-0 rounded-lg border border-border bg-muted/30 px-3 py-2 flex items-center gap-3"
 >
 <span className="text-xs font-medium text-muted-foreground">{c.name}</span>
 <span className="text-xs font-mono tabular-nums text-foreground">{fmtETH(c.floorPrice)}</span>
 <span className={`text-xs font-medium flex items-center gap-0.5 ${clr(c.change7d)}`}>
 {c.change7d >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
 {Math.abs(c.change7d).toFixed(1)}%
 </span>
 </div>
 ))}
 </div>

 <div className="border-t border-border my-6" />

 {/* Main tabs */}
 <Tabs defaultValue="overview" className="w-full">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Market Overview</TabsTrigger>
 <TabsTrigger value="analysis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Collection Analysis</TabsTrigger>
 <TabsTrigger value="pricing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Pricing Models</TabsTrigger>
 <TabsTrigger value="finance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Financialization</TabsTrigger>
 <TabsTrigger value="framework" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">Investment Framework</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="mt-6 data-[state=inactive]:hidden">
 <MarketOverview />
 </TabsContent>

 <TabsContent value="analysis" className="mt-6 data-[state=inactive]:hidden">
 <CollectionAnalysis />
 </TabsContent>

 <TabsContent value="pricing" className="mt-6 data-[state=inactive]:hidden">
 <PricingModels />
 </TabsContent>

 <TabsContent value="finance" className="mt-6 data-[state=inactive]:hidden">
 <NFTFinancialization />
 </TabsContent>

 <TabsContent value="framework" className="mt-6 data-[state=inactive]:hidden">
 <InvestmentFramework />
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
