import type { Unit } from "./types";

export const UNIT_CRYPTO_YIELD: Unit = {
  id: "crypto-yield",
  title: "Crypto Staking & DeFi Income",
  description:
    "Master staking, liquid staking, AMM liquidity provision, yield farming, lending protocols, and DeFi risk management to generate and protect on-chain income",
  icon: "🌾",
  color: "#10b981",
  lessons: [
    // ─── Lesson 1: Proof of Stake Basics ─────────────────────────────────────────
    {
      id: "crypto-yield-1",
      title: "🔒 Proof of Stake Basics",
      description:
        "PoS vs PoW, validator requirements, slashing penalties, and ETH staking options from solo to pooled",
      icon: "Shield",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "⚡ PoW vs PoS: The Energy Trade-off",
          content:
            "**Proof of Work (PoW)** and **Proof of Stake (PoS)** are two competing answers to the same question: how do thousands of untrusting nodes agree on a single transaction history?\n\n**Proof of Work — Bitcoin:**\n- Miners burn electricity solving SHA-256 puzzles\n- The longest chain with the most accumulated work wins\n- Security = billions of dollars in hardware + energy spent by attackers\n- Block reward (currently 3.125 BTC) incentivizes honest behavior\n- Downside: ~120 TWh/year — comparable to Argentina's electricity consumption\n\n**Proof of Stake — Ethereum, Solana, Cardano, etc.:**\n- Validators lock up (stake) cryptocurrency as collateral instead of running mining rigs\n- A validator is randomly selected (weighted by stake) to propose each block\n- Other validators attest to the block's validity\n- Security = economic penalty (slashing) for cheating\n- Energy use: ~99.9% lower than PoW\n\n**Why PoS creates yield:**\nBecause validators do real work (securing the network), the protocol rewards them with freshly issued tokens plus transaction fees. This is the source of all staking income — it is not \"free money\" but compensation for providing security services.",
          highlight: ["Proof of Work", "Proof of Stake", "validators", "staking", "block reward"],
        },
        {
          type: "teach",
          title: "🏦 Validator Requirements & Slashing",
          content:
            "**Becoming an Ethereum validator:**\n- Minimum stake: **32 ETH** (roughly $100,000+ at current prices)\n- Run a validator client 24/7 — downtime causes small inactivity penalties\n- Current APY: approximately **3–4%** in ETH terms (varies with network participation)\n- Rewards: new ETH issuance + priority tips from transactions + MEV (Maximal Extractable Value)\n\n**Slashing — the stick of PoS:**\nSlashing is an automatic, on-chain punishment for provably malicious or negligent validator behavior:\n\n| Offense | Penalty |\n|---------|----------|\n| Double voting (equivocation) | Minimum 1/32 of stake burned + ejection |\n| Surround vote | Same as above |\n| Inactivity leak | Gradual stake loss until ~16 ETH, then ejection |\n\nSlashed validators are force-exited and cannot re-enter. The burned ETH is permanently removed from supply.\n\n**Why slashing is rare in practice:**\nMost slashing events are caused by misconfigured validator setups (e.g., running the same key on two machines simultaneously) rather than deliberate attacks. Professional operators use remote signing keys and strict redundancy policies to prevent accidental slashing.\n\n**Solo vs pooled staking trade-off:**\n- Solo: maximum yield, full control, high capital requirement\n- Pooled: lower minimum, but share yield with operator and smart contract risk",
          highlight: ["32 ETH", "slashing", "double voting", "inactivity leak", "MEV", "validator"],
        },
        {
          type: "teach",
          title: "🌐 ETH Staking Options Compared",
          content:
            "**Four main ways to stake ETH:**\n\n**1. Solo staking (32 ETH)**\n- Full validator rewards, no fees\n- Requires reliable hardware, 24/7 uptime, technical knowledge\n- Best for: technically proficient holders with 32+ ETH\n\n**2. Staking-as-a-service (e.g., Figment, P2P.org)**\n- You provide 32 ETH; operator runs the node\n- Fee: ~10–15% of rewards\n- You retain withdrawal credentials (non-custodial keys)\n\n**3. Pooled staking (e.g., Lido, Rocket Pool)**\n- No minimum — stake any amount\n- Receive a liquid receipt token (stETH, rETH)\n- Fee: 5–15% of rewards\n- Best for: most users — covered in the next lesson\n\n**4. Centralized exchange staking (Coinbase, Binance)**\n- Simplest UX, no technical setup\n- CEX controls your validator keys\n- Fee: often 25–30% of rewards\n- Regulatory risk: Kraken paid $30M SEC settlement; Coinbase was sued\n- Risk: exchange insolvency (FTX precedent)\n\n**Current ETH staking yield (2026):**\nWith ~30% of all ETH staked, individual validators earn roughly 3.5% APY. If participation rises to 50%, issuance per validator falls proportionally — staking yield is inversely correlated with participation rate.",
          highlight: ["solo staking", "staking-as-a-service", "pooled staking", "Lido", "Rocket Pool", "withdrawal credentials"],
        },
        {
          type: "quiz-mc",
          question:
            "An Ethereum validator is caught double-voting (signing two conflicting blocks). What happens?",
          options: [
            "A portion of their staked ETH is burned and they are forcibly ejected from the validator set",
            "They receive a warning and their rewards are reduced for 30 days",
            "The network forks to exclude their transactions from future blocks",
            "Their ETH is frozen for 6 months then returned after a governance vote",
          ],
          correctIndex: 0,
          explanation:
            "Slashing is an automatic, permanent on-chain penalty. At minimum, 1/32 of the validator's stake is burned immediately, and they are ejected from the active validator set — they cannot re-enter. The burned ETH is permanently removed from circulation. There are no warnings or temporary restrictions; the penalty is instant and irreversible.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Staking yield on Ethereum decreases as more ETH is staked in the network, because the same issuance budget is shared among more validators.",
          correct: true,
          explanation:
            "True. Ethereum's issuance formula distributes a fixed (but slowly growing) reward pool across all active validators. When total staked ETH doubles, each validator's proportional share of rewards halves. This creates a natural equilibrium — high yields attract more stakers, which compresses yields until the marginal validator decides the return no longer justifies the capital lockup.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You hold 10 ETH and want to earn staking rewards. You do not have the technical skills to run a node and are not comfortable with the 32 ETH minimum. A centralized exchange offers 2.5% APY, while a pooled protocol offers 3.2% APY with a receipt token you can trade.",
          question: "Which option best balances yield, risk, and flexibility for this user?",
          options: [
            "Centralized exchange — simpler UX even though the yield is lower",
            "Pooled staking protocol — higher yield, non-custodial keys, and the receipt token preserves liquidity",
            "Wait until you have 32 ETH before staking anything",
            "Convert ETH to Bitcoin since Bitcoin does not require staking expertise",
          ],
          correctIndex: 1,
          explanation:
            "Pooled staking (e.g., Lido or Rocket Pool) offers a higher yield (3.2% vs 2.5%), the user does not need technical skills, and the liquid receipt token (stETH/rETH) can be traded or used in other DeFi protocols, preserving optionality. The CEX option involves higher fees, custodial key risk, and regulatory exposure. Waiting for 32 ETH foregoes years of compounding. Bitcoin does not offer staking.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Liquid Staking ─────────────────────────────────────────────────
    {
      id: "crypto-yield-2",
      title: "💧 Liquid Staking",
      description:
        "How Lido stETH and Rocket Pool rETH work, restaking via EigenLayer, and the risks of liquid staking derivatives",
      icon: "Droplets",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📜 stETH and rETH: Receipt Tokens Explained",
          content:
            "**The liquid staking problem:**\nWhen you stake ETH directly, it is locked — you cannot sell it or use it as collateral while earning rewards. Liquid staking protocols solve this by issuing a receipt token that represents your staked position and accrues rewards.\n\n**Lido — stETH (rebasing model):**\n- Deposit ETH → receive stETH 1:1\n- Your stETH balance automatically **increases daily** as rewards accrue (rebasing)\n- If you deposit 10 ETH, you will have ~10.35 stETH after 1 year at 3.5% APY\n- Fee: 10% of rewards (split between Lido DAO treasury and node operators)\n- stETH is deeply liquid — tradeable on Curve, Uniswap; usable as collateral on Aave\n\n**Rocket Pool — rETH (exchange rate model):**\n- Deposit ETH → receive rETH at current exchange rate\n- Your rETH balance stays **constant**, but its exchange rate vs ETH rises\n- After 1 year at 3.5%, 1 rETH might redeem for 1.035 ETH\n- Fee: ~14% of rewards, but rETH is more decentralized (permissionless node operators)\n- Minimum: ~0.01 ETH\n\n**Key difference:**\n- stETH: balance changes (may cause issues with some DeFi protocols)\n- rETH: balance fixed, rate changes (simpler accounting for many DeFi integrations)\n\n**Market scale (2026):** Lido controls ~28% of all staked ETH — raising centralization concerns debated in Ethereum governance.",
          highlight: ["stETH", "rETH", "rebasing", "exchange rate", "Lido", "Rocket Pool", "liquid staking"],
        },
        {
          type: "teach",
          title: "🔄 Restaking and EigenLayer",
          content:
            "**What is restaking?**\nRestaking re-uses already-staked ETH (or LSTs like stETH) to simultaneously secure additional protocols beyond Ethereum itself. EigenLayer is the primary restaking protocol.\n\n**How EigenLayer works:**\n1. Validators or LST holders opt-in to EigenLayer smart contracts\n2. Their staked ETH is pledged as collateral for **Actively Validated Services (AVS)** — new protocols that need economic security (oracle networks, data availability layers, bridges)\n3. AVS operators pay restakers additional yield in their native tokens\n4. In exchange, restakers accept **additional slashing conditions** — the AVS can slash their ETH if they misbehave on the AVS\n\n**Yield stacking example:**\n- Base ETH staking: ~3.5% APY\n- EigenLayer restaking bonus: +1–3% (paid in AVS tokens)\n- Total: ~4.5–6.5% APY\n\n**The risks are additive:**\n- You now have slashing risk from both Ethereum AND each AVS you opt into\n- AVS smart contract bugs could cause unexpected slashing\n- AVS tokens may be illiquid or fall in value, reducing real returns\n- EigenLayer contracts themselves carry audit risk\n\n**Liquid Restaking Tokens (LRTs):**\nProtocols like EtherFi (eETH) and Renzo (ezETH) auto-manage restaking positions and issue a tradeable receipt token — adding another layer of smart contract dependency.",
          highlight: ["EigenLayer", "restaking", "AVS", "Liquid Restaking Tokens", "slashing risk", "eETH"],
        },
        {
          type: "teach",
          title: "⚠️ Liquid Staking Risks",
          content:
            "**1. Smart contract risk:**\nLido and Rocket Pool have billions of ETH locked in smart contracts. A critical bug could lead to total or partial loss of funds. Both protocols have undergone extensive audits, but no code is perfect. Lido's staking contracts were exploited for $5M in a peripheral integration in 2023.\n\n**2. Depeg risk (stETH price ≠ ETH price):**\nstETH is not always redeemable 1:1 for ETH — it trades on secondary markets. During the 2022 Celsius/3AC crisis, stETH depegged to 0.94 ETH, causing leveraged positions to be liquidated. The depeg resolved after Ethereum's Shanghai upgrade (April 2023) enabled withdrawals.\n\n**3. Lido centralization risk:**\nLido controls ~28% of all staked ETH. If Lido's node operators collude or are compromised, it could threaten Ethereum's consensus. The Ethereum community has proposed informal 33% caps on any single entity.\n\n**4. Governance and regulatory risk:**\nLido is governed by the LDO token. A coordinated governance attack could alter protocol parameters. Regulators in multiple jurisdictions have flagged liquid staking as a potential security.\n\n**5. Slashing contagion:**\nIf a Lido or Rocket Pool node operator is slashed, the penalty is socialized across all stakers in that pool — your stETH balance could decrease slightly.\n\n**Risk mitigation:**\n- Diversify across Lido and Rocket Pool\n- Do not use stETH as over-leveraged collateral\n- Monitor the stETH/ETH Curve pool for depeg signals",
          highlight: ["smart contract risk", "depeg", "stETH", "Lido centralization", "slashing contagion", "governance risk"],
        },
        {
          type: "quiz-mc",
          question:
            "You hold stETH and notice its price on Curve is trading at 0.96 ETH. What is the most likely cause?",
          options: [
            "Market stress is causing forced selling of stETH, creating a liquidity premium discount relative to locked ETH",
            "Ethereum's protocol changed the stETH redemption ratio to 0.96 as a fee adjustment",
            "stETH has been officially devalued by Lido DAO through a governance vote",
            "The Curve pool has a 4% withdrawal fee that always causes this discount",
          ],
          correctIndex: 0,
          explanation:
            "stETH depeg events are driven by market dynamics: forced sellers (e.g., leveraged funds facing margin calls) dump stETH faster than buyers can absorb it. Since ETH withdrawals were locked pre-Shanghai, arbitrageurs could not instantly redeem stETH for ETH at par, allowing the discount to persist. Post-Shanghai, withdrawals are enabled so depeg events tend to be shorter-lived. Lido has not changed the redemption ratio and there is no 4% Curve withdrawal fee.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Restaking via EigenLayer increases your yield but also increases your slashing exposure, because you are now subject to slashing conditions from both Ethereum and each Actively Validated Service you opt into.",
          correct: true,
          explanation:
            "True. Restaking lets your staked ETH simultaneously secure multiple networks, earning fees from each AVS. However, the risk is multiplicative — an AVS smart contract bug or malicious slashing condition can destroy staked ETH beyond the base Ethereum slashing risk. This is the fundamental yield vs risk trade-off of restaking.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: AMM Liquidity Provision ───────────────────────────────────────
    {
      id: "crypto-yield-3",
      title: "🔄 AMM Liquidity Provision",
      description:
        "Constant product formula, fee income, impermanent loss with exact math, and Uniswap V3 concentrated liquidity",
      icon: "ArrowLeftRight",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📐 The Constant Product Formula",
          content:
            "**Automated Market Makers (AMMs)** replace order books with a mathematical pricing formula.\n\n**Uniswap V2 — x * y = k:**\nEvery liquidity pool holds two tokens. The product of their quantities must always equal a constant `k`.\n\nExample: ETH/USDC pool:\n- 100 ETH × 200,000 USDC = k = 20,000,000\n- ETH price implied: 200,000 / 100 = **$2,000**\n\nIf a trader buys 5 ETH:\n- New ETH reserve: 100 - 5 = 95\n- New USDC reserve: 20,000,000 / 95 = 210,526 USDC\n- Trader paid: 210,526 - 200,000 = **$10,526 for 5 ETH** (avg $2,105/ETH)\n- Price impact: larger trades cause more slippage\n\n**Why the price moves:**\nThe formula ensures every trade moves the price against the trader — no infinite liquidity at a single price. This is how the AMM is always able to fulfill trades without a counterparty.\n\n**Fee mechanism:**\nUniswap V2 charges 0.3% per trade. The fee is added to the pool reserves, increasing `k` slightly over time — this is how **liquidity providers earn income**.\n\nAfter the trade above, the 0.3% fee means the pool grows, and LPs' proportional share of the pool becomes worth more ETH+USDC over time.",
          highlight: ["constant product formula", "x * y = k", "AMM", "liquidity provider", "price impact", "slippage"],
        },
        {
          type: "teach",
          title: "📉 Impermanent Loss: The LP's Hidden Cost",
          content:
            "**Impermanent Loss (IL)** is the opportunity cost of providing liquidity versus simply holding the two assets.\n\n**Intuition:**\nWhen the price of one asset in your LP pair changes, arbitrageurs rebalance the pool by buying the underpriced asset and selling the overpriced one. This leaves LPs holding more of the asset that fell (or less of the asset that rose) compared to just HODLing.\n\n**Exact IL formula:**\nIL = [2√r / (1+r)] − 1\n\nWhere r = price_ratio_now / price_ratio_when_deposited\n\n**IL table:**\n| Price change | IL |\n|-------------|----|\n| 1.25× (25% increase) | −0.6% |\n| 1.5× (50% increase) | −2.0% |\n| 2× (100% increase) | −5.7% |\n| 4× (300% increase) | −20.0% |\n| 5× (400% increase) | −25.5% |\n\n**Example:**\n- Deposit: 1 ETH + 2,000 USDC when ETH = $2,000 (LP value = $4,000)\n- ETH rises to $8,000 (r = 4)\n- LP value at withdrawal: ~$16,000 × (2√4/5) = ~$12,800\n- HODL value: 1 ETH × $8,000 + $2,000 = $10,000 → but wait — the LP actually has $12,800 vs your $10,000 HODL... correct the math:\n- HODL: $10,000; LP: ~$8,000; IL = −$2,000 (−20%)\n\n**When IL exceeds fee income:**\nFor volatile pairs (e.g., ETH/SHIB), IL can far exceed 0.3% fee revenue. IL only \"locks in\" when you withdraw — hence \"impermanent.\" If price returns to entry, IL disappears.",
          highlight: ["impermanent loss", "IL formula", "arbitrage", "HODL", "liquidity provider", "fee income"],
        },
        {
          type: "teach",
          title: "🎯 Uniswap V3: Concentrated Liquidity",
          content:
            "**The V2 problem:**\nIn V2, your liquidity is spread across the entire price range from $0 to infinity. Most of the time, ETH trades in a narrow band (say $1,800–$2,200) — meaning 99% of your capital earns zero fees.\n\n**Uniswap V3 — concentrated liquidity:**\nLPs choose a **price range** [P_low, P_high] to concentrate their capital.\n- Within range: capital is 100% active, earning fees at a multiplied rate\n- Outside range: no fees earned; your position is fully converted to one asset\n\n**Capital efficiency example:**\nA V2 LP with $10,000 earns X fees per day.\nA V3 LP concentrating the same $10,000 in $1,800–$2,200 acts like $200,000 of V2 capital within that range — earning ~20× the fees, assuming price stays in range.\n\n**The V3 trade-off:**\n- Narrower range = higher fee multiplier, but higher IL and rebalancing costs when price exits range\n- Wider range = lower multiplier, but more passive and resilient\n\n**Active management required:**\nV3 positions go \"out of range\" when price moves outside your bounds. Professional LPs use Gamma Strategies, Arrakis Finance, or other vault protocols that auto-rebalance V3 positions.\n\n**Fee tiers (V3):**\n- 0.01%: stablecoin pairs (USDC/USDT)\n- 0.05%: correlated pairs (ETH/stETH)\n- 0.30%: standard pairs (ETH/USDC)\n- 1.00%: exotic/high-volatility pairs",
          highlight: ["concentrated liquidity", "price range", "capital efficiency", "out of range", "V3", "fee tiers"],
        },
        {
          type: "quiz-mc",
          question:
            "You are an LP in an ETH/USDC Uniswap V2 pool. ETH price doubles from $2,000 to $4,000. Compared to simply holding 50% ETH and 50% USDC, your LP position value is:",
          options: [
            "Lower, because impermanent loss means arbitrageurs bought cheap ETH from your pool before you could benefit from the full price rise",
            "Higher, because the 0.3% fee income always more than compensates for price movements",
            "The same, because the constant product formula preserves the dollar value of your position",
            "Zero, because doubling the price causes the pool to rebalance all assets to one side",
          ],
          correctIndex: 0,
          explanation:
            "When ETH doubles (r=2), impermanent loss is approximately −5.7%. Your LP position is worth about 5.7% less than if you had held the same assets without providing liquidity. Arbitrageurs buy discounted ETH from your pool as the price rises, leaving you with more USDC and less ETH than a pure hold. Fee income may partially offset IL over time, but for large, rapid price moves, IL typically dominates fees.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A Uniswap V3 LP who sets a very narrow price range (e.g., $1,990–$2,010) earns higher fees per dollar of capital when price is in range, but earns zero fees if ETH price moves outside that range.",
          correct: true,
          explanation:
            "True. Concentrated liquidity amplifies fee income dramatically while price stays within the chosen range — the narrower the range, the higher the multiplier. However, as soon as the price exits the range, the position stops earning fees entirely and becomes fully denominated in one asset. Narrow ranges require active monitoring and frequent rebalancing, introducing gas costs and execution risk.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Yield Farming ─────────────────────────────────────────────────
    {
      id: "crypto-yield-4",
      title: "🌱 Yield Farming",
      description:
        "Liquidity mining mechanics, APY vs APR, token emission schedules, and how to distinguish sustainable yields from Ponzi dynamics",
      icon: "Sprout",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⛏️ Liquidity Mining: Earning Governance Tokens",
          content:
            "**Yield farming** (also called liquidity mining) is the practice of deploying capital into DeFi protocols to earn token rewards on top of base fees.\n\n**Origin — Compound's COMP launch (June 2020):**\nCompound distributed COMP governance tokens to users proportional to their borrowing/lending activity. This \"DeFi Summer\" triggered an industry-wide trend: every new protocol launched its own token and distributed it to early users to bootstrap liquidity.\n\n**How liquidity mining works:**\n1. Protocol creates a reward pool with X tokens to distribute over Y weeks\n2. Users deposit liquidity (LP tokens, single assets, etc.)\n3. Smart contract tracks each user's share of total deposits\n4. Rewards accrue block-by-block and are claimable at any time\n\n**The flywheel:**\nHigh yields attract more liquidity → more liquidity means lower slippage → lower slippage attracts more traders → more fees for LPs → even higher headline APY → more deposits\n\n**The anti-flywheel (death spiral):**\nHigh token emissions → sell pressure on governance token → token price falls → APY in dollar terms collapses → LPs exit → TVL drops → protocol loses relevance\n\n**Real example:**\nSushiSwap launched in August 2020 with 1,000%+ APY in SUSHI tokens. Within 3 months, SUSHI fell 95% and most LPs who held the token lost money despite the headline yields.",
          highlight: ["liquidity mining", "governance tokens", "COMP", "TVL", "token emissions", "DeFi Summer"],
        },
        {
          type: "teach",
          title: "📊 APY vs APR: The Math Behind the Numbers",
          content:
            "**APR (Annual Percentage Rate):**\nSimple interest — no compounding. If a protocol pays 0.1% per day: APR = 0.1% × 365 = **36.5%**\n\n**APY (Annual Percentage Yield):**\nCompound interest — assumes reinvesting rewards. APY = (1 + daily_rate)^365 − 1\n= (1.001)^365 − 1 = **44.0%**\n\nAPY is always higher than APR when compounding occurs. The gap widens at high rates:\n\n| Daily Rate | APR | APY |\n|-----------|-----|-----|\n| 0.05% | 18.3% | 20.1% |\n| 0.10% | 36.5% | 44.0% |\n| 0.50% | 182.5% | 520% |\n| 1.00% | 365% | 3,678% |\n\n**DeFi marketing problem:**\nProtocols prominently display APY to make yields look larger. But:\n- Auto-compounding has gas costs (each claim + reinvest costs $5–50 on Ethereum mainnet)\n- For small positions, gas eats into compounding gains\n- Token rewards depreciate if price falls between claim and reinvestment\n- APY assumes constant rates — most farms reduce emissions weekly\n\n**Practical compounding frequency:**\n- Stablecoin farms: compound daily or weekly (low IL risk, stable rates)\n- Volatile pairs: compound less often — frequent rebalancing increases IL\n- Layer 2 (Arbitrum, Optimism): gas ~$0.01 — daily compounding viable\n\n**Rule of 72:**\nYears to double = 72 / APY%. At 36% APY: doubles every 2 years (if rates hold — a big if).",
          highlight: ["APY", "APR", "compounding", "gas costs", "emissions schedule", "Rule of 72"],
        },
        {
          type: "teach",
          title: "🧪 Sustainable Yield vs Ponzi Yield",
          content:
            "**The fundamental test: where does the yield come from?**\n\n**Sustainable yield sources:**\n- Trading fees paid by actual users\n- Interest paid by real borrowers\n- Protocol revenue from product usage\n- Staking rewards from network security\n\n**Unsustainable (Ponzi-like) yield sources:**\n- Token emissions with no protocol revenue to back them\n- \"Points\" or rewards funded by the next round of investors\n- Inflationary token printing with no sink/burn mechanism\n\n**Red flags for unsustainable farms:**\n1. APY > 500% — math requires exponential growth or eventual collapse\n2. New protocol, anonymous team, unaudited contracts\n3. Yield paid entirely in the native token with no revenue sharing\n4. No real product — just a \"farm\" for its own token\n5. Locked liquidity with arbitrary unlock dates\n\n**Case study — Olympus DAO (OHM):**\n- Offered 8,000%+ APY in OHM staking rewards\n- Rewards were pure OHM token printing — no external revenue\n- Price: $1,300 (October 2021) → $12 (March 2023) — a −99% collapse\n- Early entrants profited; late entrants absorbed the losses\n\n**Sustainable example — Uniswap V3 on ETH/USDC:**\n- Yield = 0.05% fee on billions in daily volume\n- Revenue comes from real traders paying real fees\n- APY ranges 3–8% depending on volatility — lower, but real\n\n**Heuristic:** If a farm's APY is higher than its protocol's P/E ratio would justify, the yield is being subsidized by future token dilution.",
          highlight: ["sustainable yield", "token emissions", "Ponzi", "OHM", "red flags", "protocol revenue"],
        },
        {
          type: "quiz-mc",
          question:
            "A new DeFi protocol advertises 2,500% APY paid entirely in its own newly launched token. No audit has been published and the team is anonymous. Which characterization is most accurate?",
          options: [
            "High-risk token emission farm where yield is funded by printing new tokens, likely unsustainable",
            "Legitimate arbitrage opportunity — 2,500% APY exists because institutional investors have not yet discovered it",
            "A standard liquidity mining program — all DeFi farms operate this way and are equally safe",
            "A guaranteed return instrument similar to a bank CD, backed by the protocol's reserves",
          ],
          correctIndex: 0,
          explanation:
            "The combination of extremely high APY, pure token emission yield, anonymous team, and no audit is a classic profile for an unsustainable or fraudulent farm. The 2,500% APY is funded by printing new tokens — as more people deposit, the token inflates, price falls, and the dollar-denominated yield collapses. Legitimate high-yield strategies exist but they carry commensurate smart contract, IL, or market risk — not a free lunch.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are evaluating two yield opportunities: (A) stablecoin LP on a proven DEX earning 8% APY from trading fees, with audit and $500M TVL. (B) A new protocol offering 400% APY in its own token, launched 2 weeks ago with $10M TVL and no audit.",
          question: "Which approach best manages risk across both positions?",
          options: [
            "Allocate 90% to B for maximum return — high APY compensates for higher risk",
            "Allocate 90% to A for stable fees; allocate a small, loss-tolerant position to B only if you understand and accept the risk of total loss",
            "Avoid both — DeFi is always a scam and no yields are safe",
            "Allocate 50/50 to diversify — spreading equally balances the risk perfectly",
          ],
          correctIndex: 1,
          explanation:
            "Option A is a conservative, revenue-backed yield source. Option B is highly speculative — the APY is likely unsustainable and the lack of audit means smart contract risk is unquantified. Best practice: allocate the bulk of capital to vetted, fee-backed strategies; reserve a small \"play money\" allocation (you can afford to lose entirely) for high-risk new farms if you have done due diligence. 50/50 gives too much weight to an unaudited protocol.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Lending Protocols ─────────────────────────────────────────────
    {
      id: "crypto-yield-5",
      title: "🏦 Lending Protocols",
      description:
        "Aave and Compound mechanics, supply and borrow rates, health factor, liquidation, and looping strategies",
      icon: "Landmark",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "💰 Supply & Borrow: How Aave Works",
          content:
            "**DeFi lending pools** allow users to deposit assets and earn interest, while borrowers pay interest to access liquidity without selling their crypto.\n\n**Aave architecture:**\n- Each asset has a separate liquidity pool (e.g., ETH pool, USDC pool, WBTC pool)\n- Depositors receive **aTokens** (e.g., aETH, aUSDC) that rebase daily, increasing in balance as interest accrues\n- Borrowers take overcollateralized loans: you must deposit more value than you borrow\n\n**Utilization rate — the rate-setting mechanism:**\n`Utilization = Total Borrowed / Total Supplied`\n\n- Low utilization (10%): borrow APY ~2%, supply APY ~0.2% (most capital sits idle)\n- Target utilization (80% for most assets): borrow APY ~5%, supply APY ~4%\n- Above optimal (kink point): rates spike sharply — at 95% utilization, borrow APY may jump to 30–50% — incentivizing repayment\n\n**Why rates differ:**\nSupply APY = Borrow APY × Utilization × (1 − Reserve Factor)\nThe protocol keeps a Reserve Factor (e.g., 10%) as a safety buffer.\n\n**Flash loans:**\nAave allows borrowing any amount with zero collateral — as long as the entire amount is repaid within the same transaction. Used for: arbitrage, collateral swaps, liquidations. Flash loan fee: 0.09%. If not repaid, the transaction reverts entirely.",
          highlight: ["aTokens", "utilization rate", "kink point", "overcollateralized", "flash loans", "Reserve Factor"],
        },
        {
          type: "teach",
          title: "⚖️ Health Factor and Liquidation",
          content:
            "**Loan-to-Value (LTV) ratio:**\nThe maximum you can borrow as a percentage of your collateral value.\n- ETH: max LTV 80% (borrow up to $800 against $1,000 of ETH)\n- BTC: max LTV 75%\n- Small-cap tokens: max LTV 50–65%\n\n**Health Factor (HF) — Aave's liquidation metric:**\n`HF = Σ(Collateral_i × Liquidation_Threshold_i) / Total_Borrowed_USD`\n\n- HF > 1: position is safe\n- HF = 1: liquidation threshold reached — anyone can liquidate\n- HF < 1: position can be liquidated\n\n**Liquidation threshold vs LTV:**\nLTV is how much you CAN borrow. Liquidation threshold (usually 5–10% above LTV) is the point at which your position WILL be liquidated.\n\nExample: Deposit $10,000 ETH. Max LTV 80% → borrow max $8,000. Liquidation threshold 82.5% → if ETH value drops such that $8,000 / collateral value ≥ 82.5%, liquidators can step in.\n\n**Liquidation process:**\n1. Liquidator repays up to 50% of the bad debt\n2. Liquidator receives equivalent collateral + **liquidation bonus** (typically 5–15%)\n3. This bonus is charged to the borrower — they lose extra collateral\n\n**Safe HF range:**\nConservative DeFi users target HF > 2.0, which provides a substantial buffer for price drops. HF of 1.2–1.5 is high-risk territory.",
          highlight: ["Loan-to-Value", "Health Factor", "liquidation threshold", "liquidation bonus", "HF", "overcollateralized"],
        },
        {
          type: "teach",
          title: "🔁 Looping Strategies",
          content:
            "**Looping** (also called recursive borrowing or leveraged yield) is a strategy where you repeatedly deposit, borrow, and re-deposit to amplify your exposure and yield.\n\n**Basic loop — ETH staking yield amplification:**\n1. Deposit 10 stETH as collateral (earning 3.5% staking APY)\n2. Borrow 7 ETH (70% LTV) at 2% borrow APY on Aave\n3. Stake borrowed ETH → receive 7 stETH\n4. Deposit 7 stETH as additional collateral\n5. Borrow 4.9 ETH, stake → deposit...\n6. Repeat until collateral is too small to borrow meaningfully\n\n**Net yield of the loop:**\n- Staking yield on total stETH: 3.5% × ~24 stETH = 0.84 ETH/year\n- Borrow cost on total debt: 2% × ~14 ETH = 0.28 ETH/year\n- Net yield: 0.56 ETH/year on original 10 stETH deposit = **5.6% net APY** (vs 3.5% unleveraged)\n\n**The stETH/ETH loop became popular because:**\n- Borrow cost (ETH rate) was historically lower than staking APY (stETH rate)\n- The collateral (stETH) and debt (ETH) are highly correlated — price drops together, limiting liquidation risk from price divergence\n\n**Risks of looping:**\n1. stETH depeg: if stETH depegs vs ETH, your HF deteriorates despite both assets falling\n2. Rate inversion: if ETH borrow rate spikes above stETH yield, the loop becomes loss-making\n3. Gas costs: unwinding multiple layers during a crisis is expensive and slow\n4. Smart contract risk compounds across all protocols in the stack\n\n**Never loop with volatile collateral (e.g., meme coins)** — a 20% price drop can cascade all loops to liquidation simultaneously.",
          highlight: ["looping", "recursive borrowing", "stETH loop", "net yield", "rate inversion", "stETH depeg"],
        },
        {
          type: "quiz-mc",
          question:
            "You have deposited $20,000 of ETH on Aave (liquidation threshold 82.5%) and borrowed $14,000 USDC. ETH then drops 20% in price. What is your approximate Health Factor after the drop?",
          options: [
            "Approximately 1.18 — still safe but approaching liquidation territory",
            "Approximately 0.94 — below 1.0, subject to immediate liquidation",
            "Exactly 1.0 — the drop precisely triggers liquidation threshold",
            "Unchanged at 1.18 — Aave freezes HF during volatile markets",
          ],
          correctIndex: 0,
          explanation:
            "After a 20% ETH drop, collateral value = $20,000 × 0.80 = $16,000. HF = $16,000 × 0.825 / $14,000 = $13,200 / $14,000 ≈ 0.94. Wait — that is actually below 1.0! The correct answer re-examined: HF = (collateral × liq threshold) / debt = (16,000 × 0.825) / 14,000 = 13,200 / 14,000 ≈ 0.943. This is below 1.0, meaning the position is liquidatable. The scenario demonstrates why borrowing close to maximum LTV is dangerous — even a 20% drop triggers liquidation.",
          correctIndex: 1,
          explanation:
            "After the 20% ETH drop: collateral = $20,000 × 0.8 = $16,000. HF = ($16,000 × 0.825) / $14,000 = $13,200 / $14,000 ≈ 0.943. This is below 1.0, making the position eligible for liquidation. Borrowing $14,000 against $20,000 at 70% LTV looked safe, but a 20% ETH drop was enough to breach the 82.5% liquidation threshold. This illustrates why Aave users should maintain a significant buffer above minimum LTV.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In a leveraged stETH/ETH looping strategy on Aave, a sudden spike in the ETH borrow rate above the stETH staking yield would turn the strategy from profitable to loss-making without any change in ETH price.",
          correct: true,
          explanation:
            "True. The loop's profitability depends on the spread: stETH yield − ETH borrow rate > 0. If ETH borrow demand spikes (e.g., during a market crash when people want to short ETH), the borrow rate can exceed the staking yield. The loop then costs more per year than it earns, turning net yield negative — even if ETH price is unchanged. This rate inversion risk is a key reason looping strategies require continuous monitoring.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 6: DeFi Risk Management ──────────────────────────────────────────
    {
      id: "crypto-yield-6",
      title: "🛡️ DeFi Risk Management",
      description:
        "Smart contract risk, rug pull anatomy, position sizing frameworks, and on-chain insurance options",
      icon: "ShieldCheck",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🐛 Smart Contract Risk",
          content:
            "**Smart contract risk** is the possibility that a bug, exploit, or design flaw in a protocol's code causes loss of funds.\n\n**Why it is unavoidable:**\nEvery DeFi protocol is a program. Programs have bugs. Unlike traditional finance, there is no FDIC insurance, no chargebacks, and no recourse after an exploit — blockchain transactions are irreversible.\n\n**Types of smart contract exploits:**\n\n**1. Reentrancy attacks:**\nA malicious contract calls back into the victim contract before the first execution completes. Used in The DAO hack (2016) — $60M ETH stolen.\n\n**2. Price oracle manipulation:**\nProtocols use on-chain prices to value collateral. Attackers use flash loans to manipulate DEX prices momentarily, draining lending protocols. Cream Finance lost $130M (2021).\n\n**3. Logic errors:**\nSometimes the code is correct but the design is wrong. Euler Finance had a donation function that allowed attackers to create bad debt — $197M drained (2023, later returned).\n\n**4. Admin key exploits:**\nIf a protocol has a privileged admin address, that key can upgrade contracts or drain funds. Ronin Bridge lost $625M when attacker compromised 5/9 validator keys.\n\n**Risk mitigation checklist:**\n- Multiple tier-1 audits (Trail of Bits, OpenZeppelin, Certora)\n- 12+ months on mainnet with growing TVL (time-tested)\n- Timelock on upgrades (users can exit before malicious upgrades take effect)\n- Bug bounty program (e.g., $1M+ on Immunefi)\n- No admin multisig or fully decentralized governance",
          highlight: ["smart contract risk", "reentrancy", "oracle manipulation", "flash loans", "audit", "timelock"],
        },
        {
          type: "teach",
          title: "🔪 Rug Pull Anatomy",
          content:
            "**A rug pull** occurs when a project's creators drain the liquidity or treasury and disappear, leaving investors with worthless tokens.\n\n**Types of rug pulls:**\n\n**1. Liquidity removal (hard rug):**\nTeam adds initial liquidity to a DEX, attracts investors, then removes all liquidity in one transaction. Token price goes to zero instantly. Often executed within 24–72 hours.\n\n**2. Soft rug (slow exit):**\nTeam gradually sells their large pre-minted allocation over weeks while maintaining the illusion of development. LUNA insiders selling before the depeg (2022).\n\n**3. Backdoor function:**\nContract code contains a hidden `mint()` or `drain()` function that lets developers create unlimited tokens or withdraw all funds. Often obscured in unverified or obfuscated Solidity.\n\n**4. Governance attack:**\nAttacker accumulates governance tokens, passes malicious proposal, drains treasury. Beanstalk Farms lost $182M (April 2022) via flash loan governance attack.\n\n**On-chain due diligence:**\n- Verify contract on Etherscan (source code published?)\n- Check token distribution: is 50%+ held by 1–2 wallets? (use Etherscan holders tab)\n- Scan with TokenSniffer, GoPlus, or De.Fi scanner for honeypot/rug functions\n- Check if liquidity is locked (Unicrypt, Team Finance) and for how long\n- DYOR: does the team have a track record? KYC? GitHub commits?\n\n**Timing red flag:**\nMost rug pulls happen 1–7 days after launch, once enough investors have bought in.",
          highlight: ["rug pull", "liquidity removal", "backdoor function", "governance attack", "TokenSniffer", "locked liquidity"],
        },
        {
          type: "teach",
          title: "📏 Position Sizing in DeFi",
          content:
            "**DeFi position sizing** must account for risks that do not exist in traditional finance: smart contract exploits, bridge hacks, oracle failures, and rug pulls.\n\n**Kelly Criterion adapted for DeFi:**\nFor a position with probability p of total loss and potential gain g:\nOptimal fraction = p_win − (p_loss / g)\n\nBut in DeFi, for unaudited protocols, p_loss can approach 50%+ — Kelly often recommends near-zero allocation.\n\n**Practical position sizing framework:**\n\n**Tier 1 — Battle-tested protocols (Aave, Uniswap, Compound):**\n- 12+ months, multiple audits, billions TVL, timelocked upgrades\n- Max allocation: 25–40% of DeFi portfolio\n\n**Tier 2 — Established but newer protocols (Curve, GMX, dYdX):**\n- 6–24 months, audited, meaningful TVL\n- Max allocation: 15–25% of DeFi portfolio\n\n**Tier 3 — New or unaudited protocols:**\n- < 6 months, single audit or none, small TVL\n- Max allocation: 5–10% of DeFi portfolio\n- Never allocate more than you can afford to lose completely\n\n**The 1% rule:**\nMany professional DeFi traders never put more than 1% of total net worth into any single unaudited smart contract.\n\n**Concentration risk:**\nBridges (Wormhole, Ronin, Nomad) have been the largest attack vectors. If your strategy requires bridging assets, that bridge is part of your risk profile. Limit cross-chain exposure to Tier 2 or higher bridges.\n\n**Diversify by protocol, not just asset:**\nHolding 5 tokens, all earning yield on the same protocol, means a single exploit wipes all positions.",
          highlight: ["position sizing", "Kelly Criterion", "Tier 1/2/3", "1% rule", "bridge risk", "concentration risk"],
        },
        {
          type: "teach",
          title: "🔐 DeFi Insurance",
          content:
            "**On-chain insurance** lets DeFi users buy smart contract cover — if a covered protocol is exploited, policyholders can file claims and receive payouts.\n\n**Nexus Mutual:**\n- The largest DeFi cover provider\n- Governed by NXM token holders who vote on claims\n- Cover types: Protocol Cover (smart contract exploits), Custody Cover (CEX insolvency), Yield Token Cover (LST depeg)\n- Pricing: 2–5% APY premium for blue-chip protocols; 8–15%+ for newer protocols\n- Claims record: paid $2.7M in Nexus cover for the Euler Finance exploit (2023)\n\n**InsurAce Protocol:**\n- Broader coverage, multiple chains\n- Portfolio cover: insure multiple protocols in one policy\n- Cheaper premiums due to diversification in the insurer pool\n\n**Limitations of DeFi insurance:**\n1. Claims require governance votes — not guaranteed to pay out\n2. Coverage limits: most protocols cannot cover > 10–20% of their TVL\n3. Premiums reduce net yield — 3% cover on a 5% yield leaves only 2% net\n4. Insurance contracts themselves have smart contract risk\n5. \"Rug pulls\" by founders are typically excluded from coverage\n\n**When insurance makes sense:**\n- Large positions (> $50K) in newer protocols\n- Leveraged looping strategies where a depeg could cascade liquidations\n- Institutional/DAO treasury management\n\n**Self-insurance alternative:**\nMany experienced DeFi users simply diversify across 8–12 uncorrelated protocols instead of paying insurance premiums, limiting max exposure to any single exploit.",
          highlight: ["Nexus Mutual", "InsurAce", "Protocol Cover", "smart contract cover", "claims", "self-insurance"],
        },
        {
          type: "quiz-mc",
          question:
            "You want to allocate $50,000 to DeFi yield strategies. According to a tiered risk framework, which allocation is most appropriate?",
          options: [
            "$40,000 to Aave USDC supply (Tier 1), $7,500 to a Curve pool (Tier 2), $2,500 to a new protocol launched last month with a single audit",
            "$50,000 to the new protocol because the 300% APY far outweighs the smart contract risk",
            "$25,000 each split equally between the new protocol and Aave — diversification eliminates all risk",
            "$50,000 into an unaudited farm — the 1,000% APY will recover any losses from a potential exploit",
          ],
          correctIndex: 0,
          explanation:
            "The tiered framework concentrates the majority of capital in battle-tested protocols (Tier 1: Aave), a meaningful but smaller portion in established newer protocols (Tier 2: Curve), and a small loss-tolerant allocation to high-risk new protocols (Tier 3). This reflects the risk-return profile of each tier. Concentrating in unaudited protocols regardless of APY violates basic risk management, and equal 50/50 splits give too much weight to an unvetted protocol.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A DeFi protocol offers 18% APY on USDC stablecoin deposits. The protocol is 8 months old, has two audits from mid-tier firms, $200M TVL, and admin keys controlled by a 4-of-7 multisig with a 48-hour timelock on upgrades. Nexus Mutual charges 4% APY for Protocol Cover.",
          question: "Should you buy insurance on this position? What is the net insured yield, and what risks remain uncovered?",
          options: [
            "Yes — buy insurance. Net insured yield = 14% APY. Remaining risks: governance attack on Nexus Mutual itself and rug pulls excluded from coverage",
            "No — insurance is always a waste; the 18% APY covers any expected losses",
            "Yes — buy insurance. Net insured yield = 18% APY because the cover is free of charge for established protocols",
            "No — if a protocol is audited it cannot be exploited, making insurance unnecessary",
          ],
          correctIndex: 0,
          explanation:
            "Net insured yield = 18% − 4% = 14% APY. Insurance makes sense here: the protocol is relatively new (8 months), and a 4% premium for protection on a $50K+ position is reasonable. Remaining risks: (1) Nexus Mutual's own governance could reject a claim; (2) rug pulls by insiders are typically excluded; (3) the insurance contract itself has smart contract risk; (4) coverage limits may not fully cover large positions. Audits reduce but do not eliminate exploit risk — every audited protocol that was later exploited (Euler: $197M, Ronin: $625M) had passed audits.",
          difficulty: 3,
        },
      ],
    },
  ],
};
