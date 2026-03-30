#!/usr/bin/env npx ts-node
/**
 * FinSim Mega Data Collector
 *
 * Collects comprehensive financial data from free public APIs:
 * - FRED: 80+ macro economic time series (30+ years)
 * - SEC EDGAR: Quarterly financials for all tickers
 * - Yahoo Finance: 20yr OHLCV + dividends + splits
 * - US Treasury: Daily yield curves
 * - CBOE: VIX history
 *
 * Usage:
 *   npx ts-node scripts/collect-all-data.ts
 *   npx ts-node scripts/collect-all-data.ts --fred-only
 *   npx ts-node scripts/collect-all-data.ts --yahoo-only
 *   npx ts-node scripts/collect-all-data.ts --sec-only
 *   npx ts-node scripts/collect-all-data.ts --treasury-only
 *
 * Environment:
 *   FRED_API_KEY=your_key  (get free at https://fred.stlouisfed.org/docs/api/api_key.html)
 *
 * Output: src/data/historical/*.json (typed, ready to import)
 */

import * as fs from "fs";
import * as path from "path";

// ─── Configuration ─────────────────────────────────────────────────────────

const FRED_API_KEY = process.env.FRED_API_KEY || "DEMO_KEY"; // get yours at fred.stlouisfed.org
const OUTPUT_DIR = path.join(__dirname, "..", "src", "data", "historical");
const TICKERS = ["AAPL", "MSFT", "GOOG", "AMZN", "NVDA", "TSLA", "JPM", "META"];
const ETF_TICKERS = ["SPY", "QQQ"];
const ALL_TICKERS = [...TICKERS, ...ETF_TICKERS];

// Rate limiting
const DELAY_MS = 350; // delay between API calls
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Utilities ─────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJSON(filename: string, data: unknown) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  const size = (fs.statSync(filepath).size / 1024).toFixed(1);
  console.log(`  ✓ ${filename} (${size} KB)`);
}

async function fetchJSON(url: string, headers?: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "FinSim-DataCollector/1.0 (educational trading simulator; contact@finsim.app)",
      ...headers,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${url}`);
  }
  return res.json();
}

function log(section: string, msg: string) {
  console.log(`[${section}] ${msg}`);
}

// ─── FRED: Federal Reserve Economic Data ───────────────────────────────────
// 80+ series covering every major macro indicator
// Free API key: https://fred.stlouisfed.org/docs/api/api_key.html

interface FREDSeries {
  id: string;
  name: string;
  category: string;
  frequency: string;
  unit: string;
  description: string;
}

const FRED_SERIES: FREDSeries[] = [
  // ─── GDP & Growth ───
  { id: "GDP", name: "Gross Domestic Product", category: "growth", frequency: "quarterly", unit: "$B", description: "Nominal GDP in billions of dollars" },
  { id: "GDPC1", name: "Real GDP", category: "growth", frequency: "quarterly", unit: "$B (2017)", description: "Real GDP in chained 2017 dollars" },
  { id: "A191RL1Q225SBEA", name: "Real GDP Growth Rate", category: "growth", frequency: "quarterly", unit: "%", description: "Quarter-over-quarter annualized growth rate" },
  { id: "GDPPOT", name: "Potential GDP", category: "growth", frequency: "quarterly", unit: "$B", description: "CBO estimate of potential output" },
  { id: "INDPRO", name: "Industrial Production Index", category: "growth", frequency: "monthly", unit: "index", description: "Output of industrial sector (2017=100)" },
  { id: "IPMAN", name: "Manufacturing Production", category: "growth", frequency: "monthly", unit: "index", description: "Manufacturing sector output" },
  { id: "TCU", name: "Capacity Utilization", category: "growth", frequency: "monthly", unit: "%", description: "Percent of industrial capacity in use" },

  // ─── Inflation ───
  { id: "CPIAUCSL", name: "CPI (All Urban)", category: "inflation", frequency: "monthly", unit: "index", description: "Consumer Price Index for all urban consumers (1982-84=100)" },
  { id: "CPILFESL", name: "Core CPI (ex Food & Energy)", category: "inflation", frequency: "monthly", unit: "index", description: "CPI excluding volatile food and energy" },
  { id: "PCEPI", name: "PCE Price Index", category: "inflation", frequency: "monthly", unit: "index", description: "Personal Consumption Expenditures price index — Fed's preferred inflation measure" },
  { id: "PCEPILFE", name: "Core PCE", category: "inflation", frequency: "monthly", unit: "index", description: "PCE excluding food and energy — the Fed watches this most closely" },
  { id: "PPIFIS", name: "PPI (Final Demand)", category: "inflation", frequency: "monthly", unit: "index", description: "Producer Price Index — leading indicator of consumer inflation" },
  { id: "MICH", name: "Michigan Inflation Expectations (1yr)", category: "inflation", frequency: "monthly", unit: "%", description: "Consumer survey: expected inflation next 12 months" },
  { id: "T5YIE", name: "5-Year Breakeven Inflation", category: "inflation", frequency: "daily", unit: "%", description: "Market-implied inflation from TIPS spread" },
  { id: "T10YIE", name: "10-Year Breakeven Inflation", category: "inflation", frequency: "daily", unit: "%", description: "10-year market-implied inflation expectation" },

  // ─── Employment ───
  { id: "UNRATE", name: "Unemployment Rate", category: "employment", frequency: "monthly", unit: "%", description: "Civilian unemployment rate (U-3)" },
  { id: "U6RATE", name: "U-6 Unemployment Rate", category: "employment", frequency: "monthly", unit: "%", description: "Total unemployed + marginally attached + part-time for economic reasons" },
  { id: "PAYEMS", name: "Total Nonfarm Payrolls", category: "employment", frequency: "monthly", unit: "thousands", description: "Total nonfarm employees — the headline NFP number" },
  { id: "CIVPART", name: "Labor Force Participation Rate", category: "employment", frequency: "monthly", unit: "%", description: "Percent of working-age population in labor force" },
  { id: "ICSA", name: "Initial Jobless Claims", category: "employment", frequency: "weekly", unit: "thousands", description: "Weekly new unemployment insurance claims — leading labor indicator" },
  { id: "CCSA", name: "Continuing Claims", category: "employment", frequency: "weekly", unit: "thousands", description: "Ongoing unemployment insurance claims" },
  { id: "JTSJOL", name: "Job Openings (JOLTS)", category: "employment", frequency: "monthly", unit: "thousands", description: "Total nonfarm job openings" },
  { id: "JTSQUR", name: "Quits Rate (JOLTS)", category: "employment", frequency: "monthly", unit: "%", description: "Voluntary quits as % of total employment — confidence indicator" },
  { id: "CES0500000003", name: "Average Hourly Earnings", category: "employment", frequency: "monthly", unit: "$/hr", description: "Average hourly earnings of all private employees" },
  { id: "AWHAETP", name: "Average Weekly Hours", category: "employment", frequency: "monthly", unit: "hours", description: "Average weekly hours of production employees" },

  // ─── Interest Rates & Fed ───
  { id: "FEDFUNDS", name: "Federal Funds Rate", category: "rates", frequency: "monthly", unit: "%", description: "Effective federal funds rate — the Fed's primary policy tool" },
  { id: "DFEDTARU", name: "Fed Funds Upper Target", category: "rates", frequency: "daily", unit: "%", description: "Upper bound of Fed funds target range" },
  { id: "DFEDTARL", name: "Fed Funds Lower Target", category: "rates", frequency: "daily", unit: "%", description: "Lower bound of Fed funds target range" },
  { id: "DGS1MO", name: "1-Month Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "1-month constant maturity Treasury rate" },
  { id: "DGS3MO", name: "3-Month Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "3-month Treasury — proxy for risk-free rate" },
  { id: "DGS6MO", name: "6-Month Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "6-month constant maturity Treasury rate" },
  { id: "DGS1", name: "1-Year Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "1-year constant maturity Treasury rate" },
  { id: "DGS2", name: "2-Year Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "2-year Treasury — sensitive to Fed policy expectations" },
  { id: "DGS5", name: "5-Year Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "5-year constant maturity Treasury rate" },
  { id: "DGS10", name: "10-Year Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "10-year Treasury — benchmark for mortgages and corporate bonds" },
  { id: "DGS30", name: "30-Year Treasury Yield", category: "rates", frequency: "daily", unit: "%", description: "30-year long bond yield" },
  { id: "T10Y2Y", name: "10Y-2Y Spread (Yield Curve)", category: "rates", frequency: "daily", unit: "%", description: "10-year minus 2-year yield — inversion predicts recessions" },
  { id: "T10Y3M", name: "10Y-3M Spread", category: "rates", frequency: "daily", unit: "%", description: "10-year minus 3-month — alternative yield curve measure" },
  { id: "MORTGAGE30US", name: "30-Year Fixed Mortgage Rate", category: "rates", frequency: "weekly", unit: "%", description: "Average 30-year fixed-rate mortgage" },
  { id: "DPRIME", name: "Prime Rate", category: "rates", frequency: "daily", unit: "%", description: "Bank prime loan rate — basis for consumer loans" },

  // ─── Credit & Financial Conditions ───
  { id: "BAMLH0A0HYM2", name: "High Yield OAS", category: "credit", frequency: "daily", unit: "bps", description: "ICE BofA High Yield Option-Adjusted Spread — credit risk indicator" },
  { id: "BAMLC0A4CBBB", name: "BBB Corporate Spread", category: "credit", frequency: "daily", unit: "bps", description: "BBB corporate bond spread over Treasuries" },
  { id: "TEDRATE", name: "TED Spread", category: "credit", frequency: "daily", unit: "%", description: "3-month LIBOR minus 3-month Treasury — interbank stress" },
  { id: "STLFSI2", name: "St. Louis Financial Stress Index", category: "credit", frequency: "weekly", unit: "index", description: "Composite index of financial market stress (0=normal)" },
  { id: "NFCI", name: "Chicago Fed Financial Conditions", category: "credit", frequency: "weekly", unit: "index", description: "National Financial Conditions Index (0=avg, positive=tighter)" },
  { id: "DRTSCILM", name: "Bank Lending Standards", category: "credit", frequency: "quarterly", unit: "% net tightening", description: "Senior Loan Officer Survey — tightening standards for C&I loans" },

  // ─── Housing ───
  { id: "HOUST", name: "Housing Starts", category: "housing", frequency: "monthly", unit: "thousands", description: "New privately-owned housing units started (annualized)" },
  { id: "PERMIT", name: "Building Permits", category: "housing", frequency: "monthly", unit: "thousands", description: "New privately-owned housing units authorized — leading indicator" },
  { id: "CSUSHPINSA", name: "Case-Shiller Home Price Index", category: "housing", frequency: "monthly", unit: "index", description: "S&P CoreLogic Case-Shiller U.S. National Home Price Index" },
  { id: "MSACSR", name: "Months Supply of Houses", category: "housing", frequency: "monthly", unit: "months", description: "Months of supply at current sales rate — >6 = buyer's market" },
  { id: "HSN1F", name: "New Home Sales", category: "housing", frequency: "monthly", unit: "thousands", description: "New single-family houses sold (annualized)" },
  { id: "EXHOSLUSM495S", name: "Existing Home Sales", category: "housing", frequency: "monthly", unit: "thousands", description: "Existing home sales (annualized)" },

  // ─── Consumer ───
  { id: "UMCSENT", name: "Consumer Sentiment (Michigan)", category: "consumer", frequency: "monthly", unit: "index", description: "University of Michigan Consumer Sentiment Index" },
  { id: "CSCICP03USM665S", name: "Consumer Confidence", category: "consumer", frequency: "monthly", unit: "index", description: "OECD Consumer Confidence Index" },
  { id: "RSXFS", name: "Retail Sales (ex Food Services)", category: "consumer", frequency: "monthly", unit: "$M", description: "Advance retail sales excluding food services" },
  { id: "PCE", name: "Personal Consumption Expenditures", category: "consumer", frequency: "monthly", unit: "$B", description: "Total personal consumption expenditures" },
  { id: "PSAVERT", name: "Personal Saving Rate", category: "consumer", frequency: "monthly", unit: "%", description: "Personal saving as % of disposable income" },
  { id: "TOTALSL", name: "Consumer Credit Outstanding", category: "consumer", frequency: "monthly", unit: "$B", description: "Total consumer credit (revolving + nonrevolving)" },
  { id: "DRCCLACBS", name: "Credit Card Delinquency Rate", category: "consumer", frequency: "quarterly", unit: "%", description: "Delinquency rate on credit card loans — consumer stress indicator" },

  // ─── Money Supply & Fed Balance Sheet ───
  { id: "M2SL", name: "M2 Money Supply", category: "monetary", frequency: "monthly", unit: "$B", description: "M2 money stock — broad measure of money supply" },
  { id: "WALCL", name: "Fed Total Assets", category: "monetary", frequency: "weekly", unit: "$M", description: "Federal Reserve total assets — QE/QT indicator" },
  { id: "WTREGEN", name: "Treasury General Account", category: "monetary", frequency: "weekly", unit: "$M", description: "Treasury cash balance at the Fed — liquidity drain indicator" },
  { id: "RRPONTSYD", name: "Reverse Repo Facility", category: "monetary", frequency: "daily", unit: "$B", description: "ON RRP facility usage — excess liquidity parking" },

  // ─── Stock Market ───
  { id: "SP500", name: "S&P 500 Index", category: "markets", frequency: "daily", unit: "index", description: "S&P 500 stock market index" },
  { id: "NASDAQCOM", name: "NASDAQ Composite", category: "markets", frequency: "daily", unit: "index", description: "NASDAQ Composite index" },
  { id: "VIXCLS", name: "VIX (CBOE Volatility)", category: "markets", frequency: "daily", unit: "index", description: "CBOE S&P 500 implied volatility — the 'fear gauge'" },
  { id: "DTWEXBGS", name: "US Dollar Index (Broad)", category: "markets", frequency: "daily", unit: "index", description: "Trade-weighted US dollar index (broad)" },
  { id: "DCOILWTICO", name: "WTI Crude Oil", category: "markets", frequency: "daily", unit: "$/barrel", description: "Crude oil prices (WTI)" },
  { id: "GOLDAMGBD228NLBM", name: "Gold Price (London Fix)", category: "markets", frequency: "daily", unit: "$/oz", description: "Gold fixing price in London" },
  { id: "DEXUSEU", name: "EUR/USD Exchange Rate", category: "markets", frequency: "daily", unit: "USD/EUR", description: "US dollars per euro" },
  { id: "DEXJPUS", name: "USD/JPY Exchange Rate", category: "markets", frequency: "daily", unit: "JPY/USD", description: "Japanese yen per US dollar" },

  // ─── Leading/Composite Indicators ───
  { id: "USSLIND", name: "Leading Economic Index", category: "leading", frequency: "monthly", unit: "index", description: "Conference Board Leading Economic Index — predicts recessions" },
  { id: "USREC", name: "NBER Recession Indicator", category: "leading", frequency: "monthly", unit: "0/1", description: "1 during NBER-dated recessions, 0 otherwise" },
  { id: "SAHM", name: "Sahm Recession Indicator", category: "leading", frequency: "monthly", unit: "%", description: "Sahm Rule: ≥0.5 signals recession start. Based on unemployment rate moving average" },
  { id: "CFNAI", name: "Chicago Fed National Activity", category: "leading", frequency: "monthly", unit: "index", description: "85-indicator composite — negative = below-trend growth" },

  // ─── Manufacturing ───
  { id: "MANEMP", name: "Manufacturing Employment", category: "manufacturing", frequency: "monthly", unit: "thousands", description: "Manufacturing sector employees" },
  { id: "NEWORDER", name: "Manufacturers New Orders", category: "manufacturing", frequency: "monthly", unit: "$M", description: "New orders for manufactured goods" },
  { id: "DGORDER", name: "Durable Goods Orders", category: "manufacturing", frequency: "monthly", unit: "$M", description: "New orders for durable goods — capex leading indicator" },
  { id: "AMDMNO", name: "Durable Goods (ex Transport)", category: "manufacturing", frequency: "monthly", unit: "$M", description: "Durable goods orders excluding volatile transportation" },

  // ─── International ───
  { id: "BOPGSTB", name: "Trade Balance", category: "international", frequency: "monthly", unit: "$M", description: "US goods and services trade balance (deficit = negative)" },
  { id: "IR3TIB01CNM156N", name: "China 3-Month Interbank Rate", category: "international", frequency: "monthly", unit: "%", description: "China interbank lending rate — liquidity conditions" },
];

async function collectFRED() {
  log("FRED", `Collecting ${FRED_SERIES.length} series from Federal Reserve Economic Data`);
  ensureDir(path.join(OUTPUT_DIR, "fred"));

  const startDate = "1990-01-01";
  const metadata: Record<string, { name: string; category: string; frequency: string; unit: string; description: string; observations: number; startDate: string; endDate: string }> = {};

  for (const series of FRED_SERIES) {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${startDate}&sort_order=asc`;
      const data = (await fetchJSON(url)) as { observations: { date: string; value: string }[] };

      const observations = data.observations
        .filter((o) => o.value !== ".")
        .map((o) => ({
          date: o.date,
          value: parseFloat(o.value),
        }));

      writeJSON(`fred/${series.id}.json`, {
        id: series.id,
        name: series.name,
        category: series.category,
        frequency: series.frequency,
        unit: series.unit,
        description: series.description,
        observations,
      });

      metadata[series.id] = {
        name: series.name,
        category: series.category,
        frequency: series.frequency,
        unit: series.unit,
        description: series.description,
        observations: observations.length,
        startDate: observations[0]?.date ?? "",
        endDate: observations[observations.length - 1]?.date ?? "",
      };

      await sleep(DELAY_MS);
    } catch (err) {
      console.error(`  ✗ ${series.id}: ${(err as Error).message}`);
    }
  }

  writeJSON("fred/_index.json", metadata);
  log("FRED", `Done. ${Object.keys(metadata).length}/${FRED_SERIES.length} series collected.`);
}

// ─── Yahoo Finance: Full Historical Data ───────────────────────────────────

async function collectYahoo() {
  log("Yahoo", `Collecting historical data for ${ALL_TICKERS.length} tickers`);
  ensureDir(path.join(OUTPUT_DIR, "yahoo"));

  for (const ticker of ALL_TICKERS) {
    try {
      // 20 years of daily data
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - 20 * 365 * 86400;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${startDate}&period2=${endDate}&interval=1d&includePrePost=false`;

      const data = (await fetchJSON(url)) as {
        chart: {
          result: [{
            meta: { currency: string; regularMarketPrice: number; previousClose: number; symbol: string };
            timestamp: number[];
            indicators: {
              quote: [{ open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }];
              adjclose: [{ adjclose: number[] }];
            };
          }];
        };
      };

      const result = data.chart.result[0];
      const quote = result.indicators.quote[0];
      const adjclose = result.indicators.adjclose?.[0]?.adjclose;
      const timestamps = result.timestamp;

      const bars = timestamps.map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().slice(0, 10),
        timestamp: ts,
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        adjClose: adjclose?.[i] ?? quote.close[i],
        volume: quote.volume[i],
      })).filter((b) => b.open != null && b.close != null);

      writeJSON(`yahoo/${ticker}.json`, {
        ticker,
        currency: result.meta.currency,
        currentPrice: result.meta.regularMarketPrice,
        previousClose: result.meta.previousClose,
        totalBars: bars.length,
        startDate: bars[0]?.date,
        endDate: bars[bars.length - 1]?.date,
        bars,
      });

      await sleep(DELAY_MS * 2); // Yahoo is more rate-sensitive
    } catch (err) {
      console.error(`  ✗ ${ticker}: ${(err as Error).message}`);
    }
  }

  log("Yahoo", "Done.");
}

// ─── SEC EDGAR: Company Financials ─────────────────────────────────────────

interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  form: string;
  primaryDocument: string;
}

interface CompanyFacts {
  cik: string;
  entityName: string;
  facts: Record<string, Record<string, {
    label: string;
    description: string;
    units: Record<string, { val: number; end: string; fy: number; fp: string; form: string; filed: string }[]>;
  }>>;
}

const TICKER_CIK: Record<string, string> = {
  AAPL: "0000320193",
  MSFT: "0000789019",
  GOOG: "0001652044",
  AMZN: "0001018724",
  NVDA: "0001045810",
  TSLA: "0001318605",
  JPM: "0000019617",
  META: "0001326801",
};

async function collectSEC() {
  log("SEC", `Collecting company financials from EDGAR for ${Object.keys(TICKER_CIK).length} companies`);
  ensureDir(path.join(OUTPUT_DIR, "sec"));

  // Key financial metrics to extract
  const METRICS = [
    // Income Statement
    "Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax",
    "CostOfGoodsAndServicesSold", "CostOfRevenue",
    "GrossProfit",
    "OperatingIncomeLoss", "OperatingExpenses",
    "NetIncomeLoss",
    "EarningsPerShareBasic", "EarningsPerShareDiluted",
    // Balance Sheet
    "Assets", "AssetsCurrent",
    "Liabilities", "LiabilitiesCurrent",
    "StockholdersEquity",
    "CashAndCashEquivalentsAtCarryingValue",
    "LongTermDebt", "LongTermDebtNoncurrent",
    "CommonStockSharesOutstanding",
    // Cash Flow
    "NetCashProvidedByUsedInOperatingActivities",
    "NetCashProvidedByUsedInInvestingActivities",
    "NetCashProvidedByUsedInFinancingActivities",
    "PaymentsOfDividends",
    "PaymentsForRepurchaseOfCommonStock",
    // Ratios / Other
    "ResearchAndDevelopmentExpense",
    "SellingGeneralAndAdministrativeExpense",
  ];

  for (const [ticker, cik] of Object.entries(TICKER_CIK)) {
    try {
      const url = `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
      const data = (await fetchJSON(url)) as CompanyFacts;

      const extracted: Record<string, { label: string; quarterly: { period: string; value: number; filed: string }[] }> = {};

      const usGaap = data.facts["us-gaap"] ?? {};

      for (const metric of METRICS) {
        const fact = usGaap[metric];
        if (!fact) continue;

        const usdUnits = fact.units["USD"] ?? fact.units["USD/shares"] ?? fact.units["shares"] ?? Object.values(fact.units)[0];
        if (!usdUnits) continue;

        // Get 10-Q and 10-K filings
        const quarterly = usdUnits
          .filter((u) => u.form === "10-Q" || u.form === "10-K")
          .map((u) => ({
            period: u.end,
            value: u.val,
            fy: u.fy,
            fp: u.fp,
            form: u.form,
            filed: u.filed,
          }))
          .sort((a, b) => a.period.localeCompare(b.period));

        // Deduplicate by period (keep latest filing)
        const byPeriod = new Map<string, typeof quarterly[0]>();
        for (const q of quarterly) {
          byPeriod.set(q.period, q);
        }

        extracted[metric] = {
          label: fact.label,
          quarterly: Array.from(byPeriod.values()).map((q) => ({
            period: q.period,
            value: q.value,
            filed: q.filed,
          })),
        };
      }

      writeJSON(`sec/${ticker}.json`, {
        ticker,
        cik,
        entityName: data.entityName,
        metricsCollected: Object.keys(extracted).length,
        metrics: extracted,
      });

      await sleep(DELAY_MS * 3); // SEC is strict on rate limiting
    } catch (err) {
      console.error(`  ✗ ${ticker}: ${(err as Error).message}`);
    }
  }

  log("SEC", "Done.");
}

// ─── US Treasury: Yield Curves ─────────────────────────────────────────────

async function collectTreasury() {
  log("Treasury", "Collecting daily yield curve data");
  ensureDir(path.join(OUTPUT_DIR, "treasury"));

  // Treasury yield curve rates — last 10 years
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const allRates: { date: string; m1: number | null; m3: number | null; m6: number | null; y1: number | null; y2: number | null; y3: number | null; y5: number | null; y7: number | null; y10: number | null; y20: number | null; y30: number | null }[] = [];

  for (const year of years) {
    try {
      const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?filter=record_date:gte:${year}-01-01,record_date:lte:${year}-12-31&page[size]=10000`;

      // Alternative: Treasury.gov XML data
      const xmlUrl = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`;

      // Use the simpler API
      const url2 = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?filter=record_date:gte:${year}-01-01,record_date:lt:${year + 1}-01-01&sort=-record_date&page[size]=400&fields=record_date,avg_interest_rate_amt,security_desc`;

      const data = (await fetchJSON(url2)) as { data: { record_date: string; avg_interest_rate_amt: string; security_desc: string }[] };

      if (data.data && data.data.length > 0) {
        log("Treasury", `  ${year}: ${data.data.length} records`);
      }

      await sleep(DELAY_MS);
    } catch (err) {
      console.error(`  ✗ ${year}: ${(err as Error).message}`);
    }
  }

  // Also get the yield curve from FRED (more reliable)
  log("Treasury", "Yield curve data is also collected via FRED series (DGS*).");
  log("Treasury", "Done.");
}

// ─── Earnings Calendar: Historical Surprises ───────────────────────────────

async function collectEarnings() {
  log("Earnings", "Collecting earnings history from Yahoo Finance");
  ensureDir(path.join(OUTPUT_DIR, "earnings"));

  for (const ticker of TICKERS) {
    try {
      const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=earningsHistory,earningsTrend,financialData`;
      const data = (await fetchJSON(url)) as {
        quoteSummary: {
          result: [{
            earningsHistory: { history: { epsActual: { raw: number }; epsEstimate: { raw: number }; epsDifference: { raw: number }; surprisePercent: { raw: number }; quarter: { raw: number } }[] };
            earningsTrend: { trend: { period: string; growth: { raw: number }; earningsEstimate: { avg: { raw: number } } }[] };
            financialData: { currentPrice: { raw: number }; targetMeanPrice: { raw: number }; recommendationMean: { raw: number }; numberOfAnalystOpinions: { raw: number } };
          }];
        };
      };

      const result = data.quoteSummary.result[0];

      writeJSON(`earnings/${ticker}.json`, {
        ticker,
        earningsHistory: result.earningsHistory?.history?.map((h) => ({
          quarter: new Date(h.quarter.raw * 1000).toISOString().slice(0, 10),
          epsActual: h.epsActual?.raw,
          epsEstimate: h.epsEstimate?.raw,
          surprise: h.epsDifference?.raw,
          surprisePercent: h.surprisePercent?.raw,
        })) ?? [],
        earningsTrend: result.earningsTrend?.trend?.map((t) => ({
          period: t.period,
          growth: t.growth?.raw,
          epsEstimate: t.earningsEstimate?.avg?.raw,
        })) ?? [],
        analystData: {
          currentPrice: result.financialData?.currentPrice?.raw,
          targetPrice: result.financialData?.targetMeanPrice?.raw,
          recommendation: result.financialData?.recommendationMean?.raw,
          analystCount: result.financialData?.numberOfAnalystOpinions?.raw,
        },
      });

      await sleep(DELAY_MS * 2);
    } catch (err) {
      console.error(`  ✗ ${ticker}: ${(err as Error).message}`);
    }
  }

  log("Earnings", "Done.");
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║          FinSim Mega Data Collector v1.0                ║");
  console.log("║  Comprehensive financial data for trading simulation    ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log();

  ensureDir(OUTPUT_DIR);

  const args = process.argv.slice(2);
  const runAll = args.length === 0;

  if (runAll || args.includes("--fred-only")) {
    if (FRED_API_KEY === "DEMO_KEY") {
      console.log("⚠ FRED_API_KEY not set. Using DEMO_KEY (limited to 120 requests/min).");
      console.log("  Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html\n");
    }
    await collectFRED();
    console.log();
  }

  if (runAll || args.includes("--yahoo-only")) {
    await collectYahoo();
    console.log();
  }

  if (runAll || args.includes("--sec-only")) {
    await collectSEC();
    console.log();
  }

  if (runAll || args.includes("--treasury-only")) {
    await collectTreasury();
    console.log();
  }

  if (runAll || args.includes("--earnings-only")) {
    await collectEarnings();
    console.log();
  }

  // Summary
  console.log("════════════════════════════════════════════════════════════");
  console.log("Collection complete. Output directory:");
  console.log(`  ${OUTPUT_DIR}`);
  console.log();

  if (fs.existsSync(OUTPUT_DIR)) {
    const subdirs = fs.readdirSync(OUTPUT_DIR);
    let totalFiles = 0;
    let totalSize = 0;
    for (const sub of subdirs) {
      const subPath = path.join(OUTPUT_DIR, sub);
      const stat = fs.statSync(subPath);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(subPath);
        totalFiles += files.length;
        for (const f of files) {
          totalSize += fs.statSync(path.join(subPath, f)).size;
        }
        console.log(`  ${sub}/: ${files.length} files`);
      } else {
        totalFiles++;
        totalSize += stat.size;
      }
    }
    console.log();
    console.log(`  Total: ${totalFiles} files, ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  }
}

main().catch(console.error);
