/**
 * Counterparty Agent System
 *
 * Simulates 5 market participant archetypes, each with distinct behavioral
 * logic that affects spread, price impact, and order flow dynamics.
 *
 * Uses mulberry32 seeded PRNG for deterministic, reproducible behavior.
 */

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(ticker: string, barIndex: number, salt: number): number {
  let h = (barIndex * 2654435761 + salt) | 0;
  for (let i = 0; i < ticker.length; i++) {
    h = (Math.imul(h, 31) + ticker.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type BehaviorType =
  | "market_maker"
  | "momentum_chaser"
  | "institutional_arb"
  | "retail_herd"
  | "black_swan";

export type ActionSentiment = "bullish" | "bearish" | "neutral" | "disruptive";

export interface AgentAction {
  timestamp: number;
  description: string;
  sentiment: ActionSentiment;
  /** Signed price impact as a fraction of current price (e.g. +0.003 = +0.3%) */
  priceImpactPct: number;
  /** Change to bid-ask spread as fraction (e.g. +0.001 = spread widens by 0.1%) */
  spreadDeltaPct: number;
  /** Approximate notional value of the action */
  notional: number;
}

export interface CounterpartyAgent {
  id: BehaviorType;
  name: string;
  description: string;
  realWorldEquivalent: string;
  behaviorType: BehaviorType;
  /** Is this agent currently active in the simulation */
  enabled: boolean;
  /** Current high-level action label shown in the UI */
  currentAction: string;
  /** -1..+1: net directional pressure this agent is currently exerting */
  currentPressure: number;
  /** 0..1: how active / impactful the agent is right now */
  activityLevel: number;
  /** Last 5 actions, most-recent first */
  recentActions: AgentAction[];
  /** Spread contribution: positive = widening */
  spreadImpactPct: number;
  /** Signed price impact this bar */
  priceImpactPct: number;
}

export interface CounterpartySnapshot {
  agents: CounterpartyAgent[];
  /** Net aggregate price impact across all active agents */
  aggregatePriceImpactPct: number;
  /** Net aggregate spread impact across all active agents */
  aggregateSpreadImpactPct: number;
  /** True when a black-swan event was injected this bar */
  blackSwanActive: boolean;
  /** Short description of the current market microstructure regime */
  regimeLabel: string;
}

// ── Agent state for tracking history across bars ──────────────────────────────

interface AgentState {
  recentActions: AgentAction[];
}

const agentStates = new Map<string, AgentState>();

function getAgentState(agentId: string): AgentState {
  if (!agentStates.has(agentId)) {
    agentStates.set(agentId, { recentActions: [] });
  }
  return agentStates.get(agentId)!;
}

function pushAction(agentId: string, action: AgentAction): void {
  const state = getAgentState(agentId);
  state.recentActions = [action, ...state.recentActions].slice(0, 5);
}

// ── Individual agent logic ────────────────────────────────────────────────────

/**
 * Market Maker
 * Provides continuous two-sided liquidity. Adjusts bid-ask spread upward
 * when realized vol is high (wider spread = more inventory risk compensation)
 * and narrows it in calm markets to attract flow.
 */
function computeMarketMaker(
  ticker: string,
  barIndex: number,
  currentPrice: number,
  recentVolPct: number, // realized vol as fraction (e.g. 0.015 = 1.5%)
): Pick<CounterpartyAgent, "currentAction" | "currentPressure" | "activityLevel" | "spreadImpactPct" | "priceImpactPct"> & {
  action: AgentAction;
} {
  const rand = mulberry32(hashSeed(ticker, barIndex, 1001));

  // Spread inversely proportional to market calm
  // During high vol: widen spread; during low vol: tighten to earn edge
  const baseSpread = 0.0005; // 0.05% tight market
  const volMult = 1.0 + recentVolPct * 40; // up to ~1.6x in 1.5% vol environment
  const spreadNoise = (rand() - 0.5) * 0.0002;
  const spreadImpactPct = Math.max(0, baseSpread * volMult + spreadNoise);

  // Market makers are near-neutral in price impact — they hedge quickly
  const priceImpactPct = (rand() - 0.5) * 0.0004; // ±0.02% noise only
  const currentPressure = priceImpactPct / 0.0004; // normalized

  const activityLevel = 0.5 + recentVolPct * 20; // more active in high vol
  const clampedActivity = Math.min(1, activityLevel);

  // Action descriptions
  const volLabel = recentVolPct > 0.012 ? "elevated" : recentVolPct > 0.007 ? "moderate" : "low";
  const spreadBps = (spreadImpactPct * 10000).toFixed(1);
  const actions = [
    `Posting tight two-sided quotes; spread widened to ${spreadBps}bps on ${volLabel} vol`,
    `Continuous liquidity provision — replenishing order book depth at ±${spreadBps}bps`,
    `Inventory hedge executed; spread maintained at ${spreadBps}bps`,
    `Adjusting quote skew ${currentPressure > 0 ? "upward" : "downward"} after order flow imbalance`,
  ];
  const currentAction = actions[Math.floor(rand() * actions.length)];

  const action: AgentAction = {
    timestamp: Date.now(),
    description: currentAction,
    sentiment: "neutral",
    priceImpactPct,
    spreadDeltaPct: spreadImpactPct,
    notional: Math.round(currentPrice * (1000 + rand() * 4000)),
  };

  return { currentAction, currentPressure, activityLevel: clampedActivity, spreadImpactPct, priceImpactPct, action };
}

/**
 * Momentum Chaser
 * Buys into up-trends and sells into down-trends with a lag.
 * Contributes positive feedback loops — amplifies moves.
 */
function computeMomentumChaser(
  ticker: string,
  barIndex: number,
  currentPrice: number,
  priceChangePct: number, // recent price change e.g. +0.015 = +1.5%
): Pick<CounterpartyAgent, "currentAction" | "currentPressure" | "activityLevel" | "spreadImpactPct" | "priceImpactPct"> & {
  action: AgentAction;
} {
  const rand = mulberry32(hashSeed(ticker, barIndex, 2002));

  // Lag: momentum chaser joins after price already moved; stronger entry if large move
  const laggedSignal = priceChangePct * (0.7 + rand() * 0.4); // 70–110% of signal
  const currentPressure = Math.max(-1, Math.min(1, laggedSignal * 50));

  // Price impact: adds fuel to existing trend; 0.1-0.4% per 1% price change
  const impactCoeff = 0.15 + rand() * 0.25;
  const priceImpactPct = laggedSignal * impactCoeff;

  // Spreads widen slightly as momentum chaser hits asks aggressively
  const spreadImpactPct = Math.abs(currentPressure) * 0.0003;

  const activityLevel = Math.min(1, Math.abs(priceChangePct) * 40);

  const direction = currentPressure > 0.1 ? "buying" : currentPressure < -0.1 ? "selling" : "waiting";
  const sizeLabel = activityLevel > 0.6 ? "large" : activityLevel > 0.3 ? "moderate" : "small";
  const actions: Record<string, string[]> = {
    buying: [
      `Chasing upward momentum with ${sizeLabel} buy orders; riding ${(priceChangePct * 100).toFixed(2)}% move`,
      `FOMO entry — adding to long position as breakout extends higher`,
      `Trend-following algorithm triggered long entry on price acceleration`,
    ],
    selling: [
      `Momentum flip — reversing to short as downtrend accelerates`,
      `Chasing downward momentum; selling into weakness after ${(Math.abs(priceChangePct) * 100).toFixed(2)}% decline`,
      `Stop-and-reverse triggered; now short after trend break`,
    ],
    waiting: [
      `Monitoring for trend signal; no clear momentum above threshold`,
      `Flat — awaiting breakout above recent range to deploy capital`,
      `Neutral stance; price consolidating, momentum score near zero`,
    ],
  };
  const currentAction = (actions[direction] ?? actions.waiting)[Math.floor(rand() * 3)];

  const action: AgentAction = {
    timestamp: Date.now(),
    description: currentAction,
    sentiment: currentPressure > 0.1 ? "bullish" : currentPressure < -0.1 ? "bearish" : "neutral",
    priceImpactPct,
    spreadDeltaPct: spreadImpactPct,
    notional: Math.round(currentPrice * (500 + rand() * 3000) * activityLevel),
  };

  return { currentAction, currentPressure, activityLevel, spreadImpactPct, priceImpactPct, action };
}

/**
 * Institutional Arbitrageur
 * Exploits mispricings between correlated assets. Places large orders that
 * move the market toward fair value. Creates temporary price dislocations
 * then quickly corrects them.
 */
function computeInstitutionalArb(
  ticker: string,
  barIndex: number,
  currentPrice: number,
  impliedFairValue: number, // estimated fair value, e.g. currentPrice ± small deviation
): Pick<CounterpartyAgent, "currentAction" | "currentPressure" | "activityLevel" | "spreadImpactPct" | "priceImpactPct"> & {
  action: AgentAction;
} {
  const rand = mulberry32(hashSeed(ticker, barIndex, 3003));

  const mispricing = (impliedFairValue - currentPrice) / currentPrice;
  // Only acts when mispricing exceeds threshold (0.3%)
  const threshold = 0.003;
  const active = Math.abs(mispricing) > threshold;

  const currentPressure = active ? Math.max(-1, Math.min(1, mispricing * 200)) : 0;
  const priceImpactPct = active ? mispricing * 0.4 : 0; // pushes 40% of way to fair value
  const spreadImpactPct = active ? 0.0008 : 0; // large orders temporarily widen spread
  const activityLevel = active ? Math.min(1, Math.abs(mispricing) * 100) : 0.1;

  const mispricingBps = (Math.abs(mispricing) * 10000).toFixed(0);
  const direction = mispricing > 0 ? "undervalued" : "overvalued";
  const orderSide = mispricing > 0 ? "buy" : "sell";
  const actions = active
    ? [
        `Cross-asset arb: ${ticker} is ${mispricingBps}bps ${direction} vs. ETF basket — placing ${orderSide} program`,
        `Statistical arb entry: pair spread at ${mispricingBps}bps dislocation — converging toward fair value`,
        `Large institutional ${orderSide} program executing; targeting ${mispricingBps}bps mispricing vs. index`,
      ]
    : [
        `Monitoring spreads; no actionable mispricing detected (threshold: 30bps)`,
        `Within fair value band — holding existing positions, no new arb opportunity`,
        `Scanning cross-asset relationships; current deviation below entry threshold`,
      ];
  const currentAction = actions[Math.floor(rand() * 3)];

  const action: AgentAction = {
    timestamp: Date.now(),
    description: currentAction,
    sentiment: mispricing > threshold ? "bullish" : mispricing < -threshold ? "bearish" : "neutral",
    priceImpactPct,
    spreadDeltaPct: spreadImpactPct,
    notional: active ? Math.round(currentPrice * (10000 + rand() * 90000)) : 0,
  };

  return { currentAction, currentPressure, activityLevel, spreadImpactPct, priceImpactPct, action };
}

/**
 * Retail Herd
 * Overreacts to news and price moves. Exhibits disposition effect:
 * holds losers too long, sells winners too early.
 * Creates noise, herding, and occasional squeezes.
 */
function computeRetailHerd(
  ticker: string,
  barIndex: number,
  currentPrice: number,
  priceChangePct: number,
  hasNews: boolean,
): Pick<CounterpartyAgent, "currentAction" | "currentPressure" | "activityLevel" | "spreadImpactPct" | "priceImpactPct"> & {
  action: AgentAction;
} {
  const rand = mulberry32(hashSeed(ticker, barIndex, 4004));

  // Overreaction coefficient: retail over-weights recent news by 1.5-2.5x
  const overreactionMult = hasNews ? 1.8 + rand() * 0.8 : 1.2 + rand() * 0.5;
  const perceivedSignal = priceChangePct * overreactionMult;

  // Disposition effect: reluctant to sell losers (dampen bear signal), quick to lock gains
  const dispositionBias = perceivedSignal < 0 ? 0.6 : 1.1; // hold losers, sell winners fast
  const currentPressure = Math.max(-1, Math.min(1, perceivedSignal * dispositionBias * 30));

  const priceImpactPct = perceivedSignal * dispositionBias * 0.08; // smaller individual trades
  const spreadImpactPct = hasNews ? 0.0006 : Math.abs(currentPressure) * 0.0002;
  const activityLevel = hasNews ? 0.8 + rand() * 0.2 : Math.min(1, Math.abs(priceChangePct) * 25);

  const newsTag = hasNews ? " (news-driven)" : "";
  const actions =
    currentPressure > 0.2
      ? [
          `Herding into long positions${newsTag} — social media buzz driving retail FOMO`,
          `Retail crowd chasing price higher${newsTag}; small lots hitting the ask`,
          `Disposition effect: retail selling recent gainers to lock profits — short-term headwind`,
        ]
      : currentPressure < -0.2
        ? [
            `Panic selling${newsTag} — retail capitulating after small decline`,
            `Disposition effect: refusing to sell losing positions; supply overhang building`,
            `Retail stop-loss cascade${newsTag}; fragmented small orders hitting bid`,
          ]
        : [
            `Retail activity subdued; no strong catalyst driving crowd behavior`,
            `Mixed sentiment among retail; buy and sell orders roughly balanced`,
            `Herd waiting for clearer signal; low participation from small accounts`,
          ];
  const currentAction = actions[Math.floor(rand() * 3)];

  const action: AgentAction = {
    timestamp: Date.now(),
    description: currentAction,
    sentiment: currentPressure > 0.2 ? "bullish" : currentPressure < -0.2 ? "bearish" : "neutral",
    priceImpactPct,
    spreadDeltaPct: spreadImpactPct,
    notional: Math.round(currentPrice * (50 + rand() * 450) * activityLevel),
  };

  return { currentAction, currentPressure, activityLevel, spreadImpactPct, priceImpactPct, action };
}

/**
 * Black Swan Generator
 * Injects rare tail events with ~1% probability per bar.
 * Can be manually triggered via simulateBlackSwan().
 * Events: flash crash, liquidity gap, circuit breaker, geopolitical shock.
 */
function computeBlackSwan(
  ticker: string,
  barIndex: number,
  currentPrice: number,
  forceEvent: boolean,
): Pick<CounterpartyAgent, "currentAction" | "currentPressure" | "activityLevel" | "spreadImpactPct" | "priceImpactPct"> & {
  action: AgentAction;
  eventTriggered: boolean;
} {
  const rand = mulberry32(hashSeed(ticker, barIndex, 5005));

  const probability = 0.01; // 1% per bar
  const eventTriggered = forceEvent || rand() < probability;

  if (!eventTriggered) {
    return {
      currentAction: "Dormant — monitoring tail-risk conditions",
      currentPressure: 0,
      activityLevel: 0.02,
      spreadImpactPct: 0,
      priceImpactPct: 0,
      action: {
        timestamp: Date.now(),
        description: "No tail event. Probability of trigger: 1% per bar.",
        sentiment: "neutral",
        priceImpactPct: 0,
        spreadDeltaPct: 0,
        notional: 0,
      },
      eventTriggered: false,
    };
  }

  // Choose event type
  type SwanEvent = {
    name: string;
    priceImpact: number;
    spreadImpact: number;
    description: string;
  };

  const events: SwanEvent[] = [
    {
      name: "Flash Crash",
      priceImpact: -(0.05 + rand() * 0.10), // -5% to -15%
      spreadImpact: 0.02,
      description: `Flash crash triggered — ${ticker} gapped down as stop-loss cascade wiped out bid-side liquidity`,
    },
    {
      name: "Liquidity Gap",
      priceImpact: (rand() < 0.5 ? -1 : 1) * (0.03 + rand() * 0.07), // ±3-10%
      spreadImpact: 0.015,
      description: `Liquidity gap — market makers withdrew quotes simultaneously; spread blew out to 150bps`,
    },
    {
      name: "Geopolitical Shock",
      priceImpact: -(0.04 + rand() * 0.08), // -4% to -12%
      spreadImpact: 0.012,
      description: `Geopolitical shock headline — algorithmic risk-off response liquidating positions in ${ticker}`,
    },
    {
      name: "Short Squeeze",
      priceImpact: 0.06 + rand() * 0.12, // +6% to +18%
      spreadImpact: 0.01,
      description: `Short squeeze initiated — heavily shorted ${ticker} spiking as shorts cover simultaneously`,
    },
    {
      name: "Circuit Breaker",
      priceImpact: -(0.07 + rand() * 0.08), // -7% to -15%
      spreadImpact: 0.025,
      description: `Exchange circuit breaker triggered on ${ticker} — trading halted after 7%+ decline in under 5 minutes`,
    },
  ];

  const event = events[Math.floor(rand() * events.length)];

  return {
    currentAction: `[ACTIVE] ${event.name} — tail event in progress`,
    currentPressure: Math.max(-1, Math.min(1, event.priceImpact * 10)),
    activityLevel: 1.0,
    spreadImpactPct: event.spreadImpact,
    priceImpactPct: event.priceImpact,
    action: {
      timestamp: Date.now(),
      description: event.description,
      sentiment: event.priceImpact > 0 ? "bullish" : "bearish",
      priceImpactPct: event.priceImpact,
      spreadDeltaPct: event.spreadImpact,
      notional: Math.round(currentPrice * (50000 + rand() * 500000)),
    },
    eventTriggered: true,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface CounterpartyInputs {
  ticker: string;
  barIndex: number;
  currentPrice: number;
  priceChangePct: number;
  recentVolPct: number;
  hasNews: boolean;
  enabledAgents: Set<BehaviorType>;
  forceBlackSwan: boolean;
}

/**
 * Compute the full counterparty snapshot for the current bar.
 * Pass `forceBlackSwan: true` to manually trigger a tail event.
 */
export function computeCounterpartySnapshot(
  inputs: CounterpartyInputs,
): CounterpartySnapshot {
  const {
    ticker,
    barIndex,
    currentPrice,
    priceChangePct,
    recentVolPct,
    hasNews,
    enabledAgents,
    forceBlackSwan,
  } = inputs;

  // Simulate a small mean-reverting fair-value deviation for arb
  const rand0 = mulberry32(hashSeed(ticker, barIndex, 9999));
  const fvDeviation = (rand0() - 0.5) * currentPrice * 0.008;
  const impliedFairValue = currentPrice + fvDeviation;

  // Compute each agent
  const mm = computeMarketMaker(ticker, barIndex, currentPrice, recentVolPct);
  const mc = computeMomentumChaser(ticker, barIndex, currentPrice, priceChangePct);
  const ia = computeInstitutionalArb(ticker, barIndex, currentPrice, impliedFairValue);
  const rh = computeRetailHerd(ticker, barIndex, currentPrice, priceChangePct, hasNews);
  const bs = computeBlackSwan(ticker, barIndex, currentPrice, forceBlackSwan);

  // Persist recent actions
  pushAction("market_maker", mm.action);
  pushAction("momentum_chaser", mc.action);
  pushAction("institutional_arb", ia.action);
  pushAction("retail_herd", rh.action);
  pushAction("black_swan", bs.action);

  const buildAgent = (
    id: BehaviorType,
    name: string,
    description: string,
    realWorldEquivalent: string,
    computed: {
      currentAction: string;
      currentPressure: number;
      activityLevel: number;
      spreadImpactPct: number;
      priceImpactPct: number;
    },
  ): CounterpartyAgent => ({
    id,
    name,
    description,
    realWorldEquivalent,
    behaviorType: id,
    enabled: enabledAgents.has(id),
    currentAction: computed.currentAction,
    currentPressure: computed.currentPressure,
    activityLevel: computed.activityLevel,
    spreadImpactPct: computed.spreadImpactPct,
    priceImpactPct: computed.priceImpactPct,
    recentActions: getAgentState(id).recentActions,
  });

  const agents: CounterpartyAgent[] = [
    buildAgent(
      "market_maker",
      "Market Maker",
      "Provides continuous two-sided liquidity. Adjusts bid-ask spread dynamically based on realized volatility.",
      "Citadel Securities, Virtu Financial, Jane Street — high-frequency firms obligated to quote both sides of the market.",
      mm,
    ),
    buildAgent(
      "momentum_chaser",
      "Momentum Chaser",
      "Follows price trends with a lag. Buys into rallies and sells into declines, amplifying existing moves.",
      "Trend-following CTAs, quantitative momentum funds, MACD-driven retail algos.",
      mc,
    ),
    buildAgent(
      "institutional_arb",
      "Institutional Arbitrageur",
      "Exploits mispricing between correlated assets. Places large orders that push prices toward fair value.",
      "Hedge funds running statistical arbitrage, ETF creation/redemption desks, index rebalancing programs.",
      ia,
    ),
    buildAgent(
      "retail_herd",
      "Retail Herd",
      "Overreacts to news and price changes. Exhibits disposition effect: holds losers too long, sells winners too early.",
      "Retail traders on Robinhood/Webull, Reddit-driven WallStreetBets crowd, social media sentiment traders.",
      rh,
    ),
    buildAgent(
      "black_swan",
      "Black Swan Generator",
      "Injects rare but extreme tail events with 1% probability per bar. Simulates flash crashes, liquidity gaps, and geopolitical shocks.",
      "Exogenous macro shocks, algorithmic cascade failures, geopolitical events, regulatory announcements.",
      bs,
    ),
  ];

  // Aggregate impact from enabled agents only
  let aggregatePriceImpactPct = 0;
  let aggregateSpreadImpactPct = 0;
  for (const agent of agents) {
    if (agent.enabled) {
      aggregatePriceImpactPct += agent.priceImpactPct;
      aggregateSpreadImpactPct += agent.spreadImpactPct;
    }
  }

  // Regime label
  const bsActive = bs.eventTriggered;
  const spread = aggregateSpreadImpactPct * 10000;
  let regimeLabel: string;
  if (bsActive) {
    regimeLabel = "Tail-Risk Event";
  } else if (spread > 15) {
    regimeLabel = "Stressed Liquidity";
  } else if (spread > 6) {
    regimeLabel = "Elevated Spreads";
  } else if (Math.abs(aggregatePriceImpactPct) > 0.005) {
    regimeLabel = "Directional Flow";
  } else {
    regimeLabel = "Normal Liquidity";
  }

  return {
    agents,
    aggregatePriceImpactPct,
    aggregateSpreadImpactPct,
    blackSwanActive: bsActive,
    regimeLabel,
  };
}

/**
 * Reset persisted agent action history (e.g. when switching tickers).
 */
export function resetAgentHistory(): void {
  agentStates.clear();
}

/**
 * Get default enabled set — all agents active.
 */
export function defaultEnabledAgents(): Set<BehaviorType> {
  return new Set<BehaviorType>([
    "market_maker",
    "momentum_chaser",
    "institutional_arb",
    "retail_herd",
    "black_swan",
  ]);
}
