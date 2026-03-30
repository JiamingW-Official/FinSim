import type { Metadata } from "next";
import { OptionsPageClient } from "./OptionsPageClient";

export const metadata: Metadata = {
  title: "Options Chain Simulator",
  description:
    "Professional options chain simulator with Black-Scholes pricing, Greeks (Delta, Gamma, Theta, Vega, Rho), volatility smile, and 12 strategy presets. Learn options trading risk-free.",
};

export default function OptionsPage() {
  return <OptionsPageClient />;
}
