"use client";

import { useState, useEffect } from "react";
import { Check, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MicroLessonData {
  id: string;
  concept: string;
  category: string;
  body: string;
  keyPoints: [string, string];
  quiz: {
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
  };
  svgIllustration: React.ReactNode;
}

// ─── mulberry32 seeded PRNG ───────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── SVG Illustrations ────────────────────────────────────────────────────────

function CandlestickIllustration() {
  return (
    <svg width="160" height="80" viewBox="0 0 160 80" className="mx-auto">
      {/* Bullish candle */}
      <rect x="20" y="20" width="16" height="36" rx="1" fill="#22c55e" fillOpacity={0.8} />
      <line x1="28" y1="10" x2="28" y2="20" stroke="#22c55e" strokeWidth={1.5} />
      <line x1="28" y1="56" x2="28" y2="68" stroke="#22c55e" strokeWidth={1.5} />
      <text x="28" y="77" textAnchor="middle" fontSize="8" fill="#6b7280">Bullish</text>

      {/* Bearish candle */}
      <rect x="52" y="24" width="16" height="32" rx="1" fill="#ef4444" fillOpacity={0.8} />
      <line x1="60" y1="12" x2="60" y2="24" stroke="#ef4444" strokeWidth={1.5} />
      <line x1="60" y1="56" x2="60" y2="66" stroke="#ef4444" strokeWidth={1.5} />
      <text x="60" y="77" textAnchor="middle" fontSize="8" fill="#6b7280">Bearish</text>

      {/* Labels */}
      <text x="100" y="14" fontSize="8" fill="#9ca3af">High</text>
      <line x1="95" y1="12" x2="85" y2="12" stroke="#9ca3af" strokeWidth={1} />
      <text x="100" y="26" fontSize="8" fill="#9ca3af">Open</text>
      <line x1="95" y1="24" x2="85" y2="24" stroke="#9ca3af" strokeWidth={1} />
      <text x="100" y="58" fontSize="8" fill="#9ca3af">Close</text>
      <line x1="95" y1="56" x2="85" y2="56" stroke="#9ca3af" strokeWidth={1} />
      <text x="100" y="70" fontSize="8" fill="#9ca3af">Low</text>
      <line x1="95" y1="68" x2="85" y2="68" stroke="#9ca3af" strokeWidth={1} />
    </svg>
  );
}

function RSIIllustration() {
  const pts = [30, 45, 60, 75, 65, 50, 35, 25, 40, 55, 70, 60];
  const w = 160;
  const h = 70;
  const xStep = w / (pts.length - 1);
  const toY = (v: number) => h - (v / 100) * h;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${i * xStep} ${toY(v)}`).join(" ");
  return (
    <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} className="mx-auto">
      {/* Overbought zone */}
      <rect x="0" y="0" width={w} height={toY(70)} fill="#ef4444" fillOpacity={0.07} />
      {/* Oversold zone */}
      <rect x="0" y={toY(30)} width={w} height={h - toY(30)} fill="#22c55e" fillOpacity={0.07} />
      {/* 70 line */}
      <line x1="0" y1={toY(70)} x2={w} y2={toY(70)} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.5} />
      {/* 30 line */}
      <line x1="0" y1={toY(30)} x2={w} y2={toY(30)} stroke="#22c55e" strokeWidth={1} strokeDasharray="3,3" strokeOpacity={0.5} />
      {/* RSI line */}
      <path d={d} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <text x="2" y={toY(70) - 2} fontSize="7" fill="#ef4444" fillOpacity={0.8}>Overbought 70</text>
      <text x="2" y={toY(30) + 8} fontSize="7" fill="#22c55e" fillOpacity={0.8}>Oversold 30</text>
    </svg>
  );
}

function MACDIllustration() {
  const w = 160;
  const h = 75;
  const macd = [2, 4, 5, 3, 1, -1, -3, -4, -2, 0, 3, 5];
  const signal = [1, 2, 3.5, 3.5, 2.5, 1, -1, -2.5, -2.5, -1, 1, 3];
  const mid = h / 2;
  const scale = 7;
  const xStep = w / (macd.length - 1);
  const md = macd.map((v, i) => `${i === 0 ? "M" : "L"} ${i * xStep} ${mid - v * scale}`).join(" ");
  const sd = signal.map((v, i) => `${i === 0 ? "M" : "L"} ${i * xStep} ${mid - v * scale}`).join(" ");
  return (
    <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} className="mx-auto">
      <line x1="0" y1={mid} x2={w} y2={mid} stroke="#374151" strokeWidth={1} />
      {macd.map((v, i) => {
        const barH = Math.abs(v) * scale;
        const barY = v >= 0 ? mid - barH : mid;
        return (
          <rect
            key={i}
            x={i * xStep - 4}
            y={barY}
            width={8}
            height={barH}
            fill={v >= 0 ? "#22c55e" : "#ef4444"}
            fillOpacity={0.5}
            rx={1}
          />
        );
      })}
      <path d={md} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={sd} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4,2" />
      <text x="2" y={h + 8} fontSize="7" fill="#6366f1">MACD</text>
      <text x="36" y={h + 8} fontSize="7" fill="#f59e0b">Signal</text>
      <text x="74" y={h + 8} fontSize="7" fill="#6b7280">Histogram</text>
    </svg>
  );
}

function SupportResistanceIllustration() {
  const w = 160;
  const h = 70;
  const candles = [
    { o: 55, c: 58, h: 60, l: 52 },
    { o: 58, c: 62, h: 65, l: 57 },
    { o: 62, c: 60, h: 65, l: 59 },
    { o: 60, c: 55, h: 62, l: 53 },
    { o: 55, c: 52, h: 57, l: 48 },
    { o: 52, c: 55, h: 56, l: 50 },
    { o: 55, c: 58, h: 60, l: 54 },
    { o: 58, c: 62, h: 64, l: 57 },
  ];
  const toY = (v: number) => h - ((v - 40) / 35) * h;
  const xStep = w / candles.length;
  return (
    <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} className="mx-auto">
      <line x1="0" y1={toY(64)} x2={w} y2={toY(64)} stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.7} />
      <line x1="0" y1={toY(50)} x2={w} y2={toY(50)} stroke="#22c55e" strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.7} />
      {candles.map((c, i) => {
        const bull = c.c >= c.o;
        const fill = bull ? "#22c55e" : "#ef4444";
        const x = i * xStep + xStep / 2;
        const bodyTop = toY(Math.max(c.o, c.c));
        const bodyH = Math.abs(toY(c.o) - toY(c.c));
        return (
          <g key={i}>
            <line x1={x} y1={toY(c.h)} x2={x} y2={toY(c.l)} stroke={fill} strokeWidth={1.5} />
            <rect x={x - 4} y={bodyTop} width={8} height={Math.max(bodyH, 2)} fill={fill} fillOpacity={0.8} rx={1} />
          </g>
        );
      })}
      <text x="2" y={toY(64) - 2} fontSize="7" fill="#ef4444" fillOpacity={0.8}>Resistance</text>
      <text x="2" y={toY(50) + 8} fontSize="7" fill="#22c55e" fillOpacity={0.8}>Support</text>
    </svg>
  );
}

function CallOptionIllustration() {
  const w = 160;
  const h = 70;
  const prices = [80, 85, 90, 95, 100, 105, 110, 115, 120];
  const strike = 100;
  const premium = 5;
  const toX = (p: number) => ((p - 80) / 40) * w;
  const toY = (pnl: number) => h / 2 - pnl * 3;
  const pts = prices.map((p) => {
    const pnl = Math.max(p - strike, 0) - premium;
    return `${toX(p)},${toY(pnl)}`;
  });
  return (
    <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} className="mx-auto">
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#374151" strokeWidth={1} />
      <line x1={toX(strike)} y1="0" x2={toX(strike)} y2={h} stroke="#6b7280" strokeWidth={1} strokeDasharray="3,3" />
      <polyline points={pts.join(" ")} fill="none" stroke="#6366f1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={toX(strike) + 2} y="10" fontSize="7" fill="#6b7280">Strike</text>
      <text x="2" y={h + 8} fontSize="7" fill="#22c55e">Profit zone</text>
      <text x="85" y={h + 8} fontSize="7" fill="#ef4444">Max loss: premium</text>
    </svg>
  );
}

function PositionSizingIllustration() {
  const w = 160;
  const h = 60;
  const account = 10000;
  const risk = 0.02;
  const stopLoss = 0.05;
  const shares = Math.floor((account * risk) / (account * stopLoss / 100));
  return (
    <svg width={w} height={h + 20} viewBox={`0 0 ${w} ${h + 20}`} className="mx-auto">
      <rect x="5" y="5" width="150" height="22" rx="3" fill="#1f2937" />
      <rect x="5" y="5" width={150 * risk * 10} height="22" rx="3" fill="#6366f1" fillOpacity={0.7} />
      <text x="80" y="20" textAnchor="middle" fontSize="8" fill="#e5e7eb">Account: $10,000</text>
      <text x="5" y="42" fontSize="8" fill="#9ca3af">Risk 2% = $200</text>
      <text x="5" y="54" fontSize="8" fill="#9ca3af">Stop 5% = $5/share</text>
      <text x="5" y="66" fontSize="8" fill="#6366f1">Position size = {shares > 0 ? shares : "~40"} shares</text>
      <text x="5" y="78" fontSize="7" fill="#6b7280">Formula: (Account × Risk%) / Stop$</text>
    </svg>
  );
}

function VolatilityIllustration() {
  const w = 160;
  const h = 70;
  const lowVol = [50, 51, 49, 52, 50, 48, 51, 50, 52, 49, 51, 50];
  const highVol = [50, 58, 43, 62, 38, 65, 35, 60, 40, 57, 44, 52];
  const toY = (v: number) => h - ((v - 30) / 40) * h;
  const xStep = w / (lowVol.length - 1);
  const ld = lowVol.map((v, i) => `${i === 0 ? "M" : "L"} ${i * xStep} ${toY(v)}`).join(" ");
  const hd = highVol.map((v, i) => `${i === 0 ? "M" : "L"} ${i * xStep} ${toY(v)}`).join(" ");
  return (
    <svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} className="mx-auto">
      <path d={ld} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={hd} fill="none" stroke="#ef4444" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <text x="2" y={h + 8} fontSize="7" fill="#22c55e">Low volatility</text>
      <text x="72" y={h + 8} fontSize="7" fill="#ef4444">High volatility</text>
    </svg>
  );
}

// ─── Micro-Lesson Library ─────────────────────────────────────────────────────

const MICRO_LESSONS: Omit<MicroLessonData, "svgIllustration">[] = [
  {
    id: "ml-candlesticks",
    concept: "Reading Candlestick Charts",
    category: "Basics",
    body: "A candlestick shows four prices in one visual: open, close, high, and low. The body (rectangle) spans open to close. The wicks (thin lines) show the high and low. A green body means close > open (buyers won). A red body means close < open (sellers won).",
    keyPoints: [
      "The body color tells you whether bulls or bears dominated the session",
      "Long wicks signal rejection — price moved far but snapped back",
    ],
    quiz: {
      question: "A candle has a long lower wick and a small green body near the top. What does this suggest?",
      options: ["Strong selling pressure", "Buyers rejected lower prices — potential bullish reversal", "Price was flat all day", "The stock is about to gap down"],
      correctIndex: 1,
      explanation: "A long lower wick shows sellers pushed price down hard, but buyers overwhelmed them and closed near the high — a bullish signal called a Hammer.",
    },
  },
  {
    id: "ml-rsi",
    concept: "RSI — Relative Strength Index",
    category: "Technical Analysis",
    body: "RSI measures how fast price is moving relative to recent history, expressed as 0–100. Above 70 is overbought (potential reversal down). Below 30 is oversold (potential reversal up). RSI divergence — price making new highs while RSI makes lower highs — is an early warning sign.",
    keyPoints: [
      "RSI > 70 and RSI < 30 are warning zones, not automatic buy/sell signals",
      "Divergence between price and RSI often precedes reversals",
    ],
    quiz: {
      question: "A stock is at an all-time high, but RSI is 62 and declining. What is this?",
      options: ["A strong buy signal", "Normal behavior — ignore RSI", "Bearish RSI divergence — momentum is weakening", "Oversold condition"],
      correctIndex: 2,
      explanation: "When price makes new highs but RSI makes lower highs, it shows waning momentum — a bearish divergence that often precedes a pullback.",
    },
  },
  {
    id: "ml-macd",
    concept: "MACD — Trend and Momentum",
    category: "Technical Analysis",
    body: "MACD (Moving Average Convergence Divergence) subtracts a 26-period EMA from a 12-period EMA. A 9-period EMA of that result becomes the signal line. Histograms show MACD minus signal. When MACD crosses above the signal line, it's a bullish signal. Below: bearish.",
    keyPoints: [
      "MACD crossovers signal trend changes; histogram bars show acceleration",
      "MACD works best in trending markets — avoid in choppy, sideways conditions",
    ],
    quiz: {
      question: "MACD crosses below its signal line after a long uptrend. What does this likely signal?",
      options: ["Strong continuation of the uptrend", "A potential bearish reversal or momentum slowdown", "The stock is about to split", "Nothing — crossovers are random"],
      correctIndex: 1,
      explanation: "A bearish MACD crossover (MACD drops below signal) after a sustained uptrend warns that bullish momentum is fading and a pullback or reversal may follow.",
    },
  },
  {
    id: "ml-support-resistance",
    concept: "Support and Resistance",
    category: "Technical Analysis",
    body: "Support is a price level where demand historically outweighs supply — price bounces up. Resistance is where supply outweighs demand — price gets rejected down. When price breaks through resistance, that level often becomes new support (role reversal).",
    keyPoints: [
      "More touches of a level = stronger significance as support or resistance",
      "Role reversal: broken resistance becomes support, broken support becomes resistance",
    ],
    quiz: {
      question: "A stock has bounced from $45 three times in the past year. Price is now at $46. What is $45?",
      options: ["A breakout target", "A strong support level", "A resistance level", "Irrelevant historical data"],
      correctIndex: 1,
      explanation: "A price that has bounced multiple times from the same level is a proven support zone. Traders watch these levels closely for long entries.",
    },
  },
  {
    id: "ml-calls-puts",
    concept: "Calls vs Puts",
    category: "Options",
    body: "A call option gives you the right (not obligation) to BUY 100 shares at the strike price before expiration. A put option gives you the right to SELL at the strike price. Calls profit when the stock rises. Puts profit when the stock falls. Buyers pay a premium; sellers collect it.",
    keyPoints: [
      "Buying calls = bullish bet with defined risk (max loss = premium paid)",
      "Buying puts = bearish bet or insurance against a position you hold",
    ],
    quiz: {
      question: "You buy a call option with a $100 strike for a $3 premium. The stock closes at $108 at expiry. What is your profit per share?",
      options: ["$8", "$5", "$11", "$3"],
      correctIndex: 1,
      explanation: "Intrinsic value = $108 - $100 = $8. Subtract the $3 premium paid = $5 profit per share, or $500 per contract.",
    },
  },
  {
    id: "ml-position-sizing",
    concept: "Position Sizing — The 2% Rule",
    category: "Risk Management",
    body: "Never risk more than 1-2% of your total account on a single trade. Position size = (Account × Risk %) / Stop-loss per share. Example: $10,000 account, 2% risk, stop-loss $5 below entry → position = ($10,000 × 0.02) / $5 = 40 shares. This rule is what separates professionals from gamblers.",
    keyPoints: [
      "The formula: Shares = (Account × Risk%) / (Entry - Stop price)",
      "Even with 40% win rate, proper sizing can still be profitable",
    ],
    quiz: {
      question: "Account = $20,000. Risk = 1%. Stop loss = $2/share below entry. How many shares should you buy?",
      options: ["100", "200", "10", "1,000"],
      correctIndex: 0,
      explanation: "($20,000 × 0.01) / $2 = $200 / $2 = 100 shares. The 1% rule caps your max loss at $200 on this trade.",
    },
  },
  {
    id: "ml-volatility",
    concept: "Historical vs Implied Volatility",
    category: "Options",
    body: "Historical Volatility (HV) measures how much price actually moved in the past. Implied Volatility (IV) is the market's expectation of future volatility, extracted from option prices. When IV > HV, options are expensive — premium sellers benefit. When IV < HV, options are cheap — buyers benefit.",
    keyPoints: [
      "High IV Rank means options are expensive relative to their 52-week range",
      "Selling options when IV is high (and buying when low) is the volatility edge",
    ],
    quiz: {
      question: "A stock's IV Rank is 85. What does this mean for options sellers?",
      options: ["Options are cheap — avoid selling", "Options are expensive — a good environment to sell premium", "The stock will go up 85%", "IV Rank above 80 means no trades"],
      correctIndex: 1,
      explanation: "IV Rank of 85 means current IV is in the 85th percentile of its 52-week range — options are expensive. Sellers collect rich premium that tends to decay as IV reverts to normal.",
    },
  },
  {
    id: "ml-bid-ask",
    concept: "The Bid-Ask Spread",
    category: "Basics",
    body: "The bid is the highest price a buyer will pay. The ask is the lowest price a seller will accept. The difference is the spread — the market maker's profit. A wide spread (illiquid) means higher transaction cost. Always use limit orders for illiquid assets to avoid paying the full spread.",
    keyPoints: [
      "Liquid stocks (AAPL, SPY) have spreads of $0.01; illiquid ones can be $0.50+",
      "Market orders fill at the ask (buying) or bid (selling) — you always pay the spread",
    ],
    quiz: {
      question: "A stock shows Bid: $49.95 / Ask: $50.05. You place a market buy order. What price do you pay?",
      options: ["$49.95", "$50.00", "$50.05", "It depends on news"],
      correctIndex: 2,
      explanation: "Market buy orders fill at the ask — the lowest price a seller accepts. You pay $50.05, effectively losing the $0.10 spread immediately.",
    },
  },
  {
    id: "ml-diversification",
    concept: "Diversification and Correlation",
    category: "Risk Management",
    body: "Diversification reduces unsystematic (company-specific) risk. But assets that move together (high correlation) don't provide real diversification. Owning 10 tech stocks is not diversified — they all fall in a tech selloff. True diversification means assets with low or negative correlation.",
    keyPoints: [
      "Correlation of 1.0 = perfect lockstep — no diversification benefit",
      "Adding bonds, commodities, or international stocks often lowers portfolio correlation",
    ],
    quiz: {
      question: "You hold 5 stocks all with 0.9 correlation. Is your portfolio diversified?",
      options: ["Yes — 5 positions is always diversified", "No — high correlation means they move together, providing little protection", "Yes — any number of stocks diversifies", "It depends on the sector"],
      correctIndex: 1,
      explanation: "High correlation means the stocks tend to rise and fall together. In a selloff, all 5 drop. True diversification requires assets that don't move in sync.",
    },
  },
  {
    id: "ml-market-regime",
    concept: "Market Regimes",
    category: "Advanced",
    body: "A market regime is the current environment: trending (clear direction), ranging (oscillating between levels), or volatile (large random moves). Your strategy should match the regime. Trend-following works in trending markets but fails in ranges. Mean-reversion works in ranges but fails in trends.",
    keyPoints: [
      "ADX > 25 often signals a trending regime; ADX < 20 suggests ranging",
      "Using the wrong strategy in the wrong regime is the most common source of losses",
    ],
    quiz: {
      question: "ADX reads 12. Price has been bouncing between $48 and $52 for 6 weeks. What regime are you in?",
      options: ["Strong uptrend", "Ranging / sideways market", "Bear market", "High volatility regime"],
      correctIndex: 1,
      explanation: "ADX below 20 and price bouncing between clear levels signals a ranging market. Mean-reversion strategies (buy support, sell resistance) work here. Trend-following strategies will give whipsaws.",
    },
  },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "finsim_micro_lessons_read";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SVG_ILLUSTRATIONS: Record<string, React.ReactNode> = {
  "ml-candlesticks": <CandlestickIllustration />,
  "ml-rsi": <RSIIllustration />,
  "ml-macd": <MACDIllustration />,
  "ml-support-resistance": <SupportResistanceIllustration />,
  "ml-calls-puts": <CallOptionIllustration />,
  "ml-position-sizing": <PositionSizingIllustration />,
  "ml-volatility": <VolatilityIllustration />,
  "ml-bid-ask": <CandlestickIllustration />,
  "ml-diversification": <VolatilityIllustration />,
  "ml-market-regime": <RSIIllustration />,
};

export function MicroLesson() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);

  // Pick today's lesson using daily seed
  useEffect(() => {
    const seed = Math.floor(Date.now() / 86400000);
    const rand = mulberry32(seed);
    const idx = Math.floor(rand() * MICRO_LESSONS.length);
    setLessonIndex(idx);
    setReadIds(loadReadIds());
    setQuizAnswer(null);
  }, []);

  const lesson = MICRO_LESSONS[lessonIndex];
  if (!lesson) return null;

  const isRead = readIds.has(lesson.id);
  const svgIllustration = SVG_ILLUSTRATIONS[lesson.id] ?? <CandlestickIllustration />;

  function markAsRead() {
    const next = new Set(readIds);
    next.add(lesson.id);
    setReadIds(next);
    saveReadIds(next);
  }

  function handleNext() {
    const nextIdx = (lessonIndex + 1) % MICRO_LESSONS.length;
    setLessonIndex(nextIdx);
    setQuizAnswer(null);
  }

  const totalRead = readIds.size;
  const progressPct = (totalRead / MICRO_LESSONS.length) * 100;

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold">60-Second Micro Lesson</h3>
          <p className="text-[10px] text-muted-foreground">{lesson.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>60s read</span>
          </div>
          {isRead && (
            <div className="flex items-center gap-1 rounded-md bg-green-500/10 px-1.5 py-0.5">
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-[9px] font-medium text-green-500">Read</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted/40">
        <div
          className="h-full bg-primary/60 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Concept title */}
        <h4 className="text-sm font-semibold leading-snug">{lesson.concept}</h4>

        {/* Body */}
        <p className="text-[11px] leading-relaxed text-muted-foreground">{lesson.body}</p>

        {/* SVG Illustration */}
        <div className="rounded-lg border border-border/30 bg-muted/20 py-3">
          {svgIllustration}
        </div>

        {/* Key points */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Key Takeaways
          </p>
          {lesson.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
              <p className="text-[11px] leading-relaxed text-foreground">{point}</p>
            </div>
          ))}
        </div>

        {/* Quiz */}
        <div className="rounded-lg border border-border/40 bg-muted/10 p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Check
          </p>
          <p className="text-[11px] font-medium leading-snug">{lesson.quiz.question}</p>
          <div className="space-y-1.5 mt-2">
            {lesson.quiz.options.map((option, i) => {
              const isSelected = quizAnswer === i;
              const isCorrect = i === lesson.quiz.correctIndex;
              const showResult = quizAnswer !== null;
              let btnCls = "w-full rounded-md border px-2.5 py-1.5 text-left text-[11px] transition-colors ";
              if (!showResult) {
                btnCls += "border-border/40 bg-card hover:bg-accent/30";
              } else if (isCorrect) {
                btnCls += "border-green-500/50 bg-green-500/10 text-green-400";
              } else if (isSelected && !isCorrect) {
                btnCls += "border-red-500/50 bg-red-500/10 text-red-400";
              } else {
                btnCls += "border-border/20 bg-muted/10 text-muted-foreground/50";
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={quizAnswer !== null}
                  onClick={() => {
                    setQuizAnswer(i);
                    if (i === lesson.quiz.correctIndex) markAsRead();
                  }}
                  className={btnCls}
                >
                  <span className="mr-2 font-mono text-[9px] text-muted-foreground">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          {quizAnswer !== null && (
            <div className="mt-2 rounded-md border border-border/30 bg-muted/20 p-2">
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                {lesson.quiz.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] text-muted-foreground">
            {totalRead}/{MICRO_LESSONS.length} lessons read
          </div>
          <div className="flex items-center gap-2">
            {!isRead && quizAnswer === null && (
              <button
                type="button"
                onClick={markAsRead}
                className="rounded-md border border-border/50 bg-card px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-accent/30"
              >
                Mark as read
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Next lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
