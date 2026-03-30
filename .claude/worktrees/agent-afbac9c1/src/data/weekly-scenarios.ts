/* ============================================================
   WEEKLY SCENARIO CHALLENGES — DATA
   Published every Monday, leaderboard locked on Friday close.
   ============================================================ */

export type WeeklyDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type ScoringMethod = "sharpe" | "absolute" | "risk-adjusted";

export interface WeeklyScenarioEvent {
  /** Bar index (0-based) when this event fires */
  barIndex: number;
  /** One-liner shown to the trader */
  headline: string;
  /** Price impact multiplier on the underlying, e.g. 0.92 = -8% */
  priceImpact: number;
  /** VIX spike additive points */
  vixSpike?: number;
}

export interface WeeklyScenario {
  id: string;
  title: string;
  description: string;
  /** 2–3 sentence background giving context before the scenario starts */
  background: string;
  difficulty: WeeklyDifficulty;
  /** ISO date string — Monday of the challenge week */
  startDate: string;
  /** ISO date string — Friday of the challenge week */
  endDate: string;
  startingCapital: number;
  /** Primary ticker to focus on */
  ticker: string;
  /** Starting price of primary ticker */
  startPrice: number;
  /** Starting simulated VIX level */
  startVix: number;
  /** Rules shown to participants */
  rules: string[];
  scoringMethod: ScoringMethod;
  /** Top prize in XP */
  topReward: number;
  /** Mid-week events that change market conditions */
  events: WeeklyScenarioEvent[];
  /** e.g. "SPY" or "60/40 portfolio" */
  benchmarkLabel: string;
  /** Benchmark return % over the week (used for vs-benchmark display) */
  benchmarkReturn: number;
}

/* ------------------------------------------------------------------ */

export const WEEKLY_SCENARIOS: WeeklyScenario[] = [
  /* 1 ---------------------------------------------------------------- */
  {
    id: "march-2020-vix-explosion",
    title: "March 2020 VIX Explosion",
    description:
      "COVID-19 news accelerates. Volatility spikes to historic levels. Can you manage risk while markets free-fall?",
    background:
      "It is February 21, 2020. SPY trades at 330 and VIX sits at a complacent 15. " +
      "Reports of a novel coronavirus spreading beyond China are dismissed by most strategists. " +
      "You have $100,000 and five trading days before the fastest bear market in history begins.",
    difficulty: "expert",
    startDate: "2026-03-02",
    endDate: "2026-03-06",
    startingCapital: 100000,
    ticker: "SPY",
    startPrice: 330,
    startVix: 15,
    rules: [
      "Max single-position size: 40% of portfolio",
      "Shorting and put buying are permitted",
      "Options allowed: SPY puts, VIX calls",
      "Score is risk-adjusted return (Sharpe over the week)",
    ],
    scoringMethod: "sharpe",
    topReward: 2500,
    events: [
      {
        barIndex: 1,
        headline: "WHO: Community spread confirmed in Italy and South Korea",
        priceImpact: 0.97,
        vixSpike: 4,
      },
      {
        barIndex: 2,
        headline: "White House downplays outbreak; CDC issues travel advisory",
        priceImpact: 0.95,
        vixSpike: 7,
      },
      {
        barIndex: 3,
        headline: "S&P futures limit down; circuit breaker triggered at open",
        priceImpact: 0.88,
        vixSpike: 18,
      },
      {
        barIndex: 4,
        headline: "Fed emergency rate cut 50bps — markets sell the news",
        priceImpact: 0.91,
        vixSpike: 12,
      },
    ],
    benchmarkLabel: "Buy & Hold SPY",
    benchmarkReturn: -11.5,
  },

  /* 2 ---------------------------------------------------------------- */
  {
    id: "nvidia-earnings-2024",
    title: "2024 NVIDIA Earnings Week",
    description:
      "NVDA reports in three days. AI hype is at fever pitch. Position for a massive move — but which direction?",
    background:
      "It is February 19, 2024. NVIDIA trades at $480 with a $1.2T market cap. " +
      "The consensus EPS estimate is $4.59 and whisper number is even higher. " +
      "Implied volatility is pricing a 10% single-day move. You have $50,000 to deploy across equity and options.",
    difficulty: "advanced",
    startDate: "2026-03-09",
    endDate: "2026-03-13",
    startingCapital: 50000,
    ticker: "NVDA",
    startPrice: 480,
    startVix: 18,
    rules: [
      "Options are the primary instrument — straddles, strangles, and spreads allowed",
      "Max leverage: 3× on options positions",
      "Earnings announcement fires at bar 3 (Wednesday close)",
      "Score is absolute P&L in dollars",
    ],
    scoringMethod: "absolute",
    topReward: 2000,
    events: [
      {
        barIndex: 1,
        headline: "Morgan Stanley raises NVDA PT to $750; call volume surges",
        priceImpact: 1.04,
        vixSpike: 2,
      },
      {
        barIndex: 2,
        headline: "Competitor AMD warns on data-center demand; sector dips",
        priceImpact: 0.98,
        vixSpike: 3,
      },
      {
        barIndex: 3,
        headline: "NVDA reports: EPS $5.16 vs $4.59 est, Rev $22.1B — stock +16% AH",
        priceImpact: 1.16,
        vixSpike: -5,
      },
      {
        barIndex: 4,
        headline: "Post-earnings digest: analysts raise targets; theta crushes options",
        priceImpact: 1.02,
        vixSpike: -3,
      },
    ],
    benchmarkLabel: "Buy & Hold NVDA",
    benchmarkReturn: 16.8,
  },

  /* 3 ---------------------------------------------------------------- */
  {
    id: "fed-policy-error",
    title: "Fed Policy Error Simulation",
    description:
      "The Fed hikes 75bps unexpectedly. Bond yields spike. Equities reprice. Manage a multi-asset portfolio through the shock.",
    background:
      "It is June 13, 2022. Inflation data printed 8.6% YoY — the hottest in 41 years. " +
      "Markets expected a 50bps hike. Instead the Fed delivers 75bps and signals more to come. " +
      "You hold $75,000 across equities and bonds. Duration risk is suddenly your biggest enemy.",
    difficulty: "expert",
    startDate: "2026-03-16",
    endDate: "2026-03-20",
    startingCapital: 75000,
    ticker: "TLT",
    startPrice: 116,
    startVix: 28,
    rules: [
      "Must maintain exposure across at least 2 asset classes at all times",
      "Shorting TLT and rate-sensitive equities permitted",
      "Score = risk-adjusted return accounting for max drawdown",
      "Benchmark: 60% SPY / 40% TLT portfolio",
    ],
    scoringMethod: "risk-adjusted",
    topReward: 2200,
    events: [
      {
        barIndex: 0,
        headline: "FOMC decision: 75bps hike — largest since 1994",
        priceImpact: 0.94,
        vixSpike: 8,
      },
      {
        barIndex: 1,
        headline: "2-year yield hits 3.45%; mortgage rates cross 6%",
        priceImpact: 0.97,
        vixSpike: 3,
      },
      {
        barIndex: 2,
        headline: "Retail sales miss; recession probability estimates climb to 40%",
        priceImpact: 0.96,
        vixSpike: 4,
      },
      {
        barIndex: 3,
        headline: "Fed's Waller: open to 75bps again in July — bond selloff deepens",
        priceImpact: 0.95,
        vixSpike: 5,
      },
    ],
    benchmarkLabel: "60/40 Portfolio",
    benchmarkReturn: -7.2,
  },

  /* 4 ---------------------------------------------------------------- */
  {
    id: "svb-contagion-week",
    title: "SVB Contagion Week",
    description:
      "Silicon Valley Bank collapses. Regional bank contagion spreads. Short, hedge, or pivot to safety in time.",
    background:
      "It is March 9, 2023. SVB Financial discloses a $1.8B loss on bond sales and plans a capital raise. " +
      "Peter Thiel's Founders Fund tells portfolio companies to withdraw deposits immediately. " +
      "You have $60,000. Regional bank ETFs are your battlefield.",
    difficulty: "advanced",
    startDate: "2026-03-23",
    endDate: "2026-03-27",
    startingCapital: 60000,
    ticker: "KRE",
    startPrice: 62,
    startVix: 22,
    rules: [
      "Short selling of regional bank names allowed",
      "Max notional short exposure: 50% of portfolio",
      "Put options on KRE and individual banks permitted",
      "Score is absolute P&L — no drawdown penalty",
    ],
    scoringMethod: "absolute",
    topReward: 1800,
    events: [
      {
        barIndex: 0,
        headline: "SVB halts trading; California DFPI takes possession of bank",
        priceImpact: 0.82,
        vixSpike: 9,
      },
      {
        barIndex: 1,
        headline: "FDIC announces only insured deposits ($250k) are protected — panic intensifies",
        priceImpact: 0.88,
        vixSpike: 11,
      },
      {
        barIndex: 2,
        headline: "Treasury, Fed, FDIC announce all SVB depositors will be made whole",
        priceImpact: 1.06,
        vixSpike: -6,
      },
      {
        barIndex: 3,
        headline: "Signature Bank seized; Credit Suisse contagion fears emerge",
        priceImpact: 0.93,
        vixSpike: 7,
      },
    ],
    benchmarkLabel: "Hold Cash",
    benchmarkReturn: 0,
  },

  /* 5 ---------------------------------------------------------------- */
  {
    id: "meme-stock-squeeze",
    title: "Meme Stock Squeeze",
    description:
      "Short interest is 140% of float. Reddit is piling in. Can you ride the squeeze — or get squeezed yourself?",
    background:
      "It is January 25, 2021. GameStop trades at $76 and short interest exceeds 140% of the float. " +
      "WallStreetBets has identified a potential short squeeze and retail order flow is accelerating. " +
      "You have $25,000. Risk management is the difference between a life-changing gain and a wipeout.",
    difficulty: "expert",
    startDate: "2026-03-30",
    endDate: "2026-04-03",
    startingCapital: 25000,
    ticker: "GME",
    startPrice: 76,
    startVix: 24,
    rules: [
      "Position limit: 60% in GME at any one time",
      "Call options permitted; puts permitted for hedging",
      "Broker halts buying at bar 3 — only sells allowed for 4 hours",
      "Score is risk-adjusted return (extreme volatility penalized)",
    ],
    scoringMethod: "risk-adjusted",
    topReward: 3000,
    events: [
      {
        barIndex: 0,
        headline: "WSB post goes viral: 'GME short squeeze inevitable' — +47% today",
        priceImpact: 1.47,
        vixSpike: 6,
      },
      {
        barIndex: 1,
        headline: "Citron Research announces short position — crowd boos, stock up again",
        priceImpact: 1.28,
        vixSpike: 5,
      },
      {
        barIndex: 2,
        headline: "GME peaks at $483; Robinhood restricts buying — stock -44% intraday",
        priceImpact: 0.56,
        vixSpike: 14,
      },
      {
        barIndex: 3,
        headline: "Congress summons Robinhood CEO; retail investors furious",
        priceImpact: 0.78,
        vixSpike: 8,
      },
    ],
    benchmarkLabel: "Buy & Hold GME",
    benchmarkReturn: 32.4,
  },

  /* 6 ---------------------------------------------------------------- */
  {
    id: "options-expiration-friday",
    title: "Options Expiration Friday",
    description:
      "Pin risk, gamma squeeze, and time decay collide on monthly OPEX. Navigate the last 6 hours of options life.",
    background:
      "It is the third Friday of September. SPY sits at exactly $445 — a major strike price with $3.2B in open interest. " +
      "Market makers are delta-hedging furiously. Every tick causes cascading buy and sell flows. " +
      "You have $40,000 and must manage your options book into expiration.",
    difficulty: "intermediate",
    startDate: "2026-04-06",
    endDate: "2026-04-10",
    startingCapital: 40000,
    ticker: "SPY",
    startPrice: 445,
    startVix: 16,
    rules: [
      "All positions must be closed or rolled by end of bar 4",
      "0-DTE options are the primary focus",
      "Theta decay accelerates each bar — plan accordingly",
      "Score is absolute P&L",
    ],
    scoringMethod: "absolute",
    topReward: 1500,
    events: [
      {
        barIndex: 0,
        headline: "Large call wall at 445 holds; MMs pinning aggressively",
        priceImpact: 1.001,
        vixSpike: 1,
      },
      {
        barIndex: 1,
        headline: "Flash spike to 448 — gamma squeeze; call buyers profit temporarily",
        priceImpact: 1.007,
        vixSpike: 3,
      },
      {
        barIndex: 2,
        headline: "Reversion to pin; 445 strike dominates; theta collapse on 0-DTE",
        priceImpact: 0.999,
        vixSpike: -1,
      },
      {
        barIndex: 3,
        headline: "Final 30 min: violent whipsaw as both calls and puts expire worthless",
        priceImpact: 1.002,
        vixSpike: 2,
      },
    ],
    benchmarkLabel: "Buy & Hold SPY",
    benchmarkReturn: 0.3,
  },

  /* 7 ---------------------------------------------------------------- */
  {
    id: "inflation-cpi-surprise",
    title: "Inflation Data Surprise",
    description:
      "CPI prints 9.1% — the hottest in 40 years. Bonds sell off hard. Can you position across asset classes in time?",
    background:
      "It is July 12, 2022. Wall Street expects CPI at 8.8%. The actual print: 9.1% YoY. " +
      "The 2-year yield gaps up 20bps in minutes. Rate-hike expectations jump to 100bps in July. " +
      "You have $55,000 and must navigate the simultaneous equity and bond repricing.",
    difficulty: "advanced",
    startDate: "2026-04-13",
    endDate: "2026-04-17",
    startingCapital: 55000,
    ticker: "TLT",
    startPrice: 110,
    startVix: 26,
    rules: [
      "Trade across equities, bonds, and commodities (GLD, TIPS)",
      "Inflation-sensitive instruments: GLD, TIPS, energy names allowed",
      "Max single-asset concentration: 50%",
      "Score is risk-adjusted return",
    ],
    scoringMethod: "risk-adjusted",
    topReward: 1800,
    events: [
      {
        barIndex: 0,
        headline: "CPI: 9.1% vs 8.8% est — 40-year high; bonds crater immediately",
        priceImpact: 0.93,
        vixSpike: 7,
      },
      {
        barIndex: 1,
        headline: "Fed's Bullard calls for 75bps in July; market now pricing 100bps",
        priceImpact: 0.96,
        vixSpike: 4,
      },
      {
        barIndex: 2,
        headline: "Energy prices retreat slightly on demand destruction fears",
        priceImpact: 0.98,
        vixSpike: 2,
      },
      {
        barIndex: 3,
        headline: "University of Michigan inflation expectations ease — relief rally",
        priceImpact: 1.03,
        vixSpike: -3,
      },
    ],
    benchmarkLabel: "60/40 Portfolio",
    benchmarkReturn: -5.1,
  },

  /* 8 ---------------------------------------------------------------- */
  {
    id: "tech-earnings-season",
    title: "Tech Earnings Season",
    description:
      "FAANG reports across the week. Manage five positions simultaneously through earnings volatility.",
    background:
      "It is October 24, 2022. Meta, Alphabet, Microsoft, Apple, and Amazon all report this week. " +
      "The Nasdaq is down 32% YTD and expectations are low. " +
      "You have $80,000 and must allocate across all five names — some will surprise, some will disappoint.",
    difficulty: "advanced",
    startDate: "2026-04-20",
    endDate: "2026-04-24",
    startingCapital: 80000,
    ticker: "QQQ",
    startPrice: 268,
    startVix: 30,
    rules: [
      "Must hold at least 4 of 5 FAANG names at some point during the week",
      "Options on individual names allowed for earnings plays",
      "Position rebalancing allowed at open/close of each bar",
      "Score is absolute P&L vs QQQ benchmark",
    ],
    scoringMethod: "absolute",
    topReward: 2000,
    events: [
      {
        barIndex: 0,
        headline: "Alphabet misses on ad revenue; shares -10% AH — sector under pressure",
        priceImpact: 0.96,
        vixSpike: 5,
      },
      {
        barIndex: 1,
        headline: "Meta crushes estimates; Reality Labs losses narrow — shares +23% AH",
        priceImpact: 1.04,
        vixSpike: -2,
      },
      {
        barIndex: 2,
        headline: "Microsoft cloud growth decelerates; guidance cut — stock -6% AH",
        priceImpact: 0.97,
        vixSpike: 4,
      },
      {
        barIndex: 3,
        headline: "Apple and Amazon both beat; Nasdaq surges 3% — short squeeze",
        priceImpact: 1.05,
        vixSpike: -4,
      },
    ],
    benchmarkLabel: "Hold QQQ",
    benchmarkReturn: -1.4,
  },

  /* 9 ---------------------------------------------------------------- */
  {
    id: "currency-crisis",
    title: "Currency Crisis",
    description:
      "An emerging market currency collapses. Dollar strength ripples across commodities and multinational equities.",
    background:
      "It is August 10, 2018. The Turkish lira loses 20% in a single day as US sanctions bite. " +
      "Contagion spreads to the Argentine peso and South African rand. " +
      "You have $50,000 and must navigate USD strength, EM equity selloffs, and commodity dislocations.",
    difficulty: "intermediate",
    startDate: "2026-04-27",
    endDate: "2026-05-01",
    startingCapital: 50000,
    ticker: "EEM",
    startPrice: 42,
    startVix: 19,
    rules: [
      "Trade across EEM, DXY-correlated instruments (UUP), and commodities (GLD, OIL)",
      "No single currency-pair position > 30% of portfolio",
      "Score is absolute P&L",
      "USD-hedged instruments count as separate positions",
    ],
    scoringMethod: "absolute",
    topReward: 1600,
    events: [
      {
        barIndex: 0,
        headline: "Turkish lira -20% intraday; European banks with TRY exposure sell off",
        priceImpact: 0.91,
        vixSpike: 8,
      },
      {
        barIndex: 1,
        headline: "Argentina asks IMF for emergency loan disbursement; peso -5%",
        priceImpact: 0.96,
        vixSpike: 4,
      },
      {
        barIndex: 2,
        headline: "DXY hits 96.5 — 14-month high; gold slumps, oil pressured",
        priceImpact: 0.97,
        vixSpike: 2,
      },
      {
        barIndex: 3,
        headline: "Turkey raises rates 625bps in emergency meeting; lira rebounds 8%",
        priceImpact: 1.03,
        vixSpike: -3,
      },
    ],
    benchmarkLabel: "Hold EEM",
    benchmarkReturn: -9.3,
  },

  /* 10 --------------------------------------------------------------- */
  {
    id: "crypto-contagion",
    title: "Crypto Contagion",
    description:
      "FTX files for bankruptcy. Crypto contagion hits crypto-adjacent equities and tech names.",
    background:
      "It is November 8, 2022. FTX, the world's third-largest crypto exchange, halts withdrawals. " +
      "CEO Sam Bankman-Fried tweets reassurances that go unbelieved. Coinbase, MicroStrategy, and Bitcoin miners collapse. " +
      "You have $45,000 — primarily in crypto-correlated equities and a small BTC position.",
    difficulty: "advanced",
    startDate: "2026-05-04",
    endDate: "2026-05-08",
    startingCapital: 45000,
    ticker: "COIN",
    startPrice: 67,
    startVix: 32,
    rules: [
      "COIN, MSTR, and MARA are tradeable; direct crypto via ETFs (BITO) allowed",
      "Short selling permitted on all instruments",
      "Score is risk-adjusted return (drawdown heavily penalized)",
      "Must reduce BTC-correlated exposure by 50% before bar 2 or face penalty",
    ],
    scoringMethod: "risk-adjusted",
    topReward: 2200,
    events: [
      {
        barIndex: 0,
        headline: "FTX halts withdrawals; Binance signs LOI to acquire — then walks away",
        priceImpact: 0.72,
        vixSpike: 14,
      },
      {
        barIndex: 1,
        headline: "FTX files Chapter 11; $8B hole confirmed — COIN -25% today",
        priceImpact: 0.75,
        vixSpike: 10,
      },
      {
        barIndex: 2,
        headline: "BlockFi files bankruptcy; Genesis warns of insolvency",
        priceImpact: 0.88,
        vixSpike: 7,
      },
      {
        barIndex: 3,
        headline: "DOJ investigation; SBF arrested — bounce on 'certainty'; short cover",
        priceImpact: 1.08,
        vixSpike: -5,
      },
    ],
    benchmarkLabel: "Hold COIN",
    benchmarkReturn: -38.2,
  },

  /* 11 --------------------------------------------------------------- */
  {
    id: "rate-pause-euphoria",
    title: "Rate Pause Euphoria",
    description:
      "The Fed signals a pause after 500bps of hikes. Markets rip higher. Balance momentum against theta decay.",
    background:
      "It is May 1, 2023. The FOMC hikes 25bps — widely expected — but signals it may be the last hike. " +
      "Futures markets immediately price out any additional hikes. Bonds rally and equities surge. " +
      "You have $65,000 and must decide: buy the momentum or sell the euphoria?",
    difficulty: "intermediate",
    startDate: "2026-05-11",
    endDate: "2026-05-15",
    startingCapital: 65000,
    ticker: "SPY",
    startPrice: 415,
    startVix: 17,
    rules: [
      "Rate-sensitive sectors (XLRE, XLU, XLF) available alongside SPY and QQQ",
      "Long call strategies encouraged — theta vs momentum tradeoff is the lesson",
      "Score is Sharpe ratio",
      "No shorting allowed — this is a pure upside-capture exercise",
    ],
    scoringMethod: "sharpe",
    topReward: 1500,
    events: [
      {
        barIndex: 0,
        headline: "FOMC: 25bps hike, language removes 'additional firming' phrase",
        priceImpact: 1.013,
        vixSpike: -3,
      },
      {
        barIndex: 1,
        headline: "10-year yield falls 15bps; REITs surge 4%; banks follow",
        priceImpact: 1.012,
        vixSpike: -2,
      },
      {
        barIndex: 2,
        headline: "Jobless claims rise — goldilocks scenario; soft landing narrative strengthens",
        priceImpact: 1.008,
        vixSpike: -1,
      },
      {
        barIndex: 3,
        headline: "Jobs report: 253k vs 180k est — paradoxical selloff as rate cut hopes fade",
        priceImpact: 0.985,
        vixSpike: 4,
      },
    ],
    benchmarkLabel: "Buy & Hold SPY",
    benchmarkReturn: 2.8,
  },

  /* 12 --------------------------------------------------------------- */
  {
    id: "black-monday-replay",
    title: "Black Monday Replay",
    description:
      "A 1987-style cascade unfolds. Portfolio insurance triggers selling. Learn circuit breakers under fire.",
    background:
      "It is October 19, 1987 — replayed in modern market microstructure. " +
      "Portfolio insurance strategies create a self-reinforcing sell loop. " +
      "The Dow drops 22.6% in a single day — the largest single-day percentage loss in history. " +
      "You have $100,000. Circuit breakers, panic psychology, and recovery timing are your curriculum.",
    difficulty: "expert",
    startDate: "2026-05-18",
    endDate: "2026-05-22",
    startingCapital: 100000,
    ticker: "SPY",
    startPrice: 480,
    startVix: 20,
    rules: [
      "Trading is halted at bars 1 and 3 for 15 minutes (circuit breaker)",
      "Futures markets may diverge significantly from spot during halts",
      "Puts and inverse ETFs are available from bar 0",
      "Score is risk-adjusted return with a survival bonus: +500 XP if drawdown < 10%",
    ],
    scoringMethod: "risk-adjusted",
    topReward: 3000,
    events: [
      {
        barIndex: 0,
        headline: "Portfolio insurance selling triggers; Dow -4% at open on record volume",
        priceImpact: 0.96,
        vixSpike: 12,
      },
      {
        barIndex: 1,
        headline: "CIRCUIT BREAKER: Level 1 halt triggered — 15-minute pause",
        priceImpact: 0.87,
        vixSpike: 22,
      },
      {
        barIndex: 2,
        headline: "Fed announces unlimited liquidity support; futures tick up briefly",
        priceImpact: 0.94,
        vixSpike: -4,
      },
      {
        barIndex: 3,
        headline: "CIRCUIT BREAKER: Level 2 halt — second 15-minute pause of the day",
        priceImpact: 0.83,
        vixSpike: 18,
      },
    ],
    benchmarkLabel: "Buy & Hold SPY",
    benchmarkReturn: -18.4,
  },
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

/** Returns the scenario currently designated as "this week's" challenge */
export function getCurrentWeeklyScenario(): WeeklyScenario {
  const now = new Date();
  const active = WEEKLY_SCENARIOS.find((s) => {
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    return now >= start && now <= end;
  });
  // Fallback to the first scenario when no date matches (dev/demo mode)
  return active ?? WEEKLY_SCENARIOS[0];
}

/** Returns past scenarios (endDate before today) */
export function getPastScenarios(): WeeklyScenario[] {
  const now = new Date();
  return WEEKLY_SCENARIOS.filter((s) => new Date(s.endDate) < now);
}

/** Returns the Friday-end countdown in seconds from now */
export function getSecondsUntilFriday(endDateIso: string): number {
  const end = new Date(endDateIso);
  // Set to Friday 16:00 ET (21:00 UTC)
  end.setUTCHours(21, 0, 0, 0);
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

export const DIFFICULTY_LABELS: Record<WeeklyDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export const SCORING_LABELS: Record<ScoringMethod, string> = {
  sharpe: "Sharpe Ratio",
  absolute: "Absolute P&L",
  "risk-adjusted": "Risk-Adjusted Return",
};
