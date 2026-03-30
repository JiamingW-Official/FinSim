import { NextRequest, NextResponse } from "next/server";
import { getHistoricalData } from "@/services/market-data/yahoo";
import { marketDataCache } from "@/services/market-data/cache";
import { WATCHLIST_STOCKS } from "@/types/market";
import type { Timeframe } from "@/types/market";

const VALID_TIMEFRAMES: Timeframe[] = ["1d", "1wk"];
const VALID_TICKERS = WATCHLIST_STOCKS.map((s) => s.ticker);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const ticker = searchParams.get("ticker");
  const timeframe = searchParams.get("timeframe") as Timeframe | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!ticker || !timeframe || !from || !to) {
    return NextResponse.json(
      { error: "Missing required params: ticker, timeframe, from, to" },
      { status: 400 },
    );
  }

  if (!VALID_TICKERS.includes(ticker)) {
    return NextResponse.json(
      { error: `Invalid ticker. Allowed: ${VALID_TICKERS.join(", ")}` },
      { status: 400 },
    );
  }

  if (!VALID_TIMEFRAMES.includes(timeframe)) {
    return NextResponse.json(
      { error: `Invalid timeframe. Allowed: ${VALID_TIMEFRAMES.join(", ")}` },
      { status: 400 },
    );
  }

  // Check cache
  const cached = marketDataCache.get(ticker, timeframe, from, to);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const bars = await getHistoricalData(ticker, from, to, timeframe);
    marketDataCache.set(ticker, timeframe, from, to, bars);
    return NextResponse.json(bars);
  } catch (error) {
    // Market data fetch failed — return 502 to client
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 502 },
    );
  }
}
