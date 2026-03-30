"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();

 return (
 <AnimatePresence initial={false}>
 <motion.div
 key={pathname}
 initial={{ opacity: 0, y: 4 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.18, ease: "easeOut" }}
 className="absolute inset-0 h-full w-full overflow-hidden"
 >
 {children}
 </motion.div>
 </AnimatePresence>
 );
}
