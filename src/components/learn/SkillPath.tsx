"use client";

import { useLearnStore } from "@/stores/learn-store";
import { UNITS } from "@/data/lessons";
import { UnitNode } from "./UnitNode";

export function SkillPath() {
 const completedLessons = useLearnStore((s) => s.completedLessons);
 const lessonScores = useLearnStore((s) => s.lessonScores);

 return (
 <div className="relative flex flex-col gap-6 pb-12">
 {/* Subtle dot-grid background */}
 <div className="pointer-events-none absolute inset-0 opacity-[0.04] dot-grid-bg" />

 {UNITS.map((unit, i) => {
 const isUnlocked =
 i === 0 ||
 UNITS[i - 1].lessons.every((l) => completedLessons.includes(l.id));

 const prevColor = i > 0 ? UNITS[i - 1].color : unit.color;

 return (
 <div key={unit.id} className="relative">
 {/* SVG bezier connector between units */}
 {i > 0 && (
 <div className="flex justify-center -mt-3 mb-3">
 <svg
 width="40"
 height="28"
 viewBox="0 0 40 28"
 className="overflow-visible"
 >
 <defs>
 <linearGradient
 id={`conn-${i}`}
 x1="0"
 y1="0"
 x2="0"
 y2="1"
 >
 <stop offset="0%" stopColor={prevColor} stopOpacity="0.4" />
 <stop offset="100%" stopColor={unit.color} stopOpacity="0.4" />
 </linearGradient>
 </defs>
 <path
 d={
 i % 2 === 1
 ? "M20,0 C20,10 30,18 20,28"
 : "M20,0 C20,10 10,18 20,28"
 }
 fill="none"
 stroke={`url(#conn-${i})`}
 strokeWidth="2"
 strokeDasharray="4 3"
 strokeLinecap="round"
 />
 </svg>
 </div>
 )}
 <UnitNode
 unit={unit}
 unitIndex={i}
 completedLessons={completedLessons}
 lessonScores={lessonScores}
 isUnitUnlocked={isUnlocked}
 delay={i * 0.15}
 />
 </div>
 );
 })}
 </div>
 );
}
