export interface TierAchievement {
  id: string;
  name: string;
  description: string;
}

export interface TierRequirements {
  tradesCompleted: number;
  minSharpe: number | null;
  behaviorScore: number | null;
  completedLessons: number;
  additionalNotes?: string;
}

export interface TierDefinition {
  name: string;
  level: number;
  description: string;
  unlockedFeatures: string[];
  requirements: TierRequirements;
  color: string;
  icon: string;
  achievements: TierAchievement[];
}
