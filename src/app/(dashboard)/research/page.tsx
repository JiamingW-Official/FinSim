"use client";

import { useState } from "react";
import {
 BookOpen,
 TrendingUp,
 TrendingDown,
 BarChart2,
 Calendar,
 Database,
 ChevronDown,
 ChevronUp,
 AlertTriangle,
 Target,
 Zap,
 Globe,
 DollarSign,
 Activity,
 Layers,
 ShieldCheck,
 Building2,
 Cpu,
 Leaf,
 Users,
 FlaskConical,
 Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG (mulberry32, seed=2023) ──────────────────────────────────────

function mulberry32(seed: number) {
 return function () {
 seed |= 0;
 seed = (seed + 0x6d2b79f5) | 0;
 let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
 t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
 return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

const rng = mulberry32(2023);

// Pre-generate random values so render is deterministic
const RNG_VALS = Array.from({ length: 400 }, () => rng());

// ── Types ─────────────────────────────────────────────────────────────────────

interface ResearchTheme {
 id: string;
 title: string;
 icon: React.ReactNode;
 conviction: "High" | "Medium" | "Low";
 convictionPct: number;
 thesis: string;
 dataPoints: string[];
 risks: string[];
 tickers: string[];
}

interface ValuationMetric {
 label: string;
 current: number;
 historicalAvg: number;
 percentile: number;
 unit: string;
}

interface EconEvent {
 date: string;
 name: string;
 prior: string;
 consensus: string;
 actual?: string;
 importance: "high" | "medium" | "low";
}

interface BankForecast {
 bank: string;
 target: number;
 stance: "bullish" | "neutral" | "bearish";
 thesis: string;
}

interface ResearchNote {
 id: string;
 title: string;
 abstract: string;
 findings: string[];
 risks: string[];
 implications: string[];
 icon: React.ReactNode;
}

interface EconIndicator {
 name: string;
 current: string;
 mom: string;
 yoy: string;
 trend: "up" | "down" | "flat";
 sparkline: number[];
 story: string;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const RESEARCH_THEMES: ResearchTheme[] = [
 {
 id: "ai-infra",
 title: "AI Infrastructure Build-Out",
 icon: <Cpu className="w-4 h-4" />,
 conviction: "High",
 convictionPct: 88,
 thesis:
 "Hyperscalers are spending at unprecedented rates on GPU clusters, custom silicon, and data centers to support frontier AI workloads. Capital expenditure from the top four cloud providers is expected to exceed $200B in 2025, with no near-term slowdown. The infrastructure layer — semiconductors, power, cooling, networking — will capture the largest share of value in the AI stack.",
 dataPoints: [
 "Meta, Google, MSFT, Amazon combined capex: ~$210B (2025E)",
 "NVDA data center revenue: $47B TTM, +215% YoY",
 "US data center power demand: +15% YoY through 2027",
 "Custom ASIC market projected to reach $40B by 2028",
 ],
 risks: [
 "AI monetization lags infrastructure spend (capex bubble risk)",
 "Geopolitical chip export restrictions (China, others)",
 "Energy constraints limiting build-out pace",
 "Regulatory scrutiny on AI concentration",
 ],
 tickers: ["NVDA", "AMD", "AVGO", "VST", "EQIX", "SMCI"],
 },
 {
 id: "reshoring",
 title: "Reshoring & Manufacturing Renaissance",
 icon: <Building2 className="w-4 h-4" />,
 conviction: "Medium",
 convictionPct: 65,
 thesis:
 "The CHIPS Act, IRA, and geopolitical decoupling from China are catalyzing a multi-trillion dollar reshoring wave in US manufacturing. Semiconductor fabs, EV battery plants, and defense supply chains are all receiving massive domestic investment. Industrial ETFs such as XLI and PAVE are positioned to benefit from this multi-year structural tailwind.",
 dataPoints: [
 "US manufacturing construction spending: +120% vs 2021",
 "IRA committed $369B in clean energy incentives",
 "CHIPS Act: $52B for domestic semiconductor production",
 "Announced factory investments: $500B+ since 2022",
 ],
 risks: [
 "Higher domestic production costs vs Asia",
 "Labor shortages in skilled manufacturing trades",
 "Political risk — policy reversal in election cycle",
 "Slower-than-projected build timelines",
 ],
 tickers: ["XLI", "PAVE", "CAT", "DE", "HON", "GE"],
 },
 {
 id: "glp1",
 title: "GLP-1 Weight Loss Revolution",
 icon: <FlaskConical className="w-4 h-4" />,
 conviction: "High",
 convictionPct: 82,
 thesis:
 "GLP-1 receptor agonists (Ozempic, Wegovy, Mounjaro) represent the most significant pharmaceutical innovation since statins, with obesity affecting 40% of US adults. Novo Nordisk and Eli Lilly are capacity-constrained as demand overwhelms supply. Adjacent industries — food, medical devices, insurance, bariatric surgery — face structural disruption as patients lose significant weight.",
 dataPoints: [
 "GLP-1 market projected to reach $130B by 2030",
 "Wegovy reduces cardiovascular events by 20% (SELECT trial)",
 "US obesity prevalence: 41.9% of adults",
 "Pipeline: oral formulations, combo therapies in Phase 3",
 ],
 risks: [
 "Payer coverage and affordability access barriers",
 "Long-term safety data still limited",
 "Competitive pipeline from Pfizer, Roche, AZ",
 "Patient adherence: ~50% discontinuation at 12 months",
 ],
 tickers: ["NVO", "LLY", "HIMS", "AMGN", "PFE"],
 },
 {
 id: "energy-transition",
 title: "Energy Transition",
 icon: <Leaf className="w-4 h-4" />,
 conviction: "Medium",
 convictionPct: 60,
 thesis:
 "Solar, wind, and battery storage are now the cheapest new sources of power generation in most markets, driving exponential capacity additions. The IRA has supercharged US clean energy investment, while Europe's energy security imperative post-Ukraine is accelerating the transition. ESG capital flows remain a structural tailwind despite near-term political headwinds.",
 dataPoints: [
 "Global solar installations: 400 GW added in 2023",
 "Lithium-ion battery costs fell 90% over last decade",
 "US offshore wind pipeline: 30 GW by 2030",
 "Clean energy investment exceeded fossil fuels for first time (2023)",
 ],
 risks: [
 "IRA rollback risk under political change",
 "Grid stability concerns with variable renewables",
 "Critical mineral supply chain bottlenecks",
 "Interest rate sensitivity for project financing",
 ],
 tickers: ["ENPH", "FSLR", "NEE", "BEP", "ICLN", "SMTC"],
 },
 {
 id: "cybersecurity",
 title: "Cybersecurity Imperative",
 icon: <ShieldCheck className="w-4 h-4" />,
 conviction: "High",
 convictionPct: 78,
 thesis:
 "AI-driven cyberattacks are increasing in sophistication and frequency, forcing enterprises to modernize security architectures. Zero-trust network access is replacing perimeter-based security, creating a massive replacement cycle. Cloud-native security platforms are consolidating spend away from legacy point solutions, benefiting scale players.",
 dataPoints: [
 "Global cybersecurity spend: $215B in 2024, +13% YoY",
 "Average data breach cost: $4.45M (IBM 2023 report)",
 "AI-assisted attacks: 3x increase in phishing volume (2023)",
 "Zero-trust adoption: 60% of enterprises plan by 2025",
 ],
 risks: [
 "Budget fatigue — security consolidation limiting vendor count",
 "Open-source alternatives commoditizing basic security",
 "Talent shortage creating execution risk",
 "Macro slowdown delaying enterprise IT spending",
 ],
 tickers: ["CRWD", "PANW", "ZS", "OKTA", "S", "CYBR"],
 },
 {
 id: "india",
 title: "India Emergence",
 icon: <Globe className="w-4 h-4" />,
 conviction: "Medium",
 convictionPct: 70,
 thesis:
 "India is now the world's most populous country and fastest-growing major economy, expanding at 6–7% annually. Manufacturing FDI is surging as companies diversify away from China. A young demographic profile, rising middle class, and digital infrastructure buildout create a decades-long investment opportunity across financials, consumer, and industrials.",
 dataPoints: [
 "GDP growth: 6.8% (FY2024), projected 6.5% FY2025",
 "Median age: 28 years vs 39 US, 49 Japan",
 "India manufacturing FDI: +36% YoY in 2023",
 "Nifty 50 forward P/E: 21x — premium to EM average",
 ],
 risks: [
 "Valuation premium leaves little room for disappointment",
 "Political risk — election outcomes",
 "Infrastructure bottlenecks limiting growth potential",
 "INR currency volatility for USD investors",
 ],
 tickers: ["INDA", "PIN", "INFY", "HDB", "IBN", "WIT"],
 },
 {
 id: "short-duration",
 title: "Short Duration Fixed Income",
 icon: <DollarSign className="w-4 h-4" />,
 conviction: "Medium",
 convictionPct: 55,
 thesis:
 "With the Fed funds rate at a 20-year high, short-duration Treasuries and money market funds offer attractive yields with minimal duration risk. T-bills at 5.2% compete favorably with equities on a risk-adjusted basis. As the rate cycle turns, short-duration bonds provide a stable income source while waiting for better equity entry points.",
 dataPoints: [
 "3-month T-bill yield: 5.18% (March 2025)",
 "Money market AUM: $6.2T (record high)",
 "Investment grade 2Y spread: 52bps vs historical avg 60bps",
 "Fed dot plot median 2025 funds rate: 4.375%",
 ],
 risks: [
 "Reinvestment risk if rates fall faster than expected",
 "Inflation re-acceleration extending higher-for-longer",
 "Opportunity cost if equity rally accelerates",
 "Credit risk in non-government short-duration products",
 ],
 tickers: ["SHV", "BIL", "SGOV", "JPST", "ICSH"],
 },
 {
 id: "commodity-supercycle",
 title: "Commodity Supercycle 2.0",
 icon: <Layers className="w-4 h-4" />,
 conviction: "Medium",
 convictionPct: 62,
 thesis:
 "The energy transition and AI infrastructure buildout are creating extraordinary demand for copper, lithium, and rare earth metals. A decade of underinvestment in mining has constrained supply, setting up a structural deficit. Combined with USD weakness and geopolitical tensions, we believe commodities are in the early innings of a multi-year bull cycle.",
 dataPoints: [
 "Copper demand for EVs + renewables: 2x by 2030 (IEA)",
 "Global copper mining capex: -30% vs prior cycle peak",
 "Lithium carbonate deficit projected: 100kt by 2025",
 "Goldman commodity index 12-month return estimate: +15%",
 ],
 risks: [
 "China demand disappointment (largest commodity consumer)",
 "Demand destruction from higher commodity prices",
 "New supply discoveries shortening deficit timeline",
 "Strong USD headwind for commodity prices",
 ],
 tickers: ["FCX", "VALE", "ALB", "COPX", "DJP", "PDBC"],
 },
];

const VALUATION_METRICS: ValuationMetric[] = [
 { label: "S&P 500 Trailing P/E", current: 24.1, historicalAvg: 18.5, percentile: 82, unit: "x" },
 { label: "S&P 500 Forward P/E", current: 20.8, historicalAvg: 16.2, percentile: 78, unit: "x" },
 { label: "Shiller CAPE", current: 33.4, historicalAvg: 17.1, percentile: 91, unit: "x" },
 { label: "Price-to-Book", current: 4.2, historicalAvg: 3.0, percentile: 80, unit: "x" },
 { label: "Price-to-Sales", current: 2.7, historicalAvg: 1.7, percentile: 88, unit: "x" },
 { label: "EV/EBITDA", current: 15.6, historicalAvg: 12.0, percentile: 76, unit: "x" },
];

const INTL_PE: { region: string; pe: number; color: string }[] = [
 { region: "US (S&P 500)", pe: 24.1, color: "#6366f1" },
 { region: "Europe (Stoxx 600)", pe: 14.2, color: "#3b82f6" },
 { region: "Emerging Markets", pe: 12.8, color: "#10b981" },
 { region: "Japan (Nikkei)", pe: 16.5, color: "#f59e0b" },
 { region: "UK (FTSE 100)", pe: 11.9, color: "#8b5cf6" },
];

const SECTOR_MULTIPLES: { sector: string; pe: number; pb: number; ps: number; evEb: number; rel: number }[] = [
 { sector: "Technology", pe: 30.2, pb: 9.1, ps: 7.4, evEb: 24.0, rel: 0.82 },
 { sector: "Healthcare", pe: 22.1, pb: 4.8, ps: 2.9, evEb: 16.8, rel: 0.12 },
 { sector: "Financials", pe: 15.3, pb: 1.7, ps: 2.1, evEb: 10.2, rel: -0.41 },
 { sector: "Cons. Disc.", pe: 27.6, pb: 6.2, ps: 1.8, evEb: 18.5, rel: 0.55 },
 { sector: "Cons. Staples", pe: 21.0, pb: 5.3, ps: 1.4, evEb: 14.2, rel: -0.10 },
 { sector: "Industrials", pe: 23.4, pb: 4.1, ps: 2.0, evEb: 16.0, rel: 0.30 },
 { sector: "Energy", pe: 12.8, pb: 2.0, ps: 1.1, evEb: 8.5, rel: -0.75 },
 { sector: "Materials", pe: 17.5, pb: 2.8, ps: 1.5, evEb: 11.2, rel: -0.22 },
 { sector: "Real Estate", pe: 38.4, pb: 2.2, ps: 5.2, evEb: 20.1, rel: 0.41 },
 { sector: "Utilities", pe: 20.8, pb: 1.9, ps: 1.8, evEb: 13.5, rel: -0.05 },
 { sector: "Comm. Services", pe: 22.3, pb: 3.5, ps: 3.1, evEb: 14.8, rel: 0.20 },
];

const ECON_EVENTS: EconEvent[] = [
 { date: "Mar 28", name: "PCE Price Index (MoM)", prior: "0.3%", consensus: "0.3%", importance: "high" },
 { date: "Apr 1", name: "ISM Manufacturing PMI", prior: "47.8", consensus: "48.5", importance: "high" },
 { date: "Apr 2", name: "JOLTS Job Openings", prior: "8.86M", consensus: "8.70M", importance: "medium" },
 { date: "Apr 4", name: "Nonfarm Payrolls", prior: "275K", consensus: "200K", importance: "high" },
 { date: "Apr 4", name: "Unemployment Rate", prior: "3.7%", consensus: "3.8%", importance: "high" },
 { date: "Apr 5", name: "Michigan Consumer Sentiment", prior: "76.9", consensus: "77.5", importance: "medium" },
 { date: "Apr 8", name: "NY Fed 1Yr Inflation Exp.", prior: "3.04%", consensus: "3.00%", importance: "medium" },
 { date: "Apr 10", name: "CPI (YoY)", prior: "3.2%", consensus: "3.1%", importance: "high" },
 { date: "Apr 11", name: "PPI (MoM)", prior: "0.6%", consensus: "0.3%", importance: "high" },
 { date: "Apr 15", name: "Retail Sales (MoM)", prior: "-0.8%", consensus: "0.6%", importance: "high" },
 { date: "Apr 16", name: "Industrial Production (MoM)", prior: "0.1%", consensus: "0.3%", importance: "medium" },
 { date: "Apr 17", name: "Housing Starts", prior: "1.331M", consensus: "1.400M",importance: "medium" },
 { date: "Apr 18", name: "Philly Fed Mfg. Index", prior: "5.2", consensus: "2.3", importance: "low" },
 { date: "Apr 22", name: "Existing Home Sales", prior: "4.38M", consensus: "4.20M", importance: "medium" },
 { date: "Apr 23", name: "S&P Global Flash PMI Comp.", prior: "52.5", consensus: "52.2", importance: "medium" },
 { date: "Apr 24", name: "Durable Goods Orders (MoM)", prior: "-6.1%", consensus: "1.2%", importance: "high" },
 { date: "Apr 25", name: "GDP (1st Est., QoQ Ann.)", prior: "3.4%", consensus: "2.1%", importance: "high" },
 { date: "Apr 26", name: "Core PCE Deflator (MoM)", prior: "0.4%", consensus: "0.3%", importance: "high" },
 { date: "Apr 30", name: "Employment Cost Index (QoQ)", prior: "0.9%", consensus: "1.0%", importance: "medium" },
 { date: "May 1", name: "FOMC Rate Decision", prior: "5.25%", consensus: "5.25%", importance: "high" },
];

const BANK_FORECASTS: BankForecast[] = [
 { bank: "JPMorgan", target: 5200, stance: "bearish", thesis: "Credit conditions tightening, consumer credit delinquencies rising, cautious on 2H." },
 { bank: "Goldman Sachs",target: 5600, stance: "bullish", thesis: "AI productivity boost underestimated by market, earnings revisions to accelerate." },
 { bank: "Morgan Stanley",target: 5400, stance: "neutral", thesis: "Soft landing base case intact, but multiple expansion limited at current valuations." },
 { bank: "Bank of America",target: 5300, stance: "bearish", thesis: "Election uncertainty headwinds, fiscal deficit concerns, cautious into Q3." },
 { bank: "Citi", target: 5500, stance: "bullish", thesis: "Consumer resilience underappreciated, real wages positive, breadth expansion supports rally." },
];

const SURPRISE_DATA: { event: string; consensus: string; actual: string; surprise: number }[] = [
 { event: "Feb Nonfarm Payrolls", consensus: "200K", actual: "275K", surprise: 1.8 },
 { event: "Feb CPI (YoY)", consensus: "3.1%", actual: "3.2%", surprise: -0.5 },
 { event: "Q4 GDP (2nd Est.)", consensus: "3.2%", actual: "3.4%", surprise: 1.2 },
 { event: "Feb Retail Sales", consensus: "0.4%", actual: "-0.8%", surprise: -3.1 },
 { event: "Feb ISM Services PMI", consensus: "53.0", actual: "52.6", surprise: -0.4 },
 { event: "Feb PPI (MoM)", consensus: "0.3%", actual: "0.6%", surprise: -1.5 },
];

const RESEARCH_NOTES: ResearchNote[] = [
 {
 id: "ai-supercycle",
 title: "The AI Supercycle",
 icon: <Cpu className="w-5 h-5 text-indigo-400" />,
 abstract: "We analyze the three-layer AI infrastructure stack — silicon, systems, and software — and conclude that we are in the early innings of a capex supercycle that will rival the internet buildout of the 1990s.",
 findings: [
 "Hyperscaler capex has doubled in 2 years and shows no sign of abating — AI workloads are compute-insatiable.",
 "Custom silicon (Google TPU, AWS Trainium) will take ~20% share from NVDA by 2028, but absolute GPU demand still rises.",
 "Software layer monetization is lagging hardware investment by 18–24 months — we are entering the monetization phase.",
 "Energy demand for data centers could represent 4–8% of US grid capacity by 2028, creating bottlenecks.",
 "Semiconductor equipment companies (AMAT, KLAC, LRCX) often outperform chip makers in late-cycle capex builds.",
 ],
 risks: [
 "AI bubble / hype cycle — revenue expectations not met, multiples compress sharply.",
 "Antitrust breakup of hyperscalers would fundamentally restructure capex flows.",
 "Disruptive model efficiency gains (e.g., MoE architectures) reduce compute requirements.",
 ],
 implications: [
 "Overweight: NVDA, AVGO, power/utility stocks with data center exposure (VST, NRG).",
 "Neutral: Software pure-plays until monetization evidence clearer (CRM, NOW).",
 "Watch: Custom silicon enablers — packaging (ASE, Amkor), HBM memory (SK Hynix).",
 ],
 },
 {
 id: "demographics",
 title: "Demographics & Markets",
 icon: <Users className="w-5 h-5 text-emerald-400" />,
 abstract: "Aging populations in developed markets are reshaping everything from housing demand to healthcare spending to bond markets. We examine the investment implications of a world where the dependency ratio is rising inexorably.",
 findings: [
 "Japan and Germany face acute workforce shrinkage — 1 in 3 citizens over 65 by 2040.",
 "US baby boomer wealth transfer of $68T over next 20 years will reshape asset allocation patterns.",
 "Healthcare spending as % of GDP rises 1–2pp per decade in aging demographics — structural growth.",
 "Aging skews toward defensive sectors: pharma, medical devices, insurance, utilities.",
 "Emerging markets (India, Vietnam, Bangladesh) benefit from demographic dividend through 2040.",
 ],
 risks: [
 "Immigration policy changes could dramatically alter US demographic trajectory.",
 "AI and robotics as demographic wild card — substituting for missing workers.",
 "Political populism from aging electorates could reverse free-trade policies.",
 ],
 implications: [
 "Overweight healthcare across aging developed markets: LLY, UNH, MDT, Stryker.",
 "Overweight India/ASEAN equities for demographic dividend tailwind.",
 "Consider inflation-linked bonds as aging demographics create sticky service inflation.",
 ],
 },
 {
 id: "dollar",
 title: "Dollar Dominance at Risk?",
 icon: <DollarSign className="w-5 h-5 text-yellow-400" />,
 abstract: "The US dollar's 80-year reign as the world's reserve currency faces new challenges from BRICS payment systems, CBDCs, and gold accumulation by central banks. We examine whether this is structural erosion or cyclical noise.",
 findings: [
 "USD share of global FX reserves: 58% vs 72% in 2000 — slow but persistent decline.",
 "Central bank gold purchases hit 1,037 tonnes in 2023, highest on record since 1967.",
 "BRICS nations announced alternative payment system — implementation remains unclear.",
 "Weaponization of USD in Russia sanctions accelerated diversification interest.",
 "US twin deficit (trade + fiscal) at levels historically associated with USD weakness.",
 ],
 risks: [
 "No credible alternative reserve currency exists — Euro, CNY, gold all have structural limits.",
 "US bond market remains the deepest, most liquid in the world — flight-to-quality persists.",
 "Commodity pricing in non-USD currencies remains immature and politically complex.",
 ],
 implications: [
 "Modest allocation to gold (5–10%) as central bank demand provides price floor.",
 "EM equity and debt benefit if USD enters multi-year structural decline.",
 "Bitcoin and crypto remain speculative — CBDC competition may limit adoption.",
 ],
 },
 {
 id: "real-estate",
 title: "Real Estate Reckoning",
 icon: <Building2 className="w-5 h-5 text-rose-400" />,
 abstract: "Commercial real estate faces its most severe stress test since 2008, with office vacancy at record highs and $2T in CRE debt maturing through 2025. Meanwhile, residential affordability is at its worst in 40 years. We separate the distress from the opportunity.",
 findings: [
 "US office vacancy rate: 19.2% nationally, 25%+ in major CBDs — a structural shift, not cyclical.",
 "$2.0T in CRE debt matures 2024–2026 — regional banks (20% of CRE lending) face credit stress.",
 "Residential affordability index: worst since 1984, as prices and rates moved higher simultaneously.",
 "Industrial REIT fundamentals remain strong: logistics, data centers, cold storage benefiting.",
 "Multifamily oversupply in Sun Belt markets expected to weigh on rents through 2025.",
 ],
 risks: [
 "Office loan extensions hide true credit losses — extend-and-pretend delays reckoning.",
 "Regional bank CRE exposure could trigger credit events if sentiment shifts.",
 "Residential market freeze (sellers locked into low-rate mortgages) creating transaction drought.",
 ],
 implications: [
 "Avoid office and retail REITs — structurally impaired, not just cyclically weak.",
 "Overweight industrial/logistics REITs: PLD, STAG, COLD (cold storage).",
 "Monitor regional banks with >300% CRE/capital concentration ratios.",
 ],
 },
 {
 id: "energy-math",
 title: "Energy Transition Math",
 icon: <Leaf className="w-5 h-5 text-green-400" />,
 abstract: "Solar levelized cost of energy (LCOE) is now below $30/MWh in sunny regions, undercutting every fossil fuel alternative. We model the transition timeline, grid stability implications, and identify who wins and who loses.",
 findings: [
 "Solar LCOE: $24–30/MWh in Sun Belt (vs $40–60/MWh for new natural gas combined cycle).",
 "EV adoption S-curve: 15% of new car sales globally in 2023 — likely 40% by 2030.",
 "Grid stability requires 4x current battery storage capacity by 2030 — massive investment needed.",
 "IRA tax credits add $10–20/MWh subsidy value, making US projects globally competitive.",
 "Permitting and transmission bottlenecks are the binding constraint, not economics.",
 ],
 risks: [
 "IRA rollback removes subsidy floor — project economics weaken at current module prices.",
 "Critical mineral supply for batteries: lithium, cobalt, nickel face geopolitical risks.",
 "Grid stability costs are socializing — distributed cost may create political backlash.",
 ],
 implications: [
 "Overweight solar manufacturers with US manufacturing (FSLR): IRA protections maximize.",
 "Battery storage players (FLNC, STEM) are bottleneck beneficiaries.",
 "Transmission utilities (AEE, ETR) are infrastructure plays on renewable integration.",
 ],
 },
];

const ECON_INDICATORS: EconIndicator[] = [
 { name: "US GDP Growth (QoQ ann.)", current: "3.4%", mom: "+0.4pp", yoy: "-0.3pp", trend: "up", sparkline: [2.2, 2.1, 1.8, 2.5, 3.2, 3.4], story: "US growth surprised to the upside in Q4, driven by resilient consumer spending and government expenditure. The composition, however, shows some softening in private investment." },
 { name: "CPI Inflation (YoY)", current: "3.2%", mom: "+0.1pp", yoy: "-4.2pp", trend: "down", sparkline: [6.5, 5.0, 3.7, 3.2, 3.1, 3.2], story: "Inflation has fallen dramatically from the 2022 peak but remains above the Fed's 2% target. Shelter costs and services inflation are proving stickier than goods deflation." },
 { name: "Core PCE (YoY)", current: "2.8%", mom: "+0.0pp", yoy: "-2.9pp", trend: "flat", sparkline: [4.9, 4.2, 3.5, 2.9, 2.8, 2.8], story: "The Fed's preferred inflation gauge has moderated significantly but a final push to 2% requires services disinflation. This is the key gating factor for rate cuts." },
 { name: "Unemployment Rate", current: "3.7%", mom: "+0.1pp", yoy: "+0.3pp", trend: "up", sparkline: [3.4, 3.5, 3.5, 3.7, 3.7, 3.7], story: "Labor market remains historically tight, though slight softening is evident. Job openings are declining, and the Sahm Rule indicator is not yet triggered." },
 { name: "Nonfarm Payrolls (3M avg)", current: "265K", mom: "+15K", yoy: "-58K", trend: "down", sparkline: [320, 310, 290, 275, 250, 265], story: "Monthly job creation remains robust but has trended lower from the post-pandemic peak. Healthcare and government have driven most recent gains while tech and finance have contracted." },
 { name: "ISM Manufacturing PMI", current: "47.8", mom: "+0.5", yoy: "-3.2", trend: "flat", sparkline: [48.0, 47.1, 47.4, 47.8, 48.5, 47.8], story: "Manufacturing remains in contraction territory (below 50) for the 16th consecutive month. New orders have stabilized but backlogs continue to drain." },
 { name: "ISM Services PMI", current: "52.6", mom: "-0.8", yoy: "+1.2", trend: "up", sparkline: [49.2, 51.9, 53.4, 54.5, 53.4, 52.6], story: "Services activity expanded for the 14th consecutive month, supported by strong employment and business activity sub-indices." },
 { name: "Retail Sales (MoM)", current: "-0.8%", mom: "-1.2pp", yoy: "+2.8pp", trend: "down", sparkline: [0.5, 0.3, 0.8, -0.2, 0.6, -0.8], story: "The surprise -0.8% decline in February likely reflects weather effects and spending payback from a strong January. Trend remains positive." },
 { name: "Housing Starts", current: "1.33M", mom: "+5.9%", yoy: "-6.1%", trend: "flat", sparkline: [1.4, 1.35, 1.28, 1.29, 1.25, 1.33], story: "Housing starts remain below the 1.5M needed to solve the supply crisis. Builder confidence is recovering with lower mortgage rates but labor and lot costs remain headwinds." },
 { name: "Existing Home Sales", current: "4.38M", mom: "+9.5%", yoy: "-5.2%", trend: "up", sparkline: [4.0, 3.8, 3.78, 3.96, 4.0, 4.38], story: "Existing home sales rose sharply as mortgage rates dipped, supporting affordability. The lock-in effect (sellers with low-rate mortgages unwilling to move) continues to constrain inventory." },
 { name: "Consumer Confidence", current: "106.7", mom: "+4.3", yoy: "+8.2", trend: "up", sparkline: [98, 102, 100, 104, 102, 106.7], story: "Consumer confidence beat expectations, supported by strong labor market conditions and fading inflation anxiety. Present situation index is at near-cycle highs." },
 { name: "U. of Michigan Sentiment", current: "76.9", mom: "-2.4", yoy: "+12.1", trend: "flat", sparkline: [60.4, 67.0, 71.6, 79.0, 79.3, 76.9], story: "Sentiment fell modestly from January's cycle high. Inflation expectations at 1-year horizon rose to 3.0%, which Fed officials will monitor carefully." },
 { name: "Personal Savings Rate", current: "3.8%", mom: "-0.2pp", yoy: "-2.1pp", trend: "down", sparkline: [5.5, 4.9, 4.5, 4.2, 4.0, 3.8], story: "The savings rate has fallen to pre-pandemic levels, suggesting consumers are drawing down excess savings. This limits the runway for consumption-led growth." },
 { name: "Trade Balance (monthly)", current: "-$68B", mom: "+$2B", yoy: "+$15B", trend: "up", sparkline: [-82,-75,-70,-71,-70,-68], story: "The trade deficit narrowed marginally, aided by strong export demand for energy products and aircraft. The structural goods deficit with China persists despite tariffs." },
 { name: "Industrial Production", current: "0.1%", mom: "+0.1pp", yoy: "-0.3pp", trend: "flat", sparkline: [-0.2, 0.3, -0.1, 0.4, 0.0, 0.1], story: "Industrial output barely grew, with mining and utilities offsetting manufacturing weakness. Capacity utilization at 78.3% is near long-run average." },
 { name: "Building Permits", current: "1.48M", mom: "+2.4%", yoy: "+1.9%", trend: "up", sparkline: [1.38, 1.42, 1.44, 1.43, 1.45, 1.48], story: "Permits, a leading indicator for construction, are recovering. Single-family permits are driving the improvement as builders respond to tight resale inventory." },
 { name: "Fed Funds Rate", current: "5.25%", mom: "0.00pp", yoy: "+0.25pp",trend: "flat", sparkline: [4.5, 4.75, 5.0, 5.25, 5.25, 5.25], story: "The Federal Reserve held rates at the highest level since 2001. Markets are pricing 3 cuts by year-end, but Fed officials have pushed back on that timeline." },
 { name: "10Y Treasury Yield", current: "4.30%", mom: "-0.12pp",yoy: "+0.40pp",trend: "down", sparkline: [3.87, 4.25, 4.80, 4.35, 4.18, 4.30], story: "The 10-year yield has come off its October 2023 peak of 5.02%. Rate cut expectations and safe-haven flows have supported the bond market's recovery." },
 { name: "2Y-10Y Yield Curve", current: "-0.38%",mom: "+0.09pp",yoy: "+0.62pp",trend: "up", sparkline: [-1.08, -1.0, -0.85, -0.55, -0.47, -0.38], story: "The yield curve inversion is narrowing, historically a signal that precedes recession rather than coincides with it. The un-inversion process deserves careful monitoring." },
 { name: "M2 Money Supply (YoY)", current: "0.3%", mom: "+0.8pp", yoy: "+7.8pp", trend: "up", sparkline: [-2.3, -2.0, -1.8, -0.8, -0.5, 0.3], story: "M2 growth has returned to positive territory after a historic contraction. Historical analysis shows money supply growth leads inflation by 12–24 months." },
];

const MARKET_INDICATORS: { name: string; level: string; change: string; trend: "up" | "down" | "flat"; color: string; story: string }[] = [
 { name: "VIX (Volatility Index)", level: "16.4", change: "-1.2", trend: "down", color: "#10b981", story: "VIX at sub-17 implies markets expect low near-term volatility. This complacency can itself be a contrarian warning signal." },
 { name: "HY Credit Spread", level: "310bps", change: "+8bps", trend: "up", color: "#ef4444", story: "HY spreads widened modestly but remain near 5-year lows, suggesting credit markets are not pricing in significant stress." },
 { name: "IG Credit Spread", level: "92bps", change: "+3bps", trend: "up", color: "#f59e0b", story: "Investment-grade spreads are historically tight, indicating high demand for quality credit and limited compensation for credit risk." },
 { name: "DXY (Dollar Index)", level: "104.2", change: "+0.3", trend: "up", color: "#6366f1", story: "The dollar remains firm on relative US growth outperformance and higher-for-longer Fed expectations. EM assets typically struggle in a strong dollar environment." },
 { name: "Gold Spot ($/oz)", level: "$2,180", change: "+$38", trend: "up", color: "#f59e0b", story: "Gold is trading near all-time highs, supported by central bank buying, de-dollarization fears, and geopolitical uncertainty." },
 { name: "WTI Crude ($/bbl)", level: "$81.4", change: "+$2.1", trend: "up", color: "#8b5cf6", story: "Oil prices are supported by OPEC+ supply discipline and solid demand. Geopolitical risk premium is modest vs prior episodes." },
 { name: "Put/Call Ratio", level: "0.82", change: "+0.04", trend: "up", color: "#ec4899", story: "Rising put/call ratio suggests growing hedging activity. A reading above 1.0 would signal elevated fear." },
 { name: "AAII Bull-Bear Spread", level: "+18.4%", change: "-3.2pp", trend: "down", color: "#14b8a6", story: "Retail investor sentiment is moderately bullish. Extreme bullishness (>40pp) is typically contrarian bearish." },
 { name: "BofA Fund Manager Survey", level: "OW Equit",change: "steady", trend: "flat", color: "#3b82f6", story: "Institutional fund managers remain overweight equities, with biggest overweights in tech and healthcare. Cash levels are near historical lows." },
 { name: "Margin Debt (NYSE)", level: "$714B", change: "+$12B", trend: "up", color: "#f97316", story: "Margin debt is rising again after a 2022–23 deleveraging cycle. Increasing leverage amplifies both upside and downside moves." },
];

const CORRELATIONS: { asset: string; corr30d: number; corr1y: number; color: string }[] = [
 { asset: "Bonds (TLT)", corr30d: -0.42, corr1y: -0.31, color: "#3b82f6" },
 { asset: "Gold", corr30d: 0.18, corr1y: 0.05, color: "#f59e0b" },
 { asset: "Oil (WTI)", corr30d: 0.24, corr1y: 0.15, color: "#8b5cf6" },
 { asset: "VIX", corr30d: -0.78, corr1y: -0.72, color: "#ef4444" },
 { asset: "Dollar (DXY)", corr30d: -0.35, corr1y: -0.28, color: "#6366f1" },
];

// ── SVG Helpers ───────────────────────────────────────────────────────────────

function MiniSparkline({ values, color = "#6366f1", width = 80, height = 28 }: {
 values: number[];
 color?: string;
 width?: number;
 height?: number;
}) {
 if (values.length < 2) return null;
 const min = Math.min(...values);
 const max = Math.max(...values);
 const range = max - min || 1;
 const pts = values.map((v, i) => {
 const x = (i / (values.length - 1)) * width;
 const y = height - ((v - min) / range) * height;
 return `${x},${y}`;
 });
 return (
 <svg width={width} height={height} className="overflow-visible">
 <polyline
 points={pts.join(" ")}
 fill="none"
 stroke={color}
 strokeWidth={1.5}
 strokeLinejoin="round"
 strokeLinecap="round"
 />
 </svg>
 );
}

function GaugeArc({ percentile, size = 80 }: { percentile: number; size?: number }) {
 const r = size / 2 - 8;
 const cx = size / 2;
 const cy = size / 2 + 4;
 const startAngle = -200 * (Math.PI / 180);
 const endAngle = 20 * (Math.PI / 180);
 const pctAngle = startAngle + (endAngle - startAngle) * (percentile / 100);

 const describeArc = (a1: number, a2: number) => {
 const x1 = cx + r * Math.cos(a1);
 const y1 = cy + r * Math.sin(a1);
 const x2 = cx + r * Math.cos(a2);
 const y2 = cy + r * Math.sin(a2);
 const large = a2 - a1 > Math.PI ? 1 : 0;
 return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
 };

 const color = percentile >= 80 ? "#ef4444" : percentile >= 60 ? "#f59e0b" : "#10b981";
 const needleX = cx + (r - 4) * Math.cos(pctAngle);
 const needleY = cy + (r - 4) * Math.sin(pctAngle);

 return (
 <svg width={size} height={size * 0.7}>
 <path d={describeArc(startAngle, endAngle)} fill="none" stroke="#1e293b" strokeWidth={8} strokeLinecap="round" />
 <path d={describeArc(startAngle, startAngle + (endAngle - startAngle) * 0.33)} fill="none" stroke="#10b981" strokeWidth={8} strokeLinecap="round" />
 <path d={describeArc(startAngle + (endAngle - startAngle) * 0.33, startAngle + (endAngle - startAngle) * 0.66)} fill="none" stroke="#f59e0b" strokeWidth={8} strokeLinecap="round" />
 <path d={describeArc(startAngle + (endAngle - startAngle) * 0.66, endAngle)} fill="none" stroke="#ef4444" strokeWidth={8} strokeLinecap="round" />
 <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth={2} strokeLinecap="round" />
 <circle cx={cx} cy={cy} r={3} fill={color} />
 </svg>
 );
}

function BarChart({ data, color = "#6366f1", width = 300, height = 80 }: {
 data: { label: string; value: number }[];
 color?: string;
 width?: number;
 height?: number;
}) {
 const max = Math.max(...data.map(d => d.value));
 const barW = Math.floor((width - (data.length - 1) * 4) / data.length);
 return (
 <svg width={width} height={height + 20} className="overflow-visible">
 {data.map((d, i) => {
 const bh = (d.value / max) * height;
 const x = i * (barW + 4);
 const y = height - bh;
 return (
 <g key={d.label}>
 <rect x={x} y={y} width={barW} height={bh} fill={color} rx={2} opacity={0.85} />
 <text x={x + barW / 2} y={height + 14} textAnchor="middle" fill="#64748b" fontSize={9}>
 {d.label}
 </text>
 </g>
 );
 })}
 </svg>
 );
}

function BuffettIndicatorChart({ width = 500, height = 120 }: { width?: number; height?: number }) {
 // Simulated Buffett indicator (Market Cap / GDP) over 30 years
 const rngB = mulberry32(7777);
 const pts: number[] = [];
 let val = 0.65;
 for (let i = 0; i < 30; i++) {
 val = Math.max(0.4, Math.min(2.2, val + (rngB() - 0.48) * 0.12));
 pts.push(val);
 }
 pts[pts.length - 1] = 1.72; // current ~172%

 const maxV = 2.2;
 const minV = 0.3;
 const range = maxV - minV;
 const polyPts = pts.map((v, i) => {
 const x = (i / (pts.length - 1)) * width;
 const y = height - ((v - minV) / range) * height;
 return `${x.toFixed(1)},${y.toFixed(1)}`;
 }).join(" ");

 const fairY = height - ((1.0 - minV) / range) * height;
 const overY = height - ((1.5 - minV) / range) * height;

 return (
 <svg width={width} height={height + 30} className="overflow-visible">
 {/* Zone fills */}
 <rect x={0} y={overY} width={width} height={fairY - overY} fill="#f59e0b" opacity={0.08} />
 <rect x={0} y={0} width={width} height={overY} fill="#ef4444" opacity={0.06} />
 <rect x={0} y={fairY} width={width} height={height - fairY}fill="#10b981" opacity={0.06} />
 {/* Reference lines */}
 <line x1={0} y1={fairY} x2={width} y2={fairY} stroke="#10b981" strokeWidth={1} strokeDasharray="4,3" />
 <line x1={0} y1={overY} x2={width} y2={overY} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,3" />
 <text x={width - 2} y={fairY - 3} textAnchor="end" fill="#10b981" fontSize={9}>Fair (100%)</text>
 <text x={width - 2} y={overY - 3} textAnchor="end" fill="#f59e0b" fontSize={9}>Overvalued (150%)</text>
 {/* Line */}
 <polyline points={polyPts} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinejoin="round" />
 {/* Current dot */}
 <circle cx={width} cy={height - ((pts[pts.length-1] - minV) / range) * height} r={4} fill="#ef4444" />
 {/* X-axis labels */}
 {[0, 9, 19, 29].map(idx => (
 <text key={idx} x={(idx / 29) * width} y={height + 18} textAnchor="middle" fill="#64748b" fontSize={9}>
 {(1994 + idx).toString()}
 </text>
 ))}
 </svg>
 );
}

function CorrBar({ value }: { value: number }) {
 const pct = ((value + 1) / 2) * 100;
 const color = value > 0.3 ? "#10b981" : value < -0.3 ? "#ef4444" : "#f59e0b";
 return (
 <div className="relative h-3 bg-muted rounded-full w-28">
 <div
 className="absolute top-0 left-1/2 h-3 rounded-full"
 style={{
 width: `${Math.abs(value) * 50}%`,
 left: value > 0 ? "50%" : `${50 - Math.abs(value) * 50}%`,
 backgroundColor: color,
 }}
 />
 <div className="absolute top-0 left-1/2 w-px h-3 bg-muted" />
 </div>
 );
}

// ── Tab Components ────────────────────────────────────────────────────────────

function ResearchDashboard() {
 const [expandedId, setExpandedId] = useState<string | null>(null);
 const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);
 const convictionColor = (c: ResearchTheme["conviction"]) =>
 c === "High" ? "text-emerald-400 border-emerald-800 bg-emerald-950/40" :
 c === "Medium" ? "text-yellow-400 border-yellow-800 bg-yellow-950/40" :
 "text-muted-foreground border-border bg-muted/40";

 return (
 <div className="space-y-3">
 <div className="flex items-center gap-3 mb-4">
 <p className="text-muted-foreground text-sm">
 8 high-conviction thematic investment ideas with thesis, data, and risk analysis.
 </p>
 <Badge variant="outline" className="ml-auto text-indigo-400 border-indigo-800">Updated Mar 2026</Badge>
 </div>
 {RESEARCH_THEMES.map((theme, idx) => (
 <div
 key={theme.id}
 >
 <Card className={cn("bg-card/70 border-border overflow-hidden", idx === 0 && "border-l-4 border-l-primary")}>
 <button
 className="w-full text-left"
 onClick={() => toggle(theme.id)}
 >
 <CardHeader className={cn("py-3 px-4", idx === 0 && "p-4")}>
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0">
 {theme.icon}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <CardTitle className={cn("text-sm text-foreground", idx === 0 && "text-lg")}>{theme.title}</CardTitle>
 <Badge variant="outline" className={cn("text-xs text-muted-foreground px-2 py-0", convictionColor(theme.conviction))}>
 {theme.conviction} Conviction
 </Badge>
 </div>
 <div className="mt-1.5 flex items-center gap-2">
 <Progress value={theme.convictionPct} className="h-1.5 w-32 bg-muted" />
 <span className="text-xs text-muted-foreground">{theme.convictionPct}%</span>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <div className="flex gap-1 flex-wrap max-w-[200px] justify-end">
 {theme.tickers.slice(0, 3).map(t => (
 <Badge key={t} variant="outline" className="text-xs text-muted-foreground border-border px-1.5 py-0">{t}</Badge>
 ))}
 </div>
 {expandedId === theme.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
 </div>
 </div>
 </CardHeader>
 </button>
 
 {expandedId === theme.id && (
 <div
 key="body"
 >
 <CardContent className="pt-0 pb-4 px-4">
 <div className="border-t border-border pt-3 space-y-4">
 {/* Thesis */}
 <div>
 <p className="text-xs font-semibold text-muted-foreground mb-1.5">Thesis</p>
 <p className="text-sm text-muted-foreground leading-relaxed">{theme.thesis}</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Data Points */}
 <div>
 <p className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
 <TrendingUp className="w-3 h-3" /> Supporting Data
 </p>
 <ul className="space-y-1">
 {theme.dataPoints.map((dp, i) => (
 <li key={i} className="text-xs text-muted-foreground flex gap-2">
 <span className="text-emerald-600 shrink-0 mt-0.5">•</span>
 <span>{dp}</span>
 </li>
 ))}
 </ul>
 </div>
 {/* Risks */}
 <div>
 <p className="text-xs font-semibold text-rose-400 mb-1.5 flex items-center gap-1">
 <AlertTriangle className="w-3 h-3" /> Risk Factors
 </p>
 <ul className="space-y-1">
 {theme.risks.map((r, i) => (
 <li key={i} className="text-xs text-muted-foreground flex gap-2">
 <span className="text-rose-600 shrink-0 mt-0.5">•</span>
 <span>{r}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 {/* All tickers */}
 <div className="flex flex-wrap gap-1.5">
 {theme.tickers.map(t => (
 <Badge key={t} className="text-xs bg-indigo-950/50 text-indigo-300 border-indigo-800 px-2">{t}</Badge>
 ))}
 </div>
 </div>
 </CardContent>
 </div>
 )}
 
 </Card>
 </div>
 ))}
 </div>
 );
}

function ValuationMonitor() {
 return (
 <div className="space-y-4">
 {/* Market Valuation Dashboard */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <BarChart2 className="w-4 h-4 text-indigo-400" />
 S&P 500 Valuation Metrics vs 30-Year History
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {VALUATION_METRICS.map((m, idx) => (
 <div
 key={m.label}
 className="bg-muted/50 rounded-lg p-3 flex flex-col items-center gap-1"
 >
 <GaugeArc percentile={m.percentile} size={80} />
 <p className="text-xs font-medium text-muted-foreground text-center leading-tight mt-1">{m.label}</p>
 <p className="text-lg font-semibold text-foreground">{m.current}{m.unit}</p>
 <div className="flex items-center gap-1 text-xs text-muted-foreground">
 <span className="text-muted-foreground">Avg: {m.historicalAvg}{m.unit}</span>
 <span className={cn("font-medium", m.percentile >= 80 ? "text-red-400" : m.percentile >= 60 ? "text-yellow-400" : "text-emerald-400")}>
 {m.percentile}th pct
 </span>
 </div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Gauge zones: Green = cheap (&lt;33rd pct) • Yellow = fair (33–66th pct) • Red = expensive (&gt;66th pct). Current S&P valuations are broadly elevated vs history.
 </p>
 </CardContent>
 </Card>

 {/* International Comparison */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />
 International P/E Comparison
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {INTL_PE.map(item => (
 <div key={item.region} className="flex items-center gap-3">
 <p className="text-sm text-muted-foreground w-44 shrink-0">{item.region}</p>
 <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
 <div
 style={{ width: `${(item.pe / 30) * 100}%` }}
 className="h-5 rounded-full flex items-center justify-end pr-2"
 >
 <span className="text-xs font-semibold text-foreground">{item.pe}x</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 US equities trade at a significant premium to international peers. European and EM markets offer relative value, but lack the growth drivers of US mega-caps.
 </p>
 </CardContent>
 </Card>

 {/* Sector Valuation Heatmap */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
 Sector Valuation Heatmap (Relative to Own History)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium py-2 pr-3 w-40">Sector</th>
 {["P/E", "P/B", "P/S", "EV/EB", "Rel. Score"].map(h => (
 <th key={h} className="text-center text-muted-foreground font-medium py-2 px-2">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {SECTOR_MULTIPLES.map((s, idx) => {
 const relColor = s.rel > 0.4 ? "text-red-400" : s.rel < -0.4 ? "text-emerald-400" : "text-yellow-400";
 const peColor = s.pe > 25 ? "bg-red-950/50 text-red-300" : s.pe > 18 ? "bg-yellow-950/50 text-yellow-300" : "bg-emerald-950/50 text-emerald-300";
 return (
 <tr
 key={s.sector}
 className="border-b border-border"
 >
 <td className="py-2 pr-3 text-muted-foreground font-medium">{s.sector}</td>
 <td className="text-center py-2 px-2">
 <span className={cn("px-1.5 py-0.5 rounded text-xs text-muted-foreground", peColor)}>{s.pe}x</span>
 </td>
 <td className="text-center py-2 px-2 text-muted-foreground">{s.pb}x</td>
 <td className="text-center py-2 px-2 text-muted-foreground">{s.ps}x</td>
 <td className="text-center py-2 px-2 text-muted-foreground">{s.evEb}x</td>
 <td className="text-center py-2 px-2">
 <span className={cn("font-medium text-xs text-muted-foreground", relColor)}>
 {s.rel > 0 ? "+" : ""}{s.rel.toFixed(2)}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Relative score: positive = expensive vs own history, negative = cheap. Tech and Real Estate are richest; Energy and Financials offer relative value.
 </p>
 </CardContent>
 </Card>

 {/* Buffett Indicator */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Activity className="w-4 h-4 text-yellow-400" />
 Buffett Indicator: Market Cap / GDP (30-Year History)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <BuffettIndicatorChart width={540} height={120} />
 </div>
 <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
 <div className="flex items-center gap-1.5"><span className="w-3 h-1 bg-emerald-500/60 inline-block rounded" />Fairly Valued (&lt;100%)</div>
 <div className="flex items-center gap-1.5"><span className="w-3 h-1 bg-yellow-500/60 inline-block rounded" />Moderately Overvalued (100–150%)</div>
 <div className="flex items-center gap-1.5"><span className="w-3 h-1 bg-red-500/60 inline-block rounded" />Significantly Overvalued (&gt;150%)</div>
 <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-400 rounded-full inline-block" />Current: 172%</div>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 At 172%, the Buffett Indicator suggests significant overvaluation relative to history. Historically, readings above 150% have preceded periods of below-average long-term returns.
 </p>
 </CardContent>
 </Card>

 {/* Credit Market Valuation */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-emerald-400" />
 Credit Market Spreads vs Historical Averages
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 gap-3">
 {[
 { label: "Investment Grade Spread", current: 92, avg: 130, min: 45, max: 600, unit: "bps", color: "#3b82f6" },
 { label: "High Yield Spread", current: 310, avg: 500, min: 200, max: 2200, unit: "bps", color: "#f59e0b" },
 ].map(c => {
 const pct = ((c.current - c.min) / (c.max - c.min)) * 100;
 const avgPct = ((c.avg - c.min) / (c.max - c.min)) * 100;
 return (
 <div key={c.label}>
 <p className="text-xs text-muted-foreground mb-2 font-medium">{c.label}</p>
 <div className="relative h-4 bg-muted rounded-full">
 <div
 className="absolute top-0 h-4 bg-muted rounded-full"
 style={{ width: `${avgPct}%`, opacity: 0.4 }}
 />
 <div
 style={{ width: `${pct}%` }}
 className="absolute top-0 h-4 rounded-full"
 />
 <div className="absolute top-0 h-4 flex items-center pl-2">
 <span className="text-xs font-medium text-foreground">{c.current}{c.unit}</span>
 </div>
 </div>
 <div className="flex justify-between text-xs text-muted-foreground mt-1">
 <span>{c.min}{c.unit} (tight)</span>
 <span className="text-muted-foreground">Avg: {c.avg}{c.unit}</span>
 <span>{c.max}{c.unit} (crisis)</span>
 </div>
 </div>
 );
 })}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Credit spreads remain historically tight, suggesting credit markets are pricing in a benign economic outlook. Tight spreads leave limited room for further compression.
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

function EconCalendar() {
 const [selectedSurprise, setSelectedSurprise] = useState<string | null>(null);
 const impColor = (imp: EconEvent["importance"]) =>
 imp === "high" ? "text-red-400 border-red-900 bg-red-950/40" :
 imp === "medium" ? "text-yellow-400 border-yellow-900 bg-yellow-950/30" :
 "text-muted-foreground border-border";

 const stanceColor = (s: BankForecast["stance"]) =>
 s === "bullish" ? "text-emerald-400 border-emerald-800 bg-emerald-950/40" :
 s === "bearish" ? "text-red-400 border-red-900 bg-red-950/40" :
 "text-yellow-400 border-yellow-900 bg-yellow-950/30";

 const minTarget = Math.min(...BANK_FORECASTS.map(b => b.target));
 const maxTarget = Math.max(...BANK_FORECASTS.map(b => b.target));
 const targetRange = maxTarget - minTarget;

 return (
 <div className="space-y-4">
 {/* Economic Calendar */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Calendar className="w-4 h-4 text-indigo-400" />
 30-Day Economic Calendar
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium py-2 w-16">Date</th>
 <th className="text-left text-muted-foreground font-medium py-2 flex-1">Event</th>
 <th className="text-center text-muted-foreground font-medium py-2 w-20">Prior</th>
 <th className="text-center text-muted-foreground font-medium py-2 w-24">Consensus</th>
 <th className="text-center text-muted-foreground font-medium py-2 w-16">Impact</th>
 </tr>
 </thead>
 <tbody>
 {ECON_EVENTS.map((ev, idx) => (
 <tr
 key={idx}
 className="border-b border-border hover:bg-muted/30 transition-colors"
 >
 <td className="py-2 pr-2 text-muted-foreground font-mono whitespace-nowrap">{ev.date}</td>
 <td className="py-2 pr-2 text-muted-foreground">{ev.name}</td>
 <td className="py-2 text-center text-muted-foreground">{ev.prior}</td>
 <td className="py-2 text-center text-foreground font-medium">{ev.consensus}</td>
 <td className="py-2 text-center">
 <Badge variant="outline" className={cn("text-xs text-muted-foreground px-1.5 py-0", impColor(ev.importance))}>
 {ev.importance}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Fed Projections (SEP) */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
 Fed SEP Projections (Dot Plot Summary)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium py-2">Variable</th>
 {["2025", "2026", "2027", "Longer Run"].map(y => (
 <th key={y} className="text-center text-muted-foreground font-medium py-2">{y}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {[
 { label: "GDP Growth", vals: ["2.1%", "2.0%", "2.0%", "1.8%"], color: "text-emerald-400" },
 { label: "PCE Inflation", vals: ["2.4%", "2.2%", "2.1%", "2.0%"], color: "text-yellow-400" },
 { label: "Unemployment", vals: ["4.0%", "4.1%", "4.0%", "4.1%"], color: "text-primary" },
 { label: "Fed Funds Rate", vals: ["4.375%","3.625%","2.875%","2.5%"],color: "text-rose-400" },
 ].map(row => (
 <tr key={row.label} className="border-b border-border">
 <td className="py-2 pr-3 text-muted-foreground font-medium">{row.label}</td>
 {row.vals.map((v, i) => (
 <td key={i} className={cn("text-center py-2 font-mono font-medium", row.color)}>{v}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Fed projections imply 3 cuts in 2025 (25bps each), with a longer-run neutral rate of 2.5%. Markets are pricing a more aggressive path that the Fed has pushed back on.
 </p>
 </CardContent>
 </Card>

 {/* Wall Street Consensus */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <TrendingUp className="w-4 h-4 text-emerald-400" />
 Wall Street 2025 Year-End S&P 500 Targets
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3 mb-4">
 {BANK_FORECASTS.map((b, idx) => {
 const pct = ((b.target - minTarget) / targetRange) * 100;
 return (
 <div
 key={b.bank}
 className="flex items-center gap-3"
 >
 <p className="text-sm text-muted-foreground w-36 shrink-0 font-medium">{b.bank}</p>
 <div className="flex-1 relative h-7 bg-muted rounded-lg overflow-hidden">
 <div
 style={{ width: `${30 + pct * 0.7}%`, backgroundColor: b.stance === "bullish" ? "#10b98133" : b.stance === "bearish" ? "#ef444433" : "#f59e0b33" }}
 className="absolute top-0 left-0 h-7 rounded-lg"
 />
 <div className="absolute inset-0 flex items-center px-3 gap-2">
 <span className="font-medium text-sm text-foreground">{b.target.toLocaleString()}</span>
 <Badge variant="outline" className={cn("text-xs text-muted-foreground px-1.5 py-0", stanceColor(b.stance))}>{b.stance}</Badge>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 {/* Thesis detail */}
 <div className="space-y-2 border-t border-border pt-3">
 {BANK_FORECASTS.map(b => (
 <div key={b.bank} className="flex gap-2 text-xs text-muted-foreground">
 <span className="text-muted-foreground font-medium w-24 shrink-0">{b.bank}:</span>
 <span className="text-muted-foreground">{b.thesis}</span>
 </div>
 ))}
 </div>
 <div className="flex items-center justify-between mt-3 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
 <span className="text-muted-foreground">Consensus (avg):</span>
 <span className="text-foreground font-medium text-base">
 {Math.round(BANK_FORECASTS.reduce((s, b) => s + b.target, 0) / BANK_FORECASTS.length).toLocaleString()}
 </span>
 <span className="text-muted-foreground">Range: {minTarget.toLocaleString()} – {maxTarget.toLocaleString()}</span>
 </div>
 </CardContent>
 </Card>

 {/* Surprise Monitor */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Zap className="w-4 h-4 text-yellow-400" />
 Consensus Surprise Monitor (Recent Releases)
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {SURPRISE_DATA.map((s, idx) => (
 <div
 key={s.event}
 className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
 onClick={() => setSelectedSurprise(prev => prev === s.event ? null : s.event)}
 >
 <div className={cn(
 "w-8 h-8 rounded-lg flex items-center justify-center text-xs text-muted-foreground font-medium shrink-0",
 s.surprise > 0 ? "bg-emerald-950/60 text-emerald-400" : "bg-red-950/60 text-red-400"
 )}>
 {s.surprise > 0 ? "+" : ""}{s.surprise.toFixed(1)}σ
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm text-muted-foreground font-medium">{s.event}</p>
 <p className="text-xs text-muted-foreground">Consensus: {s.consensus} | Actual: <span className={s.surprise > 0 ? "text-emerald-400" : "text-red-400"}>{s.actual}</span></p>
 </div>
 <div className={cn("text-xs font-medium px-2 py-1 rounded", s.surprise > 0 ? "text-emerald-400" : "text-red-400")}>
 {s.surprise > 0 ? "BEAT" : "MISS"}
 </div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3">
 Surprise score in standard deviations vs analyst consensus. Labor market data has been consistently surprising to the upside; retail sales missed expectations sharply.
 </p>
 </CardContent>
 </Card>
 </div>
 );
}

function ThematicResearch() {
 const [expandedId, setExpandedId] = useState<string | null>(null);
 const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

 return (
 <div className="space-y-4">
 <div className="flex items-center gap-2 mb-4">
 <p className="text-muted-foreground text-sm">
 In-depth research notes on structural investment themes. Each covers abstract, key findings, risks, and investment implications.
 </p>
 <Badge variant="outline" className="ml-auto text-primary border-border shrink-0">5 Deep Dives</Badge>
 </div>
 {RESEARCH_NOTES.map((note, idx) => (
 <div
 key={note.id}
 >
 <Card className="bg-card/70 border-border overflow-hidden">
 <button className="w-full text-left" onClick={() => toggle(note.id)}>
 <CardHeader className="py-4 px-5">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center shrink-0">
 {note.icon}
 </div>
 <div className="flex-1">
 <CardTitle className="text-sm text-foreground">"{note.title}"</CardTitle>
 <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{note.abstract}</p>
 </div>
 {expandedId === note.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
 </div>
 </CardHeader>
 </button>
 
 {expandedId === note.id && (
 <div
 key="body"
 >
 <CardContent className="pt-0 pb-5 px-5">
 <div className="border-t border-border pt-4 space-y-5">
 {/* Abstract */}
 <div>
 <p className="text-xs font-medium text-muted-foreground mb-2">Abstract</p>
 <p className="text-sm text-muted-foreground leading-relaxed">{note.abstract}</p>
 </div>
 {/* Key Findings */}
 <div>
 <p className="text-xs font-medium text-indigo-400 mb-2 flex items-center gap-1">
 <BookOpen className="w-3 h-3" /> Key Findings
 </p>
 <ul className="space-y-2">
 {note.findings.map((f, i) => (
 <li key={i} className="flex gap-2 text-sm text-muted-foreground">
 <span className="text-indigo-500 font-medium shrink-0">{i + 1}.</span>
 <span>{f}</span>
 </li>
 ))}
 </ul>
 </div>
 {/* Risks */}
 <div>
 <p className="text-xs font-medium text-rose-400 mb-2 flex items-center gap-1">
 <AlertTriangle className="w-3 h-3" /> Risks
 </p>
 <ul className="space-y-1.5">
 {note.risks.map((r, i) => (
 <li key={i} className="flex gap-2 text-sm text-muted-foreground">
 <span className="text-rose-500 shrink-0 mt-0.5">•</span>
 <span>{r}</span>
 </li>
 ))}
 </ul>
 </div>
 {/* Investment Implications */}
 <div>
 <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
 <Target className="w-3 h-3" /> Investment Implications
 </p>
 <ul className="space-y-1.5">
 {note.implications.map((imp, i) => (
 <li key={i} className="flex gap-2 text-sm text-muted-foreground">
 <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
 <span>{imp}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </CardContent>
 </div>
 )}
 
 </Card>
 </div>
 ))}
 </div>
 );
}

function DataLibrary() {
 const [storyId, setStoryId] = useState<string | null>(null);

 const trendIcon = (trend: "up" | "down" | "flat") =>
 trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> :
 trend === "down" ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> :
 <Activity className="w-3.5 h-3.5 text-muted-foreground" />;

 const trendColor = (trend: "up" | "down" | "flat") =>
 trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-muted-foreground";

 return (
 <div className="space-y-4">
 {/* Economic Indicators */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Database className="w-4 h-4 text-indigo-400" />
 Key Economic Indicators
 <Badge variant="outline" className="ml-auto text-xs text-muted-foreground border-border">Click any row for data story</Badge>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-xs text-muted-foreground">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium py-2 w-52">Indicator</th>
 <th className="text-center text-muted-foreground font-medium py-2">Current</th>
 <th className="text-center text-muted-foreground font-medium py-2">1M Chg</th>
 <th className="text-center text-muted-foreground font-medium py-2">12M Chg</th>
 <th className="text-center text-muted-foreground font-medium py-2 w-24">Trend</th>
 <th className="text-center text-muted-foreground font-medium py-2 w-20">Chart</th>
 </tr>
 </thead>
 <tbody>
 {ECON_INDICATORS.map((ind, idx) => (
 <>
 <tr
 key={ind.name}
 className={cn(
 "border-b border-border cursor-pointer transition-colors",
 storyId === ind.name ? "bg-indigo-950/20" : "hover:bg-muted/30"
 )}
 onClick={() => setStoryId(prev => prev === ind.name ? null : ind.name)}
 >
 <td className="py-2 pr-2 text-muted-foreground font-medium">{ind.name}</td>
 <td className="py-2 text-center text-foreground font-medium font-mono">{ind.current}</td>
 <td className={cn("py-2 text-center font-mono font-medium", ind.mom.startsWith("+") ? "text-emerald-400" : ind.mom.startsWith("-") ? "text-red-400" : "text-muted-foreground")}>
 {ind.mom}
 </td>
 <td className={cn("py-2 text-center font-mono font-medium", ind.yoy.startsWith("+") ? "text-emerald-400" : ind.yoy.startsWith("-") ? "text-red-400" : "text-muted-foreground")}>
 {ind.yoy}
 </td>
 <td className="py-2 text-center">
 <span className={cn("flex items-center justify-center gap-1 text-xs text-muted-foreground", trendColor(ind.trend))}>
 {trendIcon(ind.trend)}
 {ind.trend}
 </span>
 </td>
 <td className="py-2 flex justify-center">
 <MiniSparkline
 values={ind.sparkline}
 color={ind.trend === "up" ? "#10b981" : ind.trend === "down" ? "#ef4444" : "#6366f1"}
 width={64}
 height={24}
 />
 </td>
 </tr>
 {storyId === ind.name && (
 <tr key={`${ind.name}-story`} className="bg-indigo-950/20 border-b border-border">
 <td colSpan={6} className="px-3 py-2">
 <div className="flex gap-2 items-start">
 <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
 <p className="text-xs text-indigo-200">{ind.story}</p>
 </div>
 </td>
 </tr>
 )}
 </>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>

 {/* Market Indicators */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Activity className="w-3.5 h-3.5 text-muted-foreground/50" />
 Market Indicators &amp; Sentiment
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {MARKET_INDICATORS.map((m, idx) => (
 <div
 key={m.name}
 className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer group"
 onClick={() => setStoryId(prev => prev === m.name ? null : m.name)}
 >
 <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: m.color + "aa" }} />
 <div className="flex-1 min-w-0">
 <p className="text-xs text-muted-foreground font-medium truncate">{m.name}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className="text-sm font-medium text-foreground">{m.level}</span>
 <span className={cn("text-xs", m.trend === "up" ? "text-emerald-400" : m.trend === "down" ? "text-red-400" : "text-muted-foreground")}>
 {m.change}
 </span>
 </div>
 {storyId === m.name && (
 <p
 className="text-xs text-indigo-200 mt-1 leading-relaxed"
 >
 {m.story}
 </p>
 )}
 </div>
 <Info className="w-3.5 h-3.5 text-muted-foreground group-hover:text-muted-foreground transition-colors shrink-0" />
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Correlation Tracker */}
 <Card className="bg-card/70 border-border">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
 <Layers className="w-4 h-4 text-yellow-400" />
 S&P 500 Correlation Tracker
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground font-medium py-2 w-36">Asset vs S&P</th>
 <th className="text-center text-muted-foreground font-medium py-2">30D Corr</th>
 <th className="text-center text-muted-foreground font-medium py-2">1Y Corr</th>
 <th className="text-left text-muted-foreground font-medium py-2 pl-4">Correlation Bar</th>
 </tr>
 </thead>
 <tbody>
 {CORRELATIONS.map((c, idx) => (
 <tr
 key={c.asset}
 className="border-b border-border"
 >
 <td className="py-3 pr-3">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
 <span className="text-muted-foreground font-medium">{c.asset}</span>
 </div>
 </td>
 <td className="text-center py-3">
 <span className={cn("font-mono font-medium", c.corr30d > 0.3 ? "text-emerald-400" : c.corr30d < -0.3 ? "text-red-400" : "text-yellow-400")}>
 {c.corr30d > 0 ? "+" : ""}{c.corr30d.toFixed(2)}
 </span>
 </td>
 <td className="text-center py-3">
 <span className={cn("font-mono font-medium text-muted-foreground")}>
 {c.corr1y > 0 ? "+" : ""}{c.corr1y.toFixed(2)}
 </span>
 </td>
 <td className="py-3 pl-4">
 <CorrBar value={c.corr30d} />
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 <div className="mt-3 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground leading-relaxed">
 <strong className="text-muted-foreground">Correlation insight:</strong> The strongly negative S&P/VIX correlation (-0.78) confirms that volatility spikes reliably accompany equity drawdowns.
 The near-zero Gold correlation suggests gold is currently acting as an independent asset rather than a pure safe haven from equity risk.
 </div>
 </CardContent>
 </Card>

 {/* Export note */}
 <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
 <Database className="w-4 h-4 text-muted-foreground shrink-0" />
 <p className="text-xs text-muted-foreground">
 All data series are synthetic/educational. Click any indicator row for an auto-generated data interpretation. In a live deployment, these would connect to FRED, Bloomberg, or FactSet APIs.
 </p>
 </div>
 </div>
 );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ResearchPage() {
 return (
 <div className="flex h-full flex-col overflow-y-auto">
 <div className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 flex flex-col">
 {/* Hero */}
 <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Research</h1>
 <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-6">ANALYSIS · REPORTS · INSIGHTS</p>

 <div className="border-t border-border mb-6" />

 {/* Tabs */}
 <Tabs defaultValue="dashboard" className="w-full">
 <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto mb-6">
 <TabsTrigger value="dashboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Research Dashboard
 </TabsTrigger>
 <TabsTrigger value="valuation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Valuation Monitor
 </TabsTrigger>
 <TabsTrigger value="calendar" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Econ Calendar &amp; Forecasts
 </TabsTrigger>
 <TabsTrigger value="thematic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Thematic Research
 </TabsTrigger>
 <TabsTrigger value="data" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-2 text-xs text-muted-foreground data-[state=active]:text-foreground">
 Data Library
 </TabsTrigger>
 </TabsList>

 <TabsContent value="dashboard" className="mt-0 data-[state=inactive]:hidden"><ResearchDashboard /></TabsContent>
 <TabsContent value="valuation" className="mt-0 data-[state=inactive]:hidden"><ValuationMonitor /></TabsContent>
 <TabsContent value="calendar" className="mt-0 data-[state=inactive]:hidden"><EconCalendar /></TabsContent>
 <TabsContent value="thematic" className="mt-0 data-[state=inactive]:hidden"><ThematicResearch /></TabsContent>
 <TabsContent value="data" className="mt-0 data-[state=inactive]:hidden"><DataLibrary /></TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
