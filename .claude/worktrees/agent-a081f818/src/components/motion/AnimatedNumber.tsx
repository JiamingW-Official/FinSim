"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring, motion, type SpringOptions } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  springConfig?: SpringOptions;
}

export function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  className,
  springConfig,
}: AnimatedNumberProps) {
  const spring = useSpring(0, springConfig ?? { stiffness: 200, damping: 30, mass: 0.5 });
  const [display, setDisplay] = useState(format(value));
  const prevValue = useRef(value);

  useEffect(() => {
    spring.set(value);
    prevValue.current = value;
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(format(latest));
    });
    return unsubscribe;
  }, [spring, format]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}
