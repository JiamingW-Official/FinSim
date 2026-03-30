"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "alpha-deck-onboarding";

export function useOnboarding() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setDismissed(new Set(JSON.parse(raw)));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const dismiss = useCallback((hintId: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(hintId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const shouldShow = useCallback(
    (hintId: string) => loaded && !dismissed.has(hintId),
    [dismissed, loaded],
  );

  return { shouldShow, dismiss };
}
