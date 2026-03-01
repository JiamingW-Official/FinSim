import { GLOSSARY } from "./glossary";
import { INDICATOR_EXPLANATIONS } from "./indicator-explanations";

export interface FlashcardItem {
  id: string;
  category: string;
  front: string;
  back: string;
  hint?: string;
}

// Build flashcards from glossary entries
const glossaryCards: FlashcardItem[] = GLOSSARY.map((entry) => ({
  id: `glossary-${entry.term.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
  category: entry.category,
  front: entry.term,
  back: entry.definition,
  hint: entry.example,
}));

// Build flashcards from indicator explanations
const indicatorCards: FlashcardItem[] = Object.entries(INDICATOR_EXPLANATIONS).map(
  ([key, info]) => ({
    id: `indicator-${key}`,
    category: "indicators",
    front: `${info.name}\nHow do you read this indicator?`,
    back: `${info.howToRead}\n\n📈 Bull: ${info.bullSignal}\n📉 Bear: ${info.bearSignal}`,
    hint: info.bestFor,
  }),
);

export const FLASHCARDS: FlashcardItem[] = [...glossaryCards, ...indicatorCards];

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  basics: { label: "Basics", color: "text-blue-400" },
  orders: { label: "Orders", color: "text-emerald-400" },
  indicators: { label: "Indicators", color: "text-amber-400" },
  risk: { label: "Risk", color: "text-rose-400" },
  fundamental: { label: "Fundamental", color: "text-purple-400" },
};
