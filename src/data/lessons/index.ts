import type { Unit, Lesson } from "./types";
import { UNIT_BASICS } from "./unit-basics";
import { UNIT_ORDERS } from "./unit-orders";
import { UNIT_INDICATORS } from "./unit-indicators";
import { UNIT_RISK } from "./unit-risk";
import { UNIT_FUNDAMENTALS } from "./unit-fundamentals";
import { UNIT_PERSONAL_FINANCE } from "./unit-personal-finance";
import { UNIT_PERSONAL_FINANCE_FUNDAMENTALS } from "./unit-personal-finance-fundamentals";
import { UNIT_OPTIONS_STRATEGIES_PRACTICE } from "./unit-options-strategies-practice";
import { UNIT_MACRO_TRADING } from "./unit-macro-trading";
import { UNIT_CRYPTO_TRADING } from "./unit-crypto-trading";
import { UNIT_ADVANCED_TECHNICAL_ANALYSIS } from "./unit-advanced-technical-analysis";
import { UNIT_PORTFOLIO_CONSTRUCTION } from "./unit-portfolio-construction";
import { UNIT_PERSONAL_FINANCE_MASTERY } from "./unit-personal-finance-mastery";
import { UNIT_BEHAVIORAL_FINANCE } from "./unit-behavioral-finance";
import { UNIT_OPTIONS_PRICING_THEORY } from "./unit-options-pricing-theory";
import { UNIT_QUANTITATIVE_FINANCE } from "./unit-quantitative-finance";
import { UNIT_INVESTMENT_BANKING } from "./unit-investment-banking";
import { UNIT_RISK_MANAGEMENT_MASTERY } from "./unit-risk-management-mastery";
import { UNIT_TRADING_PSYCHOLOGY } from "./unit-trading-psychology";
import { UNIT_TECHNICAL_ANALYSIS_MASTERY } from "./unit-technical-analysis-mastery";
import { UNIT_ADVANCED_OPTIONS } from "./unit-advanced-options";
import { UNIT_INTERNATIONAL_MARKETS } from "./unit-international-markets";
import { UNIT_ESG_INVESTING } from "./unit-esg-investing";
import { UNIT_CRYPTO_DEFI } from "./unit-crypto-defi";
import { UNIT_FIXED_INCOME } from "./unit-fixed-income";
import { UNIT_DERIVATIVES_ADVANCED } from "./unit-derivatives-advanced";

export const UNITS: Unit[] = [
  UNIT_BASICS,
  UNIT_ORDERS,
  UNIT_INDICATORS,
  UNIT_RISK,
  UNIT_FUNDAMENTALS,
  UNIT_PERSONAL_FINANCE,
  UNIT_PERSONAL_FINANCE_FUNDAMENTALS,
  UNIT_OPTIONS_STRATEGIES_PRACTICE,
  UNIT_MACRO_TRADING,
  UNIT_CRYPTO_TRADING,
  UNIT_ADVANCED_TECHNICAL_ANALYSIS,
  UNIT_PORTFOLIO_CONSTRUCTION,
  UNIT_PERSONAL_FINANCE_MASTERY,
  UNIT_BEHAVIORAL_FINANCE,
  UNIT_OPTIONS_PRICING_THEORY,
  UNIT_QUANTITATIVE_FINANCE,
  UNIT_INVESTMENT_BANKING,
  UNIT_RISK_MANAGEMENT_MASTERY,
  UNIT_TRADING_PSYCHOLOGY,
  UNIT_TECHNICAL_ANALYSIS_MASTERY,
  UNIT_ADVANCED_OPTIONS,
  UNIT_INTERNATIONAL_MARKETS,
  UNIT_ESG_INVESTING,
  UNIT_CRYPTO_DEFI,
  UNIT_FIXED_INCOME,
  UNIT_DERIVATIVES_ADVANCED,
];

export function getLessonById(lessonId: string): Lesson | undefined {
  for (const unit of UNITS) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getUnitForLesson(lessonId: string): Unit | undefined {
  return UNITS.find((u) => u.lessons.some((l) => l.id === lessonId));
}

export function isLessonUnlocked(
  lessonId: string,
  completedLessons: string[],
): boolean {
  for (const unit of UNITS) {
    const unitIndex = UNITS.indexOf(unit);
    const lessonIndex = unit.lessons.findIndex((l) => l.id === lessonId);

    if (lessonIndex === -1) continue;

    // First lesson of first unit is always unlocked
    if (unitIndex === 0 && lessonIndex === 0) return true;

    // First lesson of a unit: requires all lessons of previous unit completed
    if (lessonIndex === 0 && unitIndex > 0) {
      const prevUnit = UNITS[unitIndex - 1];
      return prevUnit.lessons.every((l) => completedLessons.includes(l.id));
    }

    // Other lessons: require previous lesson in same unit completed
    const prevLesson = unit.lessons[lessonIndex - 1];
    return completedLessons.includes(prevLesson.id);
  }

  return false;
}

export type { Unit, Lesson, LessonStep, StepType, VisualType } from "./types";
export type {
  TeachStep,
  QuizMCStep,
  QuizTFStep,
  QuizScenarioStep,
  PracticeStep,
} from "./types";
