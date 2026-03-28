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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Loader2 } from "lucide-react";
import type { OptionContract, ChainFilters } from "@/types/options";

export default function OptionsPage() {
  const { isLoading, error } = useMarketData();
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
      <ChainStatsBar analytics={analytics} spotPrice={spotPrice} />

      {/* 4-tab layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="h-8 w-full shrink-0 justify-start rounded-none border-b border-border bg-card px-2 gap-0">
          <TabsTrigger
            value="chains"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:text-orange-400"
          >
            Chains
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:text-orange-400"
          >
            Strategy Builder
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:text-orange-400"
          >
            Analysis
          </TabsTrigger>
          <TabsTrigger
            value="unusual"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:text-orange-400"
          >
            Unusual Activity
          </TabsTrigger>
          <TabsTrigger
            value="greeks-lab"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:text-orange-400"
          >
            Greeks Lab
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Loading / Error states */}
            {isLoading && (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
              </div>
            )}
            {error && (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-destructive">Failed to load data. Please try again.</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {/* Chains tab */}
                <TabsContent value="chains" className="mt-0 flex flex-1 flex-col overflow-hidden data-[state=inactive]:hidden">
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
                  <div className="h-52 shrink-0 border-t border-border">
                    <Tabs
                      defaultValue={selectedLegs.length > 0 ? "payoff" : "positions"}
                      className="flex h-full flex-col"
                    >
                      <TabsList className="h-7 w-full justify-start rounded-none border-b border-border bg-card px-2">
                        <TabsTrigger
                          value="payoff"
                          className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-orange-400 data-[state=active]:bg-transparent"
                        >
                          Payoff Diagram
                        </TabsTrigger>
                        <TabsTrigger
                          value="positions"
                          className="h-6 rounded-none border-b-2 border-transparent px-3 text-xs data-[state=active]:border-orange-400 data-[state=active]:bg-transparent"
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

                {/* Strategy Builder tab */}
                <TabsContent value="strategy" className="mt-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
                  <StrategyBuilderV2
                    chain={chain}
                    spotPrice={spotPrice}
                    selectedExpiry={selectedExpiry}
                    analytics={analytics}
                    onApply={() => setActiveTab("chains")}
                  />
                </TabsContent>

                {/* Analysis tab */}
                <TabsContent value="analysis" className="mt-0 flex-1 overflow-auto data-[state=inactive]:hidden">
                  <AnalysisPanel
                    analytics={analytics}
                    smile={smile}
                    termStructure={termStructure}
                    oiVol={oiVol}
                    chain={chain}
                    spotPrice={spotPrice}
                  />
                </TabsContent>

                {/* Unusual Activity tab */}
                <TabsContent value="unusual" className="mt-0 flex-1 overflow-auto data-[state=inactive]:hidden">
                  <div className="flex flex-col gap-0">
                    {/* Feed takes natural height */}
                    <div className="min-h-[260px]">
                      <UnusualActivityFeed
                        items={unusualActivity}
                        onSelectContract={handleSelectContract}
                      />
                    </div>

                    {/* Flow Heatmap section */}
                    <div className="border-t border-border/50 px-3 py-3">
                      <h3 className="mb-2 text-[11px] font-semibold text-foreground/80">
                        Options Flow Heatmap
                      </h3>
                      <p className="mb-3 text-[10px] text-muted-foreground">
                        Net call/put dollar flow per ticker and expiry. Green = net call buying, Red = net put buying. Cell size proportional to volume.
                      </p>
                      <FlowHeatmap items={unusualActivity} />
                    </div>

                    {/* Dark Pool Flow section */}
                    <div className="border-t border-border/50 px-3 py-3">
                      <h3 className="mb-2 text-[11px] font-semibold text-foreground/80">
                        Dark Pool Prints
                      </h3>
                      <p className="mb-3 text-[10px] text-muted-foreground">
                        Simulated institutional dark pool executions. Above Ask = aggressive buyer. Below Bid = aggressive seller.
                      </p>
                      <DarkPoolFlow seed={darkPoolSeed} />
                    </div>
                  </div>
                </TabsContent>

                {/* Greeks Lab tab */}
                <TabsContent value="greeks-lab" className="mt-0 flex-1 overflow-auto data-[state=inactive]:hidden">
                  <GreeksLab
                    positions={positions}
                    spotPrice={spotPrice}
                    analytics={analytics}
                    smile={smile}
                    chain={chain}
                  />
                </TabsContent>
              </>
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
                className="hidden md:block w-72 shrink-0 overflow-y-auto border-l border-border bg-card"
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
                className="hidden md:block w-64 shrink-0 overflow-y-auto border-l border-border bg-card"
              >
                <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
                  <motion.div
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Activity className="h-3.5 w-3.5 text-orange-400" />
                  </motion.div>
                  <div>
                    <h1 className="text-xs font-black">{currentTicker} Options</h1>
                    <p className="text-[9px] text-muted-foreground">
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
    </div>
  );
}
