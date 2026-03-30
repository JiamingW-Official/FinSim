"use client";

import { useState, useMemo } from "react";
import {
 TrendingUp,
 TrendingDown,
 Building2,
 Calendar,
 DollarSign,
 BarChart3,
 BookOpen,
 Users,
 Lock,
 ChevronRight,
 Info,
 AlertTriangle,
 CheckCircle2,
 Clock,
 Award,
 Layers,
 ArrowUpDown,
 Globe,
 Percent,
 Shield,
 FileText,
 Zap,
 RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 89;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

function resetSeed() {
 s = 89;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface IPOStage {
 id: number;
 name: string;
 duration: string;
 description: string;
 keyPlayers: string[];
 icon: React.ReactNode;
}

interface RecentIPO {
 id: string;
 company: string;
 ticker: string;
 sector: string;
 offerPrice: number;
 currentPrice: number;
 firstDayClose: number;
 marketCap: number; // billions
 date: string;
 lockupExpired: boolean;
}

interface SPACItem {
 id: string;
 name: string;
 ticker: string;
 sponsor: string;
 target: string | null;
 trustValue: number;
 currentPrice: number;
 deadlineMonths: number;
 raiseSize: number; // $M
 sector: string;
 status: "searching" | "announced" | "voting";
}

interface DCMDeal {
 id: string;
 issuer: string;
 sector: string;
 size: number; // $B
 coupon: number; // %
 rating: string;
 tenor: string;
 useOfProceeds: string;
 type: "investment-grade" | "high-yield" | "loan";
 date: string;
}

interface UpcomingIPO {
 id: string;
 company: string;
 sector: string;
 expectedSize: number; // $B
 expectedQ: string;
 stage: "filed" | "roadshow" | "pricing";
 lastValuation: number; // $B
}

interface LeagueTableEntry {
 rank: number;
 bank: string;
 volume: number; // $B
 deals: number;
 share: number; // %
 change: number; // rank change
}

// ── Static Data ────────────────────────────────────────────────────────────────

const IPO_STAGES: IPOStage[] = [
 {
 id: 1,
 name: "S-1 Filing",
 duration: "Month 1–2",
 description:
 "Company files registration statement with SEC disclosing business model, financials (3 years audited), risk factors, and use of proceeds. SEC reviews and issues comment letters.",
 keyPlayers: ["Company management", "Underwriters", "SEC", "Auditors"],
 icon: <FileText className="w-4 h-4" />,
 },
 {
 id: 2,
 name: "SEC Review",
 duration: "Month 2–4",
 description:
 "SEC reviews the S-1, issues comment letters. Company responds and amends S-1 (S-1/A). Typically 2–4 rounds. Legal and accounting teams address each comment.",
 keyPlayers: ["SEC Division of Corporation Finance", "Legal counsel", "Auditors"],
 icon: <Shield className="w-4 h-4" />,
 },
 {
 id: 3,
 name: "Underwriter Selection",
 duration: "Month 1–3",
 description:
 "Company selects lead-left bookrunner and co-managers via bake-off presentations. Bankers pitch valuation, syndicate, distribution reach, and aftermarket support capabilities.",
 keyPlayers: ["Investment banks", "Board of directors", "CFO"],
 icon: <Building2 className="w-4 h-4" />,
 },
 {
 id: 4,
 name: "Organizational Meeting",
 duration: "Month 2",
 description:
 'All-hands kickoff: underwriters, legal counsel, auditors, and company management align on IPO timeline, roles, due diligence workstreams, and "testing the waters" plan.',
 keyPlayers: ["Full IPO syndicate", "Company management", "All advisors"],
 icon: <Users className="w-4 h-4" />,
 },
 {
 id: 5,
 name: "Roadshow Preparation",
 duration: "Month 4–5",
 description:
 "Draft investor presentation (roadshow deck), prepare management for Q&A, finalize preliminary prospectus (red herring). Analysts publish initiation reports.",
 keyPlayers: ["Management team", "IR team", "Equity research analysts"],
 icon: <BookOpen className="w-4 h-4" />,
 },
 {
 id: 6,
 name: "Roadshow",
 duration: "2 weeks",
 description:
 "CEO/CFO present to 50–150 institutional investors across major cities (NYC, Boston, San Francisco, London). 1×1 meetings, group lunches, conference calls. Investors submit indications of interest.",
 keyPlayers: ["C-suite", "Institutional investors", "Lead bookrunner"],
 icon: <Globe className="w-4 h-4" />,
 },
 {
 id: 7,
 name: "Book Building",
 duration: "2 weeks (concurrent)",
 description:
 "Underwriters collect indications of interest: price, quantity, and type (strike/limit). Book typically 10–20× oversubscribed. Bankers assess quality of demand and recommend final price.",
 keyPlayers: ["Bookrunner syndicate desk", "Institutional investors"],
 icon: <BarChart3 className="w-4 h-4" />,
 },
 {
 id: 8,
 name: "Pricing Night",
 duration: "Evening before listing",
 description:
 "Underwriters and company set final offer price based on book quality. Allocations communicated to investors. Company and underwriters execute underwriting agreement.",
 keyPlayers: ["Lead bookrunner", "Company board", "Major accounts"],
 icon: <DollarSign className="w-4 h-4" />,
 },
 {
 id: 9,
 name: "First Day Trading",
 duration: "Listing day",
 description:
 "Shares begin trading. Stabilization agent (underwriter) can buy shares to support price. Greenshoe option: underwriter can buy up to 15% extra shares if price rises above offer.",
 keyPlayers: ["Stabilization agent", "Market makers", "Retail/institutional buyers"],
 icon: <TrendingUp className="w-4 h-4" />,
 },
];

const RECENT_IPOS: RecentIPO[] = [
 { id: "1", company: "Stripe", ticker: "STRP", sector: "Fintech", offerPrice: 28, currentPrice: 34.2, firstDayClose: 35.5, marketCap: 72, date: "Jan 2026", lockupExpired: false },
 { id: "2", company: "Databricks", ticker: "DBRK", sector: "Cloud/AI", offerPrice: 45, currentPrice: 61.8, firstDayClose: 56.1, marketCap: 95, date: "Nov 2025", lockupExpired: false },
 { id: "3", company: "Klarna", ticker: "KLAR", sector: "Fintech", offerPrice: 22, currentPrice: 19.4, firstDayClose: 24.3, marketCap: 18, date: "Oct 2025", lockupExpired: false },
 { id: "4", company: "Chime", ticker: "CHME", sector: "Neobank", offerPrice: 18, currentPrice: 15.1, firstDayClose: 19.8, marketCap: 8.5, date: "Sep 2025", lockupExpired: false },
 { id: "5", company: "Cerebras", ticker: "CBRS", sector: "AI Chips", offerPrice: 31, currentPrice: 42.7, firstDayClose: 38.4, marketCap: 12, date: "Aug 2025", lockupExpired: true },
 { id: "6", company: "Reddit", ticker: "RDDT", sector: "Social Media", offerPrice: 34, currentPrice: 44.1, firstDayClose: 48.0, marketCap: 9.2, date: "Jun 2025", lockupExpired: true },
 { id: "7", company: "Waymo", ticker: "WAMO", sector: "Autonomous", offerPrice: 52, currentPrice: 48.3, firstDayClose: 55.0, marketCap: 45, date: "May 2025", lockupExpired: true },
 { id: "8", company: "Figma", ticker: "FGMA", sector: "Design SaaS", offerPrice: 40, currentPrice: 36.8, firstDayClose: 43.2, marketCap: 22, date: "Apr 2025", lockupExpired: true },
 { id: "9", company: "CoreWeave", ticker: "CRWV", sector: "AI Infra", offerPrice: 25, currentPrice: 31.5, firstDayClose: 29.4, marketCap: 7.8, date: "Mar 2025", lockupExpired: true },
 { id: "10", company: "Shein", ticker: "SHEI", sector: "E-Commerce", offerPrice: 38, currentPrice: 29.6, firstDayClose: 34.1, marketCap: 58, date: "Feb 2025", lockupExpired: true },
 { id: "11", company: "Instacart", ticker: "CART", sector: "Delivery", offerPrice: 30, currentPrice: 26.4, firstDayClose: 33.7, marketCap: 9.3, date: "Jan 2025", lockupExpired: true },
 { id: "12", company: "Arm Holdings", ticker: "ARM", sector: "Semiconductors", offerPrice: 51, currentPrice: 72.3, firstDayClose: 63.6, marketCap: 76, date: "Dec 2024", lockupExpired: true },
 { id: "13", company: "Birkenstock", ticker: "BIRK", sector: "Consumer", offerPrice: 46, currentPrice: 38.9, firstDayClose: 41.0, marketCap: 8.6, date: "Nov 2024", lockupExpired: true },
 { id: "14", company: "Mapbox", ticker: "MPBX", sector: "Location Tech", offerPrice: 19, currentPrice: 22.1, firstDayClose: 21.5, marketCap: 3.4, date: "Oct 2024", lockupExpired: true },
 { id: "15", company: "Rubrik", ticker: "RBRK", sector: "Cybersecurity", offerPrice: 32, currentPrice: 41.8, firstDayClose: 36.2, marketCap: 6.1, date: "Sep 2024", lockupExpired: true },
];

const SPAC_DATA: SPACItem[] = [
 { id: "1", name: "Dragoneer Growth Opp III", ticker: "DRGN", sponsor: "Dragoneer Investment", target: "Anduril Industries", trustValue: 10.08, currentPrice: 11.42, deadlineMonths: 8, raiseSize: 690, sector: "Defense Tech", status: "announced" },
 { id: "2", name: "Churchill Capital VII", ticker: "CVII", sponsor: "M. Klein & Co.", target: null, trustValue: 10.02, currentPrice: 10.05, deadlineMonths: 14, raiseSize: 500, sector: "Searching", status: "searching" },
 { id: "3", name: "Ajax Financial Acq II", ticker: "AJAX", sponsor: "Ajax Financial", target: "Vercel", trustValue: 10.11, currentPrice: 12.35, deadlineMonths: 5, raiseSize: 800, sector: "Developer Tools", status: "voting" },
 { id: "4", name: "Social Capital Hedosophia IX", ticker: "IPOX", sponsor: "Social Capital", target: null, trustValue: 10.00, currentPrice: 10.01, deadlineMonths: 18, raiseSize: 400, sector: "Searching", status: "searching" },
 { id: "5", name: "Tishman Speyer Innovation II", ticker: "TSIAU", sponsor: "Tishman Speyer", target: "Nuro AI", trustValue: 10.05, currentPrice: 10.89, deadlineMonths: 11, raiseSize: 300, sector: "Autonomous Vehicles", status: "announced" },
 { id: "6", name: "Replay Acquisition Corp", ticker: "RPLA", sponsor: "Replay Capital", target: null, trustValue: 10.03, currentPrice: 9.98, deadlineMonths: 9, raiseSize: 250, sector: "Searching", status: "searching" },
 { id: "7", name: "Gores Holdings XII", ticker: "GHXII", sponsor: "Gores Group", target: "Figure AI", trustValue: 10.07, currentPrice: 14.20, deadlineMonths: 3, raiseSize: 600, sector: "Robotics/AI", status: "announced" },
 { id: "8", name: "Reinvent Technology III", ticker: "RTPZ", sponsor: "Reinvent Capital", target: null, trustValue: 10.01, currentPrice: 10.02, deadlineMonths: 21, raiseSize: 350, sector: "Searching", status: "searching" },
 { id: "9", name: "Foley Trasimene III", ticker: "BFT", sponsor: "Foley Group", target: "Samsara II", trustValue: 10.04, currentPrice: 11.15, deadlineMonths: 7, raiseSize: 450, sector: "IoT/Fleet", status: "announced" },
 { id: "10", name: "Pivotal Investment III", ticker: "PICC", sponsor: "Pivotal Capital", target: null, trustValue: 10.00, currentPrice: 9.96, deadlineMonths: 12, raiseSize: 200, sector: "Searching", status: "searching" },
];

const DCM_DEALS: DCMDeal[] = [
 { id: "1", issuer: "Apple Inc.", sector: "Technology", size: 6.0, coupon: 4.85, rating: "Aaa/AAA", tenor: "10Y", useOfProceeds: "General corporate / buybacks", type: "investment-grade", date: "Mar 2026" },
 { id: "2", issuer: "Microsoft Corp.", sector: "Technology", size: 5.0, coupon: 4.62, rating: "Aaa/AAA", tenor: "30Y", useOfProceeds: "Activision acquisition refinancing", type: "investment-grade", date: "Feb 2026" },
 { id: "3", issuer: "HCA Healthcare", sector: "Healthcare", size: 2.5, coupon: 6.125, rating: "Ba1/BB+", tenor: "8Y", useOfProceeds: "Refinance 2026 maturities", type: "high-yield", date: "Mar 2026" },
 { id: "4", issuer: "TransDigm Group", sector: "Aerospace", size: 1.8, coupon: 6.875, rating: "B1/B+", tenor: "7Y", useOfProceeds: "Acquisition financing", type: "high-yield", date: "Feb 2026" },
 { id: "5", issuer: "Amazon.com Inc.", sector: "E-Commerce/Cloud", size: 8.0, coupon: 4.70, rating: "A1/AA", tenor: "5Y/10Y/30Y", useOfProceeds: "Data center capex", type: "investment-grade", date: "Jan 2026" },
 { id: "6", issuer: "Bausch Health", sector: "Pharma", size: 1.2, coupon: 9.0, rating: "Caa1/CCC+", tenor: "5Y", useOfProceeds: "Near-term debt paydown", type: "high-yield", date: "Mar 2026" },
 { id: "7", issuer: "Brookfield Infrastructure", sector: "Infra", size: 3.5, coupon: 5.10, rating: "Baa1/BBB+", tenor: "10Y", useOfProceeds: "Capital recycling program", type: "investment-grade", date: "Jan 2026" },
 { id: "8", issuer: "Clear Channel Outdoor", sector: "Media", size: 0.9, coupon: 7.75, rating: "Caa1/B-", tenor: "5Y", useOfProceeds: "Digital billboard expansion", type: "high-yield", date: "Feb 2026" },
 { id: "9", issuer: "Dell Technologies", sector: "Technology", size: 4.0, coupon: 5.45, rating: "Baa3/BBB-", tenor: "7Y", useOfProceeds: "AI infrastructure investment", type: "investment-grade", date: "Dec 2025" },
 { id: "10", issuer: "Endeavor Group", sector: "Entertainment", size: 1.5, coupon: 6.50, rating: "B1/B", tenor: "7Y", useOfProceeds: "WWE/UFC expansion", type: "high-yield", date: "Dec 2025" },
];

const UPCOMING_IPOS: UpcomingIPO[] = [
 { id: "1", company: "OpenAI", sector: "AI", expectedSize: 15.0, expectedQ: "Q2 2026", stage: "filed", lastValuation: 157 },
 { id: "2", company: "SpaceX", sector: "Aerospace", expectedSize: 8.0, expectedQ: "Q3 2026", stage: "filed", lastValuation: 210 },
 { id: "3", company: "Epic Games", sector: "Gaming", expectedSize: 4.0, expectedQ: "Q2 2026", stage: "roadshow", lastValuation: 32 },
 { id: "4", company: "Canva", sector: "Design SaaS", expectedSize: 3.0, expectedQ: "Q1 2026", stage: "pricing", lastValuation: 26 },
 { id: "5", company: "Discord", sector: "Social/Communication", expectedSize: 2.5, expectedQ: "Q3 2026", stage: "filed", lastValuation: 15 },
 { id: "6", company: "Plaid", sector: "Fintech", expectedSize: 2.0, expectedQ: "Q2 2026", stage: "filed", lastValuation: 13.4 },
 { id: "7", company: "Scale AI", sector: "AI/Data", expectedSize: 1.8, expectedQ: "Q4 2026", stage: "filed", lastValuation: 14 },
 { id: "8", company: "Fanatics", sector: "Sports Commerce", expectedSize: 3.5, expectedQ: "Q3 2026", stage: "filed", lastValuation: 31 },
 { id: "9", company: "Revolut", sector: "Neobank", expectedSize: 2.2, expectedQ: "Q2 2026", stage: "roadshow", lastValuation: 45 },
 { id: "10", company: "Impossible Foods", sector: "FoodTech", expectedSize: 1.0, expectedQ: "Q4 2026", stage: "filed", lastValuation: 7 },
];

const LEAGUE_TABLE: LeagueTableEntry[] = [
 { rank: 1, bank: "Goldman Sachs", volume: 48.2, deals: 34, share: 18.4, change: 0 },
 { rank: 2, bank: "Morgan Stanley", volume: 44.7, deals: 31, share: 17.1, change: 1 },
 { rank: 3, bank: "J.P. Morgan", volume: 41.3, deals: 38, share: 15.8, change: -1 },
 { rank: 4, bank: "Bank of America", volume: 28.6, deals: 22, share: 10.9, change: 2 },
 { rank: 5, bank: "Citigroup", volume: 22.1, deals: 18, share: 8.4, change: -1 },
 { rank: 6, bank: "Barclays", volume: 15.4, deals: 13, share: 5.9, change: 0 },
 { rank: 7, bank: "Deutsche Bank", volume: 12.8, deals: 11, share: 4.9, change: 1 },
 { rank: 8, bank: "UBS", volume: 11.3, deals: 9, share: 4.3, change: -1 },
 { rank: 9, bank: "Credit Suisse", volume: 9.7, deals: 8, share: 3.7, change: 2 },
 { rank: 10, bank: "Evercore ISI", volume: 7.4, deals: 7, share: 2.8, change: 0 },
];

// ── Chart Components ──────────────────────────────────────────────────────────

function IPOReturnChart() {
 resetSeed();
 const companies = RECENT_IPOS.slice(0, 10);
 const maxReturn = 80;
 const minReturn = -30;
 const range = maxReturn - minReturn;
 const w = 520;
 const h = 180;
 const barW = 36;
 const gap = 14;
 const leftPad = 50;
 const zeroY = h * (maxReturn / range);

 return (
 <svg viewBox={`0 0 ${w} ${h + 40}`} className="w-full">
 <line x1={leftPad} y1={0} x2={leftPad} y2={h} stroke="#334155" strokeWidth={1} />
 <line x1={leftPad} y1={zeroY} x2={w} y2={zeroY} stroke="#64748b" strokeWidth={1} strokeDasharray="4 3" />
 {[-20, 0, 20, 40, 60, 80].map((v) => {
 const y = h * ((maxReturn - v) / range);
 return (
 <g key={v}>
 <text x={leftPad - 6} y={y + 4} fill="#94a3b8" fontSize={9} textAnchor="end">{v}%</text>
 <line x1={leftPad} y1={y} x2={w} y2={y} stroke="#1e293b" strokeWidth={0.5} />
 </g>
 );
 })}
 {companies.map((ipo, i) => {
 const totalReturn = ((ipo.currentPrice - ipo.offerPrice) / ipo.offerPrice) * 100;
 const firstDayReturn = ((ipo.firstDayClose - ipo.offerPrice) / ipo.offerPrice) * 100;
 const x = leftPad + 10 + i * (barW + gap);
 const isPos = totalReturn >= 0;
 const barH = Math.abs(totalReturn) * (h / range);
 const barY = isPos ? zeroY - barH : zeroY;
 const firstH = Math.abs(firstDayReturn) * (h / range);
 const firstY = firstDayReturn >= 0 ? zeroY - firstH : zeroY;
 return (
 <g key={ipo.id}>
 <rect x={x} y={barY} width={barW} height={barH}
 fill={isPos ? "#22c55e" : "#ef4444"} fillOpacity={0.7} rx={2} />
 <rect x={x + 10} y={firstY} width={16} height={firstH}
 fill={firstDayReturn >= 0 ? "#3b82f6" : "#f97316"} fillOpacity={0.8} rx={1} />
 <text x={x + barW / 2} y={h + 14} fill="#94a3b8" fontSize={7} textAnchor="middle"
 transform={`rotate(-35, ${x + barW / 2}, ${h + 14})`}>
 {ipo.ticker}
 </text>
 <text x={x + barW / 2} y={isPos ? barY - 3 : barY + barH + 9} fill={isPos ? "#22c55e" : "#ef4444"}
 fontSize={8} textAnchor="middle">
 {totalReturn > 0 ? "+" : ""}{totalReturn.toFixed(0)}%
 </text>
 </g>
 );
 })}
 <g>
 <rect x={leftPad + 10} y={h + 28} width={12} height={6} fill="#22c55e" fillOpacity={0.7} rx={1} />
 <text x={leftPad + 26} y={h + 34} fill="#94a3b8" fontSize={8}>Total Return</text>
 <rect x={leftPad + 110} y={h + 28} width={12} height={6} fill="#3b82f6" fillOpacity={0.8} rx={1} />
 <text x={leftPad + 126} y={h + 34} fill="#94a3b8" fontSize={8}>First Day Pop</text>
 </g>
 </svg>
 );
}

function IPOCycleChart() {
 const years = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
 const volumes = [110, 82, 68, 72, 180, 160, 195, 210, 20, 60, 155, 125, 115, 220, 275, 170, 105, 180, 190, 230, 165, 310, 45, 110, 185, 240, 88];
 const w = 580;
 const h = 140;
 const maxV = Math.max(...volumes);
 const bw = Math.floor((w - 60) / years.length) - 2;
 const bubbleYears = [2000, 2007, 2021];
 const dryYears = [2001, 2002, 2008, 2022];

 return (
 <svg viewBox={`0 0 ${w} ${h + 50}`} className="w-full">
 <line x1={40} y1={0} x2={40} y2={h} stroke="#334155" strokeWidth={1} />
 <line x1={40} y1={h} x2={w} y2={h} stroke="#334155" strokeWidth={1} />
 {[0, 100, 200, 300].map((v) => {
 const y = h - (v / maxV) * h;
 return (
 <g key={v}>
 <line x1={40} y1={y} x2={w} y2={y} stroke="#1e293b" strokeWidth={0.5} />
 <text x={36} y={y + 3} fill="#64748b" fontSize={8} textAnchor="end">{v}</text>
 </g>
 );
 })}
 {years.map((year, i) => {
 const vol = volumes[i];
 const barH = (vol / maxV) * h;
 const x = 44 + i * (bw + 2);
 const isBubble = bubbleYears.includes(year);
 const isDry = dryYears.includes(year);
 const color = isBubble ? "#f59e0b" : isDry ? "#ef4444" : "#3b82f6";
 return (
 <g key={year}>
 <rect x={x} y={h - barH} width={bw} height={barH}
 fill={color} fillOpacity={isBubble ? 0.9 : 0.65} rx={1} />
 {(year % 5 === 0 || year === 2026) && (
 <text x={x + bw / 2} y={h + 12} fill="#64748b" fontSize={7.5} textAnchor="middle">{year}</text>
 )}
 </g>
 );
 })}
 <g>
 <rect x={44} y={h + 26} width={10} height={6} fill="#f59e0b" fillOpacity={0.9} rx={1} />
 <text x={58} y={h + 32} fill="#94a3b8" fontSize={8}>Bubble year</text>
 <rect x={140} y={h + 26} width={10} height={6} fill="#ef4444" fillOpacity={0.65} rx={1} />
 <text x={154} y={h + 32} fill="#94a3b8" fontSize={8}>Dry year</text>
 <rect x={220} y={h + 26} width={10} height={6} fill="#3b82f6" fillOpacity={0.65} rx={1} />
 <text x={234} y={h + 32} fill="#94a3b8" fontSize={8}>Normal</text>
 <text x={44} y={h + 46} fill="#475569" fontSize={8}>($B global proceeds)</text>
 </g>
 </svg>
 );
}

function GeographicBreakdownChart() {
 const regions = ["US", "EMEA", "APAC", "LatAm"];
 const values = [48, 28, 20, 4];
 const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e"];
 const total = values.reduce((a, b) => a + b, 0);
 const w = 260;
 const h = 130;
 let startAngle = -Math.PI / 2;
 const cx = 70;
 const cy = 65;
 const r = 55;

 const slices = values.map((v, i) => {
 const angle = (v / total) * 2 * Math.PI;
 const x1 = cx + r * Math.cos(startAngle);
 const y1 = cy + r * Math.sin(startAngle);
 const x2 = cx + r * Math.cos(startAngle + angle);
 const y2 = cy + r * Math.sin(startAngle + angle);
 const large = angle > Math.PI ? 1 : 0;
 const midAngle = startAngle + angle / 2;
 const lx = cx + (r + 14) * Math.cos(midAngle);
 const ly = cy + (r + 14) * Math.sin(midAngle);
 const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
 startAngle += angle;
 return { d, color: colors[i], label: regions[i], pct: v, lx, ly };
 });

 return (
 <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xs">
 {slices.map((sl, i) => (
 <g key={i}>
 <path d={sl.d} fill={sl.color} fillOpacity={0.8} stroke="#0f172a" strokeWidth={1.5} />
 <text x={sl.lx} y={sl.ly} fill={sl.color} fontSize={9} fontWeight="bold" textAnchor="middle">{sl.pct}%</text>
 </g>
 ))}
 {regions.map((r, i) => (
 <g key={r}>
 <rect x={150} y={18 + i * 24} width={10} height={10} fill={colors[i]} fillOpacity={0.8} rx={2} />
 <text x={164} y={27 + i * 24} fill="#94a3b8" fontSize={10}>{r}</text>
 <text x={210} y={27 + i * 24} fill="#e2e8f0" fontSize={10} fontWeight="bold">{values[i]}%</text>
 </g>
 ))}
 </svg>
 );
}

function SectorHeatmap() {
 const sectors = [
 { name: "Technology", ipos: 42, volume: 68.4, avgReturn: 18.2 },
 { name: "Healthcare", ipos: 28, volume: 22.1, avgReturn: 6.4 },
 { name: "Fintech", ipos: 19, volume: 31.8, avgReturn: 14.1 },
 { name: "Consumer", ipos: 15, volume: 12.4, avgReturn: -2.1 },
 { name: "Energy", ipos: 8, volume: 8.7, avgReturn: 4.8 },
 { name: "Industrials", ipos: 11, volume: 9.2, avgReturn: 8.3 },
 { name: "Real Estate", ipos: 5, volume: 4.1, avgReturn: -4.6 },
 { name: "Materials", ipos: 6, volume: 3.8, avgReturn: 1.2 },
 ];
 const maxV = Math.max(...sectors.map((s) => s.volume));
 return (
 <div className="grid grid-cols-4 gap-2">
 {sectors.map((sec) => {
 const intensity = sec.volume / maxV;
 const isPos = sec.avgReturn >= 0;
 return (
 <div
 key={sec.name}
 className="rounded-lg p-2.5 border border-border"
 style={{ background: `rgba(59,130,246,${0.08 + intensity * 0.25})` }}
 >
 <div className="text-xs font-medium text-foreground mb-1">{sec.name}</div>
 <div className="text-xs text-muted-foreground">{sec.ipos} IPOs</div>
 <div className="text-xs text-muted-foreground">${sec.volume.toFixed(1)}B</div>
 <div className={cn("text-[11px] font-semibold mt-1", isPos ? "text-green-400" : "text-red-400")}>
 {isPos ? "+" : ""}{sec.avgReturn.toFixed(1)}%
 </div>
 </div>
 );
 })}
 </div>
 );
}

function LBOWaterfallChart() {
 const tranches = [
 { name: "1st Lien TL", pct: 40, color: "#3b82f6", rate: "S+350", priority: 1 },
 { name: "2nd Lien", pct: 15, color: "#8b5cf6", rate: "S+700", priority: 2 },
 { name: "Mezzanine", pct: 10, color: "#f59e0b", rate: "12% PIK", priority: 3 },
 { name: "Equity", pct: 35, color: "#22c55e", rate: "Residual", priority: 4 },
 ];
 const w = 320;
 const h = 120;
 let offset = 0;
 return (
 <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm">
 <text x={10} y={12} fill="#64748b" fontSize={8}>Capital Structure (% Enterprise Value)</text>
 {tranches.map((tr, i) => {
 const barW = (tr.pct / 100) * (w - 120);
 const x = 10 + offset;
 offset += barW;
 return (
 <g key={tr.name}>
 <rect x={x} y={22} width={barW} height={40} fill={tr.color} fillOpacity={0.75} />
 {barW > 25 && (
 <text x={x + barW / 2} y={47} fill="#fff" fontSize={8} textAnchor="middle" fontWeight="bold">
 {tr.pct}%
 </text>
 )}
 </g>
 );
 })}
 {tranches.map((tr, i) => (
 <g key={tr.name + "leg"}>
 <rect x={10 + i * 72} y={74} width={10} height={8} fill={tr.color} fillOpacity={0.75} rx={1} />
 <text x={24 + i * 72} y={81} fill="#94a3b8" fontSize={8}>{tr.name}</text>
 <text x={24 + i * 72} y={95} fill="#64748b" fontSize={7.5}>{tr.rate}</text>
 <text x={24 + i * 72} y={107} fill="#475569" fontSize={7}>Priority {tr.priority}</text>
 </g>
 ))}
 </svg>
 );
}

// ── Info Card ─────────────────────────────────────────────────────────────────

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
 return (
 <div className="rounded-md border border-border bg-muted/50 p-4">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-primary">{icon}</span>
 <span className="text-sm font-semibold text-foreground">{title}</span>
 </div>
 {children}
 </div>
 );
}

function StatChip({ label, value, color = "blue" }: { label: string; value: string; color?: "blue" | "green" | "red" | "amber" | "purple" }) {
 const colorMap = {
 blue: "bg-muted/60 text-primary border-border",
 green: "bg-green-900/40 text-green-300 border-green-700/50",
 red: "bg-red-900/40 text-red-300 border-red-700/50",
 amber: "bg-amber-900/40 text-amber-300 border-amber-700/50",
 purple: "bg-muted/60 text-primary border-border",
 };
 return (
 <div className={cn("inline-flex flex-col rounded-lg border px-3 py-2", colorMap[color])}>
 <span className="text-xs text-muted-foreground opacity-70">{label}</span>
 <span className="text-sm font-semibold">{value}</span>
 </div>
 );
}

// ── Tab 1: IPO Process ────────────────────────────────────────────────────────

function IPOProcessTab() {
 const [selectedStage, setSelectedStage] = useState<IPOStage | null>(null);
 return (
 <div className="space-y-4">
 <div className="flex flex-wrap gap-3 mb-2">
 <StatChip label="Typical Duration" value="6–12 months" color="blue" />
 <StatChip label="Avg Underwriting Fee" value="3.5–7%" color="amber" />
 <StatChip label="Avg First Day Pop" value="+20%" color="green" />
 <StatChip label="Greenshoe Option" value="15% overallotment" color="purple" />
 </div>

 {/* Timeline */}
 <InfoCard title="IPO Timeline: 9 Stages" icon={<Clock className="w-4 h-4" />}>
 <div className="relative">
 <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
 <div className="flex gap-1 overflow-x-auto pb-3">
 {IPO_STAGES.map((stage, i) => (
 <button
 key={stage.id}
 onClick={() => setSelectedStage(stage.id === selectedStage?.id ? null : stage)}
 className={cn(
 "flex-shrink-0 flex flex-col items-center gap-1 pt-0 w-20 group",
 )}
 >
 <div className={cn(
 "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
 selectedStage?.id === stage.id
 ? "bg-primary border-primary text-foreground"
 : "bg-muted border-border text-muted-foreground group-hover:border-primary group-hover:text-primary"
 )}>
 {stage.icon}
 </div>
 <span className="text-[11px] text-muted-foreground text-center leading-tight">{stage.name}</span>
 <span className="text-[11px] text-muted-foreground">{stage.duration}</span>
 </button>
 ))}
 </div>
 </div>
 <AnimatePresence>
 {selectedStage && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-primary">{selectedStage.icon}</span>
 <span className="font-semibold text-primary">{selectedStage.name}</span>
 <span className="text-xs text-muted-foreground ml-auto">{selectedStage.duration}</span>
 </div>
 <p className="text-sm text-muted-foreground leading-relaxed mb-3">{selectedStage.description}</p>
 <div>
 <span className="text-xs text-muted-foreground">Key Players</span>
 <div className="flex flex-wrap gap-1.5 mt-1.5">
 {selectedStage.keyPlayers.map((p) => (
 <span key={p} className="text-xs bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5">{p}</span>
 ))}
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 {!selectedStage && (
 <p className="text-xs text-muted-foreground mt-2 italic">Click a stage to learn more</p>
 )}
 </InfoCard>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="S-1 Filing: What Investors Analyze" icon={<FileText className="w-4 h-4" />}>
 <ul className="space-y-2 text-sm text-muted-foreground">
 {[
 { label: "Business Model", desc: "Revenue drivers, unit economics, addressable market" },
 { label: "3-Year Financials", desc: "Revenue growth trajectory, gross margins, burn rate" },
 { label: "Risk Factors", desc: "Boilerplate vs. real risks; read the novel ones" },
 { label: "Use of Proceeds", desc: "Organic growth vs. debt paydown vs. founder liquidity" },
 { label: "Cap Table", desc: "Founder/VC ownership, option pool, voting rights" },
 { label: "Related Party Transactions", desc: "Self-dealing red flags with insiders" },
 ].map((item) => (
 <li key={item.label} className="flex gap-2">
 <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
 <span><span className="font-medium text-foreground">{item.label}:</span> {item.desc}</span>
 </li>
 ))}
 </ul>
 </InfoCard>

 <InfoCard title="Allocation & Greenshoe Mechanics" icon={<Award className="w-4 h-4" />}>
 <div className="space-y-3 text-sm">
 <div className="rounded-lg bg-muted/40 p-3">
 <div className="font-medium text-foreground mb-1">Typical Allocation Split</div>
 <div className="space-y-1">
 {[
 { label: "Institutional (mutual funds, hedge funds)", pct: 70 },
 { label: "Anchor investors (pre-IPO cornerstone)", pct: 15 },
 { label: "Retail brokerage clients", pct: 10 },
 { label: "Employee / directed shares", pct: 5 },
 ].map((item) => (
 <div key={item.label} className="flex items-center gap-2">
 <div className="w-28 text-xs text-muted-foreground flex-shrink-0">{item.pct}%</div>
 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
 <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
 </div>
 <div className="text-xs text-muted-foreground w-52">{item.label}</div>
 </div>
 ))}
 </div>
 </div>
 <div className="rounded-lg bg-amber-900/20 border border-amber-700/40 p-3">
 <div className="font-medium text-amber-300 mb-1">Greenshoe Option</div>
 <p className="text-xs text-muted-foreground">Underwriters short-sell 15% extra shares at IPO. If price rises, exercise option to buy from company. If price falls, buy in open market to stabilize. Net effect: price support for 30 days post-IPO.</p>
 </div>
 </div>
 </InfoCard>
 </div>
 </div>
 );
}

// ── Tab 2: IPO Valuation ──────────────────────────────────────────────────────

function IPOValuationTab() {
 const [filter, setFilter] = useState<"all" | "profitable" | "unprofitable" | "lockup">("all");
 const filtered = useMemo(() => {
 return RECENT_IPOS.filter((ipo) => {
 const ret = ((ipo.currentPrice - ipo.offerPrice) / ipo.offerPrice) * 100;
 if (filter === "profitable") return ret >= 0;
 if (filter === "unprofitable") return ret < 0;
 if (filter === "lockup") return ipo.lockupExpired;
 return true;
 });
 }, [filter]);

 return (
 <div className="space-y-4">
 <div className="flex flex-wrap gap-3 mb-2">
 <StatChip label="Avg IPO Underpricing" value="10–15%" color="amber" />
 <StatChip label="Avg First Day Return" value="+20%" color="green" />
 <StatChip label="3-Year Underperformance" value="-3 to -5%" color="red" />
 <StatChip label="Lockup Period" value="180 days" color="purple" />
 </div>

 <InfoCard title="IPO Return Performance" icon={<BarChart3 className="w-4 h-4" />}>
 <IPOReturnChart />
 <p className="text-xs text-muted-foreground mt-1">Green bars = total return since IPO. Blue bars = first day pop. Source: synthetic data.</p>
 </InfoCard>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <InfoCard title="IPO Underpricing" icon={<DollarSign className="w-4 h-4" />}>
 <p className="text-xs text-muted-foreground leading-relaxed mb-3">Underwriters systematically price IPOs 10–15% below fair value. This "money left on the table" benefits institutional investors who flip shares on day 1.</p>
 <div className="rounded-lg bg-muted/40 p-2">
 <div className="text-xs text-muted-foreground mb-1">Who wins / loses</div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <span className="text-green-400">Win:</span><span className="text-muted-foreground">Institutional allocatees, underwriters (repeat business)</span>
 </div>
 <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
 <span className="text-red-400">Lose:</span><span className="text-muted-foreground">Pre-IPO shareholders (diluted value), company (raised less)</span>
 </div>
 </div>
 </InfoCard>

 <InfoCard title="Long-Run Performance" icon={<TrendingDown className="w-4 h-4" />}>
 <p className="text-xs text-muted-foreground leading-relaxed mb-3">Landmark Ritter research (1991–2020): IPOs underperform comparable non-IPO stocks by 3–5% per year over 3 years post-IPO.</p>
 <div className="space-y-1.5">
 {[
 { period: "Day 1", perf: "+20%", color: "text-green-400" },
 { period: "Year 1", perf: "+8%", color: "text-green-400" },
 { period: "Year 2", perf: "-2%", color: "text-red-400" },
 { period: "Year 3", perf: "-8%", color: "text-red-400" },
 ].map((row) => (
 <div key={row.period} className="flex justify-between text-xs text-muted-foreground">
 <span className="text-muted-foreground">{row.period}</span>
 <span className={cn("font-mono font-medium", row.color)}>{row.perf}</span>
 </div>
 ))}
 </div>
 </InfoCard>

 <InfoCard title="Lockup Expiration Effect" icon={<Lock className="w-4 h-4" />}>
 <p className="text-xs text-muted-foreground leading-relaxed mb-3">After 180-day lockup expires, insiders and VC funds can sell. Historically stocks decline -3% on average around lockup expiry.</p>
 <div className="rounded-lg bg-red-900/20 border border-red-700/40 p-2.5">
 <div className="text-xs font-medium text-red-300 mb-1.5">Warning Signs</div>
 <ul className="space-y-0.5 text-xs text-muted-foreground">
 <li>• High insider ownership + recent lockup</li>
 <li>• VC funds approaching fund lifecycle end</li>
 <li>• Stock still trading at premium to comps</li>
 <li>• Soft lock-up clauses allow early sales</li>
 </ul>
 </div>
 </InfoCard>
 </div>

 <InfoCard title="Recent IPO Tracker (15 Companies)" icon={<TrendingUp className="w-4 h-4" />}>
 <div className="flex gap-2 mb-3 flex-wrap">
 {(["all", "profitable", "unprofitable", "lockup"] as const).map((f) => (
 <button key={f} onClick={() => setFilter(f)}
 className={cn("text-xs text-muted-foreground rounded-full px-3 py-1 transition-colors",
 filter === f ? "bg-primary text-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
 {f === "all" ? "All" : f === "profitable" ? "Profitable" : f === "unprofitable" ? "Underwater" : "Lockup Expired"}
 </button>
 ))}
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground min-w-[600px]">
 <thead>
 <tr className="border-b border-border">
 {["Company", "Ticker", "Sector", "Offer", "Current", "Total Return", "1st Day", "Mkt Cap", "Date", "Lockup"].map((h) => (
 <th key={h} className="text-left py-2 pr-3 text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((ipo) => {
 const ret = ((ipo.currentPrice - ipo.offerPrice) / ipo.offerPrice) * 100;
 const firstDay = ((ipo.firstDayClose - ipo.offerPrice) / ipo.offerPrice) * 100;
 return (
 <tr key={ipo.id} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="py-2 pr-3 font-medium text-foreground">{ipo.company}</td>
 <td className="pr-3 font-mono text-primary">{ipo.ticker}</td>
 <td className="pr-3 text-muted-foreground">{ipo.sector}</td>
 <td className="pr-3 font-mono">${ipo.offerPrice}</td>
 <td className="pr-3 font-mono">${ipo.currentPrice}</td>
 <td className={cn("pr-3 font-mono font-medium", ret >= 0 ? "text-green-400" : "text-red-400")}>
 {ret > 0 ? "+" : ""}{ret.toFixed(1)}%
 </td>
 <td className={cn("pr-3 font-mono", firstDay >= 0 ? "text-green-300" : "text-red-300")}>
 {firstDay > 0 ? "+" : ""}{firstDay.toFixed(1)}%
 </td>
 <td className="pr-3 text-muted-foreground">${ipo.marketCap}B</td>
 <td className="pr-3 text-muted-foreground">{ipo.date}</td>
 <td>{ipo.lockupExpired
 ? <span className="text-amber-400 font-medium">Expired</span>
 : <span className="text-muted-foreground">Active</span>}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </InfoCard>
 </div>
 );
}

// ── Tab 3: SPAC Market ────────────────────────────────────────────────────────

function SPACTab() {
 const [statusFilter, setStatusFilter] = useState<"all" | "searching" | "announced" | "voting">("all");
 const filtered = useMemo(() =>
 SPAC_DATA.filter((s) => statusFilter === "all" || s.status === statusFilter),
 [statusFilter]
 );

 return (
 <div className="space-y-4">
 <div className="flex flex-wrap gap-3 mb-2">
 <StatChip label="Sponsor Promote" value="20% for ~1%" color="amber" />
 <StatChip label="Search Window" value="24 months" color="blue" />
 <StatChip label="Redemption Rights" value="At trust value" color="green" />
 <StatChip label="Avg deSPAC Premium" value="15–30%" color="purple" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="SPAC Mechanics" icon={<Layers className="w-4 h-4" />}>
 <div className="space-y-3">
 {[
 { step: "1. SPAC IPO", desc: "Blank-check company raises money at $10/share, proceeds held in trust earning T-bill interest", color: "blue" },
 { step: "2. Search Period", desc: "Sponsor has up to 24 months to identify and negotiate with a target company (deSPAC)", color: "blue" },
 { step: "3. Announcement", desc: "Merger agreement announced; shares trade based on deal value expectations vs trust", color: "amber" },
 { step: "4. Shareholder Vote", desc: "SPAC shareholders vote to approve merger. Dissenting investors can redeem at trust value + interest", color: "amber" },
 { step: "5. deSPAC Close", desc: "Merger closes; target becomes new public company. PIPE investors fund deal alongside trust proceeds", color: "green" },
 ].map((item, i) => {
 const colorMap: Record<string, string> = { blue: "bg-primary", amber: "bg-amber-500", green: "bg-green-600" };
 return (
 <div key={i} className="flex gap-3">
 <div className={cn("mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-foreground text-xs font-semibold", colorMap[item.color])}>
 {i + 1}
 </div>
 <div>
 <div className="text-xs font-medium text-foreground">{item.step}</div>
 <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
 </div>
 </div>
 );
 })}
 </div>
 </InfoCard>

 <div className="space-y-4">
 <InfoCard title="SPAC vs Traditional IPO" icon={<ArrowUpDown className="w-4 h-4" />}>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-1.5 text-muted-foreground">Dimension</th>
 <th className="text-center py-1.5 text-primary">SPAC</th>
 <th className="text-center py-1.5 text-primary">Traditional IPO</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {[
 ["Timeline", "3–6 months", "6–12 months"],
 ["Price Certainty", "Negotiated", "Market-driven"],
 ["Projections allowed", "Yes (safe harbor)", "No (SEC restricted)"],
 ["Cost", "~5% + promote", "3.5–7%"],
 ["Founder dilution", "Higher (promote)", "Lower"],
 ["SEC scrutiny", "Lower (historically)", "Higher"],
 ["Investor redemption", "Yes (trust)", "No"],
 ["Performance record", "Worse post-deal", "Mixed"],
 ].map(([dim, spac, trad]) => (
 <tr key={dim} className="hover:bg-muted/30">
 <td className="py-1.5 text-muted-foreground">{dim}</td>
 <td className="py-1.5 text-center text-muted-foreground">{spac}</td>
 <td className="py-1.5 text-center text-muted-foreground">{trad}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </InfoCard>

 <InfoCard title="Sponsor Economics (The Promote)" icon={<AlertTriangle className="w-4 h-4" />}>
 <div className="rounded-lg bg-amber-900/20 border border-amber-700/40 p-3 text-xs text-muted-foreground leading-relaxed">
 <p>Sponsor typically pays <strong className="text-amber-300">~$25,000</strong> for <strong className="text-amber-300">20% of shares</strong> (the "promote") in a $200M SPAC. If deal closes, sponsor's shares are worth <strong className="text-amber-300">$40M</strong>. This creates misaligned incentives — sponsors are motivated to do <em>any</em> deal, not a <em>good</em> deal, before deadline.</p>
 </div>
 </InfoCard>
 </div>
 </div>

 <InfoCard title="Active SPAC Tracker" icon={<Clock className="w-4 h-4" />}>
 <div className="flex gap-2 mb-3 flex-wrap">
 {(["all", "searching", "announced", "voting"] as const).map((f) => (
 <button key={f} onClick={() => setStatusFilter(f)}
 className={cn("text-xs text-muted-foreground rounded-full px-3 py-1 transition-colors capitalize",
 statusFilter === f ? "bg-primary text-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
 {f}
 </button>
 ))}
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground min-w-[640px]">
 <thead>
 <tr className="border-b border-border">
 {["SPAC", "Ticker", "Sponsor", "Target", "Trust/Sh", "Price", "Premium", "Deadline", "Raise"].map((h) => (
 <th key={h} className="text-left py-2 pr-3 text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((sp) => {
 const prem = ((sp.currentPrice - sp.trustValue) / sp.trustValue) * 100;
 const statusColor = sp.status === "voting" ? "text-amber-400" : sp.status === "announced" ? "text-primary" : "text-muted-foreground";
 return (
 <tr key={sp.id} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="py-2 pr-3 font-medium text-foreground max-w-[140px] truncate">{sp.name}</td>
 <td className="pr-3 font-mono text-primary">{sp.ticker}</td>
 <td className="pr-3 text-muted-foreground max-w-[100px] truncate">{sp.sponsor}</td>
 <td className={cn("pr-3", sp.target ? "text-muted-foreground" : "text-muted-foreground italic")}>
 {sp.target ?? "—"}
 </td>
 <td className="pr-3 font-mono">${sp.trustValue.toFixed(2)}</td>
 <td className="pr-3 font-mono">${sp.currentPrice.toFixed(2)}</td>
 <td className={cn("pr-3 font-mono font-medium", prem >= 0 ? "text-green-400" : "text-red-400")}>
 {prem > 0 ? "+" : ""}{prem.toFixed(1)}%
 </td>
 <td className="pr-3 text-muted-foreground">{sp.deadlineMonths}mo</td>
 <td className="pr-3 text-muted-foreground">${sp.raiseSize}M</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </InfoCard>
 </div>
 );
}

// ── Tab 4: Secondary Offerings ────────────────────────────────────────────────

function SecondaryOfferingsTab() {
 const offeringTypes = [
 {
 name: "Follow-On Offering (FPO)",
 type: "dilutive",
 icon: <TrendingDown className="w-4 h-4" />,
 desc: "Company issues new shares, increasing share count. Dilutes existing shareholders. Proceeds go to company for growth, acquisitions, or debt repayment.",
 example: "Tesla FY2020: raised $5B via 3 separate ATM/FPO offerings while stock was elevated.",
 impact: "Typically -3 to -5% stock reaction on announcement.",
 color: "red",
 },
 {
 name: "Secondary Sale (Insider Sell)",
 type: "non-dilutive",
 icon: <Users className="w-4 h-4" />,
 desc: "Existing shareholders (founders, PE firms, executives) sell their shares. Company receives no proceeds. Non-dilutive but signals insider desire for liquidity.",
 example: "Softbank selling Alibaba shares in secondary blocks over multiple years.",
 impact: "Neutral to mildly negative — depends on seller reputation and size.",
 color: "amber",
 },
 {
 name: "ATM (At-the-Market) Offering",
 type: "dilutive",
 icon: <RefreshCw className="w-4 h-4" />,
 desc: "Company registers a shelf and drips shares into the open market over time via designated broker. Opportunistic — sells when stock price is favorable.",
 example: "AMC Entertainment raised $2.2B via ATM in 2021 during meme stock frenzy.",
 impact: "Overhang risk: market knows company may sell any day, capping upside.",
 color: "blue",
 },
 {
 name: "Block Trade",
 type: "non-dilutive",
 icon: <BarChart3 className="w-4 h-4" />,
 desc: "PE firm or large shareholder sells a large block via investment bank, priced overnight at 3–7% discount to market. Bank takes inventory risk.",
 example: "Archegos Capital forced liquidation (2021): $20B+ in blocks across multiple banks.",
 impact: "Stock typically falls 4–8% to absorb large supply. Trading resumes next morning.",
 color: "purple",
 },
 {
 name: "Rights Offering",
 type: "dilutive",
 icon: <Shield className="w-4 h-4" />,
 desc: "Existing shareholders given right (not obligation) to buy new shares at a discount, proportional to their holdings. Preserves ownership percentage for participants.",
 example: "International Airlines Group (IAG) £2.75B rights offering at 36% discount in 2020.",
 impact: "Rights typically trade on exchange; non-participation = dilution.",
 color: "green",
 },
 {
 name: "Convertible Bond",
 type: "quasi-equity",
 icon: <Zap className="w-4 h-4" />,
 desc: "Company issues debt that converts to equity at a premium (20–40% above current price). Low coupon (0–2%) but creates future dilution. Popular with growth/tech companies.",
 example: "MicroStrategy issued $650M 0% convert in 2021 to buy Bitcoin.",
 impact: "Dilutive at conversion price. Hedge funds 'vol arb' the conversion feature.",
 color: "amber",
 },
 ];

 const typeColor = (type: string) => {
 if (type === "dilutive") return "bg-red-900/40 text-red-300 border-red-700/50";
 if (type === "non-dilutive") return "bg-green-900/40 text-green-300 border-green-700/50";
 return "bg-amber-900/40 text-amber-300 border-amber-700/50";
 };

 return (
 <div className="space-y-4">
 <div className="flex flex-wrap gap-3 mb-2">
 <StatChip label="FPO Discount to Market" value="2–5%" color="red" />
 <StatChip label="Block Trade Discount" value="3–7%" color="amber" />
 <StatChip label="Convertible Premium" value="20–40%" color="purple" />
 <StatChip label="Rights Discount" value="15–30%" color="blue" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {offeringTypes.map((ot) => {
 const cardColor = ot.color as "blue" | "green" | "red" | "amber" | "purple";
 const borderMap = {
 blue: "border-border",
 green: "border-green-700/40",
 red: "border-red-700/40",
 amber: "border-amber-700/40",
 purple: "border-border",
 };
 const iconColorMap = {
 blue: "text-primary",
 green: "text-green-400",
 red: "text-red-400",
 amber: "text-amber-400",
 purple: "text-primary",
 };
 return (
 <div key={ot.name} className={cn("rounded-md border bg-muted/50 p-4", borderMap[cardColor])}>
 <div className="flex items-center gap-2 mb-2">
 <span className={iconColorMap[cardColor]}>{ot.icon}</span>
 <span className="text-sm font-medium text-foreground">{ot.name}</span>
 <span className={cn("ml-auto text-xs text-muted-foreground rounded-full border px-2 py-0.5 capitalize", typeColor(ot.type))}>
 {ot.type}
 </span>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed mb-2">{ot.desc}</p>
 <div className="rounded bg-muted/40 px-2 py-1.5 mb-1.5">
 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Example: </span>
 <span className="text-xs text-muted-foreground">{ot.example}</span>
 </div>
 <div className="rounded bg-muted/40 px-2 py-1.5">
 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Market Impact: </span>
 <span className="text-xs text-muted-foreground">{ot.impact}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}

// ── Tab 5: Debt Capital Markets ───────────────────────────────────────────────

function DCMTab() {
 const [typeFilter, setTypeFilter] = useState<"all" | "investment-grade" | "high-yield" | "loan">("all");
 const filtered = useMemo(() =>
 DCM_DEALS.filter((d) => typeFilter === "all" || d.type === typeFilter),
 [typeFilter]
 );

 return (
 <div className="space-y-4">
 <div className="flex flex-wrap gap-3 mb-2">
 <StatChip label="IG Spread to UST" value="+80–150 bps" color="blue" />
 <StatChip label="HY Spread to UST" value="+300–600 bps" color="amber" />
 <StatChip label="Bond Settlement" value="T+3" color="green" />
 <StatChip label="LBO Leverage" value="5–7× EBITDA" color="red" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="Bond Issuance Process" icon={<FileText className="w-4 h-4" />}>
 <div className="space-y-2">
 {[
 { step: "Mandate", desc: "Issuer selects bookrunner(s), negotiates fees (0.25–1.5% for IG, 1.5–3% for HY)" },
 { step: "Investor Education", desc: "Debt capital markets team calls anchor investors, gauges appetite" },
 { step: "Roadshow", desc: "HY: 4–5 day roadshow for covenants/story. IG: often 1-day or virtual" },
 { step: "Book Building", desc: "Orders collected via Bloomberg. Book typically 3–5× oversubscribed" },
 { step: "Pricing", desc: "Spread set based on book quality. Benchmark: matching Treasury + spread" },
 { step: "Settlement (T+3)", desc: "Bonds delivered to investors via DTC/Euroclear. Company receives proceeds" },
 ].map((item, i) => (
 <div key={i} className="flex gap-2.5">
 <div className="mt-0.5 w-5 h-5 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-primary text-xs font-medium">{i + 1}</div>
 <div>
 <span className="text-xs font-medium text-foreground">{item.step}: </span>
 <span className="text-xs text-muted-foreground">{item.desc}</span>
 </div>
 </div>
 ))}
 </div>
 </InfoCard>

 <div className="space-y-4">
 <InfoCard title="LBO Capital Structure" icon={<Layers className="w-4 h-4" />}>
 <LBOWaterfallChart />
 <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
 {[
 { label: "1st Lien Term Loan A/B", desc: "Secured, floating rate (SOFR+), 7-year maturity, amortizing" },
 { label: "2nd Lien", desc: "Subordinate security interest, higher spread, PIK toggle available" },
 { label: "Mezzanine", desc: "Unsecured, PIK/cash pay, equity upside via warrants" },
 { label: "Equity", desc: "Residual claim; sponsor returns depend on exit multiple expansion" },
 ].map((item) => (
 <div key={item.label}>
 <span className="font-medium text-muted-foreground">{item.label}: </span>
 <span className="text-muted-foreground">{item.desc}</span>
 </div>
 ))}
 </div>
 </InfoCard>

 <InfoCard title="Loan vs. Bond" icon={<ArrowUpDown className="w-4 h-4" />}>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left py-1.5 text-muted-foreground">Feature</th>
 <th className="text-center py-1.5 text-primary">Term Loan</th>
 <th className="text-center py-1.5 text-amber-400">HY Bond</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {[
 ["Rate", "Floating (SOFR+)", "Fixed coupon"],
 ["Prepayment", "Freely prepayable", "Call protection (NCL)"],
 ["Covenants", "Maintenance covenants", "Incurrence only"],
 ["Trading", "Par + accrued (OTC)", "Exchange-like (OTC)"],
 ["Maturity", "5–7 years", "7–10 years"],
 ["Min size", "$100M+", "$150M+"],
 ].map(([feat, loan, bond]) => (
 <tr key={feat} className="hover:bg-muted/30">
 <td className="py-1.5 text-muted-foreground">{feat}</td>
 <td className="py-1.5 text-center text-muted-foreground">{loan}</td>
 <td className="py-1.5 text-center text-muted-foreground">{bond}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </InfoCard>
 </div>
 </div>

 <InfoCard title="Notable Recent DCM Deals" icon={<DollarSign className="w-4 h-4" />}>
 <div className="flex gap-2 mb-3 flex-wrap">
 {(["all", "investment-grade", "high-yield", "loan"] as const).map((f) => (
 <button key={f} onClick={() => setTypeFilter(f)}
 className={cn("text-xs text-muted-foreground rounded-full px-3 py-1 transition-colors",
 typeFilter === f ? "bg-primary text-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
 {f === "all" ? "All" : f === "investment-grade" ? "Inv. Grade" : f === "high-yield" ? "High Yield" : "Loans"}
 </button>
 ))}
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground min-w-[600px]">
 <thead>
 <tr className="border-b border-border">
 {["Issuer", "Sector", "Size", "Coupon", "Rating", "Tenor", "Type", "Use of Proceeds", "Date"].map((h) => (
 <th key={h} className="text-left py-2 pr-3 text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((deal) => {
 const typeLabel = deal.type === "investment-grade" ? "IG" : deal.type === "high-yield" ? "HY" : "Loan";
 const typeColor2 = deal.type === "investment-grade"
 ? "bg-muted/60 text-primary"
 : deal.type === "high-yield"
 ? "bg-amber-900/40 text-amber-300"
 : "bg-green-900/40 text-green-300";
 return (
 <tr key={deal.id} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="py-2 pr-3 font-medium text-foreground">{deal.issuer}</td>
 <td className="pr-3 text-muted-foreground">{deal.sector}</td>
 <td className="pr-3 font-mono text-muted-foreground">${deal.size}B</td>
 <td className="pr-3 font-mono text-muted-foreground">{deal.coupon}%</td>
 <td className="pr-3 font-mono text-muted-foreground">{deal.rating}</td>
 <td className="pr-3 text-muted-foreground">{deal.tenor}</td>
 <td className="pr-3">
 <span className={cn("text-xs text-muted-foreground rounded-full px-2 py-0.5 font-medium", typeColor2)}>{typeLabel}</span>
 </td>
 <td className="pr-3 text-muted-foreground max-w-[160px] truncate">{deal.useOfProceeds}</td>
 <td className="text-muted-foreground">{deal.date}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </InfoCard>
 </div>
 );
}

// ── Tab 6: ECM Analytics ──────────────────────────────────────────────────────

function ECMAnalyticsTab() {
 const maxVol = Math.max(...LEAGUE_TABLE.map((e) => e.volume));

 return (
 <div className="space-y-4">
 <div className="flex flex-wrap gap-3 mb-2">
 <StatChip label="2026 YTD IPO Volume" value="$88B" color="blue" />
 <StatChip label="Active Pipeline" value="$47B" color="green" />
 <StatChip label="Avg IPO P/E Multiple" value="28× fwd" color="amber" />
 <StatChip label="Withdrawal Rate" value="12%" color="red" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <InfoCard title="ECM League Tables — Top 10 Bookrunners" icon={<Award className="w-4 h-4" />}>
 <div className="space-y-2">
 {LEAGUE_TABLE.map((entry) => (
 <div key={entry.rank} className="flex items-center gap-2">
 <div className={cn(
 "w-5 h-5 rounded-full flex items-center justify-center text-xs text-muted-foreground font-medium flex-shrink-0",
 entry.rank <= 3 ? "bg-amber-500/20 text-amber-300" : "bg-muted text-muted-foreground"
 )}>
 {entry.rank}
 </div>
 <div className="text-xs text-muted-foreground w-32 flex-shrink-0">{entry.bank}</div>
 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
 <div
 className={cn("h-full rounded-full", entry.rank <= 3 ? "bg-amber-500" : "bg-primary")}
 style={{ width: `${(entry.volume / maxVol) * 100}%` }}
 />
 </div>
 <div className="text-xs font-mono text-muted-foreground w-14 text-right">${entry.volume}B</div>
 <div className="text-xs text-muted-foreground w-10 text-right">{entry.deals} deals</div>
 <div className={cn("text-xs text-muted-foreground w-8 text-right font-medium",
 entry.change > 0 ? "text-green-400" : entry.change < 0 ? "text-red-400" : "text-muted-foreground")}>
 {entry.change > 0 ? `↑${entry.change}` : entry.change < 0 ? `↓${Math.abs(entry.change)}` : "—"}
 </div>
 </div>
 ))}
 </div>
 </InfoCard>

 <div className="space-y-4">
 <InfoCard title="Geographic IPO Breakdown (2026 YTD)" icon={<Globe className="w-4 h-4" />}>
 <GeographicBreakdownChart />
 </InfoCard>

 <InfoCard title="IPO Market Health Indicators" icon={<CheckCircle2 className="w-4 h-4" />}>
 <div className="space-y-2">
 {[
 { label: "S&P 500 YTD", value: "+8.4%", status: "green", note: "Supportive backdrop" },
 { label: "VIX Level", value: "17.2", status: "green", note: "Low volatility = IPO window open" },
 { label: "IG Spread", value: "+95 bps", status: "green", note: "Tight = investor risk appetite" },
 { label: "HY Spread", value: "+320 bps", status: "amber", note: "Slightly elevated vs 2024" },
 { label: "IPO Pipeline", value: "47 filings", status: "green", note: "Above-average activity" },
 { label: "SPAC Issuance", value: "8 SPACs", status: "amber", note: "Below 2021 peak" },
 ].map((ind) => {
 const dotColor = ind.status === "green" ? "bg-green-500" : ind.status === "amber" ? "bg-amber-500" : "bg-red-500";
 return (
 <div key={ind.label} className="flex items-center gap-2 text-xs text-muted-foreground">
 <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColor)} />
 <span className="text-muted-foreground w-36">{ind.label}</span>
 <span className="font-mono font-medium text-foreground w-20">{ind.value}</span>
 <span className="text-muted-foreground">{ind.note}</span>
 </div>
 );
 })}
 </div>
 </InfoCard>
 </div>
 </div>

 <InfoCard title="IPO Market Cycles (2000–2026)" icon={<BarChart3 className="w-4 h-4" />}>
 <IPOCycleChart />
 <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
 <span><strong className="text-amber-400">Bubble years</strong>: 2000 (dotcom), 2007 (LBO/credit), 2021 (SPAC/rate zero)</span>
 <span><strong className="text-red-400">Dry years</strong>: 2001–2002 (dotcom bust), 2008 (GFC), 2022 (rate hike shock)</span>
 </div>
 </InfoCard>

 <InfoCard title="Sector IPO Activity (2026 YTD)" icon={<Layers className="w-4 h-4" />}>
 <SectorHeatmap />
 </InfoCard>

 <InfoCard title="IPO Calendar — Upcoming 10 Expected IPOs" icon={<Calendar className="w-4 h-4" />}>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground min-w-[560px]">
 <thead>
 <tr className="border-b border-border">
 {["Company", "Sector", "Exp. Size", "Expected", "Stage", "Last Valuation", "vs Peers"].map((h) => (
 <th key={h} className="text-left py-2 pr-4 text-muted-foreground font-medium">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {UPCOMING_IPOS.map((ipo) => {
 const stageMap: Record<string, string> = {
 filed: "bg-muted/50 text-muted-foreground",
 roadshow: "bg-muted/60 text-primary",
 pricing: "bg-green-900/40 text-green-300",
 };
 const impliedMultiple = ipo.lastValuation / (ipo.expectedSize * 8);
 const multColor = impliedMultiple > 5 ? "text-amber-400" : impliedMultiple > 2 ? "text-primary" : "text-muted-foreground";
 return (
 <tr key={ipo.id} className="border-b border-border hover:bg-muted/40 transition-colors">
 <td className="py-2 pr-4 font-medium text-foreground">{ipo.company}</td>
 <td className="pr-4 text-muted-foreground">{ipo.sector}</td>
 <td className="pr-4 font-mono text-muted-foreground">${ipo.expectedSize}B</td>
 <td className="pr-4 text-muted-foreground">{ipo.expectedQ}</td>
 <td className="pr-4">
 <span className={cn("text-xs text-muted-foreground rounded-full px-2 py-0.5 capitalize font-medium", stageMap[ipo.stage])}>
 {ipo.stage}
 </span>
 </td>
 <td className="pr-4 font-mono text-muted-foreground">${ipo.lastValuation}B</td>
 <td className={cn("font-mono text-xs text-muted-foreground", multColor)}>
 {impliedMultiple.toFixed(1)}× rev
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground mt-2">*Vs Peers based on illustrative estimated revenue multiples. Not investment advice.</p>
 </InfoCard>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CapitalMarketsPage() {
 return (
 <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
 {/* HERO Header */}
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="mb-8 border-l-4 border-l-primary rounded-md bg-card p-6"
 >
 <div className="flex items-center gap-3 mb-1">
 <div className="w-8 h-8 rounded-lg bg-muted/10 border border-primary/40 flex items-center justify-center">
 <Building2 className="w-3.5 h-3.5 text-muted-foreground/50" />
 </div>
 <h1 className="text-xl font-semibold text-foreground">Capital Markets</h1>
 <span className="ml-2 text-xs bg-muted/60 border border-border text-primary rounded-full px-2 py-0.5">
 IPO · SPAC · DCM · ECM
 </span>
 </div>
 <p className="text-sm text-muted-foreground ml-11">
 Comprehensive guide to primary and secondary capital markets — from S-1 filing to bond issuance, SPAC mechanics, and ECM analytics.
 </p>
 </motion.div>

 {/* Tabs */}
 <Tabs defaultValue="ipo-process" className="w-full">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
 {[
 { value: "ipo-process", label: "IPO Process", icon: <Clock className="w-3.5 h-3.5" /> },
 { value: "ipo-valuation", label: "IPO Valuation", icon: <Percent className="w-3.5 h-3.5" /> },
 { value: "spac", label: "SPAC Market", icon: <Zap className="w-3.5 h-3.5" /> },
 { value: "secondary", label: "Secondary Offerings", icon: <ArrowUpDown className="w-3.5 h-3.5" /> },
 { value: "dcm", label: "Debt Capital Markets", icon: <DollarSign className="w-3.5 h-3.5" /> },
 { value: "ecm-analytics", label: "ECM Analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
 ].map((tab) => (
 <TabsTrigger
 key={tab.value}
 value={tab.value}
 className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-foreground text-muted-foreground px-3 py-1.5"
 >
 {tab.icon}
 {tab.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="ipo-process" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <IPOProcessTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="ipo-valuation" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <IPOValuationTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="spac" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <SPACTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="secondary" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <SecondaryOfferingsTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="dcm" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <DCMTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="ecm-analytics" className="data-[state=inactive]:hidden">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <ECMAnalyticsTab />
 </motion.div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
