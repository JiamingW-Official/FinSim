"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTradingStore } from "@/stores/trading-store";

export function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const tradeHistory = useTradingStore((s) => s.tradeHistory);

  useEffect(() => {
    const d = localStorage.getItem("finsim_welcome_dismissed");
    if (d) setDismissed(true);
  }, []);

  if (dismissed || tradeHistory.length > 0) return null;

  return (
    <div
      className="rounded-lg border p-4 flex items-start justify-between gap-4"
      style={{ borderColor: "#2d9cdb40", backgroundColor: "#2d9cdb08" }}
    >
      <div className="space-y-1">
        <div className="text-sm font-semibold">Start your first trade</div>
        <div className="text-xs text-muted-foreground">
          You have $10,000 in simulated capital. No real money at risk. Learn by doing.
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href="/trade"
            className="px-3 py-1.5 rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: "#2d9cdb" }}
          >
            Open Trading Desk
          </Link>
          <Link
            href="/learn"
            className="px-3 py-1.5 rounded-md text-xs font-medium border text-foreground"
          >
            Start Learning
          </Link>
        </div>
      </div>
      <button
        onClick={() => {
          setDismissed(true);
          localStorage.setItem("finsim_welcome_dismissed", "1");
        }}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ×
      </button>
    </div>
  );
}
