import type { Unit, Lesson } from "./types";
import { UNIT_BASICS } from "./unit-basics";
import { UNIT_ORDERS } from "./unit-orders";
import { UNIT_INDICATORS } from "./unit-indicators";
import { UNIT_RISK } from "./unit-risk";
import { UNIT_FUNDAMENTALS } from "./unit-fundamentals";
import { UNIT_PERSONAL_FINANCE } from "./unit-personal-finance";
import { UNIT_CRYPTO } from "./unit-crypto";
import { UNIT_ADVANCED_OPTIONS } from "./unit-advanced-options";
import { UNIT_QUANT_FINANCE } from "./unit-quant-finance";

export const UNITS: Unit[] = [
  UNIT_BASICS,
  UNIT_ORDERS,
  UNIT_INDICATORS,
  UNIT_RISK,
  UNIT_FUNDAMENTALS,
  UNIT_PERSONAL_FINANCE,
  UNIT_CRYPTO,
  UNIT_ADVANCED_OPTIONS,
  UNIT_QUANT_FINANCE,
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
