import type { Metadata } from "next";
import { TradePageClient } from "./TradePageClient";

export const metadata: Metadata = {
  title: "Paper Trade Options",
  description:
    "Practice trading stocks and options with $100K in virtual capital. Real-time candlestick charts, 15 technical indicators, and AI coaching. Risk-free paper trading simulator.",
};

export default function TradePage() {
  return <TradePageClient />;
}
