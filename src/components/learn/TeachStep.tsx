"use client";

import { motion } from "framer-motion";
import type { TeachStep as TeachStepType } from "@/data/lessons/types";
import { CandlestickDiagram } from "./visuals/CandlestickDiagram";
import { OrderFlowDiagram } from "./visuals/OrderFlowDiagram";
import { IndicatorDiagram } from "./visuals/IndicatorDiagram";
import { RiskPyramid } from "./visuals/RiskPyramid";
import { PortfolioPie } from "./visuals/PortfolioPie";

const VISUAL_MAP = {
 candlestick: CandlestickDiagram,
 "order-flow": OrderFlowDiagram,
 "indicator-chart": IndicatorDiagram,
 "risk-pyramid": RiskPyramid,
 "portfolio-pie": PortfolioPie,
} as const;

// Render **bold** inline markers
function formatInline(text: string): React.ReactNode[] {
 const parts = text.split(/(\*\*[^*]+\*\*)/g);
 return parts.map((part, i) => {
 if (part.startsWith("**") && part.endsWith("**")) {
 return (
 <strong key={i} className="text-foreground font-semibold">
 {part.slice(2, -2)}
 </strong>
 );
 }
 return <span key={i}>{part}</span>;
 });
}

// Parse content into typed blocks so bullets render as proper lists
interface Block {
 kind: "paragraph" | "bullets";
 text?: string;
 items?: string[];
}

function parseBlocks(content: string): Block[] {
 return content.split("\n\n").map((para) => {
 const lines = para.split("\n");
 const hasBullet = lines.some((l) => l.trimStart().startsWith("•"));
 if (hasBullet) {
 return {
 kind: "bullets",
 items: lines
 .filter((l) => l.trim().length > 0)
 .map((l) => l.replace(/^[\s•]+/, "")),
 };
 }
 return { kind: "paragraph", text: para };
 });
}

export function TeachStepComponent({ step, onContinue }: { step: TeachStepType; onContinue: () => void }) {
 const VisualComponent = step.visual ? VISUAL_MAP[step.visual] : null;
 const blocks = parseBlocks(step.content);

 return (
 <div className="flex flex-col gap-5">
 {/* Title */}
 <motion.h2
 className="font-serif text-2xl font-bold tracking-tight leading-tight text-foreground"
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.28 }}
 >
 {step.title}
 </motion.h2>

 {/* Visual diagram */}
 {VisualComponent && (
 <motion.div
 className="rounded-xl border border-border overflow-hidden"
 initial={{ opacity: 0, scale: 0.97 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.35, delay: 0.08 }}
 >
 <VisualComponent />
 </motion.div>
 )}

 {/* Content blocks — each staggered in */}
 <div className="space-y-2">
 {blocks.map((block, bi) => {
 const delay = 0.12 + bi * 0.08;

 if (block.kind === "bullets" && block.items) {
 return (
 <motion.div
 key={bi}
 className="rounded-xl border border-border/60 bg-muted/20 px-5 py-4"
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.25, delay }}
 >
 <ul className="space-y-2.5">
 {block.items.map((item, ii) => (
 <motion.li
 key={ii}
 className="flex items-start gap-3 text-sm leading-relaxed text-foreground/80"
 initial={{ opacity: 0, x: -4 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: delay + ii * 0.05 }}
 >
 <span className="mt-[6px] h-1 w-3 shrink-0 rounded-full bg-foreground/25" />
 <span>{formatInline(item)}</span>
 </motion.li>
 ))}
 </ul>
 </motion.div>
 );
 }

 return (
 <motion.div
 key={bi}
 className="rounded-xl border border-border/60 bg-muted/20 px-5 py-4"
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.25, delay }}
 >
 <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
 {formatInline(block.text ?? "")}
 </p>
 </motion.div>
 );
 })}
 </div>

 {/* Key terms */}
 {step.highlight && step.highlight.length > 0 && (
 <motion.div
 className="flex flex-wrap items-center gap-1.5 pt-0.5"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.4 }}
 >
 <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30 mr-1">
 Key terms
 </span>
 {step.highlight.map((term, i) => (
 <motion.span
 key={term}
 className="cursor-default rounded-full border border-border px-2.5 py-0.5 text-[11px] font-mono font-medium text-muted-foreground/60 transition-colors hover:border-foreground/20 hover:text-foreground/80"
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: 0.42 + i * 0.05, type: "spring", stiffness: 400, damping: 15 }}
 whileHover={{ scale: 1.05, y: -1 }}
 >
 {term}
 </motion.span>
 ))}
 </motion.div>
 )}

 {/* Continue */}
 <motion.button
 type="button"
 onClick={onContinue}
 className="mt-2 w-full rounded-full bg-foreground text-background py-3 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all hover:bg-foreground/90"
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ scale: 1.01 }}
 whileTap={{ scale: 0.97 }}
 transition={{ delay: 0.44 }}
 >
 Continue →
 </motion.button>
 </div>
 );
}
