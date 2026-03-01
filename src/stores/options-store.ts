import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  OptionChainExpiry,
  StrategyLeg,
  StrategyPreset,
  OptionsPosition,
  OptionsTradeRecord,
  Greeks,
} from "@/types/options";
import { CONTRACT_MULTIPLIER } from "@/types/options";
import { generateId } from "@/lib/utils";
import { calculateOptionFees } from "@/services/options/fees";

const ZERO_GREEKS: Greeks = {
  delta: 0,
  gamma: 0,
  theta: 0,
  vega: 0,
  rho: 0,
  vanna: 0,
  charm: 0,
  vomma: 0,
  speed: 0,
};

function sumGreeks(legs: StrategyLeg[]): Greeks {
  return legs.reduce(
    (acc, leg) => {
      const sign = leg.side === "buy" ? 1 : -1;
      const qty = leg.quantity * sign;
      return {
        delta: acc.delta + leg.greeks.delta * qty,
        gamma: acc.gamma + leg.greeks.gamma * qty,
        theta: acc.theta + leg.greeks.theta * qty,
        vega: acc.vega + leg.greeks.vega * qty,
        rho: acc.rho + leg.greeks.rho * qty,
        vanna: acc.vanna + leg.greeks.vanna * qty,
        charm: acc.charm + leg.greeks.charm * qty,
        vomma: acc.vomma + leg.greeks.vomma * qty,
        speed: acc.speed + leg.greeks.speed * qty,
      };
    },
    { ...ZERO_GREEKS },
  );
}

interface OptionsState {
  selectedExpiry: string;
  chainData: OptionChainExpiry[];
  selectedLegs: StrategyLeg[];
  activeStrategy: string | null;
  positions: OptionsPosition[];
  tradeHistory: OptionsTradeRecord[];

  setSelectedExpiry: (expiry: string) => void;
  setChainData: (data: OptionChainExpiry[]) => void;
  addLeg: (leg: StrategyLeg) => void;
  removeLeg: (index: number) => void;
  clearLegs: () => void;
  applyPreset: (
    preset: StrategyPreset,
    spotPrice: number,
    chain: OptionChainExpiry,
  ) => void;
  executeOptionsTrade: (
    cash: number,
    simulationDate: number,
  ) => { success: boolean; debit: number; position?: OptionsPosition };
  closePosition: (
    positionId: string,
    currentChain: OptionChainExpiry[],
    simulationDate: number,
  ) => { success: boolean; pnl: number };
  updatePositionValues: (chain: OptionChainExpiry[]) => void;
  getNetDebit: () => number;
  getTotalGreeks: () => Greeks;
  resetOptions: () => void;
}

export const useOptionsStore = create<OptionsState>()(
  persist(
    (set, get) => ({
      selectedExpiry: "",
      chainData: [],
      selectedLegs: [],
      activeStrategy: null,
      positions: [],
      tradeHistory: [],

      setSelectedExpiry: (expiry) => set({ selectedExpiry: expiry }),

      setChainData: (data) => set({ chainData: data }),

      addLeg: (leg) =>
        set((s) => ({
          selectedLegs: [...s.selectedLegs, leg],
          activeStrategy: s.selectedLegs.length === 0 ? null : s.activeStrategy,
        })),

      removeLeg: (index) =>
        set((s) => ({
          selectedLegs: s.selectedLegs.filter((_, i) => i !== index),
          activeStrategy:
            s.selectedLegs.length <= 1 ? null : s.activeStrategy,
        })),

      clearLegs: () => set({ selectedLegs: [], activeStrategy: null }),

      applyPreset: (preset, spotPrice, chain) => {
        // Determine strike spacing from the chain
        const strikes = chain.calls.map((c) => c.strike);
        const atmIdx = strikes.reduce(
          (best, s, i) =>
            Math.abs(s - spotPrice) < Math.abs(strikes[best] - spotPrice)
              ? i
              : best,
          0,
        );
        const spacing =
          strikes.length > 1 ? Math.abs(strikes[1] - strikes[0]) : 5;

        const legs: StrategyLeg[] = preset.legs.map((legTemplate, i) => {
          const offset = preset.strikeOffsets[i] ?? 0;
          const targetStrike = strikes[atmIdx] + offset * spacing;
          // Find nearest strike in chain
          const nearestStrike = strikes.reduce((best, s) =>
            Math.abs(s - targetStrike) < Math.abs(best - targetStrike)
              ? s
              : best,
          );

          const contracts =
            legTemplate.type === "call" ? chain.calls : chain.puts;
          const contract = contracts.find((c) => c.strike === nearestStrike);

          const price =
            legTemplate.side === "buy"
              ? (contract?.ask ?? 0)
              : (contract?.bid ?? 0);

          return {
            type: legTemplate.type,
            side: legTemplate.side,
            strike: nearestStrike,
            expiry: chain.expiry,
            quantity: legTemplate.quantity,
            price,
            greeks: contract?.greeks ?? { ...ZERO_GREEKS },
          };
        });

        set({
          selectedLegs: legs,
          activeStrategy: preset.name,
          selectedExpiry: chain.expiry,
        });
      },

      executeOptionsTrade: (cash, simulationDate) => {
        const state = get();
        const { selectedLegs, activeStrategy } = state;
        if (selectedLegs.length === 0)
          return { success: false, debit: 0 };

        // Calculate net debit (positive = cost, negative = credit)
        const netDebit = selectedLegs.reduce((sum, leg) => {
          const sign = leg.side === "buy" ? 1 : -1;
          return sum + sign * leg.price * leg.quantity * CONTRACT_MULTIPLIER;
        }, 0);

        const totalContracts = selectedLegs.reduce(
          (sum, leg) => sum + leg.quantity,
          0,
        );
        const { commission } = calculateOptionFees(totalContracts);
        const totalCost = netDebit + commission;

        // For debit trades, check cash
        if (totalCost > 0 && totalCost > cash) {
          return { success: false, debit: 0 };
        }

        const position: OptionsPosition = {
          id: generateId(),
          ticker: "",
          legs: [...selectedLegs],
          strategyName: activeStrategy ?? "Custom",
          openedAt: Date.now(),
          netDebit,
          currentValue: -netDebit, // initially inverse of debit
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          totalGreeks: sumGreeks(selectedLegs),
        };

        // Fix ticker from chain (legs don't carry ticker)
        if (!position.ticker && state.chainData.length > 0) {
          const firstChain = state.chainData[0];
          if (firstChain.calls.length > 0) {
            position.ticker = firstChain.calls[0].ticker;
          }
        }

        const record: OptionsTradeRecord = {
          id: generateId(),
          ticker: position.ticker,
          strategyName: position.strategyName,
          legs: [...selectedLegs],
          side: "open",
          netDebit,
          realizedPnL: 0,
          fees: commission,
          timestamp: Date.now(),
          simulationDate,
        };

        set((s) => ({
          positions: [...s.positions, position],
          tradeHistory: [...s.tradeHistory, record],
          selectedLegs: [],
          activeStrategy: null,
        }));

        return { success: true, debit: totalCost, position };
      },

      closePosition: (positionId, currentChain, simulationDate) => {
        const state = get();
        const pos = state.positions.find((p) => p.id === positionId);
        if (!pos) return { success: false, pnl: 0 };

        // Calculate current value from chain prices
        let closeValue = 0;
        pos.legs.forEach((leg) => {
          const chainExpiry = currentChain.find(
            (c) => c.expiry === leg.expiry,
          );
          if (!chainExpiry) return;

          const contracts =
            leg.type === "call" ? chainExpiry.calls : chainExpiry.puts;
          const contract = contracts.find((c) => c.strike === leg.strike);
          if (!contract) return;

          // Closing: reverse the original side
          const closePrice =
            leg.side === "buy" ? contract.bid : contract.ask;
          const sign = leg.side === "buy" ? 1 : -1;
          closeValue += sign * closePrice * leg.quantity * CONTRACT_MULTIPLIER;
        });

        const pnl = -closeValue - pos.netDebit; // netDebit was cost, closeValue is what we get back

        const totalContracts = pos.legs.reduce(
          (sum, leg) => sum + leg.quantity,
          0,
        );
        const { commission } = calculateOptionFees(totalContracts);
        const realizedPnL = pnl - commission;

        const record: OptionsTradeRecord = {
          id: generateId(),
          ticker: pos.ticker,
          strategyName: pos.strategyName,
          legs: pos.legs,
          side: "close",
          netDebit: -closeValue,
          realizedPnL,
          fees: commission,
          timestamp: Date.now(),
          simulationDate,
        };

        set((s) => ({
          positions: s.positions.filter((p) => p.id !== positionId),
          tradeHistory: [...s.tradeHistory, record],
        }));

        return { success: true, pnl: realizedPnL };
      },

      updatePositionValues: (chain) => {
        set((s) => ({
          positions: s.positions.map((pos) => {
            let currentValue = 0;
            pos.legs.forEach((leg) => {
              const chainExpiry = chain.find(
                (c) => c.expiry === leg.expiry,
              );
              if (!chainExpiry) return;

              const contracts =
                leg.type === "call" ? chainExpiry.calls : chainExpiry.puts;
              const contract = contracts.find(
                (c) => c.strike === leg.strike,
              );
              if (!contract) return;

              const sign = leg.side === "buy" ? 1 : -1;
              currentValue +=
                sign * contract.mid * leg.quantity * CONTRACT_MULTIPLIER;
            });

            const unrealizedPnL = currentValue - pos.netDebit;
            const unrealizedPnLPercent =
              pos.netDebit !== 0
                ? (unrealizedPnL / Math.abs(pos.netDebit)) * 100
                : 0;

            // Recompute greeks from chain
            const updatedLegs = pos.legs.map((leg) => {
              const chainExpiry = chain.find(
                (c) => c.expiry === leg.expiry,
              );
              if (!chainExpiry) return leg;
              const contracts =
                leg.type === "call" ? chainExpiry.calls : chainExpiry.puts;
              const contract = contracts.find(
                (c) => c.strike === leg.strike,
              );
              return contract ? { ...leg, greeks: contract.greeks } : leg;
            });

            return {
              ...pos,
              currentValue,
              unrealizedPnL,
              unrealizedPnLPercent,
              totalGreeks: sumGreeks(updatedLegs),
            };
          }),
        }));
      },

      getNetDebit: () => {
        const { selectedLegs } = get();
        return selectedLegs.reduce((sum, leg) => {
          const sign = leg.side === "buy" ? 1 : -1;
          return sum + sign * leg.price * leg.quantity * CONTRACT_MULTIPLIER;
        }, 0);
      },

      getTotalGreeks: () => sumGreeks(get().selectedLegs),

      resetOptions: () =>
        set({
          selectedExpiry: "",
          chainData: [],
          selectedLegs: [],
          activeStrategy: null,
          positions: [],
          tradeHistory: [],
        }),
    }),
    {
      name: "alpha-deck-options",
      partialize: (state) => ({
        positions: state.positions,
        tradeHistory: state.tradeHistory,
      }),
    },
  ),
);
