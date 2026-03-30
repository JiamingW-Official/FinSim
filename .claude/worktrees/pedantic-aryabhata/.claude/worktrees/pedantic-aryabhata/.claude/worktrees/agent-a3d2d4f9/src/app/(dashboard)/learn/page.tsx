import type { Metadata } from "next";
import { LearnPageClient } from "./LearnPageClient";

export const metadata: Metadata = {
  title: "Options Education | Learn Trading",
  description:
    "Structured trading education from candlestick basics to options pricing theory. Interactive quizzes, flashcards, and hands-on simulators covering 50+ lessons.",
};

export default function LearnPage() {
  return <LearnPageClient />;
}
