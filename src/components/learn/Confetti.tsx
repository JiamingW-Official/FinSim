"use client";

import { useEffect, useState } from "react";

const COLORS = ["#10b981", "#f59e0b", "#06b6d4", "#f43f5e", "#8b5cf6"];
const PARTICLE_COUNT = 30;

interface ConfettiProps {
 show: boolean;
}

export function Confetti({ show }: ConfettiProps) {
 const [particles, setParticles] = useState<Array<{
 id: number;
 left: number;
 delay: number;
 color: string;
 size: number;
 duration: number;
 }>>([]);

 useEffect(() => {
 if (!show) return;
 const ps = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
 id: i,
 left: Math.random() * 100,
 delay: Math.random() * 1.5,
 color: COLORS[Math.floor(Math.random() * COLORS.length)],
 size: 4 + Math.random() * 6,
 duration: 2 + Math.random() * 1.5,
 }));
 setParticles(ps);
 }, [show]);

 if (!show || particles.length === 0) return null;

 return (
 <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
 {particles.map((p) => (
 <div
 key={p.id}
 className="confetti-particle absolute"
 style={{
 left: `${p.left}%`,
 width: p.size,
 height: p.size * 0.6,
 backgroundColor: p.color,
 borderRadius: 1,
 animationDelay: `${p.delay}s`,
 animationDuration: `${p.duration}s`,
 }}
 />
 ))}
 </div>
 );
}
