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
        <TabsList className="h-8 w-full shrink-0 justify-start rounded-none border-b border-border bg-card px-2 gap-0 overflow-x-auto whitespace-nowrap">
          <TabsTrigger
            value="chains"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
          >
            Chains
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
          >
            Strategy Builder
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
          >
            Analysis
          </TabsTrigger>
          <TabsTrigger
            value="unusual"
            className="h-7 rounded-none border-b-2 border-transparent px-4 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
          >
            Unusual Activity
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
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
                  <div className="flex-1 overflow-auto overflow-x-auto">
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
                  />
                </TabsContent>

                {/* Unusual Activity tab */}
                <TabsContent value="unusual" className="mt-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
                  <UnusualActivityFeed
                    items={unusualActivity}
                    onSelectContract={handleSelectContract}
                  />
                </TabsContent>
              </>
            )}
          </div>

          {/* Right contextual panel */}
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
                    <h1 className="text-xs font-semibold">{currentTicker} Options</h1>
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
