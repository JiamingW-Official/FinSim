export type TierName =
  | "Cadet"
  | "First Officer"
  | "Captain"
  | "Commander"
  | "Alpha";

export interface TierRequirement {
  tradesCompleted: number;
  minSharpe: number | null;
  behaviorScore: number | null;
  completedLessons: number;
  /** Human-readable description of additional requirements */
  additionalNotes?: string;
}

export interface TierAchievement {
  id: string;
  name: string;
  description: string;
}

export interface TierDefinition {
  name: TierName;
  /** Ordinal level 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  description: string;
  unlockedFeatures: string[];
  requirements: TierRequirement;
  /** Tailwind color token used for accent/border (e.g. "blue-400") */
  color: string;
  /** Lucide icon name */
  icon: string;
  achievements: TierAchievement[];
}
