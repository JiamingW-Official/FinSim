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
        count: 80, startPrice: 130, seed: 8001,
        drift: -0.008, volatility: 0.035,
        meanReversion: 0.02, target: 75,
        momentumBias: 0.6,
        consolidation: [
          { start: 30, end: 40, tightness: 0.45 },
          { start: 60, end: 68, tightness: 0.5 },
        ],
        patterns: [
          { bar: 8, type: "shooting-star" },
          { bar: 10, type: "bearish-engulfing" },
          { bar: 25, type: "doji" },
          { bar: 38, type: "hammer" },
          { bar: 50, type: "bearish-engulfing" },
          { bar: 65, type: "hammer" },
          { bar: 70, type: "bullish-engulfing" },
        ],
        support: [75, 85, 95],
        resistance: [120, 130],
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
          count: 35, startPrice: 100, seed: 8002,
          drift: -0.010, volatility: 0.028,
          meanReversion: 0.01, target: 68,
          momentumBias: 0.65,
          patterns: [
            { bar: 3, type: "shooting-star" },
            { bar: 5, type: "bearish-engulfing" },
            { bar: 15, type: "doji" },
            { bar: 22, type: "bearish-engulfing" },
            { bar: 30, type: "hammer" },
          ],
          consolidation: [{ start: 12, end: 18, tightness: 0.5 }],
          support: [70, 78],
          resistance: [98],
        }),
        generateRealisticBars({
          count: 45, startPrice: 68, seed: 8003,
          drift: 0.008, volatility: 0.022,
          meanReversion: 0.04, target: 108,
          momentumBias: 0.6,
          patterns: [
            { bar: 1, type: "hammer" },
            { bar: 2, type: "bullish-engulfing" },
            { bar: 15, type: "doji" },
            { bar: 25, type: "hammer" },
            { bar: 35, type: "shooting-star" },
            { bar: 40, type: "bullish-engulfing" },
          ],
          consolidation: [{ start: 18, end: 26, tightness: 0.45 }],
          support: [66, 75, 85],
          resistance: [95, 105],
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
          count: 20, startPrice: 20, seed: 8004,
          drift: 0.004, volatility: 0.014,
          meanReversion: 0.05, target: 25,
          momentumBias: 0.5,
          consolidation: [{ start: 0, end: 14, tightness: 0.35 }],
          patterns: [
            { bar: 5, type: "doji" },
            { bar: 10, type: "doji" },
            { bar: 16, type: "bullish-engulfing" },
          ],
          support: [18],
          resistance: [24],
        }),
        concatBars(
          generateRealisticBars({
            count: 20, startPrice: 25, seed: 8005,
            drift: 0.035, volatility: 0.042,
            meanReversion: 0.0, target: 200,
            momentumBias: 0.8,
            patterns: [
              { bar: 3, type: "bullish-engulfing" },
              { bar: 8, type: "hammer" },
              { bar: 12, type: "bullish-engulfing" },
            ],
          }),
          generateRealisticBars({
            count: 25, startPrice: 180, seed: 8006,
            drift: -0.022, volatility: 0.038,
            meanReversion: 0.04, target: 50,
            momentumBias: 0.65,
            patterns: [
              { bar: 1, type: "shooting-star" },
              { bar: 3, type: "bearish-engulfing" },
              { bar: 10, type: "doji" },
              { bar: 15, type: "hammer" },
              { bar: 20, type: "bearish-engulfing" },
            ],
            consolidation: [{ start: 12, end: 18, tightness: 0.5 }],
            support: [55, 80],
            resistance: [140, 175],
          }),
        ),
      ),
      initialReveal: 15,
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
      // Phase 1: Sell-off with bear rallies, Phase 2: Choppy consolidation bottom
      priceData: concatBars(
        generateRealisticBars({
          count: 45, startPrice: 180, seed: 8007,
          drift: -0.004, volatility: 0.020,
          meanReversion: 0.02, target: 138,
          momentumBias: 0.55,
          patterns: [
            { bar: 5, type: "shooting-star" },
            { bar: 8, type: "bearish-engulfing" },
            { bar: 18, type: "hammer" },
            { bar: 20, type: "doji" },
            { bar: 28, type: "shooting-star" },
            { bar: 35, type: "bearish-engulfing" },
            { bar: 40, type: "hammer" },
          ],
          consolidation: [
            { start: 15, end: 22, tightness: 0.45 },
          ],
          support: [140, 155],
          resistance: [175, 185],
        }),
        generateRealisticBars({
          count: 45, startPrice: 138, seed: 8008,
          drift: 0.001, volatility: 0.016,
          meanReversion: 0.06, target: 142,
          momentumBias: 0.45,
          patterns: [
            { bar: 3, type: "hammer" },
            { bar: 8, type: "bullish-engulfing" },
            { bar: 18, type: "shooting-star" },
            { bar: 22, type: "doji" },
            { bar: 30, type: "hammer" },
            { bar: 38, type: "bullish-engulfing" },
          ],
          consolidation: [
            { start: 5, end: 15, tightness: 0.45 },
            { start: 28, end: 35, tightness: 0.5 },
          ],
          support: [132, 136],
          resistance: [145, 150],
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
      // Strong uptrend with healthy pullbacks and consolidation — classic momentum stock
      priceData: generateRealisticBars({
        count: 80, startPrice: 150, seed: 8009,
        drift: 0.005, volatility: 0.016,
        meanReversion: 0.02, target: 260,
        momentumBias: 0.62,
        patterns: [
          { bar: 10, type: "hammer" },
          { bar: 15, type: "bullish-engulfing" },
          { bar: 28, type: "doji" },
          { bar: 30, type: "hammer" },
          { bar: 42, type: "shooting-star" },
          { bar: 48, type: "doji" },
          { bar: 55, type: "bullish-engulfing" },
          { bar: 68, type: "hammer" },
          { bar: 75, type: "shooting-star" },
        ],
        consolidation: [
          { start: 25, end: 34, tightness: 0.4 },
          { start: 55, end: 62, tightness: 0.45 },
        ],
        support: [145, 175, 210],
        resistance: [200, 250],
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
      // Phase 1: Pre-election tight range, Phase 2: Post-election breakout rally
      priceData: concatBars(
        generateRealisticBars({
          count: 35, startPrice: 100, seed: 8010,
          drift: 0.0, volatility: 0.010,
          meanReversion: 0.08, target: 100,
          momentumBias: 0.45,
          consolidation: [
            { start: 0, end: 15, tightness: 0.35 },
            { start: 20, end: 30, tightness: 0.4 },
          ],
          patterns: [
            { bar: 8, type: "doji" },
            { bar: 15, type: "shooting-star" },
            { bar: 20, type: "hammer" },
            { bar: 28, type: "doji" },
          ],
          support: [96, 98],
          resistance: [102, 104],
        }),
        generateRealisticBars({
          count: 35, startPrice: 104, seed: 8011,
          drift: 0.007, volatility: 0.020,
          meanReversion: 0.02, target: 120,
          momentumBias: 0.65,
          patterns: [
            { bar: 0, type: "bullish-engulfing" },
            { bar: 5, type: "hammer" },
            { bar: 12, type: "doji" },
            { bar: 18, type: "shooting-star" },
            { bar: 22, type: "hammer" },
            { bar: 30, type: "bullish-engulfing" },
          ],
          consolidation: [{ start: 15, end: 22, tightness: 0.45 }],
          support: [104, 110],
          resistance: [118, 122],
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
      // Phase 1: Tight pre-earnings consolidation, Phase 2: Gap up + continuation drift
      priceData: concatBars(
        generateRealisticBars({
          count: 22, startPrice: 100, seed: 8012,
          drift: 0.0, volatility: 0.007,
          meanReversion: 0.1, target: 100,
          momentumBias: 0.45,
          consolidation: [{ start: 0, end: 20, tightness: 0.25 }],
          patterns: [
            { bar: 5, type: "doji" },
            { bar: 10, type: "doji" },
            { bar: 15, type: "doji" },
            { bar: 18, type: "hammer" },
          ],
          support: [98],
          resistance: [102],
        }),
        generateRealisticBars({
          count: 38, startPrice: 110, seed: 8013,
          drift: 0.004, volatility: 0.016,
          meanReversion: 0.03, target: 120,
          momentumBias: 0.55,
          patterns: [
            { bar: 0, type: "bullish-engulfing" },
            { bar: 5, type: "hammer" },
            { bar: 12, type: "doji" },
            { bar: 18, type: "shooting-star" },
            { bar: 25, type: "hammer" },
            { bar: 30, type: "bullish-engulfing" },
          ],
          consolidation: [{ start: 15, end: 22, tightness: 0.4 }],
          support: [108, 112],
          resistance: [118, 122],
        }),
      ),
      initialReveal: 12,
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
      // Phase 1: Normal calm trading, Phase 2: Violent crash, Phase 3: Snap-back recovery
      priceData: concatBars(
        generateRealisticBars({
          count: 20, startPrice: 200, seed: 8014,
          drift: 0.001, volatility: 0.009,
          meanReversion: 0.05, target: 202,
          momentumBias: 0.5,
          consolidation: [{ start: 5, end: 15, tightness: 0.35 }],
          patterns: [
            { bar: 5, type: "doji" },
            { bar: 12, type: "doji" },
            { bar: 16, type: "shooting-star" },
          ],
          support: [196],
          resistance: [204],
        }),
        concatBars(
          generateRealisticBars({
            count: 15, startPrice: 200, seed: 8015,
            drift: -0.018, volatility: 0.038,
            meanReversion: 0.0, target: 158,
            momentumBias: 0.72,
            patterns: [
              { bar: 0, type: "bearish-engulfing" },
              { bar: 3, type: "bearish-engulfing" },
              { bar: 8, type: "doji" },
              { bar: 12, type: "hammer" },
            ],
          }),
          generateRealisticBars({
            count: 35, startPrice: 162, seed: 8016,
            drift: 0.010, volatility: 0.022,
            meanReversion: 0.05, target: 198,
            momentumBias: 0.6,
            patterns: [
              { bar: 1, type: "hammer" },
              { bar: 2, type: "bullish-engulfing" },
              { bar: 10, type: "doji" },
              { bar: 18, type: "shooting-star" },
              { bar: 22, type: "hammer" },
              { bar: 28, type: "bullish-engulfing" },
            ],
            consolidation: [
              { start: 12, end: 20, tightness: 0.45 },
            ],
            support: [158, 170, 182],
            resistance: [192, 200],
          }),
        ),
      ),
      initialReveal: 15,
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
