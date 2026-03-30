export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: "trade" | "learn" | "explore" | "social";
  target: number;
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
  icon: string;
}

// Generate 5 daily missions based on today's date
export function getDailyMissions(dateStr: string): DailyMission[] {
  // Seeded by date so missions are consistent for a day
  let seed = dateStr.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  const allMissions: DailyMission[] = [
    {
      id: "m_trade_3",
      title: "Active Trader",
      description: "Complete 3 trades today",
      type: "trade",
      target: 3,
      xpReward: 50,
      difficulty: "easy",
      icon: "chart",
    },
    {
      id: "m_profit_trade",
      title: "In the Green",
      description: "Close a profitable trade",
      type: "trade",
      target: 1,
      xpReward: 75,
      difficulty: "easy",
      icon: "trend-up",
    },
    {
      id: "m_lesson_2",
      title: "Scholar",
      description: "Complete 2 lessons",
      type: "learn",
      target: 2,
      xpReward: 100,
      difficulty: "medium",
      icon: "book",
    },
    {
      id: "m_flashcards_20",
      title: "Memory Master",
      description: "Review 20 flashcards",
      type: "learn",
      target: 20,
      xpReward: 60,
      difficulty: "easy",
      icon: "cards",
    },
    {
      id: "m_options_trade",
      title: "Options Explorer",
      description: "Make an options trade",
      type: "trade",
      target: 1,
      xpReward: 150,
      difficulty: "hard",
      icon: "options",
    },
    {
      id: "m_beat_bs",
      title: "Quant Challenge",
      description: "Complete a Beat BS challenge",
      type: "explore",
      target: 1,
      xpReward: 120,
      difficulty: "medium",
      icon: "brain",
    },
    {
      id: "m_win_streak",
      title: "Winning Streak",
      description: "Win 3 trades in a row",
      type: "trade",
      target: 3,
      xpReward: 200,
      difficulty: "hard",
      icon: "fire",
    },
    {
      id: "m_explore_arena",
      title: "Arena Fighter",
      description: "Try the Black Swan Arena",
      type: "explore",
      target: 1,
      xpReward: 100,
      difficulty: "medium",
      icon: "shield",
    },
    {
      id: "m_glossary",
      title: "Word Nerd",
      description: "Look up 5 glossary terms",
      type: "learn",
      target: 5,
      xpReward: 40,
      difficulty: "easy",
      icon: "book-open",
    },
    {
      id: "m_prediction",
      title: "Oracle",
      description: "Make a prediction market bet",
      type: "explore",
      target: 1,
      xpReward: 80,
      difficulty: "easy",
      icon: "crystal",
    },
  ];

  // Pick 5 random missions for today
  const shuffled = [...allMissions].sort(() => rand() - 0.5);
  return shuffled.slice(0, 5);
}

export function getDailyProgressKey(dateStr: string): string {
  return `finsim_daily_progress_${dateStr}`;
}

export function loadDailyProgress(dateStr: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getDailyProgressKey(dateStr));
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function saveDailyProgress(
  dateStr: string,
  progress: Record<string, number>,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getDailyProgressKey(dateStr), JSON.stringify(progress));
  } catch {
    // ignore
  }
}
