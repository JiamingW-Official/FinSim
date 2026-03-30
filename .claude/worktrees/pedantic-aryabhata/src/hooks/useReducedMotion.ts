"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when the user's OS has "Reduce motion" enabled.
 * Use this to disable or shorten Framer Motion animations for
 * users who are sensitive to motion.
 *
 * WCAG 2.1 SC 2.3.3 (AAA) — Animation from Interactions.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes (e.g. user changes OS setting while app is open)
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
