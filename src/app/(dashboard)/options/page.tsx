"use client";

import { useEffect, useState } from "react";
import { useMarketData } from "@/hooks/useMarketData";
import { useOptionsChain } from "@/hooks/useOptionsChain";
import { useOptionsAnalytics } from "@/hooks/useOptionsAnalytics";
import { useOptionsStore } from "@/stores/options-store";
import { useChartStore } from "@/stores/chart-store";
import { OptionsChain } from "@/components/options/OptionsChain";
import { OptionsOrderEntry } from "@/components/options/OptionsOrderEntry";
import { OptionsPositions } from "@/components/options/OptionsPositions";
import { PayoffDiagram } from "@/components/options/PayoffDiagram";
import { ChainStatsBar } from "@/components/options/ChainStatsBar";
import { ChainFiltersBar } from "@/components/options/ChainFiltersBar";
import { ContractDetail } from "@/components/options/ContractDetail";
import { StrategyBuilderV2 } from "@/components/options/StrategyBuilderV2";
import { AnalysisPanel } from "@/components/options/AnalysisPanel";
import { UnusualActivityFeed } from "@/components/options/UnusualActivityFeed";
import { FlowHeatmap } from "@/components/options/FlowHeatmap";
import { DarkPoolFlow } from "@/components/options/DarkPoolFlow";
import { GreeksLab } from "@/components/options/GreeksLab";
import { GreeksMonitor } from "@/components/options/GreeksMonitor";
import { PortfolioMarginCalc } from "@/components/options/PortfolioMarginCalc";
import { VolSurface } from "@/components/options/VolSurface";
import { FlowAnalysis } from "@/components/options/FlowAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import type { OptionContract, ChainFilters } from "@/types/options";

const TAB_TRIGGER_CLASS =
  "shrink-0 rounded-none px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/40 data-[state=active]:text-foreground/80 data-[state=active]:border-b-2 data-[state=active]:border-primary/60 data-[state=active]:bg-transparent hover:text-muted-foreground/60 transition-colors duration-150";

const SUB_TAB_TRIGGER_CLASS =
  "shrink-0 rounded-none px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground/40 data-[state=active]:text-foreground/80 data-[state=active]:border-b-2 data-[state=active]:border-primary/60 data-[state=active]:bg-transparent hover:text-muted-foreground/60 transition-colors duration-150";

function subBtnClass(active: boolean) {
  return active
    ? "rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-colors bg-primary/15 text-primary/80"
    : "rounded-full px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider transition-colors text-muted-foreground/30 hover:text-muted-foreground/60";
}

export default function OptionsPage() {
  const { isLoading } = useMarketData();
  const { chain, spotPrice, historicalVolatility: hv } = useOptionsChain();
  const currentTicker = useChartStore((s) => s.currentTicker);
  const setChainData = useOptionsStore((s) => s.setChainData);
  const selectedExpiry = useOptionsStore((s) => s.selectedExpiry);
  const setSelectedExpiry = useOptionsStore((s) => s.setSelectedExpiry);
  const selectedLegs = useOptionsStore((s) => s.selectedLegs);
  const positions = useOptionsStore((s) => s.positions);
  const addLeg = useOptionsStore((s) => s.addLeg);
  const updatePositionValues = useOptionsStore((s) => s.updatePositionValues);

  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [filters, setFilters] = useState<ChainFilters>({
    typeFilter: "both",
    moneynessFilter: "all",
  });
  const [activeTab, setActiveTab] = useState("chains");
  const [greeksSubTab, setGreeksSubTab] = useState("greeks-lab");
  const [flowSubTab, setFlowSubTab] = useState("unusual");
  const [analysisSubTab, setAnalysisSubTab] = useState("charts");

  const { analytics, smile, termStructure, oiVol, unusualActivity } = useOptionsAnalytics(
    chain,
    spotPrice,
    hv,
    selectedExpiry,
  );

  // Derive same seed used by analytics hook for dark pool prints consistency
  const darkPoolSeed =
    chain.length > 0 && chain[0].calls.length > 0
      ? chain[0].calls[0].ticker
          .split("")
          .reduce((s: number, c: string) => s + c.charCodeAt(0), 0) *
          7 +
        chain.length
      : 42;

  // Sync chain data to store and auto-select first expiry
  useEffect(() => {
    if (chain.length > 0) {
      setChainData(chain);
      if (!selectedExpiry || !chain.find((c) => c.expiry === selectedExpiry)) {
        setSelectedExpiry(chain[0].expiry);
      }
      updatePositionValues(chain);
    }
  }, [chain, selectedExpiry, setChainData, setSelectedExpiry, updatePositionValues]);

  // Track analytics view for achievements
  useEffect(() => {
    if (activeTab === "analysis" || activeTab === "unusual") {
      try {
        const { useGameStore } = require("@/stores/game-store");
        useGameStore
          .getState()
          .recordAnalyticsView(activeTab === "analysis" ? "analysis" : "unusual");
      } catch {
        /* game store not loaded */
      }
    }
  }, [activeTab]);

  const handleSelectContract = (contract: OptionContract) => {
    setSelectedContract((prev) =>
      prev?.strike === contract.strike &&
      prev?.type === contract.type &&
      prev?.expiry === contract.expiry
        ? null
        : contract,
    );
  };

  const handleAddLeg = (leg: Parameters<typeof addLeg>[0]) => {
    addLeg(leg);
    setSelectedContract(null);
  };

  // Derived IV for header chip
  const ivPct = analytics ? Math.round(analytics.atmIV * 100) : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Compact header bar */}
      <div className="h-9 shrink-0 border-b border-border/30 bg-background/95 backdrop-blur-sm px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-semibold font-mono text-foreground/80">
            [{currentTicker}] Options
          </span>
          <span className="text-[11px] font-mono tabular-nums text-foreground/60">
            ${spotPrice.toFixed(2)}
          </span>
          {ivPct !== null && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground/60 border border-border/20">
              IV: {ivPct}%
            </span>
          )}
        </div>
        {isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/40" />
        )}
      </div>

      {/* Stats bar */}
      <div className="shrink-0 border-b border-border/20 bg-background/50 px-2 py-1">
        <ChainStatsBar analytics={analytics} spotPrice={spotPrice} isLoading={isLoading} />
      </div>

      {/* 4-tab layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="bg-muted/5 border-b border-border/20 rounded-none p-0 h-auto shrink-0 w-full flex">
          <TabsTrigger value="chains" className={TAB_TRIGGER_CLASS}>
            Chains
          </TabsTrigger>
          <TabsTrigger value="strategy" className={TAB_TRIGGER_CLASS}>
            Strategy
          </TabsTrigger>
          <TabsTrigger value="analysis" className={TAB_TRIGGER_CLASS}>
            Analysis
          </TabsTrigger>
          <TabsTrigger value="greeks" className={TAB_TRIGGER_CLASS}>
            Greeks
          </TabsTrigger>
          <TabsTrigger value="flow" className={TAB_TRIGGER_CLASS}>
            Flow
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {chain.length > 0 ? (
              <>
                {/* Chains */}
                <TabsContent
                  value="chains"
                  className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden text-xs"
                >
                  <ChainFiltersBar
                    filters={filters}
                    setFilters={setFilters}
                    chain={chain}
                    selectedExpiry={selectedExpiry}
                    onSelectExpiry={setSelectedExpiry}
                  />
                  <div className="flex-1 overflow-auto">
                    <OptionsChain
                      chain={chain}
                      selectedExpiry={selectedExpiry}
                      onSelectExpiry={setSelectedExpiry}
                      spotPrice={spotPrice}
                      filters={filters}
                      onSelectContract={handleSelectContract}
                      selectedContract={selectedContract}
                    />
                  </div>
                  {/* Bottom panel */}
                  <div className="h-52 shrink-0 border-t border-border/20">
                    <Tabs
                      defaultValue={selectedLegs.length > 0 ? "payoff" : "positions"}
                      className="flex h-full flex-col"
                    >
                      <TabsList className="bg-muted/5 border-b border-border/20 rounded-none p-0 h-auto shrink-0 w-full flex">
                        <TabsTrigger value="payoff" className={SUB_TAB_TRIGGER_CLASS}>
                          Payoff Diagram
                        </TabsTrigger>
                        <TabsTrigger value="positions" className={SUB_TAB_TRIGGER_CLASS}>
                          Positions
                          {positions.length > 0 && ` (${positions.length})`}
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="payoff" className="mt-0 flex-1 overflow-auto">
                        <PayoffDiagram legs={selectedLegs} spotPrice={spotPrice} />
                      </TabsContent>
                      <TabsContent value="positions" className="mt-0 flex-1 overflow-auto">
                        <OptionsPositions chain={chain} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                {/* Strategy */}
                <TabsContent
                  value="strategy"
                  className="mt-0 flex-1 overflow-hidden data-[state=inactive]:hidden p-3"
                >
                  <StrategyBuilderV2
                    chain={chain}
                    spotPrice={spotPrice}
                    selectedExpiry={selectedExpiry}
                    analytics={analytics}
                    onApply={() => setActiveTab("chains")}
                  />
                </TabsContent>

                {/* Analysis */}
                <TabsContent
                  value="analysis"
                  className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden pt-0"
                >
                  <div className="flex shrink-0 items-center gap-1 border-b border-border/20 bg-background/30 px-3 py-1.5">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mr-2">
                      View
                    </p>
                    <button onClick={() => setAnalysisSubTab("charts")} className={subBtnClass(analysisSubTab === "charts")}>
                      Charts
                    </button>
                    <button onClick={() => setAnalysisSubTab("vol-surface")} className={subBtnClass(analysisSubTab === "vol-surface")}>
                      Vol Surface
                    </button>
                    <button onClick={() => setAnalysisSubTab("margin-calc")} className={subBtnClass(analysisSubTab === "margin-calc")}>
                      Margin Calc
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {analysisSubTab === "charts" && (
                      <AnalysisPanel
                        analytics={analytics}
                        smile={smile}
                        termStructure={termStructure}
                        oiVol={oiVol}
                        chain={chain}
                        spotPrice={spotPrice}
                      />
                    )}
                    {analysisSubTab === "vol-surface" && (
                      <VolSurface spotPrice={spotPrice} hv={hv} ivRank={analytics.ivRank} />
                    )}
                    {analysisSubTab === "margin-calc" && <PortfolioMarginCalc />}
                  </div>
                </TabsContent>

                {/* Greeks */}
                <TabsContent
                  value="greeks"
                  className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden pt-0"
                >
                  <div className="flex shrink-0 items-center gap-1 border-b border-border/20 bg-background/30 px-3 py-1.5">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mr-2">
                      View
                    </p>
                    <button onClick={() => setGreeksSubTab("greeks-lab")} className={subBtnClass(greeksSubTab === "greeks-lab")}>
                      Greeks Lab
                    </button>
                    <button onClick={() => setGreeksSubTab("greeks-monitor")} className={subBtnClass(greeksSubTab === "greeks-monitor")}>
                      Monitor
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {greeksSubTab === "greeks-lab" && (
                      <GreeksLab
                        positions={positions}
                        spotPrice={spotPrice}
                        analytics={analytics}
                        smile={smile}
                        chain={chain}
                      />
                    )}
                    {greeksSubTab === "greeks-monitor" && (
                      <GreeksMonitor
                        positions={positions}
                        spotPrice={spotPrice}
                        analytics={analytics}
                        chain={chain}
                      />
                    )}
                  </div>
                </TabsContent>

                {/* Flow */}
                <TabsContent
                  value="flow"
                  className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden pt-0"
                >
                  <div className="flex shrink-0 items-center gap-1 border-b border-border/20 bg-background/30 px-3 py-1.5">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mr-2">
                      View
                    </p>
                    <button onClick={() => setFlowSubTab("unusual")} className={subBtnClass(flowSubTab === "unusual")}>
                      Unusual Activity
                    </button>
                    <button onClick={() => setFlowSubTab("flow-analysis")} className={subBtnClass(flowSubTab === "flow-analysis")}>
                      Flow Analysis
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {flowSubTab === "unusual" && (
                      <div className="flex flex-col gap-0">
                        <div className="min-h-[220px]">
                          <UnusualActivityFeed
                            items={unusualActivity}
                            onSelectContract={handleSelectContract}
                          />
                        </div>
                        <div className="border-t border-border/20 px-3 pt-2 pb-2">
                          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mb-1.5">
                            Flow Heatmap
                          </p>
                          <FlowHeatmap items={unusualActivity} />
                        </div>
                        <div className="border-t border-border/20 px-3 pt-2 pb-2">
                          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35 mb-1.5">
                            Institutional Flow
                          </p>
                          <DarkPoolFlow seed={darkPoolSeed} />
                        </div>
                      </div>
                    )}
                    {flowSubTab === "flow-analysis" && <FlowAnalysis />}
                  </div>
                </TabsContent>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
                  Loading options data...
                </div>
              </div>
            )}
          </div>

          {/* Right contextual panel — hidden on mobile, CSS transition instead of framer-motion */}
          <div
            className={`hidden md:block w-56 shrink-0 overflow-y-auto border-l border-border/20 bg-card/30 transition-transform duration-200 ${
              selectedContract ? "translate-x-0" : "translate-x-0"
            }`}
          >
            {selectedContract ? (
              <ContractDetail
                contract={selectedContract}
                spotPrice={spotPrice}
                analytics={analytics}
                onClose={() => setSelectedContract(null)}
                onAddLeg={handleAddLeg}
              />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border/20 px-2.5 py-2 bg-background/30">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/35">
                    {currentTicker}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-foreground/70">
                    ${spotPrice.toFixed(2)}
                  </span>
                </div>
                <OptionsOrderEntry spotPrice={spotPrice} analytics={analytics} />
              </>
            )}
          </div>
        </div>
      </Tabs>

      {/* Mobile order entry — visible below md */}
      <div className="md:hidden shrink-0 border-t border-border/20">
        <OptionsOrderEntry spotPrice={spotPrice} analytics={analytics} />
      </div>

      <p className="shrink-0 border-t border-border/20 px-3 py-1 text-center text-[9px] font-mono uppercase tracking-widest text-muted-foreground/30">
        Simulated data — for educational purposes only.
      </p>
    </div>
  );
}
