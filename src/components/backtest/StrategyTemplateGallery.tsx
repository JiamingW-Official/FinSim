"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Zap,
  Target,
  Waves,
  Expand,
  RotateCcw,
  Shield,
  ChevronRight,
  X,
  BookOpen,
  Clock,
  Crosshair,
  AlertTriangle,
  Lightbulb,
  History,
  Star,
} from "lucide-react";
import type { StrategyTemplate, StrategyConfig, BarGenPreset } from "@/types/backtest";
import { STRATEGY_TEMPLATES, CATEGORY_INFO } from "@/services/backtest/strategy-templates";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp, Activity, Zap, Target, Waves, Expand, RotateCcw, Shield,
};

const DIFFICULTY_LABELS = ["", "Beginner", "Intermediate", "Advanced", "Expert", "Master"];
const DIFFICULTY_COLORS = ["", "text-emerald-400", "text-primary", "text-amber-400", "text-orange-400", "text-rose-400"];

interface StrategyTemplateGalleryProps {
  onSelect: (config: Omit<StrategyConfig, "id" | "name" | "ticker">, preset: BarGenPreset, bars: number) => void;
  onClose: () => void;
}

export default function StrategyTemplateGallery({ onSelect, onClose }: StrategyTemplateGalleryProps) {
  const [selected, setSelected] = useState<StrategyTemplate | null>(null);

  const handleUseStrategy = (template: StrategyTemplate) => {
    onSelect(template.defaultConfig, template.recommendedPreset, template.recommendedBars);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Strategy Templates</h2>
            <p className="text-xs text-zinc-500">Select a proven strategy to learn about and test</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(85vh-64px)] overflow-hidden">
          {/* Left: Card Grid */}
          <div className="w-[400px] space-y-2 overflow-y-auto border-r border-white/5 p-4">
            {STRATEGY_TEMPLATES.map((template) => {
              const Icon = ICON_MAP[template.icon] ?? TrendingUp;
              const catInfo = CATEGORY_INFO[template.category];
              const isSelected = selected?.id === template.id;

              return (
                <motion.button
                  key={template.id}
                  onClick={() => setSelected(template)}
                  whileHover={{ x: 2 }}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${catInfo?.bgColor ?? "bg-white/10"}`}>
                    <Icon className={`h-5 w-5 ${catInfo?.color ?? "text-zinc-400"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200">{template.name}</span>
                      <ChevronRight className={`h-3 w-3 text-zinc-600 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                    <div className="text-[11px] text-zinc-500">{template.subtitle}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${catInfo?.color ?? ""} border-current/20`}>
                        {catInfo?.label ?? template.category}
                      </span>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-2.5 w-2.5 ${i < template.difficulty ? DIFFICULTY_COLORS[template.difficulty] : "text-zinc-700"}`}
                            fill={i < template.difficulty ? "currentColor" : "none"}
                          />
                        ))}
                      </span>
                      <span className={`text-[11px] ${DIFFICULTY_COLORS[template.difficulty]}`}>
                        {DIFFICULTY_LABELS[template.difficulty]}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Strategy Detail */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  {/* Theory */}
                  <Section icon={<BookOpen className="h-4 w-4 text-primary" />} title="Theory & Background">
                    <div className="space-y-2 text-[13px] leading-relaxed text-zinc-400">
                      {selected.theory.split("\n\n").map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </Section>

                  {/* Signals */}
                  <Section icon={<Crosshair className="h-4 w-4 text-emerald-400" />} title="Trading Signals">
                    <div className="space-y-2">
                      {selected.signals.map((signal, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[11px] font-bold uppercase ${
                            signal.type === "entry"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}>
                            {signal.type}
                          </span>
                          <div>
                            <div className="text-xs font-medium text-zinc-200">{signal.label}</div>
                            <div className="text-[11px] text-zinc-500">{signal.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-4">
                    <Section icon={<Lightbulb className="h-4 w-4 text-amber-400" />} title="Strengths">
                      <ul className="space-y-1">
                        {selected.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </Section>
                    <Section icon={<AlertTriangle className="h-4 w-4 text-rose-400" />} title="Weaknesses">
                      <ul className="space-y-1">
                        {selected.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </Section>
                  </div>

                  {/* Key Parameters */}
                  <Section icon={<Clock className="h-4 w-4 text-muted-foreground" />} title="Key Parameters">
                    <div className="grid grid-cols-2 gap-2">
                      {selected.keyParameters.map((param, i) => (
                        <div key={i} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-zinc-300">{param.name}</span>
                            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs font-mono font-semibold text-primary">
                              {param.default}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-zinc-600">{param.description}</div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* History */}
                  <Section icon={<History className="h-4 w-4 text-primary" />} title="Historical Context">
                    <p className="text-[12px] leading-relaxed text-zinc-500 italic">{selected.history}</p>
                  </Section>

                  {/* Use Strategy Button */}
                  <button
                    onClick={() => handleUseStrategy(selected)}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary"
                  >
                    Use This Strategy
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full flex-col items-center justify-center gap-3 text-zinc-600"
                >
                  <BookOpen className="h-12 w-12 opacity-30" />
                  <span className="text-sm">Select a strategy to learn about it</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-bold text-zinc-400">{title}</h3>
      </div>
      {children}
    </div>
  );
}
