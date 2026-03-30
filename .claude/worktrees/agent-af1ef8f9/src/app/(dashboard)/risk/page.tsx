"use client";
import { RiskDashboard } from "@/components/trading/RiskDashboard";

export default function RiskPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Risk Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Portfolio risk metrics, VaR, drawdown analysis, and position sizing guidance.</p>
      </div>
      <RiskDashboard />
    </div>
  );
}
