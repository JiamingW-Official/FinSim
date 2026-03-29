"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { Activity, Loader2 } from "lucide-react";
import type { OptionContract, ChainFilters } from "@/types/options";

const TAB_TRIGGER_CLASS =
  "h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary";
const SUB_TAB_TRIGGER_CLASS =
  "h-6 rounded-sm px-3 text-[11px] data-[state=active]:bg-muted data-[state=active]:text-foreground";

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
  const darkPoolSeed = chain.length > 0 && chain[0].calls.length > 0
    ? chain[0].calls[0].ticker.split("").reduce((s: number, c: string) => s + c.charCodeAt(0), 0) * 7 + chain.length
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Stats bar */}
      <ChainStatsBar analytics={analytics} spotPrice={spotPrice} isLoading={isLoading} />

      {/* Buffer zone — breathing room between stats bar (dense) and tabs */}
      <div className="h-2 shrink-0" />

      {/* 4-tab layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="h-8 w-full shrink-0 justify-start rounded-none border-b border-border bg-card px-2 gap-0 overflow-x-auto flex-nowrap">
          <TabsTrigger value="chains" className={TAB_TRIGGER_CLASS + " shrink-0"}>
            Chains
          </TabsTrigger>
          <TabsTrigger value="strategy" className={TAB_TRIGGER_CLASS + " shrink-0"}>
            Strategy
          </TabsTrigger>
          <TabsTrigger value="analysis" className={TAB_TRIGGER_CLASS + " shrink-0"}>
            Analysis
          </TabsTrigger>
          <TabsTrigger value="greeks" className={TAB_TRIGGER_CLASS + " shrink-0"}>
            Greeks
          </TabsTrigger>
          <TabsTrigger value="flow" className={TAB_TRIGGER_CLASS + " shrink-0"}>
            Flow
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Tab content */}
            {chain.length > 0 ? (
              <>
                {/* Chains — CONSOLE card styling (dense, tabular) */}
                <TabsContent value="chains" className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden text-xs">
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
                  {/* Buffer before bottom panel */}
                  <div className="h-1.5 shrink-0" />
                  {/* Bottom panel */}
                  <div className="h-52 shrink-0 border-t border-border/40">
                    <Tabs
                      defaultValue={selectedLegs.length > 0 ? "payoff" : "positions"}
                      className="flex h-full flex-col"
                    >
                      <TabsList className="h-7 w-full justify-start rounded-none border-b border-border bg-card px-2">
                        <TabsTrigger
                          value="payoff"
                          className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
                          Payoff Diagram
                        </TabsTrigger>
                        <TabsTrigger
                          value="positions"
                          className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent"
                        >
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

                {/* Strategy — INTERACTIVE card styling */}
                <TabsContent value="strategy" className="mt-0 flex-1 overflow-hidden data-[state=inactive]:hidden p-4">
                  <StrategyBuilderV2
                    chain={chain}
                    spotPrice={spotPrice}
                    selectedExpiry={selectedExpiry}
                    analytics={analytics}
                    onApply={() => setActiveTab("chains")}
                  />
                </TabsContent>

                {/* Analysis — FLOW card styling (borderless charts) */}
                <TabsContent value="analysis" className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden pt-0">
                  <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 py-1">
                    <button
                      onClick={() => setAnalysisSubTab("charts")}
                      className={`rounded-sm px-3 py-1 text-[11px] transition-colors ${analysisSubTab === "charts" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Charts
                    </button>
                    <button
                      onClick={() => setAnalysisSubTab("vol-surface")}
                      className={`rounded-sm px-3 py-1 text-[11px] transition-colors ${analysisSubTab === "vol-surface" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Vol Surface
                    </button>
                    <button
                      onClick={() => setAnalysisSubTab("margin-calc")}
                      className={`rounded-sm px-3 py-1 text-[11px] transition-colors ${analysisSubTab === "margin-calc" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
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
                      <VolSurface
                        spotPrice={spotPrice}
                        hv={hv}
                        ivRank={analytics.ivRank}
                      />
                    )}
                    {analysisSubTab === "margin-calc" && (
                      <PortfolioMarginCalc />
                    )}
                  </div>
                </TabsContent>

                {/* Greeks — Lab + Monitor sub-tabs */}
                <TabsContent value="greeks" className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden pt-0.5">
                  <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 py-1">
                    <button
                      onClick={() => setGreeksSubTab("greeks-lab")}
                      className={`rounded-sm px-3 py-1 text-[11px] transition-colors ${greeksSubTab === "greeks-lab" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Greeks Lab
                    </button>
                    <button
                      onClick={() => setGreeksSubTab("greeks-monitor")}
                      className={`rounded-sm px-3 py-1 text-[11px] transition-colors ${greeksSubTab === "greeks-monitor" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Greeks Monitor
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

                {/* Flow — Unusual Activity + Flow Analysis sub-tabs */}
                <TabsContent value="flow" className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden pt-1.5">
                  <div className="flex shrink-0 items-center gap-1 border-b border-border px-3 py-1">
                    <button
                      onClick={() => setFlowSubTab("unusual")}
                      className={`rounded-sm px-3 py-1 text-[11px] transition-colors ${flowSubTab === "unusual" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Unusual Activity
                    </button>
                    <button
                      onClick={() => setFlowSubTab("flow-analysis")}
                      className={`rounded-sm px-3 py-1 text-[11px] transition-colors ${flowSubTab === "flow-analysis" ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Flow Analysis
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {flowSubTab === "unusual" && (
                      <div className="flex flex-col gap-0">
                        <div className="min-h-[260px]">
                          <UnusualActivityFeed
                            items={unusualActivity}
                            onSelectContract={handleSelectContract}
                          />
                        </div>
                        <div className="border-t border-border/50 px-3 pt-4 pb-3">
                          <h3 className="mb-1.5 text-[11px] font-semibold text-foreground/80">
                            Options Flow Heatmap
                          </h3>
                          <p className="mb-2 text-xs text-muted-foreground">
                            Net call/put dollar flow per ticker and expiry. Green = net call buying, Red = net put buying.
                          </p>
                          <FlowHeatmap items={unusualActivity} />
                        </div>
                        <div className="border-t border-border/50 px-3 pt-3 pb-4">
                          <h3 className="mb-2 text-[11px] font-semibold text-foreground/80">
                            Simulated Institutional Flow
                          </h3>
                          <p className="mb-3 text-xs text-muted-foreground">
                            Simulated dark pool executions. Above Ask = aggressive buyer. Below Bid = aggressive seller.
                          </p>
                          <DarkPoolFlow seed={darkPoolSeed} />
                        </div>
                      </div>
                    )}
                    {flowSubTab === "flow-analysis" && (
                      <FlowAnalysis />
                    )}
                  </div>
                </TabsContent>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Right contextual panel — hidden on mobile */}
          <AnimatePresence mode="wait">
            {selectedContract ? (
              <motion.div
                key="detail"
                initial={{ x: 72, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 72, opacity: 0 }}
                transition={{ type: "spring", damping: 22, stiffness: 280 }}
                className="hidden md:block w-72 shrink-0 overflow-y-auto border-l-4 border-l-primary bg-card"
              >
                <ContractDetail
                  contract={selectedContract}
                  spotPrice={spotPrice}
                  analytics={analytics}
                  onClose={() => setSelectedContract(null)}
                  onAddLeg={handleAddLeg}
                />
              </motion.div>
            ) : (
              <motion.div
                key="order"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="hidden md:block w-64 shrink-0 overflow-y-auto border-l border-border/40 bg-card"
              >
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <motion.div
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Activity className="h-3.5 w-3.5 text-orange-400" />
                  </motion.div>
                  <div>
                    <h1 className="text-xs font-bold">{currentTicker} Options <span className="font-normal text-muted-foreground">(Simulated)</span></h1>
                    <p className="text-[11px] text-muted-foreground">
                      Spot: ${spotPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                <OptionsOrderEntry spotPrice={spotPrice} analytics={analytics} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
      {/* Mobile order entry — visible below md */}
      <div className="md:hidden shrink-0 border-t border-border">
        <OptionsOrderEntry spotPrice={spotPrice} analytics={analytics} />
      </div>
      <p className="shrink-0 border-t border-border/40 px-3 py-2.5 text-center text-[11px] text-muted-foreground/60">
        For educational purposes only. Not financial advice. All data is simulated.
      </p>
    </div>
  );
}
