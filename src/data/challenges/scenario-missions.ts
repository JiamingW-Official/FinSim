import { generateRealisticBars } from "@/data/lessons/practice-data";
import type { PracticeBar } from "@/data/lessons/types";
import type { ScenarioDefinition } from "@/types/challenges";

/**
 * Concatenate two bar-gen runs into one seamless price series.
 * The second segment starts at the last close of the first segment.
 */
function concatBars(a: PracticeBar[], b: PracticeBar[]): PracticeBar[] {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  const lastClose = a[a.length - 1].close;
  const ratio = lastClose / b[0].open;
  return [
    ...a,
    ...b.map((bar) => ({
      open: +(bar.open * ratio).toFixed(2),
      high: +(bar.high * ratio).toFixed(2),
      low: +(bar.low * ratio).toFixed(2),
      close: +(bar.close * ratio).toFixed(2),
      volume: bar.volume,
    })),
  ];
}

export const SCENARIO_MISSIONS: ScenarioDefinition[] = [
  {
    id: "2008-crisis",
    name: "2008 Financial Crisis",
    subtitle: "The Great Recession",
    description:
      "Lehman Brothers has collapsed. Markets are in freefall. Banks are failing, and panic is spreading across Wall Street. Can you navigate the crash and protect your portfolio — or even profit from the chaos?",
    icon: "TrendingDown",
    difficulty: 4,
    unlockLevel: 5,
    xpReward: 200,
    challenge: {
      priceData: generateRealisticBars({
        count: 60, startPrice: 130, seed: 8001,
        drift: -0.008, volatility: 0.035,
        meanReversion: 0.02, target: 75,
        momentumBias: 0.6,
        patterns: [
          { bar: 10, type: "bearish-engulfing" },
          { bar: 30, type: "hammer" },
          { bar: 45, type: "doji" },
        ],
        support: [75],
      }),
      initialReveal: 15,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 10 },
        { kind: "sell", minQuantity: 10 },
        { kind: "profit-target", minProfit: 100 },
      ],
      availableIndicators: [
        { id: "sma20", label: "SMA 20" },
        { id: "volume", label: "Volume" },
      ],
      hint: "Wait for the selling to exhaust near support, then buy the reversal.",
    },
    gradingThresholds: { S: 5, A: 2, B: 0 },
  },
  {
    id: "covid-crash",
    name: "COVID Crash & Recovery",
    subtitle: "March 2020",
    description:
      "A global pandemic has just been declared. Markets plunge 30% in weeks — the fastest bear market in history. But then the Fed steps in. Can you catch the V-shaped recovery?",
    icon: "Activity",
    difficulty: 3,
    unlockLevel: 3,
    xpReward: 150,
    challenge: {
      // Two-phase: sharp drop then V-recovery
      priceData: concatBars(
        generateRealisticBars({
          count: 25, startPrice: 100, seed: 8002,
          drift: -0.012, volatility: 0.030,
          meanReversion: 0.01, target: 70,
          momentumBias: 0.65,
          patterns: [{ bar: 5, type: "bearish-engulfing" }],
        }),
        generateRealisticBars({
          count: 35, startPrice: 70, seed: 8003,
          drift: 0.010, volatility: 0.025,
          meanReversion: 0.04, target: 105,
          momentumBias: 0.6,
          patterns: [{ bar: 2, type: "hammer" }, { bar: 3, type: "bullish-engulfing" }],
          support: [68],
        }),
      ),
      initialReveal: 15,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 10 },
        { kind: "profit-target", minProfit: 80 },
      ],
      availableIndicators: [
        { id: "sma20", label: "SMA 20" },
        { id: "rsi", label: "RSI" },
      ],
      hint: "The crash creates opportunity. Buy near the bottom for maximum gains.",
    },
    gradingThresholds: { S: 8, A: 4, B: 1 },
  },
  {
    id: "gme-squeeze",
    name: "GME Short Squeeze",
    subtitle: "Meme Stock Mania",
    description:
      "Reddit's WallStreetBets has declared war on short sellers. GME is going parabolic. The volatility is extreme — fortunes are made and lost in minutes. Can you time the squeeze?",
    icon: "Rocket",
    difficulty: 5,
    unlockLevel: 8,
    xpReward: 250,
    challenge: {
      // Consolidation → explosive squeeze → crash
      priceData: concatBars(
        generateRealisticBars({
          count: 15, startPrice: 20, seed: 8004,
          drift: 0.005, volatility: 0.015,
          meanReversion: 0.05, target: 25,
          momentumBias: 0.5,
          consolidation: [{ start: 0, end: 10, tightness: 0.4 }],
        }),
        concatBars(
          generateRealisticBars({
            count: 15, startPrice: 25, seed: 8005,
            drift: 0.040, volatility: 0.045,
            meanReversion: 0.0, target: 200,
            momentumBias: 0.8,
          }),
          generateRealisticBars({
            count: 20, startPrice: 180, seed: 8006,
            drift: -0.025, volatility: 0.040,
            meanReversion: 0.05, target: 50,
            momentumBias: 0.6,
            patterns: [{ bar: 3, type: "bearish-engulfing" }],
          }),
        ),
      ),
      initialReveal: 12,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 10 },
        { kind: "sell", minQuantity: 10 },
        { kind: "profit-target", minProfit: 200 },
      ],
      availableIndicators: [
        { id: "volume", label: "Volume" },
        { id: "bollinger", label: "Bollinger Bands" },
      ],
      hint: "Ride the squeeze up, but don't forget to sell before the crash!",
    },
    gradingThresholds: { S: 15, A: 8, B: 2 },
  },
  {
    id: "rate-hikes",
    name: "2022 Rate Hikes",
    subtitle: "The Fed Fights Inflation",
    description:
      "Inflation has hit 40-year highs. The Fed is raising rates aggressively. Tech stocks are getting crushed. Can you navigate this choppy bear market?",
    icon: "Percent",
    difficulty: 4,
    unlockLevel: 10,
    xpReward: 200,
    challenge: {
      priceData: concatBars(
        generateRealisticBars({
          count: 35, startPrice: 180, seed: 8007,
          drift: -0.004, volatility: 0.020,
          meanReversion: 0.02, target: 140,
          momentumBias: 0.55,
          patterns: [
            { bar: 8, type: "shooting-star" },
            { bar: 20, type: "doji" },
          ],
          resistance: [185],
        }),
        generateRealisticBars({
          count: 35, startPrice: 140, seed: 8008,
          drift: 0.001, volatility: 0.016,
          meanReversion: 0.06, target: 142,
          momentumBias: 0.45,
          consolidation: [{ start: 5, end: 25, tightness: 0.5 }],
          support: [135],
          resistance: [148],
        }),
      ),
      initialReveal: 15,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 10 },
        { kind: "sell", minQuantity: 10 },
        { kind: "profit-target", minProfit: 50 },
      ],
      availableIndicators: [
        { id: "sma20", label: "SMA 20" },
        { id: "macd", label: "MACD" },
      ],
      hint: "Trade the range in the consolidation phase. Patience is key.",
    },
    gradingThresholds: { S: 4, A: 2, B: 0 },
  },
  {
    id: "nvda-ai-bull",
    name: "NVDA AI Bull Run",
    subtitle: "The AI Revolution",
    description:
      "ChatGPT has taken the world by storm. NVIDIA's GPUs are powering the AI revolution, and the stock is on a tear. Can you ride the trend without buying at the top?",
    icon: "Cpu",
    difficulty: 3,
    unlockLevel: 5,
    xpReward: 150,
    challenge: {
      priceData: generateRealisticBars({
        count: 60, startPrice: 150, seed: 8009,
        drift: 0.006, volatility: 0.018,
        meanReversion: 0.02, target: 250,
        momentumBias: 0.6,
        patterns: [
          { bar: 15, type: "hammer" },
          { bar: 30, type: "doji" },
          { bar: 45, type: "bullish-engulfing" },
        ],
        support: [145, 180],
      }),
      initialReveal: 15,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 5 },
        { kind: "advance-time", bars: 20 },
        { kind: "profit-target", minProfit: 100 },
      ],
      availableIndicators: [
        { id: "sma20", label: "SMA 20" },
        { id: "rsi", label: "RSI" },
      ],
      hint: "Buy on pullbacks to support and let the trend work for you.",
    },
    gradingThresholds: { S: 8, A: 4, B: 1 },
  },
  {
    id: "election-2024",
    name: "2024 Election Trade",
    subtitle: "Political Volatility",
    description:
      "Election night is approaching. Markets are jittery with uncertainty. Polls are tight, and sectors are swinging wildly. Can you position yourself for the post-election breakout?",
    icon: "Vote",
    difficulty: 4,
    unlockLevel: 8,
    xpReward: 200,
    challenge: {
      // Pre-election consolidation → post-election breakout
      priceData: concatBars(
        generateRealisticBars({
          count: 25, startPrice: 100, seed: 8010,
          drift: 0.0, volatility: 0.012,
          meanReversion: 0.08, target: 100,
          momentumBias: 0.45,
          consolidation: [{ start: 0, end: 20, tightness: 0.4 }],
          support: [97],
          resistance: [103],
        }),
        generateRealisticBars({
          count: 25, startPrice: 103, seed: 8011,
          drift: 0.008, volatility: 0.022,
          meanReversion: 0.02, target: 118,
          momentumBias: 0.65,
          patterns: [{ bar: 0, type: "bullish-engulfing" }],
        }),
      ),
      initialReveal: 15,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 10 },
        { kind: "sell", minQuantity: 10 },
        { kind: "profit-target", minProfit: 80 },
      ],
      availableIndicators: [
        { id: "bollinger", label: "Bollinger Bands" },
        { id: "volume", label: "Volume" },
      ],
      hint: "Buy on the breakout above resistance and ride the momentum.",
    },
    gradingThresholds: { S: 6, A: 3, B: 0 },
  },
  {
    id: "earnings-roulette",
    name: "Earnings Roulette",
    subtitle: "Post-Earnings Drift",
    description:
      "Earnings are due after the bell. The stock is trading in a tight range. Will it gap up or gap down? Can you profit regardless of the direction?",
    icon: "Dices",
    difficulty: 3,
    unlockLevel: 3,
    xpReward: 150,
    challenge: {
      // Tight pre-earnings → gap up → continuation
      priceData: concatBars(
        generateRealisticBars({
          count: 15, startPrice: 100, seed: 8012,
          drift: 0.0, volatility: 0.008,
          meanReversion: 0.1, target: 100,
          momentumBias: 0.45,
          consolidation: [{ start: 0, end: 14, tightness: 0.3 }],
        }),
        generateRealisticBars({
          count: 25, startPrice: 110, seed: 8013,
          drift: 0.004, volatility: 0.018,
          meanReversion: 0.03, target: 118,
          momentumBias: 0.55,
          patterns: [{ bar: 8, type: "shooting-star" }],
          resistance: [120],
        }),
      ),
      initialReveal: 10,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 10 },
        { kind: "sell", minQuantity: 10 },
        { kind: "profit-target", minProfit: 50 },
      ],
      availableIndicators: [
        { id: "volume", label: "Volume" },
        { id: "sma20", label: "SMA 20" },
      ],
      hint: "Buy after the gap-up and sell before the next resistance.",
    },
    gradingThresholds: { S: 5, A: 3, B: 0 },
  },
  {
    id: "flash-crash",
    name: "Flash Crash",
    subtitle: "Algorithmic Chaos",
    description:
      "Algorithms have gone haywire. The market just dropped 6% in 5 minutes. Liquidity has evaporated. But flash crashes recover fast — can you catch the snap-back?",
    icon: "AlertTriangle",
    difficulty: 5,
    unlockLevel: 12,
    xpReward: 250,
    challenge: {
      // Normal → spike down → rapid recovery
      priceData: concatBars(
        generateRealisticBars({
          count: 15, startPrice: 200, seed: 8014,
          drift: 0.001, volatility: 0.010,
          meanReversion: 0.05, target: 200,
          momentumBias: 0.5,
        }),
        concatBars(
          generateRealisticBars({
            count: 10, startPrice: 200, seed: 8015,
            drift: -0.020, volatility: 0.040,
            meanReversion: 0.0, target: 160,
            momentumBias: 0.7,
          }),
          generateRealisticBars({
            count: 25, startPrice: 165, seed: 8016,
            drift: 0.012, volatility: 0.025,
            meanReversion: 0.06, target: 198,
            momentumBias: 0.6,
            patterns: [{ bar: 2, type: "hammer" }, { bar: 3, type: "bullish-engulfing" }],
            support: [162],
          }),
        ),
      ),
      initialReveal: 12,
      startingCash: 10000,
      objectives: [
        { kind: "buy", minQuantity: 5 },
        { kind: "sell", minQuantity: 5 },
        { kind: "profit-target", minProfit: 150 },
      ],
      availableIndicators: [
        { id: "rsi", label: "RSI" },
        { id: "volume", label: "Volume" },
      ],
      hint: "Buy during the flash crash when RSI is extremely oversold.",
    },
    gradingThresholds: { S: 10, A: 5, B: 1 },
  },
];
