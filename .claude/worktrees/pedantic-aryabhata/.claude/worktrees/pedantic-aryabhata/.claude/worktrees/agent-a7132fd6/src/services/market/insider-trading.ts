// Synthetic insider trading data for simulation

export interface InsiderTrade {
  id: string;
  name: string;
  title: string;
  type: "buy" | "sell";
  shares: number;
  value: number;
  date: string;
}

export interface InsiderTradingSummary {
  trades: InsiderTrade[];
  netBuying: number;
  totalBuyValue: number;
  totalSellValue: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const INSIDER_NAMES = [
  { name: "John Mitchell", title: "CEO" },
  { name: "Sarah Chen", title: "CFO" },
  { name: "David Park", title: "COO" },
  { name: "Maria Rodriguez", title: "VP Engineering" },
  { name: "James Wilson", title: "Director" },
  { name: "Lisa Thompson", title: "General Counsel" },
  { name: "Robert Kim", title: "CTO" },
  { name: "Amanda Foster", title: "SVP Sales" },
];

export function generateInsiderTrades(ticker: string): InsiderTradingSummary {
  const seed = ticker.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + 42;
  const rand = seededRandom(seed);

  const count = 5 + Math.floor(rand() * 6);
  const trades: InsiderTrade[] = [];

  for (let i = 0; i < count; i++) {
    const insider = INSIDER_NAMES[Math.floor(rand() * INSIDER_NAMES.length)];
    const isBuy = rand() > 0.55;
    const shares = Math.floor(rand() * 50000) + 1000;
    const pricePerShare = 50 + Math.floor(rand() * 400);
    const daysAgo = Math.floor(rand() * 90);
    const date = new Date(Date.now() - daysAgo * 86400000);

    trades.push({
      id: `insider-${ticker}-${i}`,
      name: insider.name,
      title: insider.title,
      type: isBuy ? "buy" : "sell",
      shares,
      value: shares * pricePerShare,
      date: date.toISOString().slice(0, 10),
    });
  }

  trades.sort((a, b) => b.date.localeCompare(a.date));

  const totalBuyValue = trades.filter((t) => t.type === "buy").reduce((s, t) => s + t.value, 0);
  const totalSellValue = trades.filter((t) => t.type === "sell").reduce((s, t) => s + t.value, 0);

  return {
    trades,
    netBuying: totalBuyValue - totalSellValue,
    totalBuyValue,
    totalSellValue,
  };
}
