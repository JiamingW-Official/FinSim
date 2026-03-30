"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface StepTransitionProps {
 stepKey: string;
 children: ReactNode;
}

export function StepTransition({ stepKey, children }: StepTransitionProps) {
 return (
 <AnimatePresence mode="wait">
 <motion.div
 key={stepKey}
 initial={{ opacity: 0, x: 40, scale: 0.97 }}
 animate={{ opacity: 1, x: 0, scale: 1 }}
 exit={{ opacity: 0, x: -40, scale: 0.97 }}
 transition={{ type: "spring", stiffness: 300, damping: 28 }}
 className="w-full"
 >
 {children}
 </motion.div>
 </AnimatePresence>
 );
}
