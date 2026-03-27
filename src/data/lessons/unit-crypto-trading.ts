import type { Unit } from "./types";

export const UNIT_CRYPTO_TRADING: Unit = {
  id: "crypto-trading",
  title: "Crypto Trading",
  description:
    "Blockchain fundamentals, DeFi mechanics, crypto technical analysis, and risk management for digital assets",
  icon: "Coins",
  color: "#f97316",
  lessons: [
    /* ================================================================
       LESSON 1 — Crypto Fundamentals
       ================================================================ */
    {
      id: "crypto-trading-1",
      title: "Crypto Fundamentals",
      description:
        "Blockchain, consensus mechanisms, and tokenomics",
      icon: "Layers",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "What Is a Blockchain?",
          content:
            "A **blockchain** is a distributed ledger — a database copied across thousands of computers (nodes) worldwide. Every node holds an identical copy.\n\nEach **block** contains:\n- A batch of validated transactions\n- A timestamp\n- A cryptographic hash of the previous block\n\nThat last point is the key insight: each block is mathematically linked to the one before it. To alter a past transaction you would have to recompute that block's hash *and* every block after it, on more than half of all nodes simultaneously. This makes tampering computationally infeasible.\n\nBlockchains eliminate the need for a central authority (bank, clearinghouse) to verify and record transfers. Trust is enforced by math and distributed consensus instead.",
          highlight: ["blockchain", "distributed ledger", "hash", "node"],
        },
        {
          type: "teach",
          title: "Consensus Mechanisms: PoW vs PoS",
          content:
            "A **consensus mechanism** is the rule set that lets thousands of nodes agree on which transactions are valid without trusting each other.\n\n**Proof of Work (PoW) — Bitcoin**:\n- Miners expend real electricity competing to solve a hash puzzle\n- Winner adds the next block and earns the block reward\n- Security cost = energy; attacking requires 51% of global hash rate\n\n**Proof of Stake (PoS) — Ethereum post-2022**:\n- Validators lock up ('stake') ETH as collateral\n- Selected pseudo-randomly, weighted by stake size\n- Dishonest behaviour causes 'slashing' (losing staked ETH)\n- Security cost = capital at risk; ~32 ETH required per validator\n- Energy use drops ~99.95% vs PoW\n\n**Key trade-off**: PoW is battle-tested and censorship-resistant; PoS is more energy-efficient and allows higher throughput. Both remain active in the industry.",
          highlight: [
            "proof of work",
            "proof of stake",
            "consensus",
            "slashing",
            "validator",
          ],
        },
        {
          type: "teach",
          title: "Tokenomics: Supply, Demand, and Incentives",
          content:
            "**Tokenomics** (token + economics) describes the economic rules governing a cryptocurrency:\n\n**Supply factors**:\n- **Maximum supply**: Bitcoin's hard cap is 21 million. Many tokens have no cap.\n- **Circulating supply**: Tokens actually available to trade today\n- **Inflation rate**: New tokens minted per year as a % of existing supply\n- **Emission schedule**: How new supply enters circulation (mining, vesting, staking rewards)\n\n**Demand factors**:\n- Utility: What you can do with the token (pay gas fees, governance votes, collateral)\n- Network effects: More users → more value\n- Speculation / narrative\n\n**Red flags in tokenomics**:\n- Team holds >30% of supply with short vesting\n- Unlimited mint authority\n- Very high annual inflation (>50%) diluting holders\n\nAlways check a project's tokenomics before investing — good technology with bad tokenomics often fails.",
          highlight: [
            "tokenomics",
            "maximum supply",
            "circulating supply",
            "inflation",
            "vesting",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why is it computationally infeasible to alter a transaction recorded deep in a blockchain?",
          options: [
            "Changing one block invalidates its hash and every subsequent block, requiring re-computation on a majority of nodes simultaneously",
            "Transactions are encrypted with a password only the bank knows",
            "Blockchain transactions can only be altered by the original sender",
            "All data is stored in read-only memory on every computer",
          ],
          correctIndex: 0,
          explanation:
            "Each block contains the hash of the previous block. Altering any historical block breaks the cryptographic chain from that point onward — every subsequent block's hash is now invalid. An attacker would need to recompute all those blocks while simultaneously controlling 51%+ of the network's computing power, which is prohibitively expensive.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Proof of Stake validators can lose (be 'slashed') part of their staked collateral if they behave dishonestly.",
          correct: true,
          explanation:
            "Slashing is the mechanism that deters validator misbehaviour in PoS systems. If a validator tries to sign conflicting blocks or goes offline excessively, the protocol automatically destroys a portion of their staked ETH. This economic penalty replaces the energy cost that deters attacks in Proof of Work.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are evaluating two tokens. Token A has a 21 million hard cap, 4-year team vesting, and the token is required to pay network fees. Token B has unlimited supply, team holds 40% with no lock-up, and there is no required utility.",
          question: "Which token has healthier tokenomics, and why?",
          options: [
            "Token A — fixed supply, long vesting aligns team incentives, and built-in utility drives demand",
            "Token B — unlimited supply allows the network to grow without artificial constraints",
            "Token B — a large team allocation ensures the project is well-funded",
            "Both are equivalent; tokenomics do not affect long-term price",
          ],
          correctIndex: 0,
          explanation:
            "Token A demonstrates sound tokenomics: a fixed supply limits inflation, a 4-year vesting schedule prevents the team from immediately dumping tokens, and required utility (fee payment) creates organic demand. Token B's unlimited supply and no lock-up are major red flags that have historically preceded rug pulls and value collapse.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — DeFi & On-Chain Analysis
       ================================================================ */
    {
      id: "crypto-trading-2",
      title: "DeFi & On-Chain Analysis",
      description:
        "DEXes, liquidity pools, and reading on-chain metrics",
      icon: "Network",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "Decentralized Exchanges and AMMs",
          content:
            "A **Decentralized Exchange (DEX)** lets users swap tokens directly from their wallet without a central intermediary. The most common model is the **Automated Market Maker (AMM)**.\n\n**How an AMM works**:\nInstead of an order book, AMMs use **liquidity pools** — smart contracts holding reserves of two tokens (e.g., ETH and USDC).\n\nPricing formula: **x × y = k** (constant product)\n- x = reserve of token A\n- y = reserve of token B\n- k = constant\n\nWhen you swap ETH → USDC, you add ETH to the pool and remove USDC. The ratio of reserves determines the price. Larger trades move the price more — this is **price impact**.\n\n**Slippage**: The difference between the expected price and the executed price. High slippage occurs in low-liquidity pools. Always set a slippage tolerance (e.g., 0.5–1%) before trading on a DEX.",
          highlight: ["DEX", "AMM", "liquidity pool", "slippage", "price impact"],
        },
        {
          type: "teach",
          title: "Liquidity Providers and Impermanent Loss",
          content:
            "**Liquidity Providers (LPs)** deposit equal value of two tokens into a pool. In return they earn a share of trading fees (typically 0.3% per swap).\n\n**Impermanent Loss (IL)** is the key risk:\n- If the price of one token changes significantly versus deposit time, an LP ends up with less total value than if they had simply held both tokens outside the pool\n- 'Impermanent' because the loss only becomes permanent when you withdraw\n\n**Example**: You deposit 1 ETH + 1,000 USDC when ETH = $1,000. ETH price doubles to $2,000. The AMM rebalances — you now have ~0.707 ETH + ~1,414 USDC = $2,828 total. But holding would be worth $3,000. You lost ~5.7% to IL versus just holding.\n\nIL increases with price divergence. It is minimised when providing liquidity for stablecoin pairs (e.g., USDC/USDT) where prices rarely diverge.",
          highlight: [
            "liquidity provider",
            "impermanent loss",
            "trading fees",
            "rebalancing",
          ],
        },
        {
          type: "teach",
          title: "On-Chain Metrics That Move Markets",
          content:
            "Because all transactions are public on-chain, analysts can measure indicators unavailable in traditional finance:\n\n**Exchange Netflow**: Net BTC/ETH moving to or from exchange wallets\n- Inflows (to exchanges) → selling pressure likely\n- Outflows (to cold wallets) → holder accumulation\n\n**Active Addresses**: Unique addresses transacting daily. Rising active addresses often precede price appreciation.\n\n**SOPR (Spent Output Profit Ratio)**: Average profit/loss of coins moved today. SOPR > 1 = holders selling in profit. SOPR dipping below 1 and bouncing often signals bottoms.\n\n**Miner reserves**: When miners sell large BTC reserves, it can create short-term selling pressure. Watch for sudden outflows from known miner wallets.\n\n**Stablecoin supply on exchanges**: Rising stablecoin balances on exchanges = potential buying power waiting to enter crypto.",
          highlight: [
            "exchange netflow",
            "active addresses",
            "SOPR",
            "miner reserves",
            "on-chain",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In an AMM liquidity pool with the formula x × y = k, what happens to the price of Token A when a trader buys a large amount of Token A from the pool?",
          options: [
            "Token A becomes more expensive because its reserve in the pool decreases, increasing its scarcity relative to Token B",
            "Token A becomes cheaper because more traders are interested in it",
            "The price stays the same because k is constant",
            "Token B's price increases while Token A stays flat",
          ],
          correctIndex: 0,
          explanation:
            "When a trader buys Token A, they remove it from the pool and add Token B. With less Token A (lower x) and more Token B (higher y), the ratio shifts — Token A becomes scarcer in the pool and therefore more expensive. This price impact is why large trades in low-liquidity pools are costly.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Large BTC outflows from centralised exchange wallets to private wallets are generally a bullish signal, as they suggest holders are moving coins into long-term storage rather than preparing to sell.",
          correct: true,
          explanation:
            "When coins leave exchanges, they typically move to self-custody cold wallets — a sign of accumulation and long-term conviction. Exchange inflows (coins moving onto exchanges) signal potential selling pressure because exchanges are where you go to sell.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You deposited 1 ETH + $3,000 USDC into an AMM pool when ETH = $3,000. Six months later ETH has dropped to $1,500 and you want to withdraw.",
          question: "Compared to simply holding 1 ETH + $3,000 USDC, how did providing liquidity affect you?",
          options: [
            "You suffered impermanent loss — the AMM rebalanced so you now hold more ETH and less USDC than your deposit, resulting in a lower USD total than just holding",
            "You benefited — the pool always maintains your initial deposit value",
            "You are unaffected — impermanent loss only occurs when price goes up, not down",
            "You profited from fees and have more value than holding",
          ],
          correctIndex: 0,
          explanation:
            "As ETH fell 50%, the AMM automatically rebalanced by acquiring more ETH and selling USDC. You now hold ~1.41 ETH + ~$2,121 USDC ≈ $4,237 total, versus holding which would be 1 ETH ($1,500) + $3,000 USDC = $4,500. That ~6% difference is impermanent loss (plus any fees earned offset it partially). Impermanent loss occurs on both price increases and decreases.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Crypto Technical Analysis
       ================================================================ */
    {
      id: "crypto-trading-3",
      title: "Crypto Technical Analysis",
      description:
        "How TA differs in crypto: 24/7 markets, higher volatility, and unique patterns",
      icon: "TrendingUp",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "What Makes Crypto TA Different",
          content:
            "Technical analysis applies to crypto just as it does to stocks, but several structural differences change how you apply it:\n\n**24/7 continuous trading**:\n- No opening gaps (mostly), but weekend/holiday liquidity is thin\n- Manipulation is easier when volume is low (late Sunday nights, major holidays)\n- No 'session open' momentum effects\n\n**Higher volatility**:\n- Bitcoin's annualised volatility averages 60–80%. The S&P 500 averages 15–20%.\n- Altcoins can move 30–50% in a single day\n- This means wider stop-losses are necessary, but also faster profit targets\n\n**Liquidity fragmentation**:\n- The same asset trades on 20+ exchanges simultaneously\n- Price can briefly diverge (arbitrage opportunities close quickly)\n- Aggregated volume data from multiple venues is more reliable than any single exchange\n\n**Funding rates on perpetual futures**:\n- Unique to crypto — when longs pay shorts (positive funding), it signals overleveraged bulls\n- Persistently high positive funding often precedes corrections",
          highlight: [
            "24/7 trading",
            "volatility",
            "funding rate",
            "liquidity",
            "perpetual futures",
          ],
          visual: "candlestick",
        },
        {
          type: "teach",
          title: "Key Levels and Patterns in Crypto",
          content:
            "Standard TA patterns work in crypto, but volatility creates some nuances:\n\n**Support and Resistance**:\n- Round numbers ($10K, $50K, $100K) act as very strong psychological levels\n- Exchange order book walls (visible on platforms like Coinbase Pro) create real S/R\n- Previous all-time highs often become support once broken above\n\n**Patterns specific to crypto cycles**:\n- **Accumulation phases**: Long flat consolidation after a bear market bottom; volume dries up, price stabilises\n- **Parabolic advances**: Crypto often goes vertical in bull markets — moving averages are left far behind\n- **Blow-off tops**: The final euphoric spike, often with 2–3× volume surge, followed by a rapid 30–60% reversal\n\n**Moving averages used in crypto**:\n- 200-week MA: The ultimate long-term support (BTC has never closed a weekly candle below it)\n- 200-day MA: Trend filter — above = bull market regime, below = bear market regime\n- 21-day EMA: Common short-term momentum indicator in crypto",
          highlight: [
            "support",
            "resistance",
            "parabolic",
            "blow-off top",
            "200-week MA",
          ],
          visual: "indicator-chart",
        },
        {
          type: "quiz-mc",
          question:
            "Bitcoin has a 24-hour funding rate of +0.15% on perpetual futures (positive, longs paying shorts). What does this most likely signal?",
          options: [
            "The market is heavily long/leveraged bullish — a potential setup for a long squeeze correction",
            "Shorts are controlling the market and a rally is imminent",
            "Bitcoin is undervalued and institutions are quietly accumulating",
            "The market is perfectly balanced between buyers and sellers",
          ],
          correctIndex: 0,
          explanation:
            "Positive funding means longs are paying shorts to keep their positions open. A very high positive funding rate signals excessive leveraged bullishness. When too many traders are long with leverage, a small price dip can trigger a cascade of liquidations (a 'long squeeze'), rapidly pushing the price lower. Contrarian traders watch for extreme funding as a sign the move may be exhausted.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In crypto markets, the 200-day moving average crossing above or below the current price is widely used as a bull/bear regime filter.",
          correct: true,
          explanation:
            "The 200-day MA is the most widely cited trend filter in crypto. When price is above the 200-day MA, most traders treat the market as a bull regime and favour long positions. When price falls below it, the regime is considered bearish and risk management tightens. Bitcoin has historically spent the majority of its time above this level, with breaks below often coinciding with prolonged bear markets.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "ETH has rallied 180% in 4 months, is now trading at a round number ($4,000), volume on the last 3 candles is 3× the 30-day average, and social media sentiment is at multi-year highs.",
          question: "What technical pattern does this describe, and what is the prudent action?",
          options: [
            "A potential blow-off top — reduce position size and tighten stop-loss, as rapid reversal risk is high",
            "A breakout continuation — add to the position aggressively since volume confirms the move",
            "An accumulation phase — this is the start of a multi-year rally; buy heavily",
            "No action needed — 180% gains are normal and this could continue indefinitely",
          ],
          correctIndex: 0,
          explanation:
            "A parabolic rally to a major psychological level ($4,000) with a volume spike 3× average and extreme sentiment is a classic blow-off top setup. These conditions often mark near-term cycle highs. Professional traders typically reduce exposure, tighten stops, or hedge here rather than chasing. The next move is frequently a rapid 30–60% correction.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Risk Management in Crypto
       ================================================================ */
    {
      id: "crypto-trading-4",
      title: "Risk Management in Crypto",
      description:
        "Correlation with risk assets, position sizing, and cold storage security",
      icon: "Shield",
      xpReward: 85,
      steps: [
        {
          type: "teach",
          title: "Crypto's Correlation with Risk Assets",
          content:
            "Crypto does not exist in isolation — it correlates with broader financial markets in important ways:\n\n**Risk-on / Risk-off behaviour**:\n- During market stress (COVID crash, 2022 Fed rate hikes), Bitcoin and crypto often sell off alongside equities, high-yield bonds, and other risk assets\n- Correlation with the S&P 500 spiked from ~0.1 (2019) to ~0.7 (2022) as institutional investors entered\n- In 'risk-off' environments, the dollar typically strengthens — bad for crypto which is priced in USD\n\n**What this means for portfolio construction**:\n- Adding crypto to a stock portfolio may not reduce risk as much as expected during market crises\n- Crypto's diversification benefit is strongest in calm, risk-on environments\n- Genuine diversification requires assets with structural low correlation: gold, short-duration bonds, volatility products\n\n**Crypto-specific risks beyond price**:\n- Protocol exploits (smart contract bugs)\n- Exchange insolvency (FTX, 2022)\n- Regulatory crackdowns (sudden bans)\n- Key-management failures (losing private keys = permanent loss)",
          highlight: [
            "correlation",
            "risk-on",
            "risk-off",
            "diversification",
            "exchange insolvency",
          ],
          visual: "portfolio-pie",
        },
        {
          type: "teach",
          title: "Position Sizing for High-Volatility Assets",
          content:
            "Standard position sizing formulas (1% risk per trade) still apply in crypto, but must account for dramatically higher volatility:\n\n**Kelly Criterion adapted for crypto**:\nWith BTC's typical daily volatility of 3–5%, using the same position size as equities would expose you to 3–5× the daily dollar risk.\n\n**Practical framework**:\n- **Portfolio allocation**: Limit total crypto exposure to a percentage you could afford to see drop 80% without life-changing harm (a historically observed drawdown for BTC; altcoins frequently -95%+)\n- **Position-level risk**: Risk no more than 1–2% of total portfolio per individual crypto trade\n- **Stop-loss width**: Crypto requires wider stops (5–15%) than equities (1–3%) due to volatility\n- **Avoid leverage** until consistently profitable: 10× leverage with 10% move = 100% loss\n\n**Dollar-cost averaging (DCA)**: Buying a fixed dollar amount on a regular schedule (e.g., $200/week) removes the stress of timing and is the most common strategy for long-term investors.",
          highlight: [
            "position sizing",
            "volatility",
            "stop-loss",
            "leverage",
            "DCA",
            "dollar-cost averaging",
          ],
          visual: "risk-pyramid",
        },
        {
          type: "teach",
          title: "Cold Storage and Self-Custody Security",
          content:
            "**'Not your keys, not your coins'** — the fundamental principle of crypto security.\n\nWhen you hold crypto on an exchange, the exchange controls the private keys. If the exchange is hacked, goes bankrupt, or freezes withdrawals (all have happened), you may lose your funds.\n\n**Storage options by security level**:\n1. **Exchange/hot wallet**: Convenient but risky for large amounts. Fine for active trading portions.\n2. **Software wallet** (MetaMask, Phantom): You hold keys, but the device can be compromised if it's connected to the internet.\n3. **Hardware wallet** (Ledger, Trezor): Private keys never leave the device; transactions are signed offline. Best for significant holdings.\n4. **Multi-signature (multisig)**: Requires M-of-N key signatures to transact (e.g., 2-of-3). Eliminates single points of failure. Used by institutions and high-net-worth holders.\n\n**Seed phrase security**:\n- A 12/24-word seed phrase can restore any wallet\n- NEVER store seed phrases digitally (no screenshots, no cloud)\n- Store on steel plates (fire/water resistant) in separate physical locations\n- Anyone with your seed phrase controls your funds permanently",
          highlight: [
            "cold storage",
            "private keys",
            "hardware wallet",
            "seed phrase",
            "multisig",
            "self-custody",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "During a major stock market selloff (S&P 500 -15% in one month), what has historically tended to happen to Bitcoin?",
          options: [
            "Bitcoin has often sold off alongside equities as investors reduce risk across all risk assets",
            "Bitcoin always rises during equity selloffs because investors flee to crypto as a safe haven",
            "Bitcoin is completely uncorrelated with equities and moves independently",
            "Bitcoin only sells off if the selloff is caused by a crypto-specific event",
          ],
          correctIndex: 0,
          explanation:
            "Historically, during sharp equity drawdowns, Bitcoin's correlation with the S&P 500 rises significantly. Institutional investors who hold both assets often sell crypto to cover losses or margin calls. The idea of Bitcoin as a 'digital safe haven' uncorrelated from risk assets has not consistently held in crisis periods — though the long-term correlation remains lower than between most equity sectors.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Storing your cryptocurrency on a hardware wallet (e.g., Ledger) is safer than keeping it on a centralised exchange for long-term holdings.",
          correct: true,
          explanation:
            "A hardware wallet stores private keys offline and signs transactions without exposing the keys to internet-connected devices. Centralised exchanges are single points of failure — hacks, insolvencies (e.g., FTX 2022), and withdrawal freezes have caused billions in losses. For any amount you are not actively trading, a hardware wallet provides significantly stronger security.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have a $50,000 investment portfolio. You want to add cryptocurrency exposure. You are considering putting $25,000 (50%) into a mix of altcoins with high potential but also high volatility, keeping everything on a popular exchange.",
          question: "What adjustments would a risk-aware crypto investor recommend?",
          options: [
            "Reduce crypto allocation to a manageable percentage (e.g., 5-15%), diversify between BTC/ETH and smaller altcoins, and move long-term holdings to a hardware wallet",
            "50% is fine — crypto always recovers so downside is temporary",
            "Increase to 80% to maximise returns, and use leverage to amplify gains",
            "Keep it all on the exchange for easy rebalancing; hardware wallets are too complicated",
          ],
          correctIndex: 0,
          explanation:
            "A 50% allocation to volatile altcoins on an exchange concentrates both price risk (altcoins regularly fall 90%+) and custody risk (exchange failures). Best practice: size crypto as a percentage of portfolio you could see drop 80%+ and still sleep at night (often 5–15% for most investors), concentrate most exposure in BTC/ETH, and keep long-term holdings in self-custody on a hardware wallet.",
          difficulty: 2,
        },
      ],
    },
  ],
};
