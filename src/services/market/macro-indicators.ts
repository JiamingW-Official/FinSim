export interface MacroIndicator {
  name: string;
  category:
    | "growth"
    | "inflation"
    | "employment"
    | "rates"
    | "housing"
    | "consumer";
  currentValue: number;
  previousValue: number;
  change: number;
  trend: "improving" | "stable" | "deteriorating";
  historicalValues: { date: string; value: number }[];
  unit: string;
  description: string;
  marketImpact: string;
}

function generateHistory(
  current: number,
  months: number,
  volatility: number,
  direction: "up" | "down" | "flat",
): { date: string; value: number }[] {
  const result: { date: string; value: number }[] = [];
  const baseDate = new Date(2024, 6, 1); // July 2024 as current

  let value = current;
  const values: number[] = [current];

  // Generate backwards from current
  for (let i = 1; i < months; i++) {
    const drift =
      direction === "up"
        ? -volatility * 0.3
        : direction === "down"
          ? volatility * 0.3
          : 0;
    const noise = (Math.sin(i * 7.3 + current * 11.7) * 0.5 + 0.5 - 0.5) * volatility;
    value = value + drift + noise;
    values.unshift(value);
  }

  for (let i = 0; i < values.length; i++) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() - (values.length - 1 - i));
    result.push({
      date: date.toISOString().slice(0, 10),
      value: Math.round(values[i] * 100) / 100,
    });
  }

  return result;
}

export const MACRO_INDICATORS: MacroIndicator[] = [
  {
    name: "GDP Growth Rate",
    category: "growth",
    currentValue: 2.8,
    previousValue: 1.4,
    change: 1.4,
    trend: "improving",
    historicalValues: generateHistory(2.8, 12, 0.5, "up"),
    unit: "%",
    description:
      "Quarter-over-quarter annualized real GDP growth. Measures the overall pace of economic expansion.",
    marketImpact:
      "Strong GDP supports corporate earnings and stock prices. Excessive growth may prompt Fed rate hikes.",
  },
  {
    name: "CPI YoY",
    category: "inflation",
    currentValue: 3.0,
    previousValue: 3.3,
    change: -0.3,
    trend: "improving",
    historicalValues: generateHistory(3.0, 12, 0.3, "down"),
    unit: "%",
    description:
      "Consumer Price Index year-over-year change. The headline inflation measure tracked by markets.",
    marketImpact:
      "Falling CPI is bullish for stocks as it signals potential rate cuts. High CPI leads to tighter monetary policy.",
  },
  {
    name: "Core PCE",
    category: "inflation",
    currentValue: 2.6,
    previousValue: 2.8,
    change: -0.2,
    trend: "improving",
    historicalValues: generateHistory(2.6, 12, 0.2, "down"),
    unit: "%",
    description:
      "Personal Consumption Expenditures excluding food and energy. The Fed's preferred inflation gauge.",
    marketImpact:
      "The metric the Fed watches most closely. Approaching the 2% target signals rate cut readiness.",
  },
  {
    name: "Unemployment Rate",
    category: "employment",
    currentValue: 4.1,
    previousValue: 4.0,
    change: 0.1,
    trend: "stable",
    historicalValues: generateHistory(4.1, 12, 0.15, "up"),
    unit: "%",
    description:
      "Percentage of the labor force that is jobless and actively seeking work.",
    marketImpact:
      "Rising unemployment may trigger rate cuts (bullish for growth stocks). Extremely low unemployment signals inflation risk.",
  },
  {
    name: "Fed Funds Rate",
    category: "rates",
    currentValue: 5.375,
    previousValue: 5.375,
    change: 0,
    trend: "stable",
    historicalValues: generateHistory(5.375, 12, 0.0, "flat"),
    unit: "%",
    description:
      "The target overnight lending rate set by the Federal Reserve. Currently at a 23-year high of 5.25-5.50%.",
    marketImpact:
      "Higher rates increase borrowing costs and discount future earnings. Rate cuts are the most powerful bullish catalyst.",
  },
  {
    name: "10Y Treasury Yield",
    category: "rates",
    currentValue: 4.25,
    previousValue: 4.4,
    change: -0.15,
    trend: "improving",
    historicalValues: generateHistory(4.25, 12, 0.25, "flat"),
    unit: "%",
    description:
      "Yield on the 10-year U.S. Treasury note. The benchmark risk-free rate for valuing all assets.",
    marketImpact:
      "Higher yields compress stock valuations (especially growth). Falling yields boost P/E multiples.",
  },
  {
    name: "2Y Treasury Yield",
    category: "rates",
    currentValue: 4.7,
    previousValue: 4.75,
    change: -0.05,
    trend: "stable",
    historicalValues: generateHistory(4.7, 12, 0.2, "flat"),
    unit: "%",
    description:
      "Yield on the 2-year U.S. Treasury note. Closely tracks Fed rate expectations.",
    marketImpact:
      "Reflects market expectations for near-term Fed policy. Rapid declines signal expected rate cuts.",
  },
  {
    name: "2s10s Spread",
    category: "rates",
    currentValue: -0.45,
    previousValue: -0.35,
    change: -0.1,
    trend: "deteriorating",
    historicalValues: generateHistory(-0.45, 12, 0.15, "down"),
    unit: "%",
    description:
      "Difference between 10Y and 2Y Treasury yields. An inverted curve (negative) has preceded every recession since 1970.",
    marketImpact:
      "Inversion signals recession risk 12-18 months out. Steepening after inversion often coincides with economic weakness.",
  },
  {
    name: "ISM Manufacturing",
    category: "growth",
    currentValue: 48.5,
    previousValue: 48.7,
    change: -0.2,
    trend: "deteriorating",
    historicalValues: generateHistory(48.5, 12, 1.0, "flat"),
    unit: "index",
    description:
      "Institute for Supply Management Manufacturing PMI. Above 50 signals expansion, below 50 signals contraction.",
    marketImpact:
      "Manufacturing has been contracting for months. A move back above 50 would be a strong cyclical buy signal.",
  },
  {
    name: "ISM Services",
    category: "growth",
    currentValue: 53.8,
    previousValue: 53.4,
    change: 0.4,
    trend: "improving",
    historicalValues: generateHistory(53.8, 12, 1.5, "flat"),
    unit: "index",
    description:
      "ISM Services PMI. Services represent about 70% of U.S. GDP, making this a critical growth indicator.",
    marketImpact:
      "Resilient services keep the economy afloat despite weak manufacturing. Readings above 50 support the soft-landing narrative.",
  },
  {
    name: "Consumer Confidence",
    category: "consumer",
    currentValue: 100.4,
    previousValue: 97.0,
    change: 3.4,
    trend: "improving",
    historicalValues: generateHistory(100.4, 12, 4.0, "up"),
    unit: "index",
    description:
      "Conference Board Consumer Confidence Index. Measures how optimistic consumers feel about the economy and their finances.",
    marketImpact:
      "Higher confidence supports consumer spending (70% of GDP). Sharp drops often precede economic slowdowns.",
  },
  {
    name: "Retail Sales MoM",
    category: "consumer",
    currentValue: 0.1,
    previousValue: 0.3,
    change: -0.2,
    trend: "stable",
    historicalValues: generateHistory(0.1, 12, 0.4, "flat"),
    unit: "%",
    description:
      "Month-over-month change in retail and food services sales. A direct measure of consumer spending momentum.",
    marketImpact:
      "Strong retail sales support consumer discretionary stocks. Weak sales may signal slowing demand.",
  },
  {
    name: "Housing Starts",
    category: "housing",
    currentValue: 1.35,
    previousValue: 1.28,
    change: 0.07,
    trend: "improving",
    historicalValues: generateHistory(1.35, 12, 0.08, "flat"),
    unit: "M",
    description:
      "Annualized number of new residential construction projects started. A leading indicator of housing market health.",
    marketImpact:
      "Rising starts signal builder confidence and housing demand. Supports homebuilder stocks and housing-related sectors.",
  },
  {
    name: "Initial Jobless Claims",
    category: "employment",
    currentValue: 233,
    previousValue: 222,
    change: 11,
    trend: "stable",
    historicalValues: generateHistory(233, 12, 12, "flat"),
    unit: "K",
    description:
      "Weekly number of new unemployment insurance filings. The most timely measure of labor market conditions.",
    marketImpact:
      "Below 250K indicates a strong labor market. A sustained rise above 300K would signal recession risk.",
  },
  {
    name: "VIX",
    category: "consumer",
    currentValue: 13.5,
    previousValue: 12.8,
    change: 0.7,
    trend: "stable",
    historicalValues: generateHistory(13.5, 12, 3.0, "down"),
    unit: "index",
    description:
      "CBOE Volatility Index, or 'Fear Gauge.' Measures expected 30-day S&P 500 volatility derived from options prices.",
    marketImpact:
      "Below 15 indicates market complacency. Spikes above 30 often mark panic bottoms and buying opportunities.",
  },
  {
    name: "Nonfarm Payrolls",
    category: "employment",
    currentValue: 206,
    previousValue: 218,
    change: -12,
    trend: "stable",
    historicalValues: generateHistory(206, 12, 30, "flat"),
    unit: "K",
    description:
      "Monthly change in non-agricultural employment. The most closely watched employment report.",
    marketImpact:
      "Strong payrolls signal economic resilience. 'Goldilocks' readings (not too hot, not too cold) are ideal for markets.",
  },
];
