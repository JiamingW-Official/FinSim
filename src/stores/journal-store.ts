import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/utils";
import type { JournalEntry } from "@/services/trading/journal";

interface JournalState {
 entries: JournalEntry[];
 addEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
 updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
 deleteEntry: (id: string) => void;
 getEntriesForTicker: (ticker: string) => JournalEntry[];
 getEntriesByTag: (tag: string) => JournalEntry[];
}

export const useJournalStore = create<JournalState>()(
 persist(
 (set, get) => ({
 entries: [],

 addEntry: (entry) => {
 const newEntry: JournalEntry = {
 ...entry,
 id: generateId(),
 createdAt: Date.now(),
 };
 set((state) => ({
 entries: [newEntry, ...state.entries],
 }));
 },

 updateEntry: (id, updates) => {
 set((state) => ({
 entries: state.entries.map((e) =>
 e.id === id ? { ...e, ...updates } : e,
 ),
 }));
 },

 deleteEntry: (id) => {
 set((state) => ({
 entries: state.entries.filter((e) => e.id !== id),
 }));
 },

 getEntriesForTicker: (ticker) => {
 return get().entries.filter((e) => e.ticker === ticker);
 },

 getEntriesByTag: (tag) => {
 return get().entries.filter((e) => e.tags.includes(tag));
 },
 }),
 { name: "alpha-deck-journal" },
 ),
);
