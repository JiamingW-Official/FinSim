import type { FullExport, GameStateExport, LearnProgressExport, TradingStateExport } from "./export-service";

export interface ImportResult {
  success: boolean;
  error?: string;
}

/**
 * Type guard: checks that `data` conforms to the FullExport schema.
 * Validates the presence and types of all required top-level fields.
 */
export function validateExport(data: unknown): data is FullExport {
  if (typeof data !== "object" || data === null) return false;

  const obj = data as Record<string, unknown>;

  if (obj.version !== 1) return false;
  if (obj.appName !== "FinSim") return false;
  if (typeof obj.exportedAt !== "string") return false;

  // Validate game section
  if (!validateGameSection(obj.game)) return false;

  // Validate learn section
  if (!validateLearnSection(obj.learn)) return false;

  // Validate trading section
  if (!validateTradingSection(obj.trading)) return false;

  return true;
}

function validateGameSection(game: unknown): game is GameStateExport {
  if (typeof game !== "object" || game === null) return false;
  const g = game as Record<string, unknown>;
  if (typeof g.xp !== "number") return false;
  if (typeof g.level !== "number") return false;
  if (typeof g.title !== "string") return false;
  if (!Array.isArray(g.achievements)) return false;
  if (typeof g.stats !== "object" || g.stats === null) return false;
  return true;
}

function validateLearnSection(learn: unknown): learn is LearnProgressExport {
  if (typeof learn !== "object" || learn === null) return false;
  const l = learn as Record<string, unknown>;
  if (!Array.isArray(l.completedLessons)) return false;
  if (typeof l.lessonScores !== "object" || l.lessonScores === null) return false;
  if (typeof l.learningStreak !== "number") return false;
  if (typeof l.lastLearnDate !== "string") return false;
  return true;
}

function validateTradingSection(trading: unknown): trading is TradingStateExport {
  if (typeof trading !== "object" || trading === null) return false;
  const t = trading as Record<string, unknown>;
  if (typeof t.cash !== "number") return false;
  if (typeof t.portfolioValue !== "number") return false;
  if (!Array.isArray(t.tradeHistory)) return false;
  if (!Array.isArray(t.equityHistory)) return false;
  return true;
}

/**
 * Parses a JSON string and returns the parsed object, or null on failure.
 */
function safeParse(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Writes a Zustand persist payload back to localStorage.
 * Merges new state into the existing zustand wrapper structure so that
 * the persist middleware can rehydrate it on next load.
 */
function writeToLocalStorage(key: string, state: Record<string, unknown>): void {
  const existing = localStorage.getItem(key);
  let wrapper: { state: Record<string, unknown>; version: number } = { state: {}, version: 0 };
  if (existing) {
    try {
      wrapper = JSON.parse(existing);
    } catch {
      wrapper = { state: {}, version: 0 };
    }
  }
  wrapper.state = { ...wrapper.state, ...state };
  localStorage.setItem(key, JSON.stringify(wrapper));
}

/**
 * Validates a JSON string and imports data back into localStorage for all stores.
 * Returns a result object indicating success or the reason for failure.
 *
 * After calling this function the caller should reload the page (or re-hydrate
 * all stores) so the new data takes effect.
 */
export function importData(jsonString: string): ImportResult {
  const parsed = safeParse(jsonString);

  if (parsed === null) {
    return { success: false, error: "Invalid JSON. The file could not be parsed." };
  }

  if (!validateExport(parsed)) {
    return {
      success: false,
      error:
        "File format is not recognized. Make sure you are importing a FinSim export file (version 1).",
    };
  }

  try {
    // Write game store state
    writeToLocalStorage("alpha-deck-game", {
      xp: parsed.game.xp,
      level: parsed.game.level,
      title: parsed.game.title,
      achievements: parsed.game.achievements,
      stats: parsed.game.stats,
    });

    // Write learn store state
    writeToLocalStorage("alpha-deck-learn", {
      completedLessons: parsed.learn.completedLessons,
      lessonScores: parsed.learn.lessonScores,
      learningStreak: parsed.learn.learningStreak,
      lastLearnDate: parsed.learn.lastLearnDate,
      dailyGoal: parsed.learn.dailyGoal ?? 3,
    });

    // Write trading store state
    writeToLocalStorage("alpha-deck-trading", {
      cash: parsed.trading.cash,
      portfolioValue: parsed.trading.portfolioValue,
      tradeHistory: parsed.trading.tradeHistory,
      equityHistory: parsed.trading.equityHistory,
      // Preserve fields not included in the export snapshot
      positions: [],
      orders: [],
      pendingOrders: [],
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Failed to write imported data: ${message}` };
  }
}
