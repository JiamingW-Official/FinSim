import type { Metadata } from "next";
import { PredictionsPageClient } from "./PredictionsPageClient";

export const metadata: Metadata = {
  title: "Prediction Markets Training",
  description:
    "Train probabilistic thinking with binary prediction markets on Fed decisions, earnings surprises, and macro events. Connect prediction markets to options pricing theory.",
};

export default function PredictionsPage() {
  return <PredictionsPageClient />;
}
