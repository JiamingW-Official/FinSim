"use client";

import { useEffect, useRef, useState } from "react";

type FlashDirection = "up" | "down" | null;

export function usePriceFlash(price: number | undefined) {
  const prevPrice = useRef(price);
  const [flash, setFlash] = useState<FlashDirection>(null);

  useEffect(() => {
    if (price == null || prevPrice.current == null) {
      prevPrice.current = price;
      return;
    }

    if (price > prevPrice.current) {
      setFlash("up");
    } else if (price < prevPrice.current) {
      setFlash("down");
    }

    prevPrice.current = price;

    const timer = setTimeout(() => setFlash(null), 400);
    return () => clearTimeout(timer);
  }, [price]);

  return flash;
}

export function useAnimatedNumber(
  target: number,
  duration: number = 300,
): number {
  const [display, setDisplay] = useState(target);
  const animRef = useRef<number | null>(null);
  const startRef = useRef(target);
  const startTime = useRef(0);

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);

    startRef.current = display;
    startTime.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startRef.current + (target - startRef.current) * eased);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}
