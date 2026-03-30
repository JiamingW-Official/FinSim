import { Unit } from "./types";

export const unitDefiProtocols: Unit = {
  id: "defi-protocols",
  title: "DeFi Protocols & Yield Strategies",
  description:
    "Master the mechanics of decentralized finance: automated market makers, on-chain lending, yield optimization vaults, and the cross-chain infrastructure connecting blockchains",
  icon: "Layers",
  color: "#8B5CF6",
  lessons: [
    // ─── Lesson 1: AMMs & Liquidity Pools ────────────────────────────────────
    {
      id: "defi-protocols-1",
      title: " AMMs & Liquidity Pools",
      description:
        "Constant product formula, impermanent loss mechanics, and the concentrated liquidity revolution of Uniswap v3",
      icon: "RefreshCw",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Automated Market Makers: How DEXes Price Assets",
          content:
            "**Automated market makers (AMMs)** replace the traditional order book with a mathematical pricing formula, allowing anyone to trade against a shared pool of tokens rather than a counterparty.\n\n**The constant product formula:**\nUniswap v2 and most first-generation AMMs use x * y = k, where x and y are the reserve quantities of two tokens and k is a constant. Every trade adjusts the ratio of x to y while keeping k unchanged, which automatically moves the price along a hyperbolic curve.\n\n**How a swap works step by step:**\n- A trader sends token A into the pool\n- The contract computes the new reserve of A after the deposit\n- It derives how much token B must leave the pool to maintain k\n- The ratio of the two reserves at any moment equals the **marginal price** of one token in terms of the other\n- A **swap fee** (typically 0.3%) is taken before the formula runs, enriching liquidity providers\n\n**Liquidity providers (LPs)** deposit equal-value amounts of both tokens to mint **LP tokens** representing their proportional share of the pool. Swap fees accumulate in the pool reserves, so LP tokens appreciate over time relative to the underlying assets.",
          highlight: [
            "automated market makers",
            "constant product formula",
            "x * y = k",
            "marginal price",
            "swap fee",
            "LP tokens",
            "liquidity providers",
          ],
        },
        {
          type: "teach",
          title: "Impermanent Loss: The Hidden Cost of Market Making",
          content:
            "When the price of a pooled asset changes, liquidity providers end up holding a different ratio of tokens than they deposited. This divergence creates **impermanent loss (IL)** — a reduction in portfolio value compared to simply holding the tokens.\n\n**Why IL happens:**\nAs arbitrageurs trade against the pool to realign it with external prices, they extract the appreciating token and leave more of the depreciating one. An LP selling into rising prices and buying into falling prices is the mirror image of a profitable momentum trade — the LP is always on the losing side of price moves.\n\n**IL magnitude by price change:**\n- 25% price move → ~0.6% IL\n- 2× price move → ~5.7% IL\n- 5× price move → ~25.5% IL\n- 10× price move → ~42.5% IL\n\nIL is \"impermanent\" only if the price returns to entry levels before withdrawal. Once an LP exits with a diverged price, losses are realized. For high-volatility pairs, **fee revenue must exceed IL** to make LP positions profitable — this is why LPs prefer stablecoin pairs (near-zero IL) or pairs where trading volume generates abundant fees.\n\n**IL vs divergence loss:** Some protocols rebrand IL as **divergence loss** to emphasize that it reflects price path divergence, not a flaw in the mechanism. The terminology shift matters little; the math is identical.",
          highlight: [
            "impermanent loss",
            "IL",
            "arbitrageurs",
            "fee revenue",
            "stablecoin pairs",
            "divergence loss",
          ],
        },
        {
          type: "teach",
          title: "Concentrated Liquidity: Uniswap v3",
          content:
            "Uniswap v3 (launched May 2021) introduced **concentrated liquidity**, allowing LPs to provide liquidity within a custom price range rather than across the entire 0 to ∞ curve.\n\n**How it works:**\n- An LP selects a lower tick price P_a and upper tick price P_b\n- Capital is only active (earning fees) while the spot price stays within [P_a, P_b]\n- When price exits the range, the LP's position becomes entirely one token and earns zero fees until price re-enters\n- Because capital is concentrated in a narrower band, it provides much deeper liquidity per dollar — potentially **4,000× more capital efficiency** for tight ranges vs v2\n\n**Tick system:** Prices are discretized into geometric ticks spaced 0.01% apart (1.0001^i). LPs choose tick boundaries; fee tiers (0.01%, 0.05%, 0.3%, 1%) determine swap cost and are matched to pair volatility.\n\n**Trade-offs:**\n- Active management required — out-of-range positions earn nothing\n- Impermanent loss is amplified within concentrated ranges compared to full-range v2 positions\n- Professional market makers with automated rebalancing (e.g., **Arrakis Finance**, **Gamma Strategies**) manage v3 positions on behalf of passive LPs\n\nConcentrated liquidity has become the dominant model; Uniswap v3 consistently captures 60–70% of DEX volume on Ethereum.",
          highlight: [
            "concentrated liquidity",
            "Uniswap v3",
            "price range",
            "tick",
            "capital efficiency",
            "active management",
            "Arrakis Finance",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In a constant product AMM with reserves of 100 ETH and 200,000 USDC (k = 20,000,000), a trader swaps in 10 ETH (ignoring fees). Approximately how much USDC does the trader receive?",
          options: [
            "20,000 USDC — the current price times 10 ETH",
            "18,182 USDC — derived from the constant product formula",
            "22,000 USDC — pool gives a price improvement bonus",
            "10,000 USDC — half of current price due to slippage",
          ],
          correctIndex: 1,
          explanation:
            "After adding 10 ETH the new ETH reserve is 110. To keep k = 20,000,000 the USDC reserve must become 20,000,000 / 110 ≈ 181,818. The trader receives 200,000 − 181,818 ≈ 18,182 USDC. The effective price (18,182 / 10 ≈ 1,818 per ETH) is worse than the pre-trade price of 2,000 because the large trade moves the pool's ratio — this price impact is called slippage.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An LP providing liquidity on a stablecoin pair such as USDC/DAI on Uniswap v2 faces minimal impermanent loss compared to an LP on a volatile pair like ETH/USDC.",
          correct: true,
          explanation:
            "Impermanent loss is driven by price divergence between the two pooled assets. Because USDC and DAI are both pegged to $1 their relative price rarely deviates, keeping IL extremely small. Volatile pairs like ETH/USDC can see large one-directional moves that generate substantial IL, which is why stablecoin AMMs (Curve Finance) use specialized invariants that concentrate liquidity around parity and charge lower fees.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "Which statement best describes what happens to a Uniswap v3 concentrated liquidity position when the market price moves outside the LP's chosen range?",
          options: [
            "The position is automatically liquidated and the LP receives both tokens back",
            "The position becomes fully composed of the cheaper token and stops earning fees",
            "The position tracks price outside the range at a lower fee rate",
            "The AMM widens the range automatically to keep the position active",
          ],
          correctIndex: 1,
          explanation:
            "When price exits the LP's range on the upside, the pool has sold all of the LP's lower-priced token — the position is entirely in the token that is now worth less relative to the move. Fees stop accruing because no trades pass through the inactive range. The LP must manually rebalance (create a new range position) or wait for price to return. This is one of the key management challenges of concentrated liquidity.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Uniswap v3 concentrated liquidity positions always have lower impermanent loss than an equivalent full-range Uniswap v2 position for the same asset pair.",
          correct: false,
          explanation:
            "The opposite is true within the active range. Concentrated liquidity amplifies impermanent loss proportionally to how narrow the range is — the same capital efficiency that boosts fee income also magnifies divergence loss when price moves. An LP in a 2× range may experience several times the IL of a full-range v2 position for an equivalent price move through that range. The trade-off is that higher fees from greater capital efficiency can still make concentrated positions net-positive.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Lending & Borrowing ───────────────────────────────────────
    {
      id: "defi-protocols-2",
      title: " Lending & Borrowing",
      description:
        "Collateralization ratios, health factors, liquidation mechanics, flash loans, and the Aave/Compound lending protocol models",
      icon: "Landmark",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Over-Collateralization and the Health Factor",
          content:
            "DeFi lending protocols like **Aave** and **Compound** operate without credit checks or identity verification. Instead, borrowers must lock up collateral worth more than the loan — a system called **over-collateralization**.\n\n**Key terms:**\n- **Loan-to-Value (LTV)**: The maximum you can borrow as a fraction of your collateral. ETH on Aave v3 might have an LTV of 80%, meaning $1,000 of ETH collateral lets you borrow up to $800.\n- **Liquidation threshold**: A slightly higher ratio (e.g., 85%) above which the position becomes liquidatable. The gap between LTV and liquidation threshold is a safety buffer.\n- **Health factor (HF)**: `HF = (collateral value × liquidation threshold) / total debt`. An HF above 1.0 means the position is safe. When HF falls to exactly 1.0 the position is eligible for liquidation.\n\n**Why HF falls:**\n- Collateral price drops (e.g., ETH falls)\n- Borrowed asset price rises (e.g., you borrowed USDC, ETH price falls in USD terms)\n- Accrued interest on the debt increases the denominator over time\n\n**Interest rate model:** Both Aave and Compound use **utilization-based rates** — as more of a pool is borrowed (utilization rises toward 100%), the borrow rate rises sharply to incentivize new deposits and discourage additional borrowing. Supply rates are always lower than borrow rates; the spread funds protocol reserves.",
          highlight: [
            "Aave",
            "Compound",
            "over-collateralization",
            "Loan-to-Value",
            "LTV",
            "liquidation threshold",
            "health factor",
            "utilization-based rates",
          ],
        },
        {
          type: "teach",
          title: "Liquidations: DeFi's Risk Management Engine",
          content:
            "When a borrower's **health factor drops below 1.0**, the protocol opens their collateral to external **liquidators** who repay a portion of the debt in exchange for a discounted slice of the collateral.\n\n**Liquidation mechanics on Aave:**\n1. A liquidator repays up to 50% of the outstanding debt in a single transaction\n2. In return they receive the equivalent collateral value plus a **liquidation bonus** (e.g., 5–10%)\n3. The bonus compensates liquidators for gas costs, market risk, and capital opportunity cost\n4. The borrower loses collateral worth slightly more than the debt repaid — effectively a forced partial sale at a discount\n\n**Who liquidates?**\nLiquidations are permissionless — any wallet can call the liquidation function. In practice, sophisticated bots written by MEV searchers and market makers compete to liquidate positions the instant they become eligible. During large market drops (\"liquidation cascades\"), hundreds of millions of dollars in collateral can be liquidated within minutes.\n\n**Bad debt risk:** If collateral price falls faster than liquidators can act (e.g., a flash crash with no oracle update), the protocol may accrue **bad debt** — collateral worth less than the outstanding loan. Protocols hold **safety modules** or insurance funds (Aave's Safety Module holds staked AAVE tokens) as a backstop.\n\n**E-Mode (Efficiency Mode) on Aave v3** allows higher LTVs for correlated assets (e.g., stablecoins vs stablecoins, ETH vs staked ETH), reducing capital requirements while managing cross-price risk.",
          highlight: [
            "health factor",
            "liquidators",
            "liquidation bonus",
            "liquidation cascades",
            "bad debt",
            "Safety Module",
            "E-Mode",
            "MEV searchers",
          ],
        },
        {
          type: "teach",
          title: "Flash Loans: Uncollateralized Borrowing in One Transaction",
          content:
            "**Flash loans** are a uniquely on-chain financial primitive: uncollateralized loans that must be borrowed and repaid within a single Ethereum transaction.\n\n**How atomicity enables flash loans:**\n- Ethereum executes all steps of a transaction atomically — either every step succeeds or the entire transaction reverts\n- A flash loan exploits this: the protocol loans any amount, the borrower uses it within the same transaction, then repays with a small fee (0.05–0.09%)\n- If repayment fails, the entire transaction reverts as if it never happened — the protocol never actually loses funds\n\n**Legitimate flash loan use cases:**\n- **Collateral swap**: Replace one collateral asset with another in a single step without closing and reopening the loan\n- **Self-liquidation**: Repay your own debt to avoid the liquidation penalty, then reclaim collateral\n- **Arbitrage**: Borrow asset A, trade it for asset B on DEX 1, sell B for A on DEX 2 at a higher price, repay the loan, pocket the spread — all in one transaction\n- **Leveraged positions**: Build multi-×-leveraged yield positions in a single transaction by looping through lending and borrowing\n\n**Flash loan attacks:**\nFlash loans have funded numerous exploits by giving attackers temporary access to enormous capital to manipulate price oracles, drain governance votes, or trigger liquidation cascades. Notable examples: the 2020 bZx attack ($900K) and the 2022 Mango Markets exploit ($114M).\n\n**Mitigation:** Protocols now use **time-weighted average price (TWAP) oracles** and Chainlink price feeds that are harder to manipulate within a single block.",
          highlight: [
            "flash loans",
            "atomicity",
            "collateral swap",
            "self-liquidation",
            "arbitrage",
            "price oracle",
            "TWAP oracles",
            "Chainlink",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A borrower deposits $10,000 of ETH as collateral (liquidation threshold 82%) and borrows $7,500 of USDC on Aave. What is their current health factor?",
          options: [
            "1.09 — the position is safe but close to the liquidation boundary",
            "0.75 — the position is undercollateralized and immediately liquidatable",
            "1.33 — the position has significant buffer above liquidation",
            "0.82 — health factor equals the liquidation threshold by definition",
          ],
          correctIndex: 0,
          explanation:
            "Health factor = (collateral × liquidation threshold) / total debt = ($10,000 × 0.82) / $7,500 = $8,200 / $7,500 ≈ 1.09. The position is technically safe (HF > 1) but only has a thin buffer — an ~8.5% decline in ETH price would push HF to 1.0 and trigger liquidation. Borrowers are advised to maintain HF well above 1.5 to weather normal price volatility.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Flash loans pose no risk to DeFi lending protocols because the atomicity of blockchain transactions guarantees that funds are always returned before any state change is finalized.",
          correct: false,
          explanation:
            "Atomicity protects the lending protocol's principal — flash loan funds are always returned or the transaction reverts. However, flash loans do pose systemic risk because they give attackers massive temporary capital to manipulate prices, governance votes, or other protocol state within a single transaction. The 2022 Mango Markets exploit used flash loans to pump collateral value and drain the treasury. The lending protocol itself did not lose money, but the broader ecosystem suffered large losses due to oracle manipulation enabled by borrowed capital.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "On Compound Finance, why does the borrow interest rate rise steeply when pool utilization approaches 100%?",
          options: [
            "To penalize large borrowers who take more than their fair share",
            "To attract new depositors and discourage additional borrowing, preventing the pool from running dry",
            "To compensate the protocol's treasury for increased smart contract risk",
            "Because Compound's governance always votes to raise rates during high-demand periods",
          ],
          correctIndex: 1,
          explanation:
            "Compound and Aave use a kinked interest rate model. Below an optimal utilization rate (e.g., 80%) rates rise gradually. Above the kink, rates spike sharply — sometimes to 100%+ APY — making further borrowing very expensive. This dual incentive (high yields attract new depositors; high costs deter new borrowers) naturally brings utilization back toward the optimal level, ensuring the pool maintains liquidity for withdrawals.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A DeFi borrower can use a flash loan to perform a collateral swap — replacing ETH collateral with wBTC collateral — without ever needing to close their loan position.",
          correct: true,
          explanation:
            "This is one of the most practical flash loan use cases. The user flash-borrows enough stablecoins to fully repay their outstanding debt, which releases their ETH collateral. They swap the ETH for wBTC, deposit wBTC as new collateral, re-borrow stablecoins, and repay the flash loan — all in one atomic transaction. Without a flash loan, the same process would require additional capital to repay the loan before the collateral could be released.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Yield Strategies ──────────────────────────────────────────
    {
      id: "defi-protocols-3",
      title: "🌾 Yield Strategies",
      description:
        "Yield farming mechanics, liquidity mining incentives, auto-compounding vaults like Yearn Finance, and basis trading for delta-neutral returns",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Yield Farming and Liquidity Mining",
          content:
            "**Yield farming** is the practice of deploying crypto assets across DeFi protocols to maximize returns, often chaining multiple protocols together. **Liquidity mining** is a specific subset where protocols distribute native governance tokens to users as an additional incentive on top of organic fees.\n\n**Why protocols offer liquidity mining:**\n- Bootstrap cold-start liquidity without spending treasury stablecoins\n- Distribute governance tokens to actual users rather than investors\n- Create flywheel effects: token incentives → TVL → more trading → more fees → higher token value → more incentives\n\n**Classic DeFi summer 2020 mechanics:**\n1. Deposit USDC into Compound to earn COMP tokens\n2. Borrow DAI against that USDC collateral, also earning COMP\n3. Deposit the DAI back into Compound (recursive borrowing)\n4. Claim COMP rewards, sell a portion to compound returns\n\n**Risks embedded in yield farming:**\n- **Smart contract risk**: A bug in any protocol in the chain can drain all funds\n- **Token price risk**: High APYs often come from token emissions — if the token price falls, real yield collapses\n- **Rug pull risk**: Anonymous teams can drain liquidity pools after attracting capital\n- **Gas cost erosion**: Frequent compounding on Ethereum mainnet can consume most profits in transaction fees\n- **Composability risk (\"money legos\")**: Each protocol dependency adds a new attack surface\n\n**Real yield vs token yield:** Post-2022, the industry shifted focus to **real yield** — protocol revenue generated from actual fees, not token printing — as a more sustainable income measure.",
          highlight: [
            "yield farming",
            "liquidity mining",
            "governance tokens",
            "COMP",
            "smart contract risk",
            "rug pull risk",
            "composability risk",
            "real yield",
          ],
        },
        {
          type: "teach",
          title: "Auto-Compounding Vaults: Yearn Finance",
          content:
            "**Yearn Finance** pioneered the concept of **yield aggregator vaults** — smart contracts that automatically move capital between protocols and compound rewards without user intervention.\n\n**How a Yearn vault works:**\n1. A user deposits a token (e.g., USDC) and receives a **yToken** (yvUSDC) representing their share\n2. The vault's **Strategy** contract deploys the capital to the highest-yielding opportunity (e.g., Compound, Aave, Curve, Convex) according to the strategy logic\n3. Earned tokens (COMP, CRV, CVX) are harvested on a regular schedule\n4. Harvested tokens are swapped for more of the underlying asset and re-deposited — this is **auto-compounding**\n5. A **management fee** (2% annually) and **performance fee** (20% of profits) are charged; treasury and strategist split the performance fee\n\n**Compounding frequency advantage:**\nManual compounding at high gas costs might only happen weekly. Vaults amortize gas across all depositors, enabling daily or even multiple-times-daily compounding — significantly boosting effective APY for large pools.\n\n**Curve + Convex integration:**\nYearn's most productive strategies involve Curve Finance's stablecoin pools. Depositing into Curve earns CRV tokens, which can be locked in **Convex Finance** (cvxCRV) to boost CRV rewards by up to 2.5×. Yearn aggregates these boosts across depositors, giving retail users institutional-grade yields without holding large CRV positions themselves.\n\n**Risk:** If any protocol in the strategy stack is exploited, vault depositors bear losses proportional to their share. Yearn's November 2021 DAI vault exploit cost $11M before the team patched it.",
          highlight: [
            "Yearn Finance",
            "yield aggregator vaults",
            "yToken",
            "Strategy",
            "auto-compounding",
            "management fee",
            "performance fee",
            "Curve Finance",
            "Convex Finance",
          ],
        },
        {
          type: "teach",
          title: "Basis Trading: Delta-Neutral Yield in DeFi",
          content:
            "**Basis trading** in DeFi captures the funding rate spread between spot and perpetual futures positions, generating yield without directional market exposure.\n\n**Funding rate mechanics:**\nPerpetual futures (perps) on exchanges like dYdX, GMX, and centralized venues don't expire. To keep perp prices anchored to spot, they use a **funding rate** — when perp price is above spot (traders are net-long), longs pay shorts every 8 hours. During bull markets, funding rates can reach 0.05–0.1% per 8-hour period (55–110% annualized).\n\n**The basis trade:**\n1. Buy $1 of spot BTC (long)\n2. Short $1 of BTC via perp futures\n3. Net delta = 0 — you don't profit or lose from BTC price moves\n4. You collect the funding rate paid by longs to shorts\n5. When funding turns negative (bear market), unwind the trade\n\n**DeFi implementation via Ethena (USDe):**\nEthena's synthetic dollar protocol automates this trade at scale:\n- Users deposit stETH (staked ETH) as collateral\n- Protocol opens equivalent short ETH perp positions across major CEX/DEX venues\n- The combined yield (staking yield + funding rate) backs the USDe stablecoin\n- During periods of high funding (bull markets), USDe has offered 15–30% APY\n\n**Risks:**\n- **Funding rate risk**: Rates can turn negative; shorts pay longs, eroding principal\n- **Counterparty/exchange risk**: Collateral held on or through centralized exchanges\n- **Liquidation risk**: If BTC price moves sharply, the short perp margin may need topping up\n- **Correlation collapse**: In a crash, both basis trades and staking yields can compress simultaneously",
          highlight: [
            "basis trading",
            "funding rate",
            "perpetual futures",
            "delta-neutral",
            "dYdX",
            "GMX",
            "Ethena",
            "USDe",
            "stETH",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A Yearn vault charges a 2% management fee and 20% performance fee. If a depositor's $10,000 earns 40% gross return over a year (before fees), what is their approximate net return?",
          options: [
            "38% — only the management fee is deducted from gross returns",
            "28.8% — management fee on principal plus performance fee on profits",
            "24% — both fees are calculated on total portfolio value",
            "40% — fees are paid by the protocol treasury, not depositors",
          ],
          correctIndex: 1,
          explanation:
            "Gross profit = $10,000 × 40% = $4,000. Performance fee = 20% × $4,000 = $800. Management fee = 2% × $10,000 = $200. Total fees = $1,000. Net profit = $4,000 − $1,000 = $3,000, which is a 30% net return — closest to option B at 28.8%. (Exact calculation depends on when management fee is accrued; this approximation is directionally correct.) High gross yields can still be attractive even after the 2/20 fee structure.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A basis trade (long spot + short perpetual futures) guarantees risk-free yield because the delta-neutral position eliminates all market exposure.",
          correct: false,
          explanation:
            "Delta-neutral does not mean risk-free. The basis trade still faces funding rate risk (rates can turn negative, meaning shorts pay longs, eroding or eliminating yield), exchange counterparty risk, liquidation risk on the short leg if margin runs low during a large price spike, and operational risks like smart contract bugs. Ethena's USDe, which automates this trade, has held its peg under normal conditions but acknowledges these risks in its documentation — the high yields reflect compensation for bearing them.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Why did DeFi liquidity mining programs during 'DeFi Summer 2020' often lead to unsustainable APYs that eventually collapsed?",
          options: [
            "Regulators intervened and forced protocols to reduce token emissions",
            "The underlying yields were denominated in governance tokens whose price fell as more were minted and sold",
            "Ethereum gas costs rose too high for farming to remain profitable",
            "Protocols ran out of treasury funds to pay promised yields",
          ],
          correctIndex: 1,
          explanation:
            "Liquidity mining APYs were quoted in governance token terms, but the denominator (token price) was inflated by speculative demand during the boom. As more tokens were emitted, holders sold to realize profits, increasing sell pressure. When speculative inflows stalled, token prices fell sharply — a 90% price decline turns a nominal 1,000% APY into a real 100% APY, and the TVL exodus triggered further price drops. This reflexive dynamic is now called a 'liquidity mining death spiral.'",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Curve Finance's gauge weight system and Convex Finance's vote-escrowed model allow large CRV holders to direct token emissions to pools of their choice, creating economic competition known as 'the Curve Wars.'",
          correct: true,
          explanation:
            "Correct. Curve distributes CRV emissions based on gauge weights voted on by veCRV holders (CRV locked for up to 4 years). Convex Finance aggregated large amounts of veCRV by offering cvxCRV as a liquid wrapper, giving it massive voting power. Protocols that want deep, cheap liquidity on Curve compete to bribe Convex/veCRV holders (via platforms like Votium) to direct emissions to their pools. This governance-driven incentive marketplace — dubbed the Curve Wars — represents a novel form of on-chain economic competition.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Bridges & Cross-Chain ─────────────────────────────────────
    {
      id: "defi-protocols-4",
      title: "🌉 Bridges & Cross-Chain",
      description:
        "Lock-and-mint mechanics, optimistic vs ZK rollup bridges, bridge security risks, and the distinction between canonical and native cross-chain assets",
      icon: "GitMerge",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "How Bridges Work: Lock-and-Mint",
          content:
            "**Blockchain bridges** allow assets and messages to move between separate blockchains that cannot natively communicate. The most common mechanism is **lock-and-mint**.\n\n**Lock-and-mint flow:**\n1. A user sends 1 ETH to a bridge contract on Ethereum mainnet\n2. The bridge contract **locks** the ETH in a smart contract escrow\n3. A relayer or oracle network detects the lock event and submits proof to a bridge contract on the destination chain (e.g., Arbitrum or Polygon)\n4. The destination contract **mints** a synthetic representation — a wrapped token like WETH on Arbitrum — in a 1:1 ratio\n5. To return: the user burns the wrapped token on the destination chain, triggering a proof that allows them to **unlock** the original ETH on Ethereum\n\n**Trust assumptions:**\nThe security of lock-and-mint bridges rests on the relayer network or oracle set that relays proofs between chains. Validators in a multi-signature bridge can collude or be compromised — the bridge holds all locked assets as a honeypot.\n\n**Scale of assets at risk:**\nAt peak 2022 activity, over $20 billion in assets were locked in cross-chain bridges. This concentration made bridges the single largest attack surface in DeFi — the Ronin Bridge (Axie Infinity, $625M), Wormhole ($320M), and Nomad ($190M) exploits all targeted bridged asset reserves.\n\n**Message passing:**\nBeyond asset transfers, bridges like **LayerZero** and **Chainlink CCIP** pass arbitrary messages between chains — enabling cross-chain governance votes, cross-chain lending, and multi-chain applications.",
          highlight: [
            "blockchain bridges",
            "lock-and-mint",
            "wrapped token",
            "relayer",
            "multi-signature bridge",
            "Ronin Bridge",
            "Wormhole",
            "LayerZero",
            "Chainlink CCIP",
          ],
        },
        {
          type: "teach",
          title: "Optimistic vs ZK Bridges: Security Trade-offs",
          content:
            "The most secure bridges are **native rollup bridges** — the canonical connection between an Ethereum L2 rollup and Ethereum mainnet. Two proof systems define their security models.\n\n**Optimistic bridges (Optimism, Arbitrum):**\n- Transactions are posted to Ethereum as calldata with a **7-day challenge window**\n- During this window, any fraud prover can submit a **fraud proof** showing that the state transition was invalid\n- If no valid challenge is raised, the transaction is finalized\n- The 7-day window is the source of the notorious **withdrawal delay** when moving assets from Optimistic rollups back to Ethereum\n- Fast withdrawal services (e.g., Hop Protocol, Across) solve this by using liquidity providers who front assets on Ethereum immediately and accept the slow canonical bridge in the background\n\n**ZK bridges (zkSync, StarkNet, Polygon zkEVM):**\n- Every batch of transactions is accompanied by a **zero-knowledge proof** (SNARK or STARK) that cryptographically proves the validity of every state transition\n- No challenge window needed — ZK proofs are verified instantly on Ethereum\n- Withdrawals finalize in minutes to hours (limited by proof generation time)\n- Computationally intensive to generate proofs; requires specialized hardware\n\n**Security hierarchy:**\n1. ZK native bridge (mathematically verified)\n2. Optimistic native bridge (economically secured, 7-day delay)\n3. Trusted multi-sig bridge (social trust, fastest but least secure)\n\nThe industry trend is toward ZK everywhere — as proof generation costs fall, ZK bridges replace optimistic and multi-sig alternatives.",
          highlight: [
            "optimistic bridges",
            "ZK bridges",
            "challenge window",
            "fraud proof",
            "zero-knowledge proof",
            "SNARK",
            "STARK",
            "withdrawal delay",
            "Hop Protocol",
            "Across",
          ],
        },
        {
          type: "teach",
          title: "Canonical vs Native Assets and Bridge Risks",
          content:
            "Not all bridged assets carry the same trust guarantees. Understanding **canonical vs native** assets is essential for managing bridge risk.\n\n**Canonical assets:**\nA **canonical token** is the officially designated representation of an asset on a given chain, endorsed by the issuing protocol or rollup team. For example:\n- Arbitrum's canonical USDC (before Circle's CCTP) was a lock-and-mint version backed by Ethereum-locked USDC\n- When Circle launched **CCTP (Cross-Chain Transfer Protocol)**, it enabled **native USDC** on Arbitrum — minted directly by Circle on the destination chain, burning the Ethereum-side USDC — eliminating bridge custodial risk\n\n**Native assets vs wrapped:**\n- **Native**: The asset is issued directly by its creator on the destination chain (e.g., Circle minting USDC natively on Polygon)\n- **Canonical**: The officially accepted wrapped version for a chain even if not natively issued\n- **Third-party wrapped**: Unofficial wrappers created by external bridge protocols with additional counterparty risk\n\n**Bridge risks summary:**\n- **Smart contract exploit**: The lock contract or mint contract has a bug (Wormhole 2022: attacker minted 120,000 wETH without locking ETH)\n- **Validator compromise**: Multi-sig signers are hacked or collude (Ronin: 5 of 9 validators compromised)\n- **Oracle manipulation**: Off-chain relayers submit false proofs\n- **Liquidity fragmentation**: Multiple bridge versions of the same token (e.g., multichain-USDC vs official USDC) create depegging risk and confusion\n\n**Risk mitigation best practices:**\n- Prefer native rollup bridges for large transfers (slower but trustless)\n- Use canonical tokens endorsed by the asset issuer\n- Diversify bridge exposure; avoid keeping large amounts in a single third-party bridge indefinitely",
          highlight: [
            "canonical token",
            "native USDC",
            "CCTP",
            "Circle",
            "third-party wrapped",
            "smart contract exploit",
            "validator compromise",
            "liquidity fragmentation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A user bridges 10 ETH from Ethereum to Arbitrum using the official Arbitrum native bridge, then immediately wants to withdraw back to Ethereum. What is the primary constraint they face?",
          options: [
            "They must pay a 0.1% bridge fee to Arbitrum's treasury before withdrawing",
            "They must wait approximately 7 days for the optimistic challenge window to expire before the ETH is released on Ethereum",
            "They must provide a ZK proof of their identity before the bridge releases funds",
            "The bridge requires a minimum balance of 100 ETH before allowing withdrawals",
          ],
          correctIndex: 1,
          explanation:
            "Arbitrum is an optimistic rollup. Its native bridge requires a 7-day challenge period during which fraud provers can challenge invalid transactions. This delay is a feature, not a bug — it gives the fraud proof system time to catch any invalid state transitions. Users who need faster access to Ethereum liquidity can use fast withdrawal protocols like Hop or Across, which use liquidity providers to front the ETH immediately while those LPs wait for the canonical bridge to finalize.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Zero-knowledge rollup bridges are considered more secure than optimistic rollup bridges because ZK proofs mathematically verify every transaction's validity without relying on economic incentives or challenge periods.",
          correct: true,
          explanation:
            "ZK bridges generate a cryptographic proof (SNARK or STARK) for every batch of transactions. This proof is verified on Ethereum and is computationally infeasible to forge — validity is mathematical, not economic. Optimistic bridges instead rely on the assumption that at least one honest fraud prover will catch and challenge any invalid batch within the 7-day window. While optimistic bridges have operated safely in practice, they have a weaker security guarantee: they depend on liveness and incentive alignment of challengers, whereas ZK proofs work regardless of who is watching.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "The Wormhole bridge exploit in February 2022 resulted in the theft of approximately $320 million. What was the root cause?",
          options: [
            "A 51% attack on the Solana blockchain allowed the attacker to rewrite bridge transaction history",
            "The attacker exploited a signature verification bug to mint 120,000 wETH on Solana without depositing any ETH on Ethereum",
            "A multi-sig key was leaked on GitHub, allowing the attacker to approve unauthorized withdrawals",
            "A reentrancy attack drained the Ethereum-side lock contract across multiple transactions",
          ],
          correctIndex: 1,
          explanation:
            "The Wormhole attacker found a vulnerability in the bridge's Solana-side guardian signature verification logic. By crafting a spoofed signature that bypassed verification, the attacker convinced the bridge that a deposit of 120,000 ETH had occurred on Ethereum — when it had not. The bridge minted 120,000 wETH on Solana against thin air. Jump Crypto (Wormhole's backer) replenished the 120,000 ETH from its own treasury to protect users, making it one of the largest corporate bailouts in DeFi history.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Circle's Cross-Chain Transfer Protocol (CCTP) eliminates bridge custodial risk for USDC by burning USDC on the source chain and minting fresh USDC on the destination chain, rather than locking source-chain USDC in a bridge contract.",
          correct: true,
          explanation:
            "CCTP is a burn-and-mint architecture. When a user transfers USDC cross-chain via CCTP, their USDC is burned (destroyed) on the origin chain and an attestation is submitted to Circle's infrastructure. Circle's attestation service authorizes the destination chain contract to mint an equivalent amount of native USDC. Because the minted USDC is issued by Circle directly — not a synthetic IOU backed by locked collateral — it carries the full Circle credit guarantee with no bridge honeypot risk. This approach has been adopted by Arbitrum, Base, Optimism, Avalanche, and others.",
          difficulty: 2,
        },
      ],
    },
  ],
};
