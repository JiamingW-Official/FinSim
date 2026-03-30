"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 Brain,
 Shield,
 Search,
 AlertTriangle,
 BarChart3,
 TrendingUp,
 Activity,
 CheckCircle,
 XCircle,
 Info,
 Zap,
 FileText,
 Eye,
 Lock,
 ChevronRight,
 Database,
 Layers,
 Target,
 Server,
 BookOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

let s = 722001;
const rand = () => {
 s = (s * 1103515245 + 12345) & 0x7fffffff;
 return s / 0x7fffffff;
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
 return (
 <h3 className="text-sm font-semibold text-muted-foreground mb-3">
 {children}
 </h3>
 );
}

function Card({
 children,
 className,
}: {
 children: React.ReactNode;
 className?: string;
}) {
 return (
 <div
 className={cn(
 "bg-card border border-border rounded-md p-4",
 className
 )}
 >
 {children}
 </div>
 );
}

function InfoBadge({
 color,
 children,
}: {
 color: "emerald" | "amber" | "rose" | "blue" | "violet";
 children: React.ReactNode;
}) {
 const cls: Record<typeof color, string> = {
 emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
 amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
 rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
 blue: "bg-primary/15 text-primary border-border",
 violet: "bg-primary/15 text-primary border-border",
 };
 return (
 <span
 className={cn(
 "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-muted-foreground font-medium border",
 cls[color]
 )}
 >
 {children}
 </span>
 );
}

// ── TAB 1: ML in Trading ──────────────────────────────────────────────────────

const ML_USE_CASES = [
 {
 name: "Return Prediction",
 technique: "Gradient Boosting / LSTM",
 horizon: "1d – 5d",
 features: "Price, volume, macro",
 sharpe: 1.4,
 data: "Structured",
 status: "Production",
 },
 {
 name: "NLP Sentiment",
 technique: "BERT / FinBERT",
 horizon: "Intraday",
 features: "News, filings, social",
 sharpe: 0.9,
 data: "Text",
 status: "Production",
 },
 {
 name: "RL Trading Agent",
 technique: "PPO / SAC",
 horizon: "Tick – 1d",
 features: "Order book, price",
 sharpe: 1.1,
 data: "Structured",
 status: "Research",
 },
 {
 name: "Alternative Data",
 technique: "XGBoost / CNN",
 horizon: "1d – 1mo",
 features: "Satellite, CC, web",
 sharpe: 1.6,
 data: "Unstructured",
 status: "Production",
 },
 {
 name: "Earnings Surprise",
 technique: "Ensemble + NLP",
 horizon: "Event-driven",
 features: "Estimates, text, alt",
 sharpe: 1.2,
 data: "Mixed",
 status: "Production",
 },
 {
 name: "Market Regime",
 technique: "HMM / Clustering",
 horizon: "1wk – 1mo",
 features: "Volatility, macro",
 sharpe: 0.8,
 data: "Structured",
 status: "Research",
 },
];

const RL_STAGES = [
 { label: "Environment", desc: "Order book + portfolio state" },
 { label: "Agent", desc: "Neural network policy π(s)" },
 { label: "Action", desc: "Buy / Sell / Hold" },
 { label: "Reward", desc: "Sharpe-adjusted P&L" },
 { label: "Update", desc: "Policy gradient (PPO)" },
];

const ALT_DATA = [
 { source: "Satellite imagery", signal: "Retail parking lots, oil tanks", edge: "High" },
 { source: "Credit card data", signal: "Revenue before earnings", edge: "Very high" },
 { source: "Web scraping", signal: "Job postings, prices", edge: "Medium" },
 { source: "Social media", signal: "Reddit, Twitter sentiment", edge: "Low–Medium" },
 { source: "App analytics", signal: "DAU, installs", edge: "High" },
 { source: "Patent filings", signal: "R&D pipeline strength", edge: "Medium" },
];

function MLTradingTab() {
 const [activeCase, setActiveCase] = useState(0);

 // Sparkline for selected case using seeded data
 const sparkData = useMemo(() => {
 const localS = { v: 722001 + activeCase * 17 };
 const localRand = () => {
 localS.v = (localS.v * 1103515245 + 12345) & 0x7fffffff;
 return localS.v / 0x7fffffff;
 };
 return Array.from({ length: 40 }, (_, i) => {
 const trend = i * 0.4;
 return 30 + trend + (localRand() - 0.5) * 18;
 });
 }, [activeCase]);

 const minV = Math.min(...sparkData);
 const maxV = Math.max(...sparkData);
 const norm = (v: number) => ((v - minV) / (maxV - minV)) * 60;
 const pts = sparkData
 .map((v, i) => `${(i / (sparkData.length - 1)) * 280},${70 - norm(v)}`)
 .join(" ");

 return (
 <div className="space-y-4">
 {/* Header stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { label: "AUM in ML Strategies", value: "$1.2T", color: "text-primary" },
 { label: "Quant Funds > 50% ML", value: "68%", color: "text-primary" },
 { label: "Avg Sharpe (ML vs human)", value: "1.3 vs 0.9", color: "text-emerald-400" },
 { label: "Alt data spend (2025)", value: "$7.4B", color: "text-amber-400" },
 ].map((s) => (
 <Card key={s.label}>
 <div className={cn("text-xl font-bold font-mono", s.color)}>{s.value}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
 </Card>
 ))}
 </div>

 {/* Use case table */}
 <Card>
 <SectionTitle>ML Use Case Comparison</SectionTitle>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 {["Strategy", "Technique", "Horizon", "Features", "Sharpe", "Data", "Status"].map((h) => (
 <th key={h} className="text-left text-muted-foreground text-xs font-medium pb-2 pr-3 whitespace-nowrap">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {ML_USE_CASES.map((row, i) => (
 <tr
 key={row.name}
 onClick={() => setActiveCase(i)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors hover:bg-muted/40",
 activeCase === i && "bg-muted/60"
 )}
 >
 <td className="py-2 pr-3 font-medium text-foreground whitespace-nowrap">{row.name}</td>
 <td className="py-2 pr-3 text-muted-foreground text-xs whitespace-nowrap">{row.technique}</td>
 <td className="py-2 pr-3 text-muted-foreground text-xs whitespace-nowrap">{row.horizon}</td>
 <td className="py-2 pr-3 text-muted-foreground text-xs whitespace-nowrap">{row.features}</td>
 <td className="py-2 pr-3 font-mono text-emerald-400">{row.sharpe.toFixed(1)}</td>
 <td className="py-2 pr-3">
 <InfoBadge color="blue">{row.data}</InfoBadge>
 </td>
 <td className="py-2 pr-3">
 <InfoBadge color={row.status === "Production" ? "emerald" : "amber"}>
 {row.status}
 </InfoBadge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Sparkline for selected */}
 <Card>
 <SectionTitle>{ML_USE_CASES[activeCase].name} — Simulated Equity Curve</SectionTitle>
 <svg viewBox="0 0 280 80" className="w-full h-20">
 <defs>
 <linearGradient id="mlGrad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
 </linearGradient>
 </defs>
 <polygon
 points={`0,80 ${pts} 280,80`}
 fill="url(#mlGrad)"
 />
 <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
 </svg>
 <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
 <span>Sharpe: <span className="text-emerald-400 font-mono">{ML_USE_CASES[activeCase].sharpe.toFixed(1)}</span></span>
 <span>Horizon: <span className="text-muted-foreground">{ML_USE_CASES[activeCase].horizon}</span></span>
 <span>Status: <span className="text-muted-foreground">{ML_USE_CASES[activeCase].status}</span></span>
 </div>
 </Card>

 {/* RL loop diagram */}
 <Card>
 <SectionTitle>RL Agent Loop</SectionTitle>
 <div className="flex flex-col gap-2">
 {RL_STAGES.map((stage, i) => (
 <div key={stage.label} className="flex items-center gap-3">
 <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
 {i + 1}
 </div>
 <div className="flex-1 bg-muted/50 rounded px-3 py-1.5">
 <span className="text-xs font-semibold text-foreground">{stage.label}</span>
 <span className="text-xs text-muted-foreground ml-2">{stage.desc}</span>
 </div>
 {i < RL_STAGES.length - 1 && (
 <ChevronRight className="w-3 h-3 text-muted-foreground" />
 )}
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Alternative Data */}
 <Card>
 <SectionTitle>Alternative Data Sources</SectionTitle>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {ALT_DATA.map((d) => (
 <div key={d.source} className="bg-muted/40 rounded-lg p-3">
 <div className="flex items-center justify-between mb-1">
 <span className="text-sm font-medium text-foreground">{d.source}</span>
 <InfoBadge
 color={
 d.edge === "Very high"
 ? "emerald"
 : d.edge === "High"
 ? "blue"
 : d.edge.startsWith("Low")
 ? "amber"
 : "violet"
 }
 >
 {d.edge}
 </InfoBadge>
 </div>
 <p className="text-xs text-muted-foreground">{d.signal}</p>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}

// ── TAB 2: Credit Scoring ─────────────────────────────────────────────────────

const CREDIT_FEATURES = [
 { name: "Payment history", traditional: 35, ml: 28 },
 { name: "Credit utilization", traditional: 30, ml: 22 },
 { name: "Credit age", traditional: 15, ml: 8 },
 { name: "New credit inquiries", traditional: 10, ml: 5 },
 { name: "Credit mix", traditional: 10, ml: 7 },
 { name: "Income stability", traditional: 0, ml: 14 },
 { name: "Spending patterns", traditional: 0, ml: 9 },
 { name: "Social/network signals", traditional: 0, ml: 4 },
 { name: "Behavioral biometrics", traditional: 0, ml: 3 },
];

const SHAP_DATA = [
 { feature: "Late payments (3mo)", value: -0.42, dir: "neg" },
 { feature: "High revolving util", value: -0.31, dir: "neg" },
 { feature: "Income > $80k", value: +0.29, dir: "pos" },
 { feature: "Mortgage holder", value: +0.24, dir: "pos" },
 { feature: "Short credit history", value: -0.19, dir: "neg" },
 { feature: "Multiple inquiries", value: -0.14, dir: "neg" },
 { feature: "Savings account", value: +0.11, dir: "pos" },
];

const FAIRNESS_ITEMS = [
 { concern: "Proxy discrimination", detail: "Zip code or spending patterns may encode race/ethnicity", severity: "high" },
 { concern: "Historical bias", detail: "Models trained on biased past decisions perpetuate inequality", severity: "high" },
 { concern: "Disparate impact", detail: "Equal accuracy across groups ≠ equal approval rates", severity: "medium" },
 { concern: "Lack of explainability", detail: "Applicants must be told why credit was denied (ECOA)", severity: "medium" },
 { concern: "Model drift", detail: "Behavior shifts over time as population changes", severity: "low" },
];

function CreditScoringTab() {
 const [showShap, setShowShap] = useState(false);

 const maxFeat = Math.max(...CREDIT_FEATURES.map((f) => Math.max(f.traditional, f.ml)));

 return (
 <div className="space-y-4">
 {/* FICO vs ML overview */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Card>
 <SectionTitle>Traditional FICO</SectionTitle>
 <div className="space-y-2">
 {[
 ["Score range", "300 – 850"],
 ["Input features", "~5 credit bureau fields"],
 ["Decision time", "Seconds (rule-based)"],
 ["Explainability", "High (top 4 reason codes)"],
 ["Fairness", "Regulated, well-studied"],
 ["Accuracy (AUC)", "~0.78"],
 ].map(([k, v]) => (
 <div key={k} className="flex justify-between text-sm">
 <span className="text-muted-foreground">{k}</span>
 <span className="text-foreground font-medium">{v}</span>
 </div>
 ))}
 </div>
 </Card>
 <Card>
 <SectionTitle>ML Credit Models</SectionTitle>
 <div className="space-y-2">
 {[
 ["Input features", "100s – 1000s"],
 ["Algorithms", "XGBoost, neural nets, ensemble"],
 ["Decision time", "Real-time (ms)"],
 ["Explainability", "SHAP / LIME (post-hoc)"],
 ["Fairness", "Requires active monitoring"],
 ["Accuracy (AUC)", "~0.86–0.91"],
 ].map(([k, v]) => (
 <div key={k} className="flex justify-between text-sm">
 <span className="text-muted-foreground">{k}</span>
 <span className="text-foreground font-medium">{v}</span>
 </div>
 ))}
 </div>
 </Card>
 </div>

 {/* Feature importance bar chart */}
 <Card>
 <div className="flex items-center justify-between mb-4">
 <SectionTitle>Feature Importance Comparison</SectionTitle>
 <div className="flex gap-3 text-xs text-muted-foreground">
 <span className="flex items-center gap-1.5">
 <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
 FICO weight
 </span>
 <span className="flex items-center gap-1.5">
 <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
 ML importance
 </span>
 </div>
 </div>
 <svg viewBox={`0 0 480 ${CREDIT_FEATURES.length * 32 + 10}`} className="w-full">
 {CREDIT_FEATURES.map((feat, i) => {
 const y = i * 32 + 6;
 const tradW = (feat.traditional / maxFeat) * 200;
 const mlW = (feat.ml / maxFeat) * 200;
 return (
 <g key={feat.name}>
 <text x="0" y={y + 10} className="fill-muted-foreground" fontSize="10" dominantBaseline="middle">
 {feat.name}
 </text>
 {/* FICO bar */}
 <rect x="170" y={y + 2} width={tradW} height="11" rx="2" fill="#3b82f6" opacity="0.7" />
 <text x={172 + tradW} y={y + 9} fill="#3b82f6" fontSize="9" dominantBaseline="middle">
 {feat.traditional > 0 ? `${feat.traditional}%` : "–"}
 </text>
 {/* ML bar */}
 <rect x="170" y={y + 15} width={mlW} height="11" rx="2" fill="#8b5cf6" opacity="0.7" />
 <text x={172 + mlW} y={y + 22} fill="#8b5cf6" fontSize="9" dominantBaseline="middle">
 {feat.ml > 0 ? `${feat.ml}%` : "–"}
 </text>
 </g>
 );
 })}
 </svg>
 </Card>

 {/* SHAP explanation */}
 <Card>
 <div className="flex items-center justify-between mb-3">
 <SectionTitle>SHAP Values — Explainability</SectionTitle>
 <button
 onClick={() => setShowShap((v) => !v)}
 className="text-xs text-primary hover:text-primary transition-colors"
 >
 {showShap ? "Hide detail" : "Show example"}
 </button>
 </div>
 <p className="text-xs text-muted-foreground mb-3">
 SHAP (SHapley Additive exPlanations) decomposes a model prediction into per-feature
 contributions, enabling regulators to audit individual decisions under ECOA/FCRA.
 </p>
 <AnimatePresence>
 {showShap && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="space-y-1.5">
 {SHAP_DATA.map((item) => {
 const barW = Math.abs(item.value) * 160;
 return (
 <div key={item.feature} className="flex items-center gap-2 text-xs text-muted-foreground">
 <span className="w-40 text-muted-foreground truncate flex-shrink-0">{item.feature}</span>
 <div className="flex-1 relative h-5 bg-muted rounded overflow-hidden">
 <div
 className={cn(
 "absolute top-0 h-full rounded",
 item.dir === "pos" ? "left-1/2 bg-emerald-500/60" : "right-1/2 bg-rose-500/60"
 )}
 style={{ width: `${(barW / 160) * 50}%` }}
 />
 <span className="absolute inset-0 flex items-center px-2 text-muted-foreground font-mono text-xs">
 {item.value > 0 ? "+" : ""}{item.value.toFixed(2)}
 </span>
 </div>
 </div>
 );
 })}
 </div>
 <p className="text-xs text-muted-foreground mt-2 italic">
 Positive SHAP → increases approval probability; Negative → decreases it.
 </p>
 </motion.div>
 )}
 </AnimatePresence>
 </Card>

 {/* Fairness concerns */}
 <Card>
 <SectionTitle>Fairness & Bias Concerns</SectionTitle>
 <div className="space-y-2">
 {FAIRNESS_ITEMS.map((item) => (
 <div key={item.concern} className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg">
 <AlertTriangle
 className={cn(
 "w-4 h-4 mt-0.5 flex-shrink-0",
 item.severity === "high"
 ? "text-rose-400"
 : item.severity === "medium"
 ? "text-amber-400"
 : "text-muted-foreground"
 )}
 />
 <div>
 <div className="text-sm font-medium text-foreground">{item.concern}</div>
 <div className="text-xs text-muted-foreground">{item.detail}</div>
 </div>
 <InfoBadge
 color={
 item.severity === "high"
 ? "rose"
 : item.severity === "medium"
 ? "amber"
 : "blue"
 }
 >
 {item.severity}
 </InfoBadge>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}

// ── TAB 3: Fraud Detection ────────────────────────────────────────────────────

// Precision/Recall curve points
const PR_CURVE = Array.from({ length: 20 }, (_, i) => {
 const recall = i / 19;
 const precision = 1 / (1 + Math.exp(6 * (recall - 0.7)));
 return { recall, precision };
});

const FRAUD_METHODS = [
 {
 method: "Rule-based filters",
 description: "Hard-coded velocity checks, geo anomalies",
 precision: 0.61,
 recall: 0.55,
 latency: "<1ms",
 scalable: false,
 },
 {
 method: "Isolation Forest",
 description: "Unsupervised anomaly detection",
 precision: 0.74,
 recall: 0.68,
 latency: "5ms",
 scalable: true,
 },
 {
 method: "Gradient Boosting",
 description: "Supervised, labeled fraud cases",
 precision: 0.88,
 recall: 0.82,
 latency: "8ms",
 scalable: true,
 },
 {
 method: "Graph Neural Network",
 description: "Detects fraud rings via transaction graph",
 precision: 0.91,
 recall: 0.85,
 latency: "25ms",
 scalable: true,
 },
 {
 method: "Ensemble (GBM + GNN)",
 description: "Combined scoring + ring detection",
 precision: 0.94,
 recall: 0.89,
 latency: "30ms",
 scalable: true,
 },
];

const FP_COSTS = [
 { threshold: "0.1", fpRate: 12, fnRate: 2, cost: 9.2 },
 { threshold: "0.3", fpRate: 6, fnRate: 5, cost: 6.1 },
 { threshold: "0.5", fpRate: 3, fnRate: 9, cost: 5.8 },
 { threshold: "0.7", fpRate: 1.5, fnRate: 16, cost: 7.2 },
 { threshold: "0.9", fpRate: 0.5, fnRate: 28, cost: 11.4 },
];

function FraudDetectionTab() {
 const [selected, setSelected] = useState(4);

 // PR curve SVG
 const svgW = 260;
 const svgH = 180;
 const pad = 30;
 const pts = PR_CURVE.map((p) => {
 const x = pad + p.recall * (svgW - pad * 2);
 const y = pad + (1 - p.precision) * (svgH - pad * 2);
 return `${x},${y}`;
 }).join(" ");

 return (
 <div className="space-y-4">
 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { label: "Global fraud losses (2024)", value: "$485B", color: "text-rose-400" },
 { label: "Avg detection latency (ML)", value: "18ms", color: "text-primary" },
 { label: "FP cost per alert (manual)", value: "$25–$50", color: "text-amber-400" },
 { label: "GNN fraud ring detection", value: "+34%", color: "text-emerald-400" },
 ].map((s) => (
 <Card key={s.label}>
 <div className={cn("text-xl font-medium font-mono", s.color)}>{s.value}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
 </Card>
 ))}
 </div>

 {/* Method comparison */}
 <Card>
 <SectionTitle>Detection Method Comparison</SectionTitle>
 <div className="space-y-2">
 {FRAUD_METHODS.map((m, i) => (
 <div
 key={m.method}
 onClick={() => setSelected(i)}
 className={cn(
 "p-3 rounded-lg border cursor-pointer transition-colors",
 selected === i
 ? "border-primary/50 bg-primary/10"
 : "border-border hover:bg-muted/40"
 )}
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-foreground">{m.method}</span>
 <div className="flex gap-2">
 <InfoBadge color={m.scalable ? "emerald" : "amber"}>
 {m.scalable ? "Scalable" : "Limited"}
 </InfoBadge>
 <span className="text-xs text-muted-foreground">{m.latency}</span>
 </div>
 </div>
 <p className="text-xs text-muted-foreground mb-2">{m.description}</p>
 <div className="flex gap-4">
 <div className="flex-1">
 <div className="text-xs text-muted-foreground mb-1">Precision</div>
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full bg-emerald-500 rounded-full"
 style={{ width: `${m.precision * 100}%` }}
 />
 </div>
 <span className="text-xs text-emerald-400 font-mono w-8">
 {(m.precision * 100).toFixed(0)}%
 </span>
 </div>
 </div>
 <div className="flex-1">
 <div className="text-xs text-muted-foreground mb-1">Recall</div>
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full bg-primary rounded-full"
 style={{ width: `${m.recall * 100}%` }}
 />
 </div>
 <span className="text-xs text-primary font-mono w-8">
 {(m.recall * 100).toFixed(0)}%
 </span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Precision-Recall curve */}
 <Card>
 <SectionTitle>Precision–Recall Tradeoff</SectionTitle>
 <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
 {/* Axes */}
 <line x1={pad} y1={svgH - pad} x2={svgW - pad + 5} y2={svgH - pad} stroke="#3f3f46" strokeWidth="1" />
 <line x1={pad} y1={pad - 5} x2={pad} y2={svgH - pad} stroke="#3f3f46" strokeWidth="1" />
 {/* Labels */}
 <text x={svgW / 2} y={svgH - 4} fill="#71717a" fontSize="9" textAnchor="middle">Recall</text>
 <text x={8} y={svgH / 2} fill="#71717a" fontSize="9" textAnchor="middle" transform={`rotate(-90,8,${svgH / 2})`}>Precision</text>
 {/* Tick labels */}
 {[0, 0.25, 0.5, 0.75, 1].map((v) => (
 <g key={v}>
 <text x={pad + v * (svgW - pad * 2)} y={svgH - pad + 10} fill="#52525b" fontSize="7" textAnchor="middle">
 {v.toFixed(2)}
 </text>
 <text x={pad - 4} y={pad + (1 - v) * (svgH - pad * 2)} fill="#52525b" fontSize="7" textAnchor="end" dominantBaseline="middle">
 {v.toFixed(2)}
 </text>
 </g>
 ))}
 {/* Curve fill */}
 <polygon
 points={`${pad},${svgH - pad} ${pts} ${svgW - pad},${svgH - pad}`}
 fill="#8b5cf6"
 opacity="0.15"
 />
 <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
 {/* AUC label */}
 <text x={svgW - pad - 2} y={pad + 12} fill="#8b5cf6" fontSize="9" textAnchor="end">
 AUC-PR ≈ 0.89
 </text>
 </svg>
 </Card>

 {/* False positive cost */}
 <Card>
 <SectionTitle>Threshold vs. Cost ($B annualized)</SectionTitle>
 <div className="space-y-2">
 {FP_COSTS.map((row) => (
 <div key={row.threshold} className="flex items-center gap-2 text-xs text-muted-foreground">
 <span className="w-14 text-muted-foreground flex-shrink-0">θ={row.threshold}</span>
 <span className="w-16 text-rose-400">FP: {row.fpRate}%</span>
 <span className="w-16 text-amber-400">FN: {row.fnRate}%</span>
 <div className="flex-1 h-4 bg-muted rounded overflow-hidden relative">
 <div
 className="h-full bg-primary/60 rounded"
 style={{ width: `${(row.cost / 12) * 100}%` }}
 />
 <span className="absolute inset-0 flex items-center px-2 text-muted-foreground font-mono">
 ${row.cost.toFixed(1)}B
 </span>
 </div>
 </div>
 ))}
 </div>
 <p className="text-xs text-muted-foreground mt-3 italic">
 Optimal threshold balances false positive review cost against missed fraud losses.
 </p>
 </Card>
 </div>

 {/* Graph Neural Network callout */}
 <Card className="border-border bg-primary/5">
 <div className="flex items-start gap-3">
 <Layers className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
 <div>
 <div className="text-sm font-semibold text-primary mb-1">Graph Neural Networks for Fraud Rings</div>
 <p className="text-xs text-muted-foreground">
 GNNs model transactions as a directed graph where nodes are accounts and edges are transfers.
 Message-passing aggregates neighborhood features to detect coordinated fraud rings that
 appear legitimate when analyzed in isolation — catching ~34% more ring fraud than
 traditional ML methods.
 </p>
 </div>
 </div>
 </Card>
 </div>
 );
}

// ── TAB 4: AI-Powered Research ────────────────────────────────────────────────

const AI_TOOLS = [
 {
 name: "Kensho (S&P)",
 category: "Quantitative events",
 capabilities: ["Event-driven analysis", "NLP earnings", "Macro linkage", "API access"],
 users: "Institutional",
 },
 {
 name: "AlphaSense",
 category: "Document intelligence",
 capabilities: ["10-K/Q search", "Earnings call NLP", "Broker research", "Sentiment trends"],
 users: "Buy & sell side",
 },
 {
 name: "Bloomberg AI",
 category: "News + data",
 capabilities: ["Real-time NLP", "Entity extraction", "BICS classification", "GPT integration"],
 users: "Terminal subscribers",
 },
 {
 name: "FactSet Cognitive",
 category: "Research workflow",
 capabilities: ["Auto-summaries", "Comp table gen", "Q&A over filings", "ESG extraction"],
 users: "Analysts / PMs",
 },
 {
 name: "ChatGPT / Claude",
 category: "General LLM",
 capabilities: ["Ad-hoc analysis", "Code generation", "Summarization", "Ideation"],
 users: "Retail & institutional",
 },
];

const NLP_PIPELINE = [
 { step: "Ingest", detail: "Earnings call transcript, 10-K, 8-K filing" },
 { step: "Tokenize", detail: "Split into sentences, normalize financial entities" },
 { step: "Embed", detail: "FinBERT / domain-tuned transformer to 768-dim vectors" },
 { step: "Classify", detail: "Tone: bullish / neutral / bearish per segment" },
 { step: "Aggregate", detail: "Weighted sentiment score + key phrase extraction" },
 { step: "Signal", detail: "Compare to prior quarter → momentum or reversal" },
];

const LLM_RISKS = [
 { risk: "Hallucination", detail: "Fabricates citations, financial figures, or events", severity: "critical" },
 { risk: "Stale knowledge", detail: "Training cutoff may predate recent market events", severity: "high" },
 { risk: "No fiduciary duty", detail: "LLMs are not licensed advisors; output is not advice", severity: "high" },
 { risk: "Prompt injection", detail: "Malicious input in docs could hijack analysis", severity: "medium" },
 { risk: "Overconfidence", detail: "Fluent text masks uncertainty in underlying data", severity: "medium" },
];

function AIResearchTab() {
 const [activeCapTable, setActiveCapTable] = useState(0);

 const capCols = [
 "Earnings NLP",
 "10-K/Q search",
 "Real-time news",
 "Quantitative",
 "Custom models",
 "API access",
 ];

 const capMatrix: Record<string, boolean[]> = {
 "Kensho (S&P)": [true, false, true, true, true, true],
 "AlphaSense": [true, true, false, false, false, false],
 "Bloomberg AI": [true, false, true, true, false, true],
 "FactSet Cognitive": [true, true, false, false, false, false],
 "ChatGPT / Claude": [false, false, false, false, false, true],
 };

 return (
 <div className="space-y-4">
 {/* NLP pipeline */}
 <Card>
 <SectionTitle>NLP Earnings Call Analysis Pipeline</SectionTitle>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 {NLP_PIPELINE.map((item, i) => (
 <div key={item.step} className="bg-muted/40 rounded-lg p-3 relative">
 <div className="flex items-center gap-2 mb-1">
 <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
 {i + 1}
 </span>
 <span className="text-sm font-medium text-foreground">{item.step}</span>
 </div>
 <p className="text-xs text-muted-foreground">{item.detail}</p>
 </div>
 ))}
 </div>
 </Card>

 {/* Capability table */}
 <Card>
 <SectionTitle>AI Tool Capability Matrix</SectionTitle>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border">
 <th className="text-left text-muted-foreground text-xs font-medium pb-2 pr-3">Tool</th>
 {capCols.map((c) => (
 <th key={c} className="text-center text-muted-foreground text-xs font-medium pb-2 px-2 whitespace-nowrap">
 {c}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {AI_TOOLS.map((tool, i) => (
 <tr
 key={tool.name}
 onClick={() => setActiveCapTable(i)}
 className={cn(
 "border-b border-border cursor-pointer transition-colors hover:bg-muted/30",
 activeCapTable === i && "bg-muted/50"
 )}
 >
 <td className="py-2 pr-3">
 <div className="text-foreground font-medium text-xs">{tool.name}</div>
 <div className="text-muted-foreground text-xs">{tool.category}</div>
 </td>
 {(capMatrix[tool.name] ?? []).map((has, j) => (
 <td key={j} className="py-2 px-2 text-center">
 {has ? (
 <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
 ) : (
 <XCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" />
 )}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 {/* Selected tool detail */}
 <AnimatePresence mode="wait">
 <motion.div
 key={activeCapTable}
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -4 }}
 className="mt-3 p-3 bg-muted/40 rounded-lg"
 >
 <div className="text-xs font-medium text-muted-foreground mb-1">
 {AI_TOOLS[activeCapTable].name} — Key capabilities
 </div>
 <div className="flex flex-wrap gap-1.5">
 {AI_TOOLS[activeCapTable].capabilities.map((cap) => (
 <InfoBadge key={cap} color="blue">{cap}</InfoBadge>
 ))}
 <InfoBadge color="violet">{AI_TOOLS[activeCapTable].users}</InfoBadge>
 </div>
 </motion.div>
 </AnimatePresence>
 </Card>

 {/* SEC filing sentiment concept */}
 <Card>
 <SectionTitle>SEC Filing Sentiment Analysis</SectionTitle>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {[
 {
 filing: "10-K Risk Factors",
 signal: "Word count increase > 15% → potential hidden risk",
 direction: "Bearish",
 accuracy: "71%",
 },
 {
 filing: "8-K MD&A Tone",
 signal: "Negative tone shift before guidance cut often precedes selloff",
 direction: "Bearish",
 accuracy: "68%",
 },
 {
 filing: "Earnings Call Q&A",
 signal: "CEO hesitation / hedge words in Q&A → uncertainty signal",
 direction: "Mixed",
 accuracy: "63%",
 },
 ].map((item) => (
 <div key={item.filing} className="bg-muted/40 rounded-lg p-3">
 <div className="text-xs font-medium text-foreground mb-1">{item.filing}</div>
 <p className="text-xs text-muted-foreground mb-2">{item.signal}</p>
 <div className="flex items-center justify-between">
 <InfoBadge color={item.direction === "Bearish" ? "rose" : "amber"}>
 {item.direction}
 </InfoBadge>
 <span className="text-xs text-muted-foreground">Accuracy: <span className="text-muted-foreground">{item.accuracy}</span></span>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* LLM risks */}
 <Card className="border-amber-500/20">
 <SectionTitle>LLM Risks in Finance</SectionTitle>
 <div className="space-y-2">
 {LLM_RISKS.map((item) => (
 <div key={item.risk} className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg">
 <AlertTriangle
 className={cn(
 "w-4 h-4 mt-0.5 flex-shrink-0",
 item.severity === "critical"
 ? "text-rose-400"
 : item.severity === "high"
 ? "text-amber-400"
 : "text-muted-foreground"
 )}
 />
 <div className="flex-1">
 <div className="text-sm font-medium text-foreground">{item.risk}</div>
 <div className="text-xs text-muted-foreground">{item.detail}</div>
 </div>
 <InfoBadge
 color={
 item.severity === "critical"
 ? "rose"
 : item.severity === "high"
 ? "amber"
 : "blue"
 }
 >
 {item.severity}
 </InfoBadge>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}

// ── TAB 5: Risk & Regulation ──────────────────────────────────────────────────

const SR117_COMPONENTS = [
 {
 component: "Model Inventory",
 description: "Comprehensive catalog of all models used in risk decisions",
 status: "Required",
 },
 {
 component: "Validation",
 description: "Independent team must validate conceptual soundness, data quality, outcomes",
 status: "Required",
 },
 {
 component: "Ongoing Monitoring",
 description: "Track model performance, stability indices (PSI, CSI), backtests",
 status: "Required",
 },
 {
 component: "Documentation",
 description: "Full methodology docs, assumptions, limitations, test results",
 status: "Required",
 },
 {
 component: "Governance",
 description: "Board-level accountability, model risk appetite statement",
 status: "Required",
 },
 {
 component: "Explainability",
 description: "Black-box models need post-hoc explainability for regulatory review",
 status: "Guidance",
 },
];

const SANDBOXES = [
 { regulator: "FCA (UK)", program: "Regulatory Sandbox", focus: "FinTech, AI trading, open banking" },
 { regulator: "MAS (Singapore)", program: "FinTech Regulatory Sandbox", focus: "AI credit, digital assets" },
 { regulator: "OCC (US)", program: "Innovation Pilot Program", focus: "National bank AI use cases" },
 { regulator: "ECB (EU)", program: "DORA + AI Act pilot", focus: "Operational resilience, AI risk" },
 { regulator: "HKMA (HK)", program: "Fintech Supervisory Sandbox", focus: "WealthTech, robo-advisors" },
];

const EXPLAINABILITY_REQS = [
 { regulation: "ECOA / Reg B (US)", requirement: "Adverse action notice with specific reasons for credit denial", scope: "Credit" },
 { regulation: "GDPR / AI Act (EU)", requirement: "Right to explanation for automated decisions; no solely automated high-risk decisions", scope: "All" },
 { regulation: "SR 11-7 (Fed)", requirement: "Independent model validation; conceptual soundness documentation", scope: "Banks" },
 { regulation: "SEC AI disclosure", requirement: "Investment advisers must disclose AI use and associated conflicts", scope: "Investment" },
 { regulation: "FINRA (US)", requirement: "Algo trading supervision and testing requirements", scope: "Trading" },
];

// Risk framework SVG heatmap data
const RISK_MATRIX = [
 { label: "Model error", likelihood: 3, impact: 4 },
 { label: "Data drift", likelihood: 4, impact: 3 },
 { label: "Adversarial attack", likelihood: 2, impact: 5 },
 { label: "Hallucination", likelihood: 4, impact: 4 },
 { label: "Regulatory non-compliance", likelihood: 2, impact: 5 },
 { label: "Overfitting", likelihood: 3, impact: 3 },
 { label: "Vendor dependency", likelihood: 3, impact: 2 },
 { label: "Bias/Fairness", likelihood: 4, impact: 4 },
];

function RiskRegulationTab() {
 const cellW = 52;
 const cellH = 40;
 const padL = 50;
 const padT = 20;

 const colorForCell = (l: number, i: number) => {
 const score = l * i;
 if (score >= 15) return "#ef4444";
 if (score >= 9) return "#f59e0b";
 if (score >= 4) return "#3b82f6";
 return "#22c55e";
 };

 return (
 <div className="space-y-4">
 {/* SR 11-7 */}
 <Card>
 <SectionTitle>SR 11-7 Model Risk Management Framework</SectionTitle>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {SR117_COMPONENTS.map((item) => (
 <div key={item.component} className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
 <div className="flex-shrink-0">
 {item.status === "Required" ? (
 <CheckCircle className="w-4 h-4 text-emerald-400" />
 ) : (
 <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
 )}
 </div>
 <div>
 <div className="text-sm font-medium text-foreground">{item.component}</div>
 <div className="text-xs text-muted-foreground">{item.description}</div>
 </div>
 <InfoBadge color={item.status === "Required" ? "emerald" : "blue"}>
 {item.status}
 </InfoBadge>
 </div>
 ))}
 </div>
 </Card>

 {/* Risk matrix */}
 <Card>
 <SectionTitle>AI Risk Matrix (Likelihood × Impact)</SectionTitle>
 <div className="overflow-x-auto">
 <svg viewBox={`0 0 ${padL + 5 * cellW + 20} ${padT + 5 * cellH + 40}`} className="w-full max-w-lg">
 {/* Grid cells */}
 {[1, 2, 3, 4, 5].map((impact) =>
 [1, 2, 3, 4, 5].map((likelihood) => {
 const x = padL + (likelihood - 1) * cellW;
 const y = padT + (5 - impact) * cellH;
 return (
 <rect
 key={`${likelihood}-${impact}`}
 x={x}
 y={y}
 width={cellW - 2}
 height={cellH - 2}
 rx="3"
 fill={colorForCell(likelihood, impact)}
 opacity="0.15"
 stroke={colorForCell(likelihood, impact)}
 strokeWidth="0.5"
 strokeOpacity="0.3"
 />
 );
 })
 )}
 {/* Risk items */}
 {RISK_MATRIX.map((item) => {
 const x = padL + (item.likelihood - 1) * cellW + cellW / 2 - 2;
 const y = padT + (5 - item.impact) * cellH + cellH / 2;
 return (
 <g key={item.label}>
 <circle
 cx={x}
 cy={y}
 r="5"
 fill={colorForCell(item.likelihood, item.impact)}
 opacity="0.8"
 />
 <text x={x + 8} y={y + 1} fill="#a1a1aa" fontSize="7" dominantBaseline="middle">
 {item.label}
 </text>
 </g>
 );
 })}
 {/* Axis labels */}
 <text x={padL + 5 * cellW / 2} y={padT + 5 * cellH + 16} fill="#71717a" fontSize="9" textAnchor="middle">
 Likelihood →
 </text>
 <text
 x={12}
 y={padT + 5 * cellH / 2}
 fill="#71717a"
 fontSize="9"
 textAnchor="middle"
 transform={`rotate(-90,12,${padT + 5 * cellH / 2})`}
 >
 Impact →
 </text>
 {[1, 2, 3, 4, 5].map((v) => (
 <text
 key={v}
 x={padL + (v - 1) * cellW + cellW / 2 - 2}
 y={padT + 5 * cellH + 8}
 fill="#52525b"
 fontSize="7"
 textAnchor="middle"
 >
 {v}
 </text>
 ))}
 {[1, 2, 3, 4, 5].map((v) => (
 <text
 key={v}
 x={padL - 6}
 y={padT + (5 - v) * cellH + cellH / 2}
 fill="#52525b"
 fontSize="7"
 textAnchor="end"
 dominantBaseline="middle"
 >
 {v}
 </text>
 ))}
 </svg>
 <div className="flex gap-4 text-xs text-muted-foreground mt-1">
 {[
 { color: "bg-rose-500", label: "Critical (≥15)" },
 { color: "bg-amber-500", label: "High (9–14)" },
 { color: "bg-primary", label: "Medium (4–8)" },
 { color: "bg-emerald-500", label: "Low (<4)" },
 ].map((item) => (
 <span key={item.label} className="flex items-center gap-1.5 text-muted-foreground">
 <span className={cn("w-3 h-3 rounded-sm inline-block opacity-80", item.color)} />
 {item.label}
 </span>
 ))}
 </div>
 </div>
 </Card>

 {/* Explainability requirements */}
 <Card>
 <SectionTitle>Global Explainability Requirements</SectionTitle>
 <div className="space-y-2">
 {EXPLAINABILITY_REQS.map((item) => (
 <div key={item.regulation} className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg">
 <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-sm font-medium text-foreground">{item.regulation}</span>
 <InfoBadge color="violet">{item.scope}</InfoBadge>
 </div>
 <div className="text-xs text-muted-foreground">{item.requirement}</div>
 </div>
 </div>
 ))}
 </div>
 </Card>

 {/* Regulatory sandboxes */}
 <Card>
 <SectionTitle>Global Regulatory Sandboxes</SectionTitle>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {SANDBOXES.map((s) => (
 <div key={s.regulator} className="bg-muted/40 rounded-lg p-3">
 <div className="flex items-center justify-between mb-1">
 <span className="text-sm font-medium text-foreground">{s.regulator}</span>
 <InfoBadge color="blue">{s.program.split(" ")[0]}</InfoBadge>
 </div>
 <div className="text-xs text-muted-foreground mb-0.5 font-medium">{s.program}</div>
 <div className="text-xs text-muted-foreground">{s.focus}</div>
 </div>
 ))}
 </div>
 </Card>

 {/* AI hallucination callout */}
 <Card className="border-rose-500/20 bg-rose-500/5">
 <div className="flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
 <div>
 <div className="text-sm font-medium text-rose-300 mb-1">AI Hallucinations in Finance — Key Risks</div>
 <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
 <li>Fabricated financial data or analyst reports used in investment memos</li>
 <li>Incorrect regulatory citations in compliance filings</li>
 <li>Wrong earnings figures injected into automated research workflows</li>
 <li>Misstated contract terms in legal review pipelines</li>
 <li>Mitigation: Retrieval-augmented generation (RAG) + human review gates</li>
 </ul>
 </div>
 </div>
 </Card>
 </div>
 );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
 { id: "ml-trading", label: "ML in Trading", Icon: TrendingUp },
 { id: "credit", label: "Credit Scoring", Icon: BarChart3 },
 { id: "fraud", label: "Fraud Detection", Icon: Shield },
 { id: "research", label: "AI Research", Icon: Search },
 { id: "risk", label: "Risk & Regulation", Icon: Lock },
];

export default function AIFinancePage() {
 // Consume a few rand() values to advance PRNG state for determinism
 void rand(); void rand(); void rand();

 return (
 <div className="min-h-screen bg-background text-foreground p-4 md:p-4">
 {/* Page header */}
 <div className="mb-6">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-9 h-9 rounded-md bg-primary/15 border border-border flex items-center justify-center">
 <Brain className="w-3.5 h-3.5 text-muted-foreground/50" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-foreground tracking-tight">AI & ML in Finance</h1>
 <p className="text-sm text-muted-foreground">
 Machine learning, natural language processing, and AI governance across capital markets
 </p>
 </div>
 </div>

 {/* Quick concept pills */}
 <div className="flex flex-wrap gap-2 mt-3">
 {[
 { icon: TrendingUp, label: "Return prediction", color: "text-primary" },
 { icon: Shield, label: "Fraud detection", color: "text-emerald-400" },
 { icon: FileText, label: "NLP filings", color: "text-primary" },
 { icon: Eye, label: "Explainability", color: "text-amber-400" },
 { icon: Lock, label: "SR 11-7 compliance", color: "text-rose-400" },
 ].map(({ icon: Icon, label, color }) => (
 <div
 key={label}
 className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-border rounded-full text-xs text-muted-foreground"
 >
 <Icon className={cn("w-3 h-3", color)} />
 {label}
 </div>
 ))}
 </div>
 </div>

 {/* Tabs */}
 <Tabs defaultValue="ml-trading" className="w-full">
 <TabsList className="bg-card border border-border h-auto flex-wrap gap-1 p-1 mb-6">
 {TABS.map(({ id, label, Icon }) => (
 <TabsTrigger
 key={id}
 value={id}
 className="flex items-center gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
 >
 <Icon className="w-3.5 h-3.5" />
 {label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="ml-trading" className="data-[state=inactive]:hidden mt-0">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <MLTradingTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="credit" className="data-[state=inactive]:hidden mt-0">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <CreditScoringTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="fraud" className="data-[state=inactive]:hidden mt-0">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <FraudDetectionTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="research" className="data-[state=inactive]:hidden mt-0">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <AIResearchTab />
 </motion.div>
 </TabsContent>

 <TabsContent value="risk" className="data-[state=inactive]:hidden mt-0">
 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
 <RiskRegulationTab />
 </motion.div>
 </TabsContent>
 </Tabs>
 </div>
 );
}
