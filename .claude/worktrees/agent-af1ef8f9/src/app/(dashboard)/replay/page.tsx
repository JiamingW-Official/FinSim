"use client";

import { useMemo, useState } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { TradeReplay } from "@/components/trading/TradeReplay";
import { buildReplayFromTrade } from "@/services/trading/replay-engine";

export default function ReplayPage() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const [dismissed, setDismissed] = useState(false);

  const lastSell = useMemo(
    () => tradeHistory.find((t) => t.side === "sell" && t.realizedPnL !== undefined),
    [tradeHistory],
  );

  const replayData = useMemo(() => {
    if (!lastSell) return null;
    return buildReplayFromTrade(lastSell, tradeHistory);
  }, [lastSell, tradeHistory]);

  if (!lastSell || !replayData) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Trade Replay</h1>
        <p className="text-sm text-muted-foreground mt-4">
          Complete a trade to replay it here.
        </p>
      </div>
    );
  }

  if (dismissed) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Trade Replay</h1>
        <p className="text-sm text-muted-foreground mt-4">
          Review your last trade bar by bar.
        </p>
        <button
          onClick={() => setDismissed(false)}
          className="mt-4 px-4 py-2 text-sm rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Open Replay
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trade Replay</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your last trade bar by bar.
        </p>
      </div>
      <TradeReplay replay={replayData} onClose={() => setDismissed(true)} />
    </div>
  );
}
