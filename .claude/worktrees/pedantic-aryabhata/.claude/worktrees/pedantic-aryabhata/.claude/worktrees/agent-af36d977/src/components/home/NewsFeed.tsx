"use client";

import { useMemo } from "react";
import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";

/* ------------------------------------------------------------------ */
/*  Mulberry32 seeded PRNG                                             */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashDate(dateStr: string): number {
  let h = 0xdeadbeef;
  for (let i = 0; i < dateStr.length; i++) {
    h = (Math.imul(h, 31) + dateStr.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/* ------------------------------------------------------------------ */
/*  Headline database keyed by ticker                                  */
/* ------------------------------------------------------------------ */

interface HeadlineEntry {
  ticker: string | null; // null = market-wide
  headline: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
}

const HEADLINES: HeadlineEntry[] = [
  // AAPL
  { ticker: "AAPL", headline: "Apple reports record Q4 earnings, beats EPS estimates by 12%", source: "Bloomberg", sentiment: "positive" },
  { ticker: "AAPL", headline: "Apple Vision Pro supply ramp accelerates ahead of holiday season", source: "Reuters", sentiment: "positive" },
  { ticker: "AAPL", headline: "Apple warns of slower iPhone upgrade cycle amid macro headwinds", source: "WSJ", sentiment: "negative" },
  // MSFT
  { ticker: "MSFT", headline: "Microsoft Azure revenue grows 29% YoY, beats cloud estimates", source: "CNBC", sentiment: "positive" },
  { ticker: "MSFT", headline: "Microsoft Copilot adoption reaches 1 million enterprise seats", source: "Bloomberg", sentiment: "positive" },
  // GOOG
  { ticker: "GOOG", headline: "Alphabet advertising revenue rebounds as AI-powered search gains traction", source: "FT", sentiment: "positive" },
  { ticker: "GOOG", headline: "Google faces new antitrust probe over AI search dominance", source: "Reuters", sentiment: "negative" },
  // NVDA
  { ticker: "NVDA", headline: "NVIDIA Blackwell GPU demand outpaces supply, CEO says", source: "Bloomberg", sentiment: "positive" },
  { ticker: "NVDA", headline: "NVIDIA data center revenue hits $18.4B, smashes analyst forecasts", source: "CNBC", sentiment: "positive" },
  // TSLA
  { ticker: "TSLA", headline: "Tesla Q3 deliveries miss consensus by 4%, stock drops after-hours", source: "WSJ", sentiment: "negative" },
  { ticker: "TSLA", headline: "Tesla Full Self-Driving Version 13 shows significant improvement in autonomy", source: "Electrek", sentiment: "positive" },
  // META
  { ticker: "META", headline: "Meta advertising revenue hits $39.9B on AI-targeting improvements", source: "Bloomberg", sentiment: "positive" },
  { ticker: "META", headline: "Meta Llama 4 open-source model outperforms GPT-4 on key benchmarks", source: "TechCrunch", sentiment: "positive" },
  // AMZN
  { ticker: "AMZN", headline: "Amazon AWS operating income surges 60% as enterprise cloud demand holds", source: "Reuters", sentiment: "positive" },
  { ticker: "AMZN", headline: "Amazon Prime Day sets record, generating $14.2B in two-day global sales", source: "CNBC", sentiment: "positive" },
  // JPM
  { ticker: "JPM", headline: "JPMorgan Chase Q3 net income rises 35% on higher net interest income", source: "Bloomberg", sentiment: "positive" },
  { ticker: "JPM", headline: "JPMorgan CEO warns of stagflation risk, sees 30% probability of recession", source: "FT", sentiment: "negative" },
  // SPY / QQQ / market-wide
  { ticker: null, headline: "Fed holds rates steady at 5.25–5.50%, signals data-dependent path ahead", source: "Federal Reserve", sentiment: "neutral" },
  { ticker: null, headline: "S&P 500 closes at all-time high as earnings season beats estimates by 7%", source: "Bloomberg", sentiment: "positive" },
  { ticker: null, headline: "CPI cools to 2.4% YoY, boosting expectations for mid-year rate cuts", source: "BLS", sentiment: "positive" },
  { ticker: null, headline: "Yield curve briefly inverts again as 10-year Treasury touches 4.9%", source: "Reuters", sentiment: "negative" },
  { ticker: null, headline: "Goldman Sachs raises S&P 500 year-end target to 5,800 on AI productivity thesis", source: "GS Research", sentiment: "positive" },
  { ticker: null, headline: "Retail sales miss expectations, raising concerns about consumer spending slowdown", source: "Commerce Dept.", sentiment: "negative" },
  { ticker: null, headline: "Oil prices rise 3% on OPEC+ production cut extension through Q2", source: "Reuters", sentiment: "neutral" },
  { ticker: null, headline: "Small-cap stocks rally as rate-cut optimism boosts cyclical sectors", source: "WSJ", sentiment: "positive" },
];

/* ------------------------------------------------------------------ */
/*  Headline selection logic                                           */
/* ------------------------------------------------------------------ */

function pickHeadlines(
  tradedTickers: string[],
  dateStr: string,
  count: number,
): HeadlineEntry[] {
  const rand = mulberry32(hashDate(dateStr));

  // Bucket headlines: those relevant to user's tickers vs market-wide
  const relevant = HEADLINES.filter(
    (h) => h.ticker !== null && tradedTickers.includes(h.ticker),
  );
  const marketWide = HEADLINES.filter((h) => h.ticker === null);
  const other = HEADLINES.filter(
    (h) => h.ticker !== null && !tradedTickers.includes(h.ticker),
  );

  // Build a pool: prefer relevant, fill with market-wide, then other
  const pool: HeadlineEntry[] = [];
  const used = new Set<string>();

  const addFrom = (arr: HeadlineEntry[]) => {
    // Fisher-Yates shuffle the array using seeded rand
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    for (const h of copy) {
      if (!used.has(h.headline)) {
        pool.push(h);
        used.add(h.headline);
      }
    }
  };

  addFrom(relevant);
  addFrom(marketWide);
  addFrom(other);

  return pool.slice(0, count);
}

/* ------------------------------------------------------------------ */
/*  Time display helper                                                */
/* ------------------------------------------------------------------ */

const TIMES = ["2m ago", "11m ago", "27m ago", "45m ago", "1h ago"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const SENTIMENT_DOT = {
  positive: "bg-green-400",
  negative: "bg-red-400",
  neutral: "bg-muted-foreground",
};

export function NewsFeed() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const today = new Date().toISOString().slice(0, 10);

  const tradedTickers = useMemo(() => {
    const tickers = new Set<string>();
    for (const t of tradeHistory) tickers.add(t.ticker);
    return Array.from(tickers);
  }, [tradeHistory]);

  const headlines = useMemo(
    () => pickHeadlines(tradedTickers, today, 5),
    [tradedTickers, today],
  );

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Newspaper className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Market News
        </h2>
      </div>

      <ul className="divide-y divide-border/30">
        {headlines.map((h, idx) => (
          <li key={h.headline} className="flex items-start gap-2.5 py-2.5">
            <div
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                SENTIMENT_DOT[h.sentiment],
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium leading-snug line-clamp-2">
                {h.headline}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {h.ticker && (
                  <span className="text-[9px] font-semibold text-primary/70 tabular-nums">
                    {h.ticker}
                  </span>
                )}
                <span className="text-[9px] text-muted-foreground/60">
                  {h.source}
                </span>
                <span className="text-[9px] text-muted-foreground/40">
                  {TIMES[idx] ?? "1h ago"}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
