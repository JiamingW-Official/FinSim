// ---------------------------------------------------------------------------
// Extended Backtest Metrics — Time, Calendar, Consistency, Recovery Stats
// ---------------------------------------------------------------------------

export interface ExtendedBacktestMetrics {
  // Time-based
  avgHoldingPeriod: number;
  avgBarsInWin: number;
  avgBarsInLoss: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  // Calendar
  bestMonth: { month: string; return: number };
  worstMonth: { month: string; return: number };
  monthlyReturns: { month: string; return: number }[];
  // Consistency
  percentProfitableMonths: number;
  averageMonthlyReturn: number;
  monthlyReturnStdDev: number;
  // Recovery
  avgRecoveryTime: number;
  ulcerIndex: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  let sumSq = 0;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i] - avg;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / (arr.length - 1));
}

function formatMonth(timestamp: number): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Calculate extended backtest metrics from equity history and trade log.
 *
 * @param equityHistory - Time series of portfolio equity (oldest first)
 * @param trades - Completed trades with pnl and holding period
 */
export function calculateExtendedMetrics(
  equityHistory: { timestamp: number; value: number }[],
  trades: { timestamp: number; pnl: number; holdingPeriod: number }[],
): ExtendedBacktestMetrics {
  // ── Trade-based metrics ─────────────────────────────────────────────────

  const avgHoldingPeriod =
    trades.length > 0
      ? mean(trades.map((t) => t.holdingPeriod))
      : 0;

  const winTrades = trades.filter((t) => t.pnl > 0);
  const loseTrades = trades.filter((t) => t.pnl < 0);

  const avgBarsInWin =
    winTrades.length > 0
      ? mean(winTrades.map((t) => t.holdingPeriod))
      : 0;

  const avgBarsInLoss =
    loseTrades.length > 0
      ? mean(loseTrades.map((t) => t.holdingPeriod))
      : 0;

  // Streaks
  let longestWinStreak = 0;
  let longestLoseStreak = 0;
  let currentWinStreak = 0;
  let currentLoseStreak = 0;

  for (const trade of trades) {
    if (trade.pnl > 0) {
      currentWinStreak++;
      currentLoseStreak = 0;
      if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
    } else if (trade.pnl < 0) {
      currentLoseStreak++;
      currentWinStreak = 0;
      if (currentLoseStreak > longestLoseStreak) longestLoseStreak = currentLoseStreak;
    } else {
      currentWinStreak = 0;
      currentLoseStreak = 0;
    }
  }

  // ── Calendar / Monthly Returns ──────────────────────────────────────────

  const monthlyReturns: { month: string; return: number }[] = [];

  if (equityHistory.length >= 2) {
    // Group equity points by month
    const monthMap = new Map<
      string,
      { first: number; last: number }
    >();

    for (const point of equityHistory) {
      const month = formatMonth(point.timestamp);
      const existing = monthMap.get(month);
      if (!existing) {
        monthMap.set(month, { first: point.value, last: point.value });
      } else {
        existing.last = point.value;
      }
    }

    for (const [month, { first, last }] of monthMap) {
      const ret = first !== 0 ? ((last - first) / first) * 100 : 0;
      monthlyReturns.push({ month, return: Math.round(ret * 100) / 100 });
    }
  }

  // Sort by date
  monthlyReturns.sort((a, b) => a.month.localeCompare(b.month));

  const monthlyReturnValues = monthlyReturns.map((m) => m.return);

  const bestMonth =
    monthlyReturns.length > 0
      ? monthlyReturns.reduce((best, m) => (m.return > best.return ? m : best))
      : { month: "N/A", return: 0 };

  const worstMonth =
    monthlyReturns.length > 0
      ? monthlyReturns.reduce((worst, m) => (m.return < worst.return ? m : worst))
      : { month: "N/A", return: 0 };

  const profitableMonths = monthlyReturns.filter((m) => m.return > 0).length;
  const percentProfitableMonths =
    monthlyReturns.length > 0
      ? Math.round((profitableMonths / monthlyReturns.length) * 10000) / 100
      : 0;

  const averageMonthlyReturn = Math.round(mean(monthlyReturnValues) * 100) / 100;
  const monthlyReturnStdDev = Math.round(stdDev(monthlyReturnValues) * 100) / 100;

  // ── Recovery & Ulcer Index ──────────────────────────────────────────────

  let peak = 0;
  let drawdownSumSq = 0;
  let drawdownCount = 0;
  const recoveryTimes: number[] = [];
  let currentDDStart = -1;

  for (let i = 0; i < equityHistory.length; i++) {
    const v = equityHistory[i].value;
    if (v > peak) {
      // Recovered from drawdown
      if (currentDDStart >= 0) {
        recoveryTimes.push(i - currentDDStart);
        currentDDStart = -1;
      }
      peak = v;
    }

    const ddPct = peak > 0 ? ((peak - v) / peak) * 100 : 0;

    if (ddPct > 0 && currentDDStart < 0) {
      currentDDStart = i;
    }

    drawdownSumSq += ddPct * ddPct;
    drawdownCount++;
  }

  const avgRecoveryTime =
    recoveryTimes.length > 0
      ? Math.round(mean(recoveryTimes) * 10) / 10
      : 0;

  // Ulcer Index = sqrt(mean of squared drawdowns)
  const ulcerIndex =
    drawdownCount > 0
      ? Math.round(Math.sqrt(drawdownSumSq / drawdownCount) * 100) / 100
      : 0;

  return {
    avgHoldingPeriod: Math.round(avgHoldingPeriod * 10) / 10,
    avgBarsInWin: Math.round(avgBarsInWin * 10) / 10,
    avgBarsInLoss: Math.round(avgBarsInLoss * 10) / 10,
    longestWinStreak,
    longestLoseStreak,
    bestMonth,
    worstMonth,
    monthlyReturns,
    percentProfitableMonths,
    averageMonthlyReturn,
    monthlyReturnStdDev,
    avgRecoveryTime,
    ulcerIndex,
  };
}
