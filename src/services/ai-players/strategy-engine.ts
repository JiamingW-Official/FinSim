// ── AI Strategy Engine ───────────────────────────────────────────────────────
// Simulates deterministic daily trading decisions for AI competitors.

import type { OHLCVBar } from "@/types/market";
import type { AIPlayer } from "./player-factory";

export interface AIPosition {
  ticker: string;
  shares: number;
  avgCost: number;
  currentValue: number;
}

export interface AIPortfolio {
  playerId: string;
  cash: number;
  positions: AIPosition[];
  totalValue: number;
  dailyPnL: number;
  totalReturn: number; // percentage from starting capital
  tradeCount: number;
}

// ── Seeded PRNG ──────────────────────────────────────────────────────────────

function createPRNG(seed: number) {
  let s = seed === 0 ? 1 : seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

// ── Initial portfolio ────────────────────────────────────────────────────────

export function createInitialPortfolio(playerId: string): AIPortfolio {
  return {
    playerId,
    cash: 100_000,
    positions: [],
    totalValue: 100_000,
    dailyPnL: 0,
    totalReturn: 0,
    tradeCount: 0,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPosition(
  portfolio: AIPortfolio,
  ticker: string,
): AIPosition | undefined {
  return portfolio.positions.find((p) => p.ticker === ticker);
}

function buyShares(
  portfolio: AIPortfolio,
  ticker: string,
  shares: number,
  price: number,
): void {
  const cost = shares * price;
  if (cost > portfolio.cash || shares <= 0) return;

  portfolio.cash -= cost;
  const existing = getPosition(portfolio, ticker);
  if (existing) {
    const totalShares = existing.shares + shares;
    existing.avgCost =
      (existing.avgCost * existing.shares + price * shares) / totalShares;
    existing.shares = totalShares;
  } else {
    portfolio.positions.push({
      ticker,
      shares,
      avgCost: price,
      currentValue: shares * price,
    });
  }
  portfolio.tradeCount++;
}

function sellShares(
  portfolio: AIPortfolio,
  ticker: string,
  shares: number,
  price: number,
): void {
  const existing = getPosition(portfolio, ticker);
  if (!existing || existing.shares < shares || shares <= 0) return;

  portfolio.cash += shares * price;
  existing.shares -= shares;
  if (existing.shares === 0) {
    portfolio.positions = portfolio.positions.filter(
      (p) => p.ticker !== ticker,
    );
  }
  portfolio.tradeCount++;
}

// ── Strategy implementations ─────────────────────────────────────────────────

function momentumStrategy(
  rng: () => number,
  portfolio: AIPortfolio,
  bars: Record<string, OHLCVBar>,
  riskTolerance: number,
): void {
  const tickers = Object.keys(bars);
  // Buy tickers with positive daily return, sell losers
  for (const ticker of tickers) {
    const bar = bars[ticker];
    const dailyReturn = (bar.close - bar.open) / bar.open;
    const pos = getPosition(portfolio, ticker);

    if (dailyReturn > 0.005 && !pos && rng() < 0.3 * riskTolerance) {
      // Buy winner
      const maxSpend = portfolio.cash * 0.15 * riskTolerance;
      const shares = Math.floor(maxSpend / bar.close);
      buyShares(portfolio, ticker, shares, bar.close);
    } else if (dailyReturn < -0.01 && pos && rng() < 0.4) {
      // Sell loser
      sellShares(portfolio, ticker, pos.shares, bar.close);
    }
  }
}

function valueStrategy(
  rng: () => number,
  portfolio: AIPortfolio,
  bars: Record<string, OHLCVBar>,
  riskTolerance: number,
): void {
  const tickers = Object.keys(bars);
  // Simulated "value": buy when price dips below open by >1%, hold long
  for (const ticker of tickers) {
    const bar = bars[ticker];
    const pos = getPosition(portfolio, ticker);
    const drawdown = (bar.close - bar.high) / bar.high;

    if (drawdown < -0.01 && !pos && rng() < 0.2 * riskTolerance) {
      const maxSpend = portfolio.cash * 0.2 * riskTolerance;
      const shares = Math.floor(maxSpend / bar.close);
      buyShares(portfolio, ticker, shares, bar.close);
    }
    // Rarely sells — only on big gain
    if (pos) {
      const gain = (bar.close - pos.avgCost) / pos.avgCost;
      if (gain > 0.15 && rng() < 0.15) {
        sellShares(portfolio, ticker, pos.shares, bar.close);
      }
    }
  }
}

function swingStrategy(
  rng: () => number,
  portfolio: AIPortfolio,
  bars: Record<string, OHLCVBar>,
  riskTolerance: number,
  dayIndex: number,
): void {
  const tickers = Object.keys(bars);
  // Trades every ~5 days
  const isTradingDay = dayIndex % 5 === 0;

  for (const ticker of tickers) {
    const bar = bars[ticker];
    const pos = getPosition(portfolio, ticker);

    if (isTradingDay && !pos && rng() < 0.25 * riskTolerance) {
      const maxSpend = portfolio.cash * 0.12 * riskTolerance;
      const shares = Math.floor(maxSpend / bar.close);
      buyShares(portfolio, ticker, shares, bar.close);
    } else if (pos && dayIndex % 5 === 3 && rng() < 0.5) {
      // Exit after ~3 days
      sellShares(portfolio, ticker, pos.shares, bar.close);
    }
  }
}

function indexStrategy(
  rng: () => number,
  portfolio: AIPortfolio,
  bars: Record<string, OHLCVBar>,
  dayIndex: number,
): void {
  const tickers = Object.keys(bars);
  if (tickers.length === 0) return;
  // Buy equal weight on day 0, rebalance monthly (~21 trading days)
  if (dayIndex === 0 || (dayIndex % 21 === 0 && rng() < 0.8)) {
    // Sell everything first
    for (const pos of [...portfolio.positions]) {
      const bar = bars[pos.ticker];
      if (bar) {
        sellShares(portfolio, pos.ticker, pos.shares, bar.close);
      }
    }
    // Buy equal weight
    const perTicker = portfolio.cash / tickers.length;
    for (const ticker of tickers) {
      const bar = bars[ticker];
      const shares = Math.floor((perTicker * 0.95) / bar.close);
      if (shares > 0) {
        buyShares(portfolio, ticker, shares, bar.close);
      }
    }
  }
}

function contrarianStrategy(
  rng: () => number,
  portfolio: AIPortfolio,
  bars: Record<string, OHLCVBar>,
  riskTolerance: number,
): void {
  const tickers = Object.keys(bars);
  for (const ticker of tickers) {
    const bar = bars[ticker];
    const dailyReturn = (bar.close - bar.open) / bar.open;
    const pos = getPosition(portfolio, ticker);

    // Buy dips
    if (dailyReturn < -0.015 && !pos && rng() < 0.35 * riskTolerance) {
      const maxSpend = portfolio.cash * 0.15 * riskTolerance;
      const shares = Math.floor(maxSpend / bar.close);
      buyShares(portfolio, ticker, shares, bar.close);
    }
    // Sell rallies
    if (dailyReturn > 0.02 && pos && rng() < 0.3) {
      sellShares(portfolio, ticker, pos.shares, bar.close);
    }
  }
}

function randomStrategy(
  rng: () => number,
  portfolio: AIPortfolio,
  bars: Record<string, OHLCVBar>,
): void {
  const tickers = Object.keys(bars);
  if (tickers.length === 0) return;
  // ~20% chance of doing something each day
  if (rng() > 0.2) return;

  const ticker = tickers[Math.floor(rng() * tickers.length)];
  const bar = bars[ticker];
  if (!bar) return;
  const pos = getPosition(portfolio, ticker);

  if (rng() < 0.5 && !pos) {
    const maxSpend = portfolio.cash * 0.1;
    const shares = Math.floor(maxSpend / bar.close);
    buyShares(portfolio, ticker, shares, bar.close);
  } else if (pos) {
    sellShares(portfolio, ticker, pos.shares, bar.close);
  }
}

// ── Main simulation step ─────────────────────────────────────────────────────

export function simulateDay(
  player: AIPlayer,
  portfolio: AIPortfolio,
  dailyBars: Record<string, OHLCVBar>,
  tradingDayIndex: number,
): AIPortfolio {
  // Guard: nothing to do if no bar data
  if (Object.keys(dailyBars).length === 0) return portfolio;

  // Deterministic seed from player ID + day index
  const seed = hashString(player.id) + tradingDayIndex * 7919;
  const rng = createPRNG(seed);

  // Clone portfolio to avoid mutation issues
  const updated: AIPortfolio = {
    ...portfolio,
    positions: portfolio.positions.map((p) => ({ ...p })),
  };

  const prevValue = updated.totalValue;

  // Run strategy
  switch (player.strategy) {
    case "momentum":
      momentumStrategy(rng, updated, dailyBars, player.riskTolerance);
      break;
    case "value":
      valueStrategy(rng, updated, dailyBars, player.riskTolerance);
      break;
    case "swing":
      swingStrategy(
        rng,
        updated,
        dailyBars,
        player.riskTolerance,
        tradingDayIndex,
      );
      break;
    case "index":
      indexStrategy(rng, updated, dailyBars, tradingDayIndex);
      break;
    case "contrarian":
      contrarianStrategy(rng, updated, dailyBars, player.riskTolerance);
      break;
    case "random":
      randomStrategy(rng, updated, dailyBars);
      break;
  }

  // Update position values with closing prices
  for (const pos of updated.positions) {
    const bar = dailyBars[pos.ticker];
    if (bar) {
      pos.currentValue = pos.shares * bar.close;
    }
  }

  // Safety: cap positions to 20 to bound persist size
  if (updated.positions.length > 20) {
    updated.positions = updated.positions.slice(0, 20);
  }

  // Compute totals
  const positionsValue = updated.positions.reduce(
    (sum, p) => sum + p.currentValue,
    0,
  );
  updated.totalValue = updated.cash + positionsValue;
  updated.dailyPnL = updated.totalValue - prevValue;
  updated.totalReturn =
    ((updated.totalValue - player.startingCapital) / player.startingCapital) *
    100;

  return updated;
}
