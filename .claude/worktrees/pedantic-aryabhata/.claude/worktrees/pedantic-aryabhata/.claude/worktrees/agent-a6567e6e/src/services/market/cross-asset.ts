// ── Cross-Asset Correlation & Regime Analysis ────────────────────────────────

export interface CrossAssetData {
  asset: string;
  ticker: string;
  category: "equity" | "bond" | "commodity" | "currency" | "volatility" | "credit";
  price: number;
  change1d: number;
  change1w: number;
  change1m: number;
  change3m: number;
  changeYtd: number;
}

export interface CrossAssetCorrelation {
  asset1: string;
  asset2: string;
  correlation30d: number;
  correlation90d: number;
  correlation1y: number;
}

export interface MarketRegime {
  name: string;
  confidence: number;
  signals: string[];
  implications: { assetClass: string; outlook: string }[];
}

// ── Seeded PRNG ──────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed & 0x7fffffff;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

// ── Base mid-2024 asset prices ───────────────────────────────────────────────

interface AssetBase {
  asset: string;
  ticker: string;
  category: CrossAssetData["category"];
  basePrice: number;
  volatility: number; // daily vol multiplier
}

const ASSETS: AssetBase[] = [
  { asset: "S&P 500",       ticker: "SPX",    category: "equity",     basePrice: 5460,   volatility: 0.008 },
  { asset: "NASDAQ 100",    ticker: "NDX",    category: "equity",     basePrice: 19700,  volatility: 0.011 },
  { asset: "Russell 2000",  ticker: "RUT",    category: "equity",     basePrice: 2030,   volatility: 0.012 },
  { asset: "Dow Jones",     ticker: "DJI",    category: "equity",     basePrice: 39200,  volatility: 0.007 },
  { asset: "10Y Treasury",  ticker: "TNX",    category: "bond",       basePrice: 4.28,   volatility: 0.015 },
  { asset: "2Y Treasury",   ticker: "T2Y",    category: "bond",       basePrice: 4.72,   volatility: 0.012 },
  { asset: "Gold",          ticker: "GC",     category: "commodity",  basePrice: 2340,   volatility: 0.007 },
  { asset: "Silver",        ticker: "SI",     category: "commodity",  basePrice: 29.5,   volatility: 0.014 },
  { asset: "Oil WTI",       ticker: "CL",     category: "commodity",  basePrice: 81.2,   volatility: 0.016 },
  { asset: "Natural Gas",   ticker: "NG",     category: "commodity",  basePrice: 2.65,   volatility: 0.025 },
  { asset: "DXY Dollar",    ticker: "DXY",    category: "currency",   basePrice: 105.6,  volatility: 0.004 },
  { asset: "EUR/USD",       ticker: "EURUSD", category: "currency",   basePrice: 1.072,  volatility: 0.004 },
  { asset: "Bitcoin",       ticker: "BTC",    category: "currency",   basePrice: 64200,  volatility: 0.025 },
  { asset: "VIX",           ticker: "VIX",    category: "volatility", basePrice: 13.2,   volatility: 0.04 },
  { asset: "HY Spread",     ticker: "HYG",    category: "credit",     basePrice: 3.35,   volatility: 0.02 },
];

// ── Generate daily-varying asset data ────────────────────────────────────────

function generateChange(rng: () => number, vol: number): number {
  return Math.round(((rng() - 0.5) * 2 * vol * 100) * 100) / 100;
}

export function getCrossAssetData(): CrossAssetData[] {
  const day = dayOfYear();
  const rng = seededRandom(day * 31337);

  return ASSETS.map((a) => {
    const c1d = generateChange(rng, a.volatility);
    const c1w = generateChange(rng, a.volatility * 2.2);
    const c1m = generateChange(rng, a.volatility * 4.5);
    const c3m = generateChange(rng, a.volatility * 8);
    const cYtd = generateChange(rng, a.volatility * 12);

    // Adjust price by 1d change
    const price =
      a.ticker === "TNX" || a.ticker === "T2Y" || a.ticker === "HYG"
        ? Math.round((a.basePrice + c1d * a.basePrice * 0.01) * 1000) / 1000
        : Math.round(a.basePrice * (1 + c1d / 100) * 100) / 100;

    return {
      asset: a.asset,
      ticker: a.ticker,
      category: a.category,
      price,
      change1d: c1d,
      change1w: c1w,
      change1m: c1m,
      change3m: c3m,
      changeYtd: cYtd,
    };
  });
}

// ── Correlation pairs ────────────────────────────────────────────────────────

interface CorrelationBase {
  a1: string;
  a2: string;
  base30: number;
  base90: number;
  base1y: number;
}

const CORR_PAIRS: CorrelationBase[] = [
  { a1: "S&P 500",      a2: "NASDAQ 100",   base30: 0.95, base90: 0.93, base1y: 0.91 },
  { a1: "S&P 500",      a2: "10Y Treasury",  base30: -0.42, base90: -0.38, base1y: -0.30 },
  { a1: "S&P 500",      a2: "Gold",          base30: -0.15, base90: -0.08, base1y: 0.05 },
  { a1: "S&P 500",      a2: "Oil WTI",       base30: 0.25, base90: 0.20, base1y: 0.18 },
  { a1: "S&P 500",      a2: "VIX",           base30: -0.85, base90: -0.82, base1y: -0.80 },
  { a1: "S&P 500",      a2: "DXY Dollar",    base30: -0.22, base90: -0.18, base1y: -0.10 },
  { a1: "S&P 500",      a2: "Bitcoin",       base30: 0.45, base90: 0.38, base1y: 0.30 },
  { a1: "S&P 500",      a2: "HY Spread",     base30: -0.70, base90: -0.65, base1y: -0.60 },
  { a1: "10Y Treasury",  a2: "Gold",          base30: -0.35, base90: -0.30, base1y: -0.25 },
  { a1: "10Y Treasury",  a2: "DXY Dollar",    base30: 0.55, base90: 0.50, base1y: 0.45 },
  { a1: "Gold",          a2: "DXY Dollar",    base30: -0.65, base90: -0.60, base1y: -0.55 },
  { a1: "Gold",          a2: "Silver",        base30: 0.88, base90: 0.85, base1y: 0.82 },
  { a1: "Oil WTI",       a2: "Natural Gas",   base30: 0.25, base90: 0.20, base1y: 0.15 },
  { a1: "VIX",           a2: "HY Spread",     base30: 0.72, base90: 0.68, base1y: 0.62 },
  { a1: "Bitcoin",       a2: "NASDAQ 100",    base30: 0.50, base90: 0.42, base1y: 0.35 },
];

export function getCrossAssetCorrelations(): CrossAssetCorrelation[] {
  const day = dayOfYear();
  const rng = seededRandom(day * 77713);

  return CORR_PAIRS.map((p) => {
    const noise = () => (rng() - 0.5) * 0.06;
    const clamp = (v: number) => Math.round(Math.max(-1, Math.min(1, v)) * 100) / 100;
    return {
      asset1: p.a1,
      asset2: p.a2,
      correlation30d: clamp(p.base30 + noise()),
      correlation90d: clamp(p.base90 + noise()),
      correlation1y: clamp(p.base1y + noise()),
    };
  });
}

// ── Market Regime Detection ──────────────────────────────────────────────────

type RegimeName = "Risk On" | "Risk Off" | "Goldilocks" | "Stagflation" | "Reflation" | "Deflation";

interface RegimeScore {
  name: RegimeName;
  score: number;
  signals: string[];
  implications: { assetClass: string; outlook: string }[];
}

export function detectMarketRegime(): MarketRegime {
  const data = getCrossAssetData();
  const find = (ticker: string) => data.find((d) => d.ticker === ticker)!;

  const spx = find("SPX");
  const vix = find("VIX");
  const tnx = find("TNX");
  const t2y = find("T2Y");
  const dxy = find("DXY");
  const hyg = find("HYG");
  const gc  = find("GC");
  const cl  = find("CL");

  const yieldSpread = tnx.price - t2y.price;
  const vixLevel = vix.price;
  const hySpread = hyg.price;

  const regimes: RegimeScore[] = [
    {
      name: "Risk On",
      score: 0,
      signals: [],
      implications: [
        { assetClass: "Equities", outlook: "Bullish — growth stocks and small caps outperform" },
        { assetClass: "Bonds", outlook: "Bearish — yields rise as money flows to risk assets" },
        { assetClass: "Commodities", outlook: "Mixed — industrial metals up, gold underperforms" },
        { assetClass: "Credit", outlook: "Bullish — spreads tighten" },
      ],
    },
    {
      name: "Risk Off",
      score: 0,
      signals: [],
      implications: [
        { assetClass: "Equities", outlook: "Bearish — defensive sectors outperform" },
        { assetClass: "Bonds", outlook: "Bullish — flight to safety drives yields down" },
        { assetClass: "Commodities", outlook: "Gold rallies, oil weakens on demand fears" },
        { assetClass: "Credit", outlook: "Bearish — spreads widen" },
      ],
    },
    {
      name: "Goldilocks",
      score: 0,
      signals: [],
      implications: [
        { assetClass: "Equities", outlook: "Bullish — broad-based rally, low volatility" },
        { assetClass: "Bonds", outlook: "Neutral — stable yields with mild compression" },
        { assetClass: "Commodities", outlook: "Neutral — stable demand, no inflation spike" },
        { assetClass: "Credit", outlook: "Bullish — low defaults, tight spreads" },
      ],
    },
    {
      name: "Stagflation",
      score: 0,
      signals: [],
      implications: [
        { assetClass: "Equities", outlook: "Bearish — margin compression, multiple contraction" },
        { assetClass: "Bonds", outlook: "Bearish — inflation erodes real returns" },
        { assetClass: "Commodities", outlook: "Bullish — real assets hedge inflation" },
        { assetClass: "Credit", outlook: "Bearish — rising defaults and wider spreads" },
      ],
    },
    {
      name: "Reflation",
      score: 0,
      signals: [],
      implications: [
        { assetClass: "Equities", outlook: "Bullish — cyclicals and value outperform" },
        { assetClass: "Bonds", outlook: "Bearish — rising inflation expectations lift yields" },
        { assetClass: "Commodities", outlook: "Bullish — demand recovery lifts prices" },
        { assetClass: "Credit", outlook: "Bullish — improving economy tightens spreads" },
      ],
    },
    {
      name: "Deflation",
      score: 0,
      signals: [],
      implications: [
        { assetClass: "Equities", outlook: "Bearish — earnings decline, multiples compress" },
        { assetClass: "Bonds", outlook: "Bullish — yields collapse, long duration outperforms" },
        { assetClass: "Commodities", outlook: "Bearish — demand destruction across the board" },
        { assetClass: "Credit", outlook: "Bearish — defaults rise despite low rates" },
      ],
    },
  ];

  const getRegime = (n: RegimeName) => regimes.find((r) => r.name === n)!;

  // --- VIX signals ---
  if (vixLevel < 15) {
    getRegime("Goldilocks").score += 3;
    getRegime("Goldilocks").signals.push(`VIX at ${vix.price.toFixed(1)} indicates low fear`);
    getRegime("Risk On").score += 2;
    getRegime("Risk On").signals.push(`VIX below 15 supports risk appetite`);
  } else if (vixLevel < 20) {
    getRegime("Goldilocks").score += 1;
    getRegime("Risk On").score += 1;
  } else if (vixLevel < 30) {
    getRegime("Risk Off").score += 2;
    getRegime("Risk Off").signals.push(`Elevated VIX at ${vix.price.toFixed(1)} signals caution`);
  } else {
    getRegime("Risk Off").score += 4;
    getRegime("Risk Off").signals.push(`VIX spike to ${vix.price.toFixed(1)} indicates panic`);
  }

  // --- Yield curve signals ---
  if (yieldSpread < -0.3) {
    getRegime("Risk Off").score += 2;
    getRegime("Risk Off").signals.push(`Inverted yield curve (${(yieldSpread * 100).toFixed(0)}bps) signals recession risk`);
    getRegime("Deflation").score += 2;
    getRegime("Deflation").signals.push(`Deeply inverted curve suggests growth fears`);
  } else if (yieldSpread < 0) {
    getRegime("Risk Off").score += 1;
    getRegime("Stagflation").score += 1;
    getRegime("Stagflation").signals.push(`Flat/inverted curve with inflation risk`);
  } else if (yieldSpread > 0.5) {
    getRegime("Reflation").score += 2;
    getRegime("Reflation").signals.push(`Steepening curve (${(yieldSpread * 100).toFixed(0)}bps) supports reflation`);
    getRegime("Risk On").score += 1;
  } else {
    getRegime("Goldilocks").score += 1;
    getRegime("Goldilocks").signals.push(`Normal yield curve spread`);
  }

  // --- Credit spread signals ---
  if (hySpread < 3.0) {
    getRegime("Goldilocks").score += 2;
    getRegime("Goldilocks").signals.push(`Tight HY spreads (${hyg.price.toFixed(2)}%) reflect confidence`);
  } else if (hySpread < 4.0) {
    getRegime("Risk On").score += 1;
  } else if (hySpread < 5.5) {
    getRegime("Risk Off").score += 1;
    getRegime("Risk Off").signals.push(`Widening credit spreads (${hyg.price.toFixed(2)}%)`);
  } else {
    getRegime("Risk Off").score += 3;
    getRegime("Risk Off").signals.push(`Blowout HY spreads signal stress`);
    getRegime("Stagflation").score += 1;
  }

  // --- Dollar signals ---
  if (dxy.change1m > 1.5) {
    getRegime("Risk Off").score += 1;
    getRegime("Risk Off").signals.push(`Dollar strength signals flight to safety`);
    getRegime("Deflation").score += 1;
  } else if (dxy.change1m < -1.5) {
    getRegime("Reflation").score += 1;
    getRegime("Reflation").signals.push(`Weak dollar supports global growth`);
    getRegime("Risk On").score += 1;
  }

  // --- Equity signals ---
  if (spx.change1m > 3) {
    getRegime("Risk On").score += 2;
    getRegime("Risk On").signals.push(`S&P 500 up ${spx.change1m.toFixed(1)}% in 1M, strong momentum`);
  } else if (spx.change1m < -3) {
    getRegime("Risk Off").score += 2;
    getRegime("Risk Off").signals.push(`S&P 500 down ${Math.abs(spx.change1m).toFixed(1)}% in 1M`);
  }

  // --- Commodity/inflation signals ---
  if (cl.change1m > 5 && gc.change1m > 2) {
    getRegime("Stagflation").score += 2;
    getRegime("Stagflation").signals.push(`Rising oil and gold suggest inflation fears`);
  } else if (cl.change1m < -5) {
    getRegime("Deflation").score += 1;
    getRegime("Deflation").signals.push(`Falling oil prices signal demand weakness`);
  }

  // Pick highest scoring regime
  regimes.sort((a, b) => b.score - a.score);
  const winner = regimes[0];
  const totalScore = regimes.reduce((s, r) => s + r.score, 0);
  const confidence = totalScore > 0 ? Math.round((winner.score / totalScore) * 100) : 50;

  // Ensure at least a couple of signals
  if (winner.signals.length === 0) {
    winner.signals.push("Mixed signals across asset classes");
  }

  return {
    name: winner.name,
    confidence: Math.max(35, Math.min(95, confidence)),
    signals: winner.signals.slice(0, 5),
    implications: winner.implications,
  };
}
