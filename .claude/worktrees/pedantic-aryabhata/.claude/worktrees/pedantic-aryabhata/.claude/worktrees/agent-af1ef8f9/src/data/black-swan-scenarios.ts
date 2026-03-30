// Black Swan Arena — extreme tail-risk scenario definitions
// Each scenario is designed to stress-test capital preservation skills

export type BlackSwanCategory =
  | "systemic"
  | "geopolitical"
  | "liquidity"
  | "regulatory"
  | "pandemic"
  | "market_structure";

export type SurvivalCriterion = {
  id: string;
  label: string;
  description: string;
  // Minimum capital preserved as a fraction (0–1) to pass this criterion
  minCapitalPreserved?: number;
  // Maximum drawdown allowed (%)
  maxDrawdownPct?: number;
  // Whether the player must have executed at least one hedge
  requiresHedge?: boolean;
  // Whether the player must have reduced net exposure below this fraction of starting capital
  maxNetExposureFraction?: number;
};

export interface BlackSwanScenario {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: BlackSwanCategory;
  /** 1 = low danger, 10 = extinction-level threat */
  severity: number;
  /** Starting VIX level when the scenario kicks in */
  initialVIX: number;
  /** Instantaneous price shock as a percentage (negative = down, positive = up) */
  priceShock: number;
  /** Duration of the stress event in simulation bars (each bar ≈ 1 day unless otherwise noted) */
  duration: number;
  /** Ongoing daily volatility multiplier during the event (vs normal 1.0) */
  volatilityMultiplier: number;
  /** Correlation of all assets going toward +1 during the event (0 = normal, 1 = perfect correlation) */
  correlationSpike: number;
  /** Key concepts and educational topics this scenario demonstrates */
  educationalFocus: string[];
  /** Ordered list of survival criteria — all must be satisfied to be declared a survivor */
  survivalCriteria: SurvivalCriterion[];
  /** What the majority of retail traders did wrong during this type of event */
  commonMistakes: string[];
  /** What worked: strategies that preserved capital or even profited */
  whatWorked: string[];
  /** Historical analogues */
  historicalAnalogues: string[];
}

export const BLACK_SWAN_SCENARIOS: BlackSwanScenario[] = [
  {
    id: "triple_shock",
    name: "Triple Shock Protocol",
    tagline: "Cyberattack + Oil Crisis + Emergency Fed Meeting",
    description:
      "Three low-probability shocks converge in a single trading day. A state-sponsored cyberattack disables three major clearing houses. Simultaneously, a drone strike on a key Gulf pipeline triggers an oil supply shock. The Federal Reserve calls an unscheduled emergency meeting — and the market doesn't know whether to price in a rate cut or a panic hike.",
    category: "systemic",
    severity: 10,
    initialVIX: 52,
    priceShock: -18,
    duration: 40,
    volatilityMultiplier: 4.2,
    correlationSpike: 0.95,
    educationalFocus: [
      "Tail-risk hedging with put options",
      "Portfolio correlation breakdown",
      "Flight-to-quality mechanics (Treasuries, gold, yen)",
      "Circuit breaker rules and market halts",
      "Contagion: how liquidity cascades across asset classes",
      "Fed policy under genuine systemic stress",
    ],
    survivalCriteria: [
      {
        id: "capital_floor",
        label: "Capital Floor",
        description: "Preserve at least 80% of starting capital through the event.",
        minCapitalPreserved: 0.80,
      },
      {
        id: "drawdown_limit",
        label: "Drawdown Discipline",
        description: "Maximum intraday drawdown must not exceed 25%.",
        maxDrawdownPct: 25,
      },
      {
        id: "exposure_reduction",
        label: "Exposure Reduction",
        description: "Net equity exposure must fall below 30% of starting capital within the first 5 bars.",
        maxNetExposureFraction: 0.30,
      },
      {
        id: "hedge_applied",
        label: "Hedge Deployed",
        description: "At least one protective position (short, inverse ETF, put) must be opened.",
        requiresHedge: true,
      },
    ],
    commonMistakes: [
      "Averaging down into a falling market with no stop-loss discipline",
      "Treating the opening gap-down as a buying opportunity on day 1",
      "Ignoring oil sector long exposure — direct correlated hit",
      "Holding leveraged positions through a Fed announcement of unknown direction",
      "Assuming the circuit breaker halt signals a bottom",
    ],
    whatWorked: [
      "Reducing gross exposure to under 20% before the second shock",
      "Long volatility positions (VIX calls, long straddles) initiated early",
      "Flight-to-quality rotation into short-duration Treasuries and gold",
      "Strict position sizing: no single position above 2% of portfolio",
      "Sitting in cash and waiting for stabilization — sometimes no trade is the best trade",
    ],
    historicalAnalogues: [
      "March 2020 COVID crash (multi-shock, Fed emergency meeting)",
      "9/11 market closure and re-open selloff",
      "1973 OPEC oil embargo + Watergate political shock",
    ],
  },

  {
    id: "flash_crash_2",
    name: "Flash Crash 2.0",
    tagline: "Algorithmic cascade, circuit breakers, liquidity void",
    description:
      "A corrupted data feed triggers a cascade of stop-loss algorithms. Within 11 minutes, the S&P 500 drops 9%. Circuit breakers halt trading five times. When trading resumes, bid-ask spreads widen to 10x normal. Market makers pull their quotes. The order book is a ghost town — if you need to exit, you are selling into a void.",
    category: "market_structure",
    severity: 8,
    initialVIX: 45,
    priceShock: -9,
    duration: 15,
    volatilityMultiplier: 6.0,
    correlationSpike: 0.88,
    educationalFocus: [
      "Algorithmic feedback loops and cascade failures",
      "Bid-ask spread widening under stress — true execution cost",
      "Circuit breakers: Level 1 (7%), Level 2 (13%), Level 3 (20%)",
      "Market maker obligations and quote withdrawal rights",
      "Slippage: why a limit order protects but a market order destroys in a void",
      "V-shaped recoveries: liquidity returns when algos reset",
    ],
    survivalCriteria: [
      {
        id: "no_market_orders",
        label: "No Panic Market Orders",
        description: "Avoid executing large market orders during the liquidity void. Capital loss from slippage must be under 5%.",
        maxDrawdownPct: 15,
      },
      {
        id: "capital_floor",
        label: "Capital Preserved",
        description: "Maintain at least 85% of starting capital.",
        minCapitalPreserved: 0.85,
      },
      {
        id: "recovery_participation",
        label: "Recovery Participation",
        description: "Hold or re-enter at least one long position during the V-shaped recovery (bars 8–15).",
        requiresHedge: false,
      },
    ],
    commonMistakes: [
      "Selling at the absolute bottom into the liquidity void",
      "Using market orders — getting filled 5–8% worse than last price",
      "Panic-closing all positions at the widest spreads",
      "Missing the V-shaped recovery entirely by staying in cash",
      "Over-trading: placing multiple redundant orders that all fill as liquidity returns",
    ],
    whatWorked: [
      "Pre-set limit orders at support levels — filled automatically at good prices",
      "Not trading for the first 5 minutes after the halt lifted",
      "Buying in small tranches as bid-ask spread started to normalize",
      "Recognizing the flush as mechanical, not fundamental",
      "Patience: the S&P recovered 6% within 90 minutes of the circuit breaker lift",
    ],
    historicalAnalogues: [
      "Flash Crash of May 6, 2010 (Dow -1,000 intraday)",
      "Knight Capital algorithmic failure 2012",
      "August 24, 2015 ETF pricing dislocation",
    ],
  },

  {
    id: "pandemic_zero_day",
    name: "Pandemic Zero Day",
    tagline: "Unknown pathogen, global market shutdown",
    description:
      "WHO declares a Public Health Emergency of International Concern for an unknown respiratory pathogen with a case fatality rate estimated at 3–8%. Three major airports are shut. Futures markets drop limit-down before regular trading opens. The information vacuum is total — models built on historical data are useless.",
    category: "pandemic",
    severity: 9,
    initialVIX: 62,
    priceShock: -22,
    duration: 60,
    volatilityMultiplier: 3.8,
    correlationSpike: 0.92,
    educationalFocus: [
      "Black Swan theory (Nassim Taleb): unknown unknowns",
      "Regime change: when historical correlations break down entirely",
      "Sector rotation under pandemic conditions (travel/hospitality vs. pharma/e-commerce)",
      "Volatility surface dynamics: front-month IV spikes, back-month lags",
      "Government intervention: stimulus, rate cuts, QE infinity",
      "Mean-reversion after fat-tail events: when to start buying",
    ],
    survivalCriteria: [
      {
        id: "capital_floor",
        label: "Capital Preserved",
        description: "Preserve at least 70% of starting capital.",
        minCapitalPreserved: 0.70,
      },
      {
        id: "drawdown_limit",
        label: "Drawdown Ceiling",
        description: "Peak drawdown must not exceed 35%.",
        maxDrawdownPct: 35,
      },
      {
        id: "hedge_applied",
        label: "Protective Hedge",
        description: "Open a protective or inverse position within the first 10 bars.",
        requiresHedge: true,
      },
    ],
    commonMistakes: [
      "Buying the first 5% dip — labeling it a buying opportunity before severity is known",
      "Maintaining full sector concentration in travel, hospitality, retail",
      "Ignoring the VIX signal — IV at 62 means the market expects more pain",
      "Selling defensive positions (staples, pharma) due to short-term correlation spike",
      "Leveraging up after the initial drop, not accounting for multiple down legs",
    ],
    whatWorked: [
      "Dramatically cutting equity exposure within 48 hours of the declaration",
      "Rotating into healthcare, e-commerce, remote-work beneficiaries",
      "Long volatility before the second and third wave of selling",
      "Cash as a position — staying liquid during the information vacuum",
      "Scaling back in gradually over 10–14 bars as policy response became clear",
    ],
    historicalAnalogues: [
      "COVID-19 initial crash Feb–Mar 2020 (-34% in 33 days)",
      "SARS 2003 Hong Kong market impact",
      "Spanish Flu 1918 bond and equity market response",
    ],
  },

  {
    id: "currency_devaluation_cascade",
    name: "Currency Devaluation Cascade",
    tagline: "Emerging market contagion spreading to developed markets",
    description:
      "A major emerging market economy devalues its currency overnight by 30%. Capital flight triggers a contagion cascade: four more EM currencies break their pegs within 72 hours. European banks with EM sovereign debt exposure collapse in pre-market. The dollar surges, commodity prices implode, and EM equity funds face mass redemptions.",
    category: "geopolitical",
    severity: 8,
    initialVIX: 38,
    priceShock: -14,
    duration: 35,
    volatilityMultiplier: 2.8,
    correlationSpike: 0.82,
    educationalFocus: [
      "Currency peg mechanics and speculative attacks",
      "Contagion theory: how local shocks become global crises",
      "Dollar strength and its impact on commodity-exporting nations",
      "EM debt: foreign currency risk and roll-over risk",
      "George Soros and the 1992 ERM crisis as a framework",
      "Flight-to-quality: USD, JPY, CHF, gold during EM stress",
    ],
    survivalCriteria: [
      {
        id: "fx_exposure",
        label: "Reduced FX Exposure",
        description: "Eliminate EM-correlated equity exposure within 8 bars.",
        maxNetExposureFraction: 0.25,
      },
      {
        id: "capital_floor",
        label: "Capital Preserved",
        description: "Preserve at least 82% of starting capital.",
        minCapitalPreserved: 0.82,
      },
      {
        id: "drawdown_limit",
        label: "Drawdown Control",
        description: "Maximum drawdown must remain under 22%.",
        maxDrawdownPct: 22,
      },
    ],
    commonMistakes: [
      "Buying EM equity dips as if the currency stress is isolated",
      "Ignoring commodity book exposure during a dollar-surge event",
      "Underestimating European bank secondary exposure to EM sovereign debt",
      "Failing to rotate into USD-denominated safe havens early",
      "Assuming EM contagion cannot reach US equity markets",
    ],
    whatWorked: [
      "Exiting EM and commodity positions before the second peg break",
      "Long USD/short commodity-linked currencies as a hedge",
      "Rotating into large-cap US domestic companies with no EM revenue",
      "Long US Treasuries and gold as capital fled to safety",
      "Monitoring currency futures as a leading indicator of equity stress",
    ],
    historicalAnalogues: [
      "1997 Asian Financial Crisis (Thai baht peg break)",
      "1998 Russian ruble default + LTCM collapse",
      "2015 Chinese yuan devaluation shock",
    ],
  },

  {
    id: "ai_regulatory_shock",
    name: "AI Regulatory Shock",
    tagline: "Major AI companies banned overnight by emergency decree",
    description:
      "Following a widely publicized AI safety incident, the EU and three US states issue emergency injunctions halting commercial deployment of all frontier AI models. Three Mag-7 companies announce they are suspending AI product lines pending regulatory review. The $4 trillion AI infrastructure trade unwinds in a single session.",
    category: "regulatory",
    severity: 7,
    initialVIX: 35,
    priceShock: -16,
    duration: 25,
    volatilityMultiplier: 2.5,
    correlationSpike: 0.78,
    educationalFocus: [
      "Concentration risk: when a single theme drives 30%+ of an index",
      "Regulatory event risk: overnight binary outcomes",
      "Sector rotation: beneficiaries and victims of sudden technology bans",
      "Options as event-risk hedges: buying puts before known catalyst dates",
      "Narrative vs. fundamentals: how fast a consensus trade can reverse",
      "Index mechanics: how cap-weighted indices amplify single-sector shocks",
    ],
    survivalCriteria: [
      {
        id: "concentration_limit",
        label: "Concentration Control",
        description: "No single tech position should exceed 15% of portfolio at time of shock.",
        maxNetExposureFraction: 0.40,
      },
      {
        id: "capital_floor",
        label: "Capital Preserved",
        description: "Preserve at least 83% of starting capital.",
        minCapitalPreserved: 0.83,
      },
      {
        id: "hedge_applied",
        label: "Event Hedge",
        description: "A short or put position on an AI-correlated ticker must be open.",
        requiresHedge: true,
      },
    ],
    commonMistakes: [
      "Overconcentration in the AI theme — treating consensus as certainty",
      "No tail-risk hedge despite extraordinarily stretched valuations",
      "Buying the initial dip without accounting for regulatory overhang duration",
      "Ignoring NVDA/MSFT/META correlation — they all sell off together",
      "Anchoring to pre-shock price targets from sell-side analysts",
    ],
    whatWorked: [
      "Pre-positioned put spreads on concentrated tech names before the event",
      "Rotating into AI-neutral value sectors: financials, utilities, healthcare",
      "Shorting AI infrastructure plays (cloud, data center REITs)",
      "Buying semiconductor equipment shorts — capex cycle reversal",
      "Waiting for a proper deceleration signal before re-entering tech",
    ],
    historicalAnalogues: [
      "Ant Group IPO cancellation (Nov 2020)",
      "Chinese tech crackdown 2021 (DiDi, Alibaba, Tencent -50–80%)",
      "Facebook Cambridge Analytica regulatory shock 2018",
    ],
  },

  {
    id: "liquidity_crisis",
    name: "Liquidity Crisis",
    tagline: "Repo market seizing, interbank paralysis",
    description:
      "Overnight repo rates spike to 8% as a major prime broker fails to roll its short-term funding. Counterparty risk fears spread through the interbank market. Money market funds break the buck. Three hedge funds with $300B in assets face margin calls simultaneously. The plumbing of global finance is clogged.",
    category: "liquidity",
    severity: 9,
    initialVIX: 48,
    priceShock: -11,
    duration: 45,
    volatilityMultiplier: 3.5,
    correlationSpike: 0.90,
    educationalFocus: [
      "Repo market mechanics: overnight funding and collateral haircuts",
      "Prime brokerage risk: how hedge fund leverage amplifies systemic stress",
      "Money market fund 'breaking the buck': Reserve Primary Fund (2008)",
      "Deleveraging spiral: margin calls force selling which forces more margin calls",
      "Central bank emergency facilities: Fed repo operations and swap lines",
      "Liquidity vs. solvency: why healthy assets still get sold in a liquidity crisis",
    ],
    survivalCriteria: [
      {
        id: "cash_buffer",
        label: "Cash Buffer",
        description: "Maintain at least 40% portfolio in cash or near-cash at all times during the event.",
        maxNetExposureFraction: 0.60,
      },
      {
        id: "capital_floor",
        label: "Capital Preserved",
        description: "Preserve at least 78% of starting capital.",
        minCapitalPreserved: 0.78,
      },
      {
        id: "drawdown_limit",
        label: "Drawdown Ceiling",
        description: "Peak drawdown must stay below 28%.",
        maxDrawdownPct: 28,
      },
      {
        id: "hedge_applied",
        label: "Short Financials Hedge",
        description: "Open a defensive short position to offset long equity exposure.",
        requiresHedge: true,
      },
    ],
    commonMistakes: [
      "Holding leveraged positions when margin rates can spike unexpectedly",
      "Treating the liquidity crisis as a buying opportunity too early",
      "Ignoring financial sector exposure — banks are first casualties",
      "Assuming the Fed will intervene immediately and decisively",
      "Selling Treasuries to fund margin calls — creating a Treasury-equity correlation spike",
    ],
    whatWorked: [
      "De-leveraging well before margin calls became forced",
      "Short financials as a direct hedge against interbank stress",
      "Long Treasury bills and money market alternatives away from prime funds",
      "Waiting for explicit Fed repo operation announcements before re-risking",
      "Treating gold as liquidity hedge of last resort",
    ],
    historicalAnalogues: [
      "2008 Lehman Brothers collapse and repo market freeze",
      "September 2019 repo rate spike",
      "March 2020 Treasury market dysfunction",
    ],
  },

  {
    id: "correlated_liquidation",
    name: "Correlated Liquidation",
    tagline: "Risk parity funds unwind — everything sells simultaneously",
    description:
      "Global risk parity funds with $1.4 trillion in AUM receive simultaneous redemption notices after bond and equity correlations both spike to +0.8. Their models mandate selling everything: equities, bonds, gold, commodities, EM, DM — in proportion to volatility. There is no safe asset. Diversification has failed.",
    category: "systemic",
    severity: 8,
    initialVIX: 42,
    priceShock: -12,
    duration: 30,
    volatilityMultiplier: 3.2,
    correlationSpike: 0.97,
    educationalFocus: [
      "Risk parity: how volatility-weighting creates systemic procyclicality",
      "Correlation convergence during crises: 'in a crisis, all correlations go to 1'",
      "Modern Portfolio Theory limitations in tail-risk environments",
      "Convexity of bonds: when the 'safe haven' also sells off",
      "Volatility targeting: forced de-risking creates a feedback loop",
      "Tail-risk parity: Bridgewater All-Weather strategy and its 2020 failure",
    ],
    survivalCriteria: [
      {
        id: "diversification_awareness",
        label: "Diversification Awareness",
        description: "Reduce ALL correlated long positions (equity and bond) within 6 bars.",
        maxNetExposureFraction: 0.35,
      },
      {
        id: "capital_floor",
        label: "Capital Preserved",
        description: "Preserve at least 80% of starting capital.",
        minCapitalPreserved: 0.80,
      },
      {
        id: "hedge_applied",
        label: "Long Volatility",
        description: "Open a long-volatility or short-correlation position.",
        requiresHedge: true,
      },
      {
        id: "drawdown_limit",
        label: "Drawdown Control",
        description: "Keep maximum drawdown below 24%.",
        maxDrawdownPct: 24,
      },
    ],
    commonMistakes: [
      "Relying on bond holdings to offset equity losses — bonds sold too",
      "Assuming gold would be a safe haven — it was liquidated proportionally",
      "Adding to positions in 'cheap' assets while systematic selling continues",
      "Using historical correlations to position: they all broke to +1",
      "Not understanding that the selling was mechanical, not fundamental",
    ],
    whatWorked: [
      "Pure cash and short-term T-bills — the only true safe haven",
      "Long VIX instruments: the volatility spike was the clearest signal",
      "Short risk-parity ETF proxies as a direct hedge",
      "Recognizing the mechanical nature and timing re-entry at fund exhaustion",
      "Options strategies with positive convexity: benefited from extreme IV",
    ],
    historicalAnalogues: [
      "February 2018 volatility event (VIXplosion)",
      "March 2020 multi-asset liquidation",
      "August 2015 risk-parity fund unwind",
    ],
  },

  {
    id: "black_monday_redux",
    name: "Black Monday Redux",
    tagline: "Program trading triggers +20% single-day collapse",
    description:
      "Portfolio insurance strategies — now implemented through algorithmic delta-hedging — trigger a self-reinforcing selling program. As prices fall, the models sell futures. As futures fall, spot follows. Margin calls cascade. By 2:30 PM, the index is down 21%. The specialists on the NYSE floor are technically insolvent. The question is whether trading resumes tomorrow.",
    category: "market_structure",
    severity: 10,
    initialVIX: 72,
    priceShock: -21,
    duration: 20,
    volatilityMultiplier: 7.0,
    correlationSpike: 0.98,
    educationalFocus: [
      "Black Monday 1987: portfolio insurance and the mechanics of collapse",
      "Futures vs. spot arbitrage breakdown under extreme stress",
      "Specialist system vs. market-maker model: who provides liquidity of last resort",
      "Circuit breakers: how they were created in response to 1987",
      "Brady Report recommendations: the regulatory aftermath",
      "Historical VIX equivalents: what 100+ implied vol means for option pricing",
      "Survival psychology: when to accept a large loss and live to trade another day",
    ],
    survivalCriteria: [
      {
        id: "rapid_exit",
        label: "Rapid De-risking",
        description: "Exit at least 70% of long equity exposure within the first 5 bars.",
        maxNetExposureFraction: 0.30,
      },
      {
        id: "capital_floor",
        label: "Capital Preserved",
        description: "Preserve at least 65% of starting capital — even this is a triumph in a 20% down day.",
        minCapitalPreserved: 0.65,
      },
      {
        id: "hedge_applied",
        label: "Short or Put Hedge",
        description: "Establish a net short or put protection during the first leg down.",
        requiresHedge: true,
      },
      {
        id: "drawdown_limit",
        label: "Hard Drawdown Stop",
        description: "Maximum drawdown must not exceed 40%.",
        maxDrawdownPct: 40,
      },
    ],
    commonMistakes: [
      "Holding full long exposure, believing a 5% drop 'can't get worse'",
      "Calling bottoms on the way down — in a cascade, each level breaks",
      "Liquidating at the absolute low, locking in the worst possible price",
      "Using the 1987 recovery as justification to not cut: it took 2 years to recover",
      "Ignoring the futures market as a leading indicator of spot deterioration",
    ],
    whatWorked: [
      "Pre-event portfolio insurance of their own: long put positions",
      "Cutting exposure aggressively on the first 3% break — not waiting",
      "Short futures as a direct hedge against the portfolio insurance selling",
      "Staying flat and watching — refusing to fight algorithmic momentum",
      "Post-event buying: those who had cash to deploy bought generational lows",
    ],
    historicalAnalogues: [
      "Black Monday October 19, 1987 (-22.6% in one day)",
      "October 1929 Black Thursday/Tuesday",
      "March 16, 2020 (worst single-day point drop in Dow history at the time)",
    ],
  },
];

export const BLACK_SWAN_SCENARIOS_BY_ID = Object.fromEntries(
  BLACK_SWAN_SCENARIOS.map((s) => [s.id, s]),
) as Record<string, BlackSwanScenario>;

/** Returns severity color classes for Tailwind */
export function getSeverityColor(severity: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (severity >= 9) return { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/40" };
  if (severity >= 7) return { text: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/40" };
  if (severity >= 5) return { text: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/40" };
  return { text: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/40" };
}

/** Returns a label for the severity level */
export function getSeverityLabel(severity: number): string {
  if (severity === 10) return "EXTINCTION";
  if (severity >= 9) return "CRITICAL";
  if (severity >= 7) return "SEVERE";
  if (severity >= 5) return "HIGH";
  return "ELEVATED";
}
