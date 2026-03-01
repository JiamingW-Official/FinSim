import { useMemo } from "react";
import type { OptionChainExpiry } from "@/types/options";
import {
  computeChainAnalytics,
  computeVolSmile,
  computeVolTermStructure,
  computeOIVolByStrike,
  generateUnusualActivity,
} from "@/services/options/analytics";

export function useOptionsAnalytics(
  chain: OptionChainExpiry[],
  spotPrice: number,
  hv: number,
  selectedExpiry: string,
) {
  const analytics = useMemo(
    () => computeChainAnalytics(chain, spotPrice, hv),
    [chain, spotPrice, hv],
  );

  const smile = useMemo(() => {
    const exp = chain.find((c) => c.expiry === selectedExpiry) ?? chain[0];
    return exp ? computeVolSmile(exp, spotPrice) : [];
  }, [chain, selectedExpiry, spotPrice]);

  const termStructure = useMemo(
    () => computeVolTermStructure(chain),
    [chain],
  );

  const oiVol = useMemo(() => {
    const exp = chain.find((c) => c.expiry === selectedExpiry) ?? chain[0];
    return exp ? computeOIVolByStrike(exp) : [];
  }, [chain, selectedExpiry]);

  // Seed: combine ticker chars from first contract + chain length for consistency
  const seed = useMemo(() => {
    if (chain.length === 0 || chain[0].calls.length === 0) return 42;
    const ticker = chain[0].calls[0].ticker;
    return ticker.split("").reduce((s, c) => s + c.charCodeAt(0), 0) * 7 + chain.length;
  }, [chain]);

  const unusualActivity = useMemo(
    () => generateUnusualActivity(chain, spotPrice, seed),
    [chain, spotPrice, seed],
  );

  return { analytics, smile, termStructure, oiVol, unusualActivity };
}
