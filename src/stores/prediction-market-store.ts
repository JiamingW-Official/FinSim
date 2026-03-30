import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PredictionBet {
 marketId: string;
 position: "yes" | "no";
 amount: number;
 probability: number;
 timestamp: number;
 resolved?: boolean;
 payout?: number;
 outcome?: boolean;
}

interface PredictionMarketState {
 bets: PredictionBet[];
 insightPoints: number;
 totalResolved: number;
 correctPredictions: number;

 placeBet: (
 marketId: string,
 position: "yes" | "no",
 amount: number,
 probability: number,
 ) => void;
 resolveBet: (marketId: string, outcome: boolean) => void;
 getAccuracy: () => number;
 getBrierScore: () => number;
 getMarketBet: (marketId: string) => PredictionBet | undefined;
}

export const usePredictionMarketStore = create<PredictionMarketState>()(
 persist(
 (set, get) => ({
 bets: [],
 insightPoints: 1000,
 totalResolved: 0,
 correctPredictions: 0,

 placeBet: (marketId, position, amount, probability) => {
 const state = get();
 const existing = state.bets.find(
 (b) => b.marketId === marketId && !b.resolved,
 );
 if (existing) return;
 if (amount > state.insightPoints) return;
 if (amount < 10 || amount > 100) return;

 const bet: PredictionBet = {
 marketId,
 position,
 amount,
 probability: probability / 100,
 timestamp: Date.now(),
 };

 set({
 bets: [...state.bets, bet],
 insightPoints: state.insightPoints - amount,
 });

 // Award XP for placing a bet
 try {
 const { useGameStore } = require("./game-store");
 useGameStore.getState().awardXP(10);
 } catch {
 /* game store not loaded */
 }
 },

 resolveBet: (marketId, outcome) => {
 const state = get();
 const betIndex = state.bets.findIndex(
 (b) => b.marketId === marketId && !b.resolved,
 );
 if (betIndex === -1) return;

 const bet = state.bets[betIndex];
 const isCorrect =
 (bet.position === "yes" && outcome) ||
 (bet.position === "no" && !outcome);

 let payout = 0;
 if (isCorrect) {
 if (bet.position === "yes") {
 payout = Math.round(bet.amount * (1 / bet.probability));
 } else {
 payout = Math.round(bet.amount * (1 / (1 - bet.probability)));
 }
 }

 const updatedBets = [...state.bets];
 updatedBets[betIndex] = {
 ...bet,
 resolved: true,
 payout,
 outcome,
 };

 set({
 bets: updatedBets,
 insightPoints: state.insightPoints + payout,
 totalResolved: state.totalResolved + 1,
 correctPredictions:
 state.correctPredictions + (isCorrect ? 1 : 0),
 });

 // Award bonus XP if correct
 if (isCorrect) {
 try {
 const { useGameStore } = require("./game-store");
 useGameStore.getState().awardXP(25);
 } catch {
 /* game store not loaded */
 }
 }
 },

 getAccuracy: () => {
 const { totalResolved, correctPredictions } = get();
 if (totalResolved === 0) return 0;
 return Math.round((correctPredictions / totalResolved) * 100);
 },

 getBrierScore: () => {
 const { bets } = get();
 const resolvedBets = bets.filter((b) => b.resolved);
 if (resolvedBets.length === 0) return 0;

 let sumSquaredError = 0;
 for (const bet of resolvedBets) {
 const outcomeValue = bet.outcome ? 1 : 0;
 const forecast =
 bet.position === "yes" ? bet.probability : 1 - bet.probability;
 sumSquaredError += (forecast - outcomeValue) ** 2;
 }

 return Number((sumSquaredError / resolvedBets.length).toFixed(3));
 },

 getMarketBet: (marketId) => {
 return get().bets.find(
 (b) => b.marketId === marketId && !b.resolved,
 );
 },
 }),
 {
 name: "alpha-deck-prediction-markets",
 partialize: (state) => ({
 bets: state.bets,
 insightPoints: state.insightPoints,
 totalResolved: state.totalResolved,
 correctPredictions: state.correctPredictions,
 }),
 },
 ),
);
