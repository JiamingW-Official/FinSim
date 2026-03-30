"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "@/stores/trading-store";

const COLORS = [
 "#10b981", "#f59e0b", "#06b6d4", "#f43f5e", "#8b5cf6", "#fbbf24",
 "#34d399", "#fb923c", "#60a5fa", "#f472b6",
];
const GOLD_COLORS = ["#fbbf24", "#f59e0b", "#fcd34d", "#fde68a", "#10b981"];

interface Particle {
 id: number;
 x: number;
 y: number;
 color: string;
 angle: number;
 distance: number;
 isRect: boolean;
 size: number;
 duration: number;
}

function generateParticles(count: number, isLarge: boolean): Particle[] {
 const colors = isLarge ? [...COLORS, ...GOLD_COLORS] : COLORS;
 return Array.from({ length: count }, (_, i) => {
 // Mainly upward: angles 30°–150° (with some spread to sides)
 const angleRad = ((30 + Math.random() * 120) * Math.PI) / 180;
 return {
 id: i,
 x: 40 + Math.random() * 20, // center horizontally (40–60%)
 y: 60 + Math.random() * 15, // start near bottom
 color: colors[Math.floor(Math.random() * colors.length)],
 angle: angleRad,
 distance: 80 + Math.random() * 140,
 isRect: i % 2 === 0,
 size: 5 + Math.random() * 7,
 duration: 1.0 + Math.random() * 0.6,
 };
 });
}

export function TradeConfetti() {
 const tradeHistory = useTradingStore((s) => s.tradeHistory);
 const prevLengthRef = useRef(tradeHistory.length);
 const [particles, setParticles] = useState<Particle[]>([]);
 const [active, setActive] = useState(false);

 useEffect(() => {
 const newLen = tradeHistory.length;
 if (newLen <= prevLengthRef.current) {
 prevLengthRef.current = newLen;
 return;
 }
 prevLengthRef.current = newLen;

 const latest = tradeHistory[0];
 if (!latest || latest.side !== "sell" || (latest.realizedPnL ?? 0) <= 0) return;

 const isLarge = (latest.realizedPnL ?? 0) >= 500;
 const count = isLarge ? 80 : 40;
 setParticles(generateParticles(count, isLarge));
 setActive(true);

 // Clean up after animation
 const timer = setTimeout(() => {
 setActive(false);
 setParticles([]);
 }, 2000);
 return () => clearTimeout(timer);
 }, [tradeHistory]);

 return (
 <AnimatePresence>
 {active && (
 <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
 {particles.map((p) => {
 const tx = Math.cos(p.angle) * p.distance;
 const ty = -Math.sin(p.angle) * p.distance;
 return (
 <motion.div
 key={p.id}
 initial={{ opacity: 1, x: 0, y: 0, scale: 0.3, rotate: 0 }}
 animate={{
 opacity: 0,
 x: tx,
 y: ty,
 scale: [0.3, 1.0],
 rotate: Math.random() > 0.5 ? 360 : -360,
 }}
 transition={{ duration: p.duration, ease: "easeOut" }}
 style={{
 position: "absolute",
 left: `${p.x}%`,
 top: `${p.y}%`,
 width: p.isRect ? p.size : p.size * 0.9,
 height: p.isRect ? p.size * 0.5 : p.size * 0.9,
 backgroundColor: p.color,
 borderRadius: p.isRect ? 1 : "50%",
 }}
 />
 );
 })}
 </div>
 )}
 </AnimatePresence>
 );
}
