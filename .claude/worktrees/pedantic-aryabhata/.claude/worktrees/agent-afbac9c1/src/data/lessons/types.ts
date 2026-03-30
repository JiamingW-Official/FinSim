export type StepType = "teach" | "quiz-mc" | "quiz-tf" | "quiz-scenario" | "practice";

export type VisualType =
  | "candlestick"
  | "order-flow"
  | "indicator-chart"
  | "risk-pyramid"
  | "portfolio-pie";

export interface TeachStep {
  type: "teach";
  title: string;
  content: string;
  visual?: VisualType;
  highlight?: string[];
}

export interface QuizMCStep {
  type: "quiz-mc";
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  difficulty?: 1 | 2 | 3;
}

export interface QuizTFStep {
  type: "quiz-tf";
  statement: string;
  correct: boolean;
  explanation: string;
  difficulty?: 1 | 2 | 3;
}

export interface QuizScenarioStep {
  type: "quiz-scenario";
  scenario: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  difficulty?: 1 | 2 | 3;
}

export type PracticeObjective =
  | { kind: "buy"; minQuantity: number }
  | { kind: "sell"; minQuantity: number }
  | { kind: "advance-time"; bars: number }
  | { kind: "toggle-indicator"; indicator: string }
  | { kind: "profit-target"; minProfit: number }
  | { kind: "stop-loss"; maxLoss: number };

export interface PracticeBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PracticeChallenge {
  priceData: PracticeBar[];
  initialReveal: number;
  objectives: PracticeObjective[];
  hint?: string;
  startingCash?: number;
  availableIndicators?: Array<{ id: string; label: string }>;
}

export interface PracticeStep {
  type: "practice";
  instruction: string;
  objective: string;
  actionType: "navigate" | "buy" | "sell" | "indicator" | "observe";
  challenge?: PracticeChallenge;
}

export type LessonStep =
  | TeachStep
  | QuizMCStep
  | QuizTFStep
  | QuizScenarioStep
  | PracticeStep;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  steps: LessonStep[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}
