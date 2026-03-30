"use client";

import { useState, useCallback } from "react";

/**
 * useLocalStorage — a hook that persists state in localStorage.
 *
 * - SSR-safe: reads localStorage only on the client (typeof window check).
 * - Graceful JSON parse error handling: falls back to initialValue on failure.
 * - Returns [storedValue, setValue] with the same signature as useState.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Skip localStorage access during SSR
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // Catches JSON.parse errors or security errors (e.g. private browsing on some browsers)
      console.warn(`useLocalStorage: failed to read key "${key}"`, );
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Support functional updates (same as setState)
        const valueToStore =
          typeof value === "function"
            ? (value as (prev: T) => T)(storedValue)
            : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // Catches QuotaExceededError or circular-reference JSON errors
        console.warn(`useLocalStorage: failed to write key "${key}"`);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}
