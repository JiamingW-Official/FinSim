"use client";

import { useSessionTracker } from "@/hooks/useAnalytics";

/**
 * Invisible sentinel component that tracks session starts.
 * Mount once in the dashboard layout.
 */
export function SessionTracker() {
  useSessionTracker();
  return null;
}
