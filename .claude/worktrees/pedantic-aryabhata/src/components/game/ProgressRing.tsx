"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
 progress: number; // 0 to 100
 size?: number;
 strokeWidth?: number;
 children?: React.ReactNode;
}

export function ProgressRing({
 progress,
 size = 32,
 strokeWidth = 3,
 children,
}: ProgressRingProps) {
 const radius = (size - strokeWidth) / 2;
 const circumference = 2 * Math.PI * radius;
 const offset = circumference - (progress / 100) * circumference;

 return (
 <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
 <svg width={size} height={size} className="-rotate-90">
 {/* Background circle */}
 <circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 fill="none"
 stroke="currentColor"
 strokeWidth={strokeWidth}
 className="text-muted/50"
 />
 {/* Progress circle */}
 <motion.circle
 cx={size / 2}
 cy={size / 2}
 r={radius}
 fill="none"
 stroke="url(#progressGradient)"
 strokeWidth={strokeWidth}
 strokeLinecap="round"
 strokeDasharray={circumference}
 initial={{ strokeDashoffset: circumference }}
 animate={{ strokeDashoffset: offset }}
 transition={{ duration: 0.6, ease: "easeOut" }}
 />
 <defs>
 <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
 <stop offset="0%" stopColor="#10b981" />
 <stop offset="100%" stopColor="#34d399" />
 </linearGradient>
 </defs>
 </svg>
 {/* Center content */}
 <div className="absolute inset-0 flex items-center justify-center">
 {children}
 </div>
 </div>
 );
}
