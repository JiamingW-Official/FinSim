import { GLOSSARY } from "./glossary";
import { INDICATOR_EXPLANATIONS } from "./indicator-explanations";

export interface FlashcardItem {
  id: string;
  category: string;
  front: string;
  back: string;
  hint?: string;
}

// Build flashcards from glossary entries
const glossaryCards: FlashcardItem[] = GLOSSARY.map((entry) => ({
  id: `glossary-${entry.term.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
  category: entry.category,
  front: entry.term,
  back: entry.definition,
  hint: entry.example,
}));

// Build flashcards from indicator explanations
const indicatorCards: FlashcardItem[] = Object.entries(INDICATOR_EXPLANATIONS).map(
  ([key, info]) => ({
    id: `indicator-${key}`,
    category: "indicators",
    front: `${info.name}\nHow do you read this indicator?`,
    back: `${info.howToRead}\n\n📈 Bull: ${info.bullSignal}\n📉 Bear: ${info.bearSignal}`,
    hint: info.bestFor,
  }),
);

// Quant & advanced concept flashcards
const quantCards: FlashcardItem[] = [
  {
    id: "quant-sharpe",
    category: "quant",
    front: "Sharpe Ratio\nWhat does it measure?",
    back: "Risk-adjusted return. Formula: (Portfolio Return - Risk-Free Rate) / Portfolio Volatility. Higher is better. Above 1.0 is good, above 2.0 is excellent. Named after Nobel laureate William Sharpe.",
    hint: "Measures return per unit of risk",
  },
  {
    id: "quant-sortino",
    category: "quant",
    front: "Sortino Ratio\nHow does it differ from Sharpe?",
    back: "Like Sharpe but only penalizes downside volatility, not upside. Uses downside deviation instead of total standard deviation. Better for strategies with positive skew where upside volatility is desirable.",
  },
  {
    id: "quant-var",
    category: "quant",
    front: "Value at Risk (VaR)\nWhat does 95% VaR of $5,000 mean?",
    back: "There is a 95% probability that your portfolio will not lose more than $5,000 in one day (or specified period). The remaining 5% of the time, losses could exceed this. Parametric VaR assumes normal distribution: VaR = μ - 1.645σ.",
  },
  {
    id: "quant-kelly",
    category: "quant",
    front: "Kelly Criterion\nHow do you calculate optimal bet size?",
    back: "f* = (p*b - q) / b where p = win probability, q = 1-p, b = payoff ratio (avg win / avg loss). Tells you the fraction of bankroll to risk per trade for maximum geometric growth. Most practitioners use half-Kelly for safety.",
  },
  {
    id: "quant-max-dd",
    category: "quant",
    front: "Maximum Drawdown\nWhy is it important?",
    back: "The largest peak-to-trough decline in portfolio value. A 50% drawdown requires a 100% gain to recover. It measures worst-case scenario risk and is often more psychologically important than volatility.",
  },
  {
    id: "quant-beta",
    category: "quant",
    front: "Beta\nWhat does a beta of 1.5 mean?",
    back: "The stock moves 1.5x the market. If S&P 500 rises 10%, the stock is expected to rise 15%. Beta = Cov(stock, market) / Var(market). Beta < 1 = defensive, Beta > 1 = aggressive, Beta < 0 = inverse relationship.",
  },
  {
    id: "quant-alpha",
    category: "quant",
    front: "Jensen's Alpha\nWhat does positive alpha indicate?",
    back: "Excess return above what CAPM predicts for the given risk level. Alpha = Rp - [Rf + β(Rm - Rf)]. Positive alpha means outperformance; the holy grail of active management. Most funds have negative alpha after fees.",
  },
  {
    id: "quant-efficient-frontier",
    category: "quant",
    front: "Efficient Frontier\nWhat is it?",
    back: "The set of portfolios offering the highest expected return for each level of risk. Developed by Harry Markowitz (1952 Nobel Prize). Portfolios below the frontier are suboptimal — you can get more return for the same risk by diversifying.",
  },
  {
    id: "quant-monte-carlo",
    category: "quant",
    front: "Monte Carlo Simulation\nHow is it used in finance?",
    back: "Run thousands of random simulations using historical return/volatility parameters to estimate probability distributions of future outcomes. Uses geometric Brownian motion: S(t+dt) = S(t) * exp((μ-σ²/2)dt + σ√dt·Z). Shows range of possible outcomes, not just a single forecast.",
  },
  {
    id: "quant-profit-factor",
    category: "quant",
    front: "Profit Factor\nWhat does a profit factor of 2.0 mean?",
    back: "Gross profits are 2x gross losses. Formula: Total Winning $ / Total Losing $. Above 1.0 is profitable, above 1.5 is good, above 2.0 is excellent. Unlike win rate, it accounts for the SIZE of wins vs losses.",
  },
  {
    id: "prediction-brier",
    category: "predictions",
    front: "Brier Score\nWhat does it measure?",
    back: "Calibration quality of probabilistic predictions. Formula: mean of (forecast - outcome)² across all predictions. Range 0-1, lower is better. A score of 0 = perfect calibration, 0.25 = random guessing on binary events. Named after Glenn Brier (1950).",
  },
  {
    id: "prediction-calibration",
    category: "predictions",
    front: "Prediction Calibration\nWhat does it mean to be well-calibrated?",
    back: "When you say 70% probability, the event should happen about 70% of the time. Most people are overconfident — their 90% predictions come true only 70% of the time. Tracking your Brier Score helps improve calibration over time.",
  },
  {
    id: "prediction-base-rate",
    category: "predictions",
    front: "Base Rate\nWhy is it important for predictions?",
    back: "The historical frequency of an event occurring. Before making a prediction, always ask 'how often does this type of event happen?' Example: S&P 500 is positive ~73% of years. Ignoring base rates is one of the most common forecasting errors.",
  },
  {
    id: "quant-cvar",
    category: "quant",
    front: "Conditional VaR (CVaR / Expected Shortfall)\nHow does it differ from VaR?",
    back: "CVaR measures the expected loss GIVEN that you've exceeded VaR. If 95% VaR is $5K, CVaR answers: 'In the worst 5% of cases, what's the AVERAGE loss?' Always larger than VaR. Better tail risk measure because VaR ignores the severity of tail losses.",
  },
  {
    id: "quant-skewness",
    category: "quant",
    front: "Return Skewness\nWhat does negative skew mean for a portfolio?",
    back: "Negative skew means the left tail is fatter — large losses are more frequent than large gains. Most equity portfolios have negative skew. Options strategies can create positive skew. Excess kurtosis > 0 means fatter tails than normal distribution (leptokurtic).",
  },
  {
    id: "quant-information-ratio",
    category: "quant",
    front: "Information Ratio\nHow does it measure skill?",
    back: "Active return divided by tracking error: IR = (Rp - Rb) / σ(Rp - Rb). Measures consistency of outperformance vs a benchmark. IR > 0.5 is good, > 1.0 is exceptional. Unlike Sharpe, it specifically measures alpha-generation skill relative to a benchmark.",
  },
];

export const FLASHCARDS: FlashcardItem[] = [...glossaryCards, ...indicatorCards, ...quantCards];

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  basics: { label: "Basics", color: "text-blue-400" },
  orders: { label: "Orders", color: "text-green-400" },
  indicators: { label: "Indicators", color: "text-amber-400" },
  risk: { label: "Risk", color: "text-rose-400" },
  fundamental: { label: "Fundamental", color: "text-purple-400" },
  "personal-finance": { label: "Personal Finance", color: "text-yellow-400" },
  quant: { label: "Quantitative", color: "text-cyan-400" },
  predictions: { label: "Predictions", color: "text-orange-400" },
};
