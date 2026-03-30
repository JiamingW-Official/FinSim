// ---------------------------------------------------------------------------
// Monte Carlo Portfolio Simulation — Geometric Brownian Motion
// ---------------------------------------------------------------------------

export interface MonteCarloResult {
  percentiles: Record<number, number[]>; // p1, p5, p25, p50, p75, p95, p99 -> values over time
  expectedValue: number;
  probabilityOfLoss: number;
  probabilityOfDoubling: number;
  medianReturn: number;
  worstCase: number;  // p1
  bestCase: number;   // p99
}

// ─── Box-Muller Transform ────────────────────────────────────────────────────

function boxMullerRandom(): number {
  let u1 = 0;
  let u2 = 0;
  // Avoid log(0)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// ─── Percentile helper ───────────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

// ─── Main Simulation ─────────────────────────────────────────────────────────

export function runMonteCarloSimulation(
  initialValue: number,
  annualReturn: number,
  annualVolatility: number,
  yearsForward: number,
  simulations: number = 10000,
  monthlyContribution: number = 0,
): MonteCarloResult {
  const totalMonths = Math.round(yearsForward * 12);
  const dt = 1 / 12; // monthly time step in years
  const drift = (annualReturn - 0.5 * annualVolatility * annualVolatility) * dt;
  const diffusion = annualVolatility * Math.sqrt(dt);

  // Collect final values and full paths for percentile computation
  const finalValues: number[] = new Array(simulations);
  // For each time step, collect all simulation values to compute percentiles
  // Use a transposed structure: pathValues[month][sim]
  const pathValues: number[][] = [];
  for (let m = 0; m <= totalMonths; m++) {
    pathValues[m] = new Array(simulations);
  }

  for (let s = 0; s < simulations; s++) {
    let value = initialValue;
    pathValues[0][s] = value;

    for (let m = 1; m <= totalMonths; m++) {
      const z = boxMullerRandom();
      value = value * Math.exp(drift + diffusion * z);
      value += monthlyContribution;
      pathValues[m][s] = value;
    }

    finalValues[s] = value;
  }

  // Sort each month's values for percentile calculation
  const pKeys = [1, 5, 25, 50, 75, 95, 99];
  const percentiles: Record<number, number[]> = {};
  for (const p of pKeys) {
    percentiles[p] = new Array(totalMonths + 1);
  }

  for (let m = 0; m <= totalMonths; m++) {
    const sorted = pathValues[m].slice().sort((a, b) => a - b);
    for (const p of pKeys) {
      percentiles[p][m] = percentile(sorted, p);
    }
  }

  // Compute summary statistics from final values
  const sortedFinal = finalValues.slice().sort((a, b) => a - b);
  const totalContributed = initialValue + monthlyContribution * totalMonths;

  let sumFinal = 0;
  let lossCount = 0;
  let doubleCount = 0;

  for (let s = 0; s < simulations; s++) {
    sumFinal += finalValues[s];
    if (finalValues[s] < totalContributed) lossCount++;
    if (finalValues[s] >= 2 * totalContributed) doubleCount++;
  }

  const expectedValue = sumFinal / simulations;
  const medianFinal = percentile(sortedFinal, 50);
  const medianReturn = (medianFinal - totalContributed) / totalContributed;

  return {
    percentiles,
    expectedValue,
    probabilityOfLoss: lossCount / simulations,
    probabilityOfDoubling: doubleCount / simulations,
    medianReturn,
    worstCase: percentile(sortedFinal, 1),
    bestCase: percentile(sortedFinal, 99),
  };
}
