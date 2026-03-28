import type { Unit } from "./types";

export const UNIT_CRYPTO_FUNDAMENTALS: Unit = {
  id: "crypto-fundamentals",
  title: "Cryptocurrency Fundamentals",
  description:
    "From Bitcoin basics to DeFi: master the foundations of digital assets",
  icon: "Cpu",
  color: "#F97316",
  lessons: [
    /* ================================================================
       LESSON 1 — Blockchain Basics
       ================================================================ */
    {
      id: "crypto-fundamentals-1",
      title: "Blockchain Basics",
      description:
        "Distributed ledgers, consensus mechanisms, hash functions, and immutability",
      icon: "Layers",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "What Is a Distributed Ledger?",
          content:
            "A **blockchain** is a type of **distributed ledger** — a database that is replicated and synchronised across thousands of independent computers called **nodes**. No single entity owns or controls the database.\n\nEach **block** packages together:\n- A set of validated transactions\n- A timestamp\n- The **cryptographic hash** of the previous block\n\nA **hash function** (e.g., SHA-256) takes any input and produces a fixed-length fingerprint. The same input always produces the same hash, but changing even one character produces a completely different output.\n\nBecause each block embeds the previous block's hash, every block in the chain is cryptographically bound to all its predecessors. Altering a past transaction would change that block's hash, which would invalidate every subsequent block, requiring recomputation across the entire chain on a majority of nodes simultaneously — computationally infeasible at scale.",
          highlight: [
            "blockchain",
            "distributed ledger",
            "node",
            "hash function",
            "cryptographic hash",
          ],
        },
        {
          type: "teach",
          title: "Consensus: Proof of Work vs Proof of Stake",
          content:
            "A **consensus mechanism** allows thousands of nodes — which don't trust each other — to agree on a single, valid version of the ledger.\n\n**Proof of Work (PoW) — Bitcoin**:\n- Miners compete to solve a computationally expensive hash puzzle\n- The winner adds the next block and earns the block reward + fees\n- Security derives from real energy expenditure; attacking requires 51% of global hash rate\n- Very battle-tested; highly decentralised\n\n**Proof of Stake (PoS) — Ethereum (post-2022 Merge)**:\n- Validators lock up ('stake') ETH as collateral — 32 ETH minimum per validator\n- Validators are selected pseudo-randomly, weighted by stake\n- Dishonest behaviour triggers **slashing**: a portion of the staked ETH is destroyed\n- Energy consumption drops ~99.95% versus PoW\n\n**Key trade-off**: PoW is more proven and censorship-resistant; PoS enables higher throughput and is far more energy efficient. Both models are actively used by major blockchains.",
          highlight: [
            "consensus mechanism",
            "proof of work",
            "proof of stake",
            "slashing",
            "validator",
            "miner",
          ],
        },
        {
          type: "teach",
          title: "Immutability and Node Roles",
          content:
            "**Immutability** is one of blockchain's most important properties: once a transaction is confirmed and buried under several subsequent blocks, reversing it becomes practically impossible.\n\nThis is because:\n1. Each block's hash depends on all prior data\n2. Any tampering cascades forward, invalidating every later block\n3. An attacker would need to redo all that work while outpacing the honest network in real time\n\n**Node types**:\n- **Full nodes**: Store the complete blockchain history, independently validate every transaction and block. The backbone of decentralisation.\n- **Light nodes**: Store only block headers; rely on full nodes for verification. Used by mobile wallets.\n- **Archive nodes**: Store all historical states of the blockchain — used by block explorers and analytics platforms.\n- **Mining/Validator nodes**: Full nodes that also propose new blocks and earn rewards.\n\nThe more full nodes that exist globally, the harder the network is to censor or attack.",
          highlight: [
            "immutability",
            "full node",
            "light node",
            "archive node",
            "validator",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Why is altering a transaction recorded deep in a blockchain considered computationally infeasible?",
          options: [
            "Changing one block invalidates its hash and every subsequent block's hash, requiring recomputation on a majority of nodes simultaneously",
            "All blockchain data is stored in read-only memory that cannot be overwritten",
            "Transactions can only be reversed by the original sender with a private password",
            "The blockchain automatically rejects any blocks that contain modified transactions",
          ],
          correctIndex: 0,
          explanation:
            "Each block embeds the cryptographic hash of the prior block. Changing any historical record alters that block's hash, breaking the link to every block that follows. An attacker would need to recompute all subsequent blocks while also controlling more than 50% of the entire network's computing power — a cost that makes attacks economically irrational on large, well-established chains.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In Ethereum's Proof of Stake system, a validator that acts dishonestly can have a portion of their staked ETH permanently destroyed — a process called slashing.",
          correct: true,
          explanation:
            "Slashing is the core deterrent in PoS security. If a validator signs two conflicting blocks or attempts double-spending, the protocol automatically destroys part of their staked ETH and ejects them from the validator set. This economic punishment replaces the energy cost that deters attacks in Proof of Work systems.",
          difficulty: 1,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Bitcoin & Ethereum
       ================================================================ */
    {
      id: "crypto-fundamentals-2",
      title: "Bitcoin & Ethereum",
      description:
        "Bitcoin's monetary policy, Ethereum smart contracts, the EVM, gas fees, and Layer 2s",
      icon: "Coins",
      xpReward: 85,
      steps: [
        {
          type: "teach",
          title: "Bitcoin's Monetary Policy",
          content:
            "Bitcoin was designed as **digital sound money** with a transparent, immutable monetary policy:\n\n**21 million hard cap**: No more than 21 million BTC will ever exist. This is enforced by the protocol's code, not by a central bank's promise.\n\n**Halving cycle**: Approximately every 210,000 blocks (~4 years), the block subsidy paid to miners is cut in half:\n- 2009: 50 BTC/block\n- 2012: 25 BTC → 2016: 12.5 → 2020: 6.25 → 2024: 3.125 BTC\n- Halvings reduce new supply entering the market; historically correlated with bull markets 12–18 months later\n\n**UTXO model**: Bitcoin tracks ownership via **Unspent Transaction Outputs**. When you receive BTC, it becomes a UTXO. Spending it consumes that UTXO and creates new ones. There are no 'accounts' — only chains of ownership proofs.\n\n**Deflationary by design**: With a fixed supply and growing demand, Bitcoin is structurally deflationary — a stark contrast to fiat currencies which can be printed in unlimited quantities.",
          highlight: [
            "21 million",
            "halving",
            "UTXO",
            "block subsidy",
            "hard cap",
            "deflationary",
          ],
        },
        {
          type: "teach",
          title: "Ethereum: Smart Contracts and the EVM",
          content:
            "Ethereum extended the blockchain concept beyond simple value transfer by enabling **smart contracts** — self-executing programs stored on-chain whose terms are enforced automatically by code.\n\n**Smart contract properties**:\n- Deployed once, run forever (on any node that processes the chain)\n- Transparent: code is publicly auditable\n- Immutable once deployed (unless designed with upgrade patterns)\n- Deterministic: same inputs always produce same outputs\n\n**Ethereum Virtual Machine (EVM)**: The runtime environment that executes smart contract code across all Ethereum nodes simultaneously. Because every node runs the same computation, results are trustlessly verifiable.\n\n**Gas fees**: Every operation on the EVM costs 'gas' — the unit of computational work. Users pay gas in ETH (specifically in 'gwei', 1 gwei = 0.000000001 ETH). Gas prices fluctuate with network demand.\n- High gas: network is congested\n- EIP-1559 (2021) introduced base fee burning: a portion of every transaction fee is permanently destroyed, making ETH mildly deflationary during high-demand periods\n\n**Layer 2 scaling**: Solutions built on top of Ethereum that process transactions off the main chain (L1) and periodically post compressed proofs back. Examples: Arbitrum, Optimism (Optimistic Rollups), zkSync (ZK Rollups). Fees are 10–100× lower than L1.",
          highlight: [
            "smart contract",
            "EVM",
            "gas",
            "gwei",
            "Layer 2",
            "rollup",
            "EIP-1559",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Bitcoin's 'halving' event reduces the block reward paid to miners by 50%. What is the primary economic significance for Bitcoin's price?",
          options: [
            "It cuts the rate of new BTC supply entering the market, creating a supply shock that has historically preceded major bull runs",
            "It doubles the transaction fees, making Bitcoin more expensive to use and thus more valuable",
            "It doubles the mining difficulty, securing the network but having no direct effect on price",
            "It triggers an automatic increase in the 21 million supply cap to maintain miner incentives",
          ],
          correctIndex: 0,
          explanation:
            "Each halving cuts the daily issuance of new BTC roughly in half. If demand remains constant or grows, the reduction in new supply creates upward price pressure. Historically, BTC has entered significant bull markets 12–18 months after each halving (2012, 2016, 2020). The 21 million cap is never increased — that is a core design invariant of Bitcoin.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Ethereum's Layer 2 solutions (such as Arbitrum and Optimism) process transactions off the main Ethereum chain and periodically submit proofs back to Layer 1, enabling significantly lower fees.",
          correct: true,
          explanation:
            "Layer 2 rollups batch many transactions together, execute them off-chain, and post a compressed summary (or validity proof) to Ethereum's Layer 1. This dramatically reduces the cost per transaction — often 10–100× cheaper than transacting directly on L1 — while inheriting Ethereum's security guarantees. Rollups are the dominant scaling roadmap for Ethereum.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "What is the purpose of 'gas' in the Ethereum network?",
          options: [
            "It is the unit of computational work that prices EVM operations, paid in ETH to compensate validators for executing and storing transactions",
            "It is a separate token used exclusively for paying smart contract developers as royalties",
            "It is a fee collected by the Ethereum Foundation to fund protocol development",
            "It is a penalty charged to users who send transactions that fail or revert",
          ],
          correctIndex: 0,
          explanation:
            "Gas is Ethereum's internal pricing mechanism for computation. Every EVM operation (addition, storage write, function call) has a predetermined gas cost. Users set a gas price (in gwei) they are willing to pay per unit of gas. Validators prioritise higher-fee transactions. This system prevents spam and ensures fair resource allocation across a shared, decentralised computer.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Tokenomics
       ================================================================ */
    {
      id: "crypto-fundamentals-3",
      title: "Tokenomics",
      description:
        "Token supply, distribution, vesting, burning mechanisms, staking rewards, and inflation models",
      icon: "BarChart2",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "Supply, Distribution, and Vesting",
          content:
            "**Tokenomics** (token + economics) describes the rules governing a token's creation, distribution, and ongoing supply.\n\n**Key supply metrics**:\n- **Maximum supply**: The hard cap on tokens that will ever exist (Bitcoin: 21M; many tokens: unlimited)\n- **Total supply**: Tokens created so far minus any permanently burned\n- **Circulating supply**: Tokens actively tradeable in the market today\n- **Fully diluted valuation (FDV)**: Price × maximum supply — shows the 'theoretical' market cap if all tokens existed today\n\n**Distribution and vesting**:\nMost projects allocate tokens across multiple groups at launch:\n- Team & founders (typically 15–20%)\n- Investors / VCs (15–30%)\n- Community / ecosystem / treasury (40–60%)\n\n**Vesting schedules** lock up team and investor tokens for a period (e.g., 1-year cliff, 3-year linear vest). Vesting aligns incentives: if the team can't sell for 3 years, they are motivated to build long-term value. Short or no vesting is a red flag — it enables immediate dumping on retail buyers.",
          highlight: [
            "tokenomics",
            "maximum supply",
            "circulating supply",
            "fully diluted valuation",
            "vesting",
          ],
        },
        {
          type: "teach",
          title: "Burning, Staking, and Inflation Models",
          content:
            "**Token burning** permanently removes tokens from circulation, reducing supply:\n- **Transaction burns**: Ethereum's EIP-1559 burns a portion of every transaction's base fee\n- **Buyback-and-burn**: A protocol uses revenue to buy tokens on the open market, then destroys them\n- **Deflationary effect**: If tokens are burned faster than new ones are minted, total supply shrinks over time\n\n**Staking rewards** incentivise token holders to lock up tokens and secure the network:\n- Validators earn newly minted tokens for securing PoS networks\n- This creates **inflation** — new supply dilutes existing holders\n- Staking APY compensates stakers for the dilution; non-stakers are diluted\n\n**Inflation vs deflation models**:\n- **Fixed supply + no rewards**: Maximum scarcity (Bitcoin)\n- **Inflationary + staking**: New tokens issued continuously but stakers keep pace (Ethereum, Solana)\n- **Deflationary**: Burns exceed emissions — supply shrinks (ETH during high usage periods)\n- **High inflation**: New tokens emitted aggressively (often seen in early DeFi protocols); unsustainable without real demand growth",
          highlight: [
            "token burning",
            "staking",
            "inflation",
            "deflation",
            "buyback-and-burn",
            "staking APY",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A new DeFi protocol launches with 1 billion tokens. The team holds 35% with no vesting schedule, investors hold 30% with a 3-month lock-up, and only 5% is in public circulation. What is the most significant red flag?",
          options: [
            "The team can immediately sell 350 million tokens at any time, creating massive selling pressure with no long-term alignment",
            "The 1 billion total supply is too large and should be capped at 100 million",
            "Public circulation of 5% is too low and prevents price discovery",
            "Investor lock-ups of 3 months are too long and restrict liquidity",
          ],
          correctIndex: 0,
          explanation:
            "A team allocation with no vesting is the most critical red flag in tokenomics. With 35% of supply unlocked, the team can sell at any time after listing, flooding the market and crashing the price. Healthy tokenomics require at least a 1-year cliff plus multi-year linear vesting for teams and insiders, ensuring they remain financially invested in long-term success.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Ethereum's EIP-1559 upgrade made ETH potentially deflationary by burning a portion of each transaction's base fee, meaning total ETH supply can decrease during periods of high network activity.",
          correct: true,
          explanation:
            "EIP-1559 introduced a mechanism where the base fee for every Ethereum transaction is permanently destroyed (burned) rather than paid to validators. Validators only receive the 'priority tip'. During periods of high network usage, the ETH burned per day can exceed the new ETH issued as staking rewards, causing the total supply to shrink. This made ETH's monetary policy dynamic rather than strictly inflationary.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "What does a token's 'Fully Diluted Valuation' (FDV) represent, and why is it important when evaluating a new token?",
          options: [
            "Price multiplied by maximum possible supply — it shows the implied market cap if all tokens (including locked/unvested ones) were in circulation today",
            "The total value of all tokens burned since the project launched",
            "The current market cap divided by the number of token holders",
            "The project's revenue multiplied by a sector-standard price-to-earnings multiple",
          ],
          correctIndex: 0,
          explanation:
            "FDV = current price × maximum supply. It matters because tokens listed with low circulating supply can have a small market cap but a huge FDV. As vesting unlocks release more tokens into circulation, significant sell pressure can emerge. A project with a $500M market cap but a $10B FDV means 95% of supply hasn't hit the market yet — a meaningful future dilution risk.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Crypto as Investment
       ================================================================ */
    {
      id: "crypto-fundamentals-4",
      title: "Crypto as Investment",
      description:
        "Portfolio allocation, market cycles, on-chain metrics, risk factors, and the regulatory landscape",
      icon: "TrendingUp",
      xpReward: 95,
      steps: [
        {
          type: "teach",
          title: "Portfolio Allocation and Market Cycles",
          content:
            "Crypto's risk profile is unlike any traditional asset class:\n\n**Historical drawdowns**: Bitcoin has experienced multiple -80%+ drawdowns from peak to trough. Altcoins frequently fall -90% to -95%+ in bear markets. Allocate only what you can afford to see drop dramatically without life-changing consequences.\n\n**The 4-year halving cycle**: Bitcoin's market cycles are broadly correlated with its halving schedule:\n- **Accumulation phase** (~12–18 months post-bear): Price stabilises, volume dries up, smart money quietly accumulates\n- **Bull run** (~12–18 months, typically 12–18 months post-halving): Parabolic price appreciation, rising retail interest, altcoin season\n- **Distribution/top**: Volume spikes, euphoric sentiment, rapid price reversal\n- **Bear market** (12–18 months): Prolonged drawdown, project failures, leverage washed out\n\n**Allocation framework**:\n- Most financial advisors suggest 1–5% of portfolio in crypto for most investors\n- Bitcoin and Ethereum are considered 'blue chips' with deeper liquidity and longer track records\n- Altcoins carry significantly higher risk and should be treated as venture-style bets\n- Dollar-cost averaging (DCA) removes the stress of timing and smooths entry price",
          highlight: [
            "halving cycle",
            "drawdown",
            "accumulation",
            "bull run",
            "bear market",
            "dollar-cost averaging",
          ],
        },
        {
          type: "teach",
          title: "On-Chain Metrics for Investment Decisions",
          content:
            "Because all blockchain transactions are public, investors can analyse network activity in ways impossible with traditional assets:\n\n**Exchange netflow**: Net BTC/ETH moving to or from exchange wallets. Large inflows to exchanges signal selling intent; large outflows to self-custody signal accumulation.\n\n**MVRV Ratio** (Market Value / Realised Value): Compares current market cap to the aggregate cost basis of all coins. MVRV > 3.5 historically signals overvaluation (cycle tops); MVRV < 1 signals undervaluation (cycle bottoms).\n\n**Stock-to-Flow (S2F)**: A model comparing existing supply ('stock') to annual new production ('flow'). Bitcoin's post-halving S2F rivals gold. Used as a long-term price floor model, though debated.\n\n**Active addresses**: Unique addresses transacting daily — a proxy for adoption and network health. Rising active addresses during accumulation phases confirm growing usage.\n\n**Long-term holder (LTH) supply**: BTC held without moving for 155+ days. When LTH supply is high and growing, it signals conviction among experienced holders. LTH distribution (they begin selling) often marks cycle tops.",
          highlight: [
            "exchange netflow",
            "MVRV",
            "stock-to-flow",
            "active addresses",
            "long-term holder",
            "on-chain",
          ],
        },
        {
          type: "teach",
          title: "Risk Factors and the Regulatory Landscape",
          content:
            "Crypto carries unique risks beyond standard market volatility:\n\n**Technical risks**:\n- **Smart contract exploits**: Code vulnerabilities can drain DeFi protocols instantly. Over $3B was stolen in hacks in 2022 alone.\n- **Bridge vulnerabilities**: Cross-chain bridges are frequent hack targets\n- **Key management failure**: Losing a seed phrase = permanent loss of funds\n\n**Structural risks**:\n- **Exchange insolvency**: FTX's 2022 collapse erased billions in customer funds overnight\n- **Stablecoin de-pegs**: Terra/LUNA's algorithmic stablecoin lost its peg in 2022, wiping ~$40B in market value in days\n- **Liquidity risk**: Small-cap altcoins can become impossible to exit during panic\n\n**Regulatory landscape (2024–2025)**:\n- US: SEC classifies most tokens as securities; Bitcoin ETFs approved January 2024; Ethereum ETFs approved May 2024\n- EU: MiCA regulation (Markets in Crypto-Assets) provides a comprehensive framework from 2024\n- Globally: Regulatory clarity is improving but varies enormously by jurisdiction\n- Key takeaway: Regulatory crackdowns can rapidly impact prices and access — maintain awareness of your jurisdiction's rules",
          highlight: [
            "smart contract exploit",
            "exchange insolvency",
            "stablecoin",
            "regulatory",
            "MiCA",
            "Bitcoin ETF",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Bitcoin's MVRV ratio rises above 3.7. Based on historical patterns, what investment signal does this provide?",
          options: [
            "The market is statistically overvalued relative to aggregate cost basis — historically a warning zone near cycle tops where risk management should tighten",
            "The market is undervalued and this is a strong buy signal for maximum allocation",
            "MVRV above 3 indicates exceptional network security and has no pricing implication",
            "The signal is meaningless because on-chain metrics cannot predict future prices",
          ],
          correctIndex: 0,
          explanation:
            "MVRV compares current market cap to the realised value (aggregate cost basis of all coins). When the ratio is very high (>3.5), the 'average' holder is sitting on large unrealised gains and has strong incentive to sell. Historically, MVRV readings above 3.5–4 have coincided with cycle tops in Bitcoin. It is not a precise timer, but it is a useful risk indicator for position sizing.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The approval of spot Bitcoin ETFs by the US SEC in January 2024 was a significant regulatory milestone that allowed traditional investors to gain Bitcoin exposure through standard brokerage accounts without holding cryptocurrency directly.",
          correct: true,
          explanation:
            "The SEC approved multiple spot Bitcoin ETFs (including products from BlackRock, Fidelity, and others) in January 2024, and Ethereum ETFs followed in May 2024. These products allow investors in traditional brokerage accounts to gain crypto price exposure without managing wallets, seed phrases, or exchange accounts. The ETF launches were associated with significant institutional capital inflows and marked a major step in crypto's mainstream financial integration.",
          difficulty: 1,
        },
      ],
    },
  ],
};
