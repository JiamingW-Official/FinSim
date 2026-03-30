// Synthetic institutional holdings data for simulation

export interface InstitutionalHolder {
  name: string;
  shares: number;
  value: number;
  pctOutstanding: number;
  quarterlyChange: number; // positive = increased, negative = decreased
}

export interface InstitutionalHoldingsSummary {
  totalInstitutionalOwnership: number;
  holders: InstitutionalHolder[];
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const INSTITUTION_NAMES = [
  "Vanguard Group",
  "BlackRock",
  "State Street",
  "Fidelity Investments",
  "Capital Research",
  "T. Rowe Price",
  "Geode Capital",
  "Northern Trust",
  "JP Morgan Asset Mgmt",
  "Morgan Stanley IM",
  "Invesco",
  "Wellington Mgmt",
];

export function generateInstitutionalHoldings(ticker: string): InstitutionalHoldingsSummary {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + 77;
  const rand = seededRandom(seed);

  const holders: InstitutionalHolder[] = [];
  let remainingPct = 65 + rand() * 20; // 65-85% total

  for (let i = 0; i < 10; i++) {
    const pct = i === 0 ? 6 + rand() * 4 : Math.max(0.5, remainingPct * (0.1 + rand() * 0.15));
    remainingPct -= pct;
    const shares = Math.floor(pct * 10_000_000 + rand() * 5_000_000);
    const pricePerShare = 80 + rand() * 350;
    const change = (rand() - 0.4) * 15; // slight positive bias

    holders.push({
      name: INSTITUTION_NAMES[i],
      shares,
      value: shares * pricePerShare,
      pctOutstanding: Math.round(pct * 100) / 100,
      quarterlyChange: Math.round(change * 100) / 100,
    });
  }

  holders.sort((a, b) => b.pctOutstanding - a.pctOutstanding);

  const totalInstitutionalOwnership = holders.reduce((s, h) => s + h.pctOutstanding, 0);

  return {
    totalInstitutionalOwnership: Math.round(totalInstitutionalOwnership * 100) / 100,
    holders,
  };
}
