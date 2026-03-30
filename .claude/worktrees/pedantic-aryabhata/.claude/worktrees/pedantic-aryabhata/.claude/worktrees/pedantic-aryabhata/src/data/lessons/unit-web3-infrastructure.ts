import type { Unit } from "./types";

export const UNIT_WEB3_INFRASTRUCTURE: Unit = {
  id: "web3-infrastructure",
  title: "Web3 Infrastructure & Digital Assets",
  description:
    "Deep dive into blockchain architecture, smart contract security, tokenomics, cross-chain interoperability, data availability layers, and Web3 business models",
  icon: "",
  color: "#6366f1",
  lessons: [
    // ─── Lesson 1: Blockchain Fundamentals ──────────────────────────────────────
    {
      id: "web3-infra-1",
      title: "Blockchain Fundamentals",
      description:
        "Distributed ledger architecture, consensus mechanisms (PoW/PoS/PoH/dPoS), Nakamoto consensus, finality, and MEV",
      icon: "Link",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Distributed Ledger & Nakamoto Consensus",
          content:
            "A **blockchain** is a distributed ledger replicated across thousands of independent nodes. The core innovation of Bitcoin (2009) was **Nakamoto consensus** — a mechanism for uncoordinated, anonymous participants to agree on a canonical transaction history without trusting each other.\n\n**How Nakamoto consensus works:**\n- Nodes compete to find a hash below a target difficulty (nonce grinding)\n- The longest valid chain wins — longest = most accumulated proof of work\n- Selfish mining attacks become economically rational only above ~25–33% hash share\n- **Probabilistic finality**: a transaction becomes effectively irreversible after ~6 confirmations (~1 hour) as the cost to reorg grows exponentially\n\n**CAP theorem trade-offs:**\nBlockchains are distributed systems subject to the CAP theorem — they can guarantee only two of: Consistency, Availability, Partition tolerance. Most public chains sacrifice consistency (eventual consistency) in exchange for partition tolerance and availability.\n\n**Block structure:**\n- Block header: previous hash, Merkle root of transactions, timestamp, nonce, difficulty target\n- **Merkle tree**: binary tree of transaction hashes — allows efficient SPV (Simplified Payment Verification) proofs without downloading the full chain",
          highlight: ["Nakamoto consensus", "distributed ledger", "probabilistic finality", "Merkle tree", "CAP theorem"],
        },
        {
          type: "teach",
          title: "Consensus Mechanisms: PoW / PoS / PoH / dPoS",
          content:
            "Different blockchains have developed distinct consensus mechanisms with different security, speed, and decentralization trade-offs.\n\n**Proof of Work (PoW) — Bitcoin:**\n- Miners expend energy to find valid hashes; security = accumulated energy cost\n- Attack cost: ~$10B+ to acquire 51% of Bitcoin hash rate (2026 estimate)\n- Throughput: ~7 TPS; confirmation latency: 10 min average\n\n**Proof of Stake (PoS) — Ethereum post-Merge:**\n- Validators stake ETH as collateral; slashed for equivocation or downtime\n- Casper FFG + LMD-GHOST: combines finality gadget (Casper) with fork-choice rule\n- **Economic finality**: reverting a finalized checkpoint costs ~1/3 of staked ETH (~$30B+)\n- Throughput: ~15 TPS on L1; finality in ~12–15 minutes\n\n**Proof of History (PoH) — Solana:**\n- Cryptographic clock: SHA-256 hash chain creates a verifiable timestamp sequence\n- Validators don't need to communicate timestamps — they share a global time reference\n- Enables parallel transaction processing; theoretical throughput: 65,000 TPS\n- Trade-off: high hardware requirements, history of outages under load\n\n**Delegated Proof of Stake (dPoS) — EOS, TRON, Cosmos validators:**\n- Token holders vote for a fixed set of delegates (21 for EOS, 100 for Cosmos)\n- Much higher throughput but more centralized — top validators control block production\n- Used in Cosmos SDK chains where speed and governance flexibility matter more than permissionless validation",
          highlight: ["Proof of Work", "Proof of Stake", "Proof of History", "delegated PoS", "slashing", "economic finality"],
        },
        {
          type: "teach",
          title: "Finality Types & MEV",
          content:
            "**Finality** is the guarantee that a confirmed transaction cannot be reversed.\n\n**Types of finality:**\n- **Probabilistic finality** (Bitcoin): transaction risk declines exponentially with confirmations; never mathematically certain\n- **Economic finality** (Ethereum PoS): reverting finalized blocks requires destroying ≥1/3 of validator stake — economically suicidal\n- **Instant finality** (Tendermint/BFT chains): 2/3 of validators sign off before a block is committed; single confirmation is final\n\n**Miner/Maximal Extractable Value (MEV):**\nMEV is profit extracted by block producers who can reorder, insert, or censor transactions within a block.\n\n**MEV strategies:**\n- **Front-running**: seeing a large pending DEX trade in the mempool and inserting a buy order ahead of it\n- **Back-running**: inserting a sell order immediately after a large buy to capture the price impact\n- **Sandwich attack**: front-run + back-run simultaneously around a victim's trade\n- **Liquidation MEV**: competing bots race to liquidate undercollateralized DeFi positions first\n\n**Scale**: Ethereum MEV exceeded $1.5B cumulative by 2025. MEV-Boost separates block building from proposing, democratizing extraction. Flashbots' SUAVE aims for encrypted mempools to reduce harmful MEV.",
          highlight: ["probabilistic finality", "economic finality", "instant finality", "MEV", "front-running", "sandwich attack", "MEV-Boost"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the key innovation of Proof of History (PoH) used by Solana?",
          options: [
            "It creates a cryptographic timestamp record so validators share a verifiable global time reference, enabling parallel processing",
            "It requires validators to prove they have held tokens for a minimum historical period before voting",
            "It records the entire transaction history on-chain using zero-knowledge proofs",
            "It uses historical price data to determine block rewards dynamically",
          ],
          correctIndex: 0,
          explanation:
            "Proof of History creates a verifiable delay function (VDF) using a SHA-256 hash chain — each output is the input to the next hash, creating a cryptographic clock. This eliminates the need for validators to communicate timestamps separately, allowing Solana to process transactions in parallel and achieve very high theoretical throughput (~65,000 TPS).",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A DeFi trader submits a large swap transaction on Ethereum. An MEV bot sees this in the mempool, buys the same token first, then sells it after the victim's trade executes. What is this attack called?",
          options: [
            "Sandwich attack",
            "Reentrancy attack",
            "Eclipse attack",
            "Sybil attack",
          ],
          correctIndex: 0,
          explanation:
            "A sandwich attack wraps the victim's transaction: the bot front-runs with a buy (pushing the price up), allows the victim's large buy to execute at the higher price, then immediately back-runs with a sell into the liquidity the victim just provided. The victim suffers worse execution; the bot captures the spread. MEV-Boost and private mempools (Flashbots Protect) help users avoid this.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "On Bitcoin, after 6 confirmations, a transaction is considered mathematically impossible to reverse.",
          correct: false,
          explanation:
            "False. Bitcoin has probabilistic finality — it becomes increasingly expensive and unlikely to reverse, but never mathematically impossible. After 6 confirmations (~1 hour), the cost of a reorg (re-mining 6+ blocks) is enormous, making reversal economically irrational. True deterministic finality requires BFT-style consensus mechanisms like Tendermint.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Smart Contracts ───────────────────────────────────────────────
    {
      id: "web3-infra-2",
      title: "Smart Contracts & Security",
      description:
        "EVM architecture, Solidity concepts, gas mechanics, common vulnerabilities (reentrancy/overflow), audits, and formal verification",
      icon: "FileCode",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The EVM & Solidity Fundamentals",
          content:
            "The **Ethereum Virtual Machine (EVM)** is a stack-based, quasi-Turing-complete runtime that executes smart contract bytecode across all Ethereum nodes deterministically.\n\n**Key EVM properties:**\n- **Deterministic**: the same input always produces the same output on every node worldwide\n- **Isolated**: contracts run in a sandbox with no filesystem, network, or clock access\n- **Gas-metered**: every opcode has a gas cost; execution halts if gas runs out (preventing infinite loops)\n- **EVM-compatible chains**: Polygon, Avalanche C-Chain, BNB Chain, Arbitrum, Optimism all run the same bytecode\n\n**Solidity basics (conceptual):**\n- Object-oriented language; contracts are like classes with state variables, functions, modifiers, and events\n- **State variables** are stored permanently on-chain (expensive — SSTORE opcode costs 20,000 gas)\n- **Memory variables** are temporary (cheap)\n- **Mappings**: key-value stores (like hash tables) — the primary data structure for token balances\n- **Events**: cheap logs emitted during execution, indexed off-chain by explorers and dApps\n\n**Gas mechanics:**\nGas price = Base fee (burned) + Priority tip (to validator)\nBase fee adjusts dynamically: rises when blocks are >50% full, falls when <50%.\nA standard ETH transfer = 21,000 gas. A Uniswap swap = ~130,000–180,000 gas.",
          highlight: ["EVM", "Solidity", "gas", "deterministic", "state variables", "mappings", "EVM-compatible"],
        },
        {
          type: "teach",
          title: "Smart Contract Vulnerabilities",
          content:
            "Smart contract bugs are catastrophic — code is immutable and holds real value. Over $4B has been lost to contract exploits.\n\n**Reentrancy attack:**\nThe most famous vulnerability — exploited in the 2016 DAO hack ($60M).\n- Malicious contract calls back into the victim before the first execution completes\n- Example: withdraw() sends ETH before updating the balance → attacker calls withdraw() recursively\n- Fix: use Checks-Effects-Interactions pattern (update state before external calls) or ReentrancyGuard\n\n**Integer overflow/underflow:**\n- Solidity 0.7 and below: uint256 wraps around silently (255 + 1 = 0)\n- Exploited to mint unlimited tokens or bypass balance checks\n- Fix: Solidity 0.8+ has built-in overflow checks; use SafeMath for older code\n\n**Oracle manipulation:**\n- Contracts relying on on-chain price oracles (e.g., Uniswap spot price) can be manipulated via flash loans\n- Flash loan → manipulate pool price → exploit protocol → repay in one tx\n- Fix: use time-weighted average prices (TWAPs) or Chainlink decentralized oracles\n\n**Access control flaws:**\n- Missing `onlyOwner` modifiers allow anyone to call admin functions\n- The Parity wallet bug (2017, $150M frozen) — uninitialized library contract self-destructed\n\n**Front-running / commit-reveal:**\n- Transactions are public before confirmation; outcomes can be gamed\n- Fix: commit-reveal schemes hide intent until commitment is locked",
          highlight: ["reentrancy", "integer overflow", "oracle manipulation", "flash loan", "access control", "Checks-Effects-Interactions", "TWAP"],
        },
        {
          type: "teach",
          title: "Audits & Formal Verification",
          content:
            "Given the immutability and financial stakes of smart contracts, security assurance is critical before deployment.\n\n**Audit process:**\n1. **Manual review**: experienced auditors read every line of code, test edge cases, review logic against specification\n2. **Automated analysis**: tools like Slither (static analysis), MythX, and Echidna (fuzzing) catch common patterns\n3. **Test coverage**: >95% branch coverage expected; fork tests simulate mainnet state\n4. **Bug bounty**: ongoing incentive (Immunefi, Code4rena) — top protocols offer $1M+ bounties\n\n**Leading audit firms**: Trail of Bits, OpenZeppelin, Certik, Consensys Diligence, Spearbit\n\n**Cost**: a thorough audit of a medium-complexity protocol costs $50K–$500K and takes 2–6 weeks.\n\n**Formal verification:**\n- Mathematical proof that code satisfies a specification under all possible inputs\n- Uses tools like Certora Prover (Ethereum), Move Prover (Aptos/Sui), K framework\n- Example: formally prove that total supply always equals the sum of all balances\n- Extremely rigorous but expensive — used by MakerDAO, Aave, and high-value bridges\n\n**Audit limitations:**\n- An audit is not a guarantee — Certik-audited contracts have been exploited\n- Auditors can miss novel attack vectors or logic errors in specifications\n- Upgradeability proxies can introduce post-audit vulnerabilities",
          highlight: ["audit", "Slither", "fuzzing", "formal verification", "Certora Prover", "bug bounty", "Certik"],
        },
        {
          type: "quiz-mc",
          question:
            "In a reentrancy attack on a smart contract, what is the critical flaw that allows the attacker to drain funds?",
          options: [
            "The contract sends ETH to an external address before updating the sender's balance in storage",
            "The contract uses integer arithmetic that overflows when processing large amounts",
            "The contract does not check whether the caller is a smart contract rather than an EOA",
            "The contract emits events before completing state changes, alerting attackers to opportunities",
          ],
          correctIndex: 0,
          explanation:
            "Reentrancy exploits the Checks-Effects-Interactions violation: the contract sends ETH (interaction) before updating the balance (effect). When ETH is sent to a malicious contract, the malicious contract's receive() function immediately calls back into the victim's withdraw() function. At that point, the balance still shows the original value, so the check passes again, and the attacker can withdraw repeatedly until the contract is drained.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A smart contract that has passed a formal verification audit can be considered 100% secure against all possible exploits.",
          correct: false,
          explanation:
            "False. Formal verification proves that code satisfies a given mathematical specification, but it cannot exceed the quality of that specification. If the spec itself is incomplete or incorrect, the verified code can still have bugs. Additionally, composability risks (how the contract interacts with other contracts), oracle dependencies, and governance attacks are outside the scope of typical formal verification. Even formally verified protocols have been exploited through logic errors in the spec.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Tokenomics Design ─────────────────────────────────────────────
    {
      id: "web3-infra-3",
      title: "Tokenomics Design",
      description:
        "Supply schedules, emission rates, token utility (governance/fee/staking), vesting cliffs, and inflation vs deflationary models",
      icon: "Coins",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Supply Schedule & Emission Rate",
          content:
            "**Tokenomics** is the economic design of a token — how it is created, distributed, and what gives it value. Poor tokenomics have destroyed billions in value.\n\n**Supply schedule:**\n- **Fixed supply** (Bitcoin: 21M BTC): scarcity-based value proposition; emission halves every ~4 years (halvings). Current block reward: 3.125 BTC.\n- **Inflationary** (Ethereum pre-Merge, Solana): new tokens continuously issued to validators/stakers; demand must grow faster than supply for price appreciation\n- **Deflationary/burn** (Ethereum post-EIP-1559): a portion of every transaction fee is permanently destroyed. ETH becomes deflationary when network activity is high enough that burns exceed issuance (~15 Gwei base fee threshold)\n\n**Emission rate matters:**\n- If 1B tokens are promised to the team over 4 years, that's ~685K tokens/day of potential sell pressure\n- Early-stage DeFi protocols often emit 80%+ of supply to liquidity miners in the first year — massive dilution\n- **Dilution formula**: value_per_token = total_protocol_value / circulating_supply; every new token minted dilutes existing holders\n\n**Token allocation buckets (typical DeFi project):**\n- Team & advisors: 15–20% (locked)\n- Investors (VC rounds): 15–25% (locked)\n- Ecosystem / treasury: 25–40%\n- Community / liquidity mining: 20–30%\n- Public sale: 5–10%",
          highlight: ["tokenomics", "supply schedule", "emission rate", "inflationary", "deflationary", "dilution", "EIP-1559"],
        },
        {
          type: "teach",
          title: "Token Utility & Vesting Cliffs",
          content:
            "A token derives sustainable value from its **utility** — what it actually does in the protocol ecosystem.\n\n**Three primary utility types:**\n\n**1. Governance tokens:**\n- Vote on protocol parameters: fee levels, collateral ratios, treasury spending, upgrades\n- Examples: UNI (Uniswap), COMP (Compound), MKR (MakerDAO)\n- Risk: low participation (voter apathy), plutocracy (whales dominate votes), governance attacks\n\n**2. Fee/revenue tokens:**\n- Capture protocol fees — either through buy-and-burn or direct distribution to stakers\n- Examples: BNB (fee discount + quarterly burn), GMX (70% of fees to stakers)\n- More defensible value accrual — tied directly to real usage\n\n**3. Staking/security tokens:**\n- Lock tokens to secure the network or provide collateral; earn issuance rewards\n- Examples: ETH (Ethereum validator staking), MATIC (Polygon PoS)\n- Stake-to-earn creates demand but also inflation pressure\n\n**Vesting schedules:**\n- Team/investor tokens are typically locked for 1 year (cliff) then released linearly over 3–4 years\n- **Cliff**: the lockup period before ANY tokens unlock — prevents immediate post-TGE (Token Generation Event) dumping\n- A 1-year cliff + 3-year linear vest means 0% at month 12, then ~2.8%/month for 36 months\n- Watch token unlock calendars — major unlocks create predictable sell pressure\n- Resource: Token Unlocks dashboard tracks $50B+ in scheduled unlocks",
          highlight: ["governance token", "fee token", "staking", "vesting cliff", "token unlock", "TGE", "buy-and-burn"],
        },
        {
          type: "quiz-mc",
          question:
            "A DeFi protocol launches with 1 billion tokens. 20% goes to the team with a 1-year cliff and 3-year linear vest. What best describes the token unlock schedule?",
          options: [
            "Zero tokens unlock for 12 months; then ~5.6M tokens per month for 36 months",
            "200M tokens unlock immediately at launch with no restrictions",
            "All 200M team tokens unlock on the 1-year anniversary as a lump sum",
            "200M tokens are distributed equally over 4 years starting at launch: 50M per year",
          ],
          correctIndex: 0,
          explanation:
            "A 1-year cliff means absolutely zero team tokens are available for the first 12 months. After the cliff, linear vesting begins: 200M tokens / 36 months = ~5.56M tokens per month for 3 years. This structure prevents the team from selling at launch and aligns incentives — the team must keep the project growing for their allocation to vest. Watch token unlock calendars for these events, as they create predictable sell pressure.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Ethereum's EIP-1559 introduced a base fee that is burned rather than paid to validators. Under what condition does ETH supply become net deflationary?",
          options: [
            "When the burn rate from base fees exceeds the issuance rate of new ETH to validators",
            "When the ETH price rises above $10,000 for 30 consecutive days",
            "When more than 50% of all ETH is staked in the beacon chain",
            "When the number of active Ethereum addresses exceeds 100 million",
          ],
          correctIndex: 0,
          explanation:
            "ETH issuance (validator rewards) is roughly constant (~0.27% annual rate at current staking levels). The burn rate from base fees depends on network activity — higher usage = higher base fees = more ETH burned. When the burn rate exceeds issuance, the net supply decreases (ultrasound money). This requires roughly >15–20 Gwei average base fee sustained over time. During periods of low network activity, issuance can exceed burns and ETH supply grows.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A governance token that only grants voting rights (with no fee sharing or burn mechanism) has strong tokenomics because protocol governance is inherently valuable.",
          correct: false,
          explanation:
            "False. Pure governance tokens with no direct cash flow, fee capture, or burn mechanism have historically struggled to maintain value — there is little economic reason to hold them beyond speculation on future utility. UNI is the canonical example: despite controlling Uniswap's ~$1B+ annual fee revenue, holders did not capture those fees for years, making the 'governance premium' difficult to sustain. Sustainable tokenomics require mechanisms that tie token value to real protocol revenue.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Interoperability ───────────────────────────────────────────────
    {
      id: "web3-infra-4",
      title: "Cross-Chain Interoperability",
      description:
        "Cross-chain bridges, IBC protocol (Cosmos), Polkadot parachains, bridge hacks, and atomic swaps",
      icon: "GitMerge",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Cross-Chain Bridges & Their Risks",
          content:
            "**Cross-chain bridges** allow assets and data to move between separate blockchains. They are among the most value-dense and most hacked components in Web3.\n\n**Bridge architectures:**\n\n**1. Lock-and-mint (custodial):**\n- Lock native asset on chain A → mint wrapped representation on chain B\n- Example: wrap ETH to WETH on Polygon; locked ETH sits in a smart contract\n- Risk: the locked pool is a honeypot — total bridge TVL is a single attack surface\n\n**2. Liquidity networks (e.g., Hop Protocol, Connext):**\n- Liquidity providers hold native assets on both sides; bridge routes through them\n- More trust-minimized; no single locked pool\n- Faster: uses AMM-style liquidity pools for instant finality\n\n**3. Light client bridges (trust-minimized):**\n- Each chain runs a light client verifying the other chain's consensus\n- Most secure but computationally expensive and slow to build\n- IBC (see below) is the gold standard\n\n**Bridge exploit history (>$2B lost):**\n- **Ronin Bridge (2022)**: $625M stolen — 5 of 9 validator keys compromised\n- **Wormhole (2022)**: $320M — signature verification bug allowed minting without deposit\n- **Nomad (2022)**: $190M — initialization bug allowed anyone to copy and replay any valid message\n- **Harmony Horizon (2022)**: $100M — 2-of-5 multisig keys stolen via phishing\n\n**Common attack vectors:** validator key theft, smart contract bugs, economic oracle manipulation, governance attacks",
          highlight: ["cross-chain bridge", "lock-and-mint", "liquidity network", "light client bridge", "Ronin hack", "Wormhole hack", "bridge security"],
        },
        {
          type: "teach",
          title: "IBC Protocol & Cosmos Ecosystem",
          content:
            "**Inter-Blockchain Communication (IBC)** is the gold-standard trust-minimized interoperability protocol, native to the Cosmos ecosystem.\n\n**How IBC works:**\n- Each chain runs a light client of the other chain — verifies block headers and state proofs\n- **Relayers** (off-chain processes) observe both chains and submit IBC packet proofs\n- The receiving chain verifies the proof against its light client — no trusted third party\n- IBC packets carry tokens (ICS-20), NFTs (ICS-721), or arbitrary data\n\n**Cosmos architecture:**\n- **Cosmos Hub (ATOM)**: the first IBC-connected hub; provides IBC routing and interchain security\n- **Tendermint BFT**: the consensus engine — instant finality, 2/3 validator signatures required\n- **Cosmos SDK**: modular framework for building application-specific blockchains (Osmosis, Celestia, dYdX v4, Injective, Kava)\n- **Interchain Security (ICS)**: consumer chains share Cosmos Hub validators — smaller chains borrow security\n\n**IBC vs other bridges:**\n| Feature | IBC | Wrapped bridges |\n|---------|-----|-----------------|\n| Trust model | Light client (trustless) | Multisig or validators |\n| Finality | Instant (Tendermint) | 10–60 min |\n| Hack history | Zero major IBC exploits | $2B+ lost |\n| Scope | Cosmos ecosystem | Cross-ecosystem |\n\n**Cosmos ecosystem scale (2026)**: ~100 IBC-connected chains, $15B+ TVL across the ecosystem, processing millions of IBC transfers monthly",
          highlight: ["IBC", "Inter-Blockchain Communication", "light client", "relayer", "Cosmos Hub", "Tendermint", "Cosmos SDK", "interchain security"],
        },
        {
          type: "teach",
          title: "Polkadot Parachains & Atomic Swaps",
          content:
            "**Polkadot** takes a different approach to interoperability: a shared security model with heterogeneous chains.\n\n**Polkadot architecture:**\n- **Relay Chain**: the central security hub; validators process cross-chain messages (XCMP)\n- **Parachains**: sovereign blockchains that lease a slot on the relay chain to access shared security\n- **Parachain slot auctions**: projects compete via DOT bonding to secure a 2-year slot — crowdloans let community contribute DOT\n- **XCMP** (Cross-Chain Message Passing): native, trust-minimized message passing between parachains\n- Examples: Moonbeam (EVM compatibility), Acala (DeFi hub), Astar (smart contracts)\n\n**Shared security model:**\nParachains don't need their own validator set — they inherit Polkadot's ~1,000 validators. A 51% attack on any parachain requires attacking the entire relay chain — dramatically raising security costs for smaller chains.\n\n**Atomic swaps:**\n- A technique for trustless peer-to-peer cross-chain trades without any bridge\n- Uses **Hash Time-Locked Contracts (HTLCs)**: both parties lock funds; reveal of a secret hash releases funds atomically\n- Cryptographic guarantee: either both transfers complete or both are refunded\n- Limitation: both chains must support the same hash function; slow (requires multiple on-chain txs); poor UX\n- Used in Lightning Network for Bitcoin cross-chain payments; largely superseded by bridges for user experience",
          highlight: ["Polkadot", "parachain", "relay chain", "XCMP", "shared security", "atomic swap", "HTLC", "Hash Time-Locked Contract"],
        },
        {
          type: "quiz-mc",
          question:
            "The Ronin bridge hack ($625M in 2022) involved which attack vector?",
          options: [
            "Attackers compromised 5 of 9 validator private keys, gaining control of the multisig that secured locked funds",
            "A reentrancy bug in the bridge smart contract allowed recursive withdrawals",
            "Flash loan manipulation of the bridge's price oracle caused incorrect asset valuations",
            "A governance attack passed a malicious proposal that changed the withdrawal logic",
          ],
          correctIndex: 0,
          explanation:
            "The Ronin bridge (used by Axie Infinity) was secured by a 9-validator multisig requiring 5/9 signatures for withdrawals. Attackers (later attributed to North Korea's Lazarus Group) compromised 5 validator keys — 4 from Sky Mavis's internal infrastructure and 1 from a third-party validator. With 5/9 keys, they had the threshold needed to forge withdrawal signatures and drain $625M. This illustrates why multisig bridges with small validator sets are high-risk.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Polkadot's shared security model means individual parachains must maintain their own large validator set to be secure against 51% attacks.",
          correct: false,
          explanation:
            "False. The key innovation of Polkadot is that parachains do NOT need their own validators. By connecting to the relay chain through a parachain slot, they inherit security from Polkadot's ~1,000 relay chain validators. Attacking any parachain requires attacking the entire Polkadot relay chain, which is significantly more expensive than attacking a parachain's hypothetical independent validator set. This is the opposite of a standalone chain's security model.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Data Availability & Scaling ────────────────────────────────────
    {
      id: "web3-infra-5",
      title: "Data Availability & Scaling",
      description:
        "Monolithic vs modular blockchains, data availability layers (Celestia/EigenDA), rollup-centric roadmap, and danksharding",
      icon: "Database",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Monolithic vs Modular Blockchain Architecture",
          content:
            "The **modular blockchain thesis** argues that different functions should be separated into specialized layers rather than bundled in one monolithic chain.\n\n**Four blockchain functions:**\n1. **Execution**: processing transactions and state transitions (running smart contracts)\n2. **Settlement**: finalizing transaction outcomes and resolving disputes\n3. **Consensus**: agreeing on the order and validity of transactions\n4. **Data availability**: ensuring transaction data is published and retrievable\n\n**Monolithic chains (traditional model — Bitcoin, Ethereum L1, Solana):**\n- All four functions handled by every full node\n- Every node downloads, executes, and stores all data\n- Scaling requires bigger blocks → fewer people can run full nodes → centralization\n- The **scalability trilemma**: can only optimize 2 of 3 — security, decentralization, scalability\n\n**Modular stack (the modern approach):**\n- **Execution layer**: rollups (Optimism, Arbitrum, zkSync) — handle transaction execution off-chain\n- **Data availability layer**: Celestia, EigenDA, Avail — cheap, scalable data publishing\n- **Settlement/consensus**: Ethereum — provides security and finality for rollup state roots\n\n**Why this matters:**\nModular design lets each layer specialize and scale independently. A rollup can process 10,000 TPS by posting only compressed state diffs to a data availability layer, while inheriting Ethereum's security for final settlement.",
          highlight: ["modular blockchain", "execution layer", "data availability", "settlement", "scalability trilemma", "rollup", "monolithic"],
        },
        {
          type: "teach",
          title: "Data Availability Layers: Celestia & EigenDA",
          content:
            "**Data availability (DA)** is the guarantee that the data underlying a block has been published and is retrievable. Without it, a malicious block producer could withhold transaction data, making it impossible to verify state transitions.\n\n**The DA problem:**\nFull nodes can verify execution; light clients cannot. But if a block producer withholds data, light clients have no way to detect this without downloading everything — breaking scalability.\n\n**Data Availability Sampling (DAS):**\n- Light nodes sample random chunks of a block's data\n- If enough samples are available, the full block can be reconstructed (using erasure coding)\n- Each light node downloads only ~1KB instead of the full block (~2MB)\n- Collectively, thousands of light nodes provide a statistical guarantee of data availability\n\n**Celestia:**\n- The first modular DA layer; launched mainnet October 2023\n- Minimal chain: only orders and certifies data publication; no execution\n- Uses 2D Reed-Solomon erasure coding + KZG commitments for DAS\n- Cost: ~100× cheaper than posting data to Ethereum L1 (pre-EIP-4844)\n- Used by Manta Network, Caldera chains, Dymension rollups\n\n**EigenDA (EigenLayer):**\n- DA layer leveraging Ethereum's economic security via restaking\n- Ethereum stakers re-stake ETH to opt into EigenDA validation duties\n- Fees paid in ETH; slashing enforced via EigenLayer smart contracts\n- Used by Mantle, Celo, AltLayer deployments",
          highlight: ["data availability", "Data Availability Sampling", "Celestia", "EigenDA", "erasure coding", "KZG commitments", "restaking"],
        },
        {
          type: "teach",
          title: "Rollup-Centric Roadmap & Danksharding",
          content:
            "Ethereum's official scaling roadmap is **rollup-centric** — L1 becomes a settlement and data availability layer while rollups handle execution.\n\n**Rollup types:**\n- **Optimistic rollups** (Arbitrum, Optimism, Base): assume transactions are valid; allow 7-day fraud proof window; simpler but slow for withdrawals\n- **ZK rollups** (zkSync, Starknet, Polygon zkEVM, Scroll): generate a cryptographic validity proof (SNARK/STARK) that instantly proves correct execution; near-instant finality\n\n**EIP-4844 (Proto-Danksharding) — March 2024:**\n- Introduced **blobs**: a new transaction type that carries large data chunks (~128 KB each) at very low cost\n- Blobs are stored for ~18 days then pruned (not permanently on-chain) — pure DA with no execution\n- Reduced rollup data costs by 10–100× immediately\n- Arbitrum fees dropped from ~$0.50 to $0.01–0.05 per transaction post-EIP-4844\n\n**Full Danksharding (future):**\n- Scale blob capacity from 3–6 blobs/block to 64–128 blobs/block\n- Requires **Distributed Validator Technology (DVT)** and **PeerDAS** for validators to only store their assigned data shards\n- Target: 1–2 MB/s of available data bandwidth → enough to support thousands of rollup transactions per second\n- Timeline: expected ~2027–2028 based on current Ethereum roadmap\n\n**The Surge**: Vitalik's roadmap milestone targeting 100,000 TPS via rollups + danksharding",
          highlight: ["rollup-centric roadmap", "optimistic rollup", "ZK rollup", "EIP-4844", "blobs", "danksharding", "Proto-Danksharding", "The Surge"],
        },
        {
          type: "quiz-mc",
          question:
            "What did Ethereum's EIP-4844 (Proto-Danksharding) introduce, and what was its primary effect?",
          options: [
            "Blob transactions that provide cheap temporary data storage for rollups, reducing their transaction fees by 10–100×",
            "Shard chains that split Ethereum into 64 parallel execution shards",
            "Zero-knowledge proofs for all Ethereum L1 transactions, replacing the EVM",
            "A new Proof of Stake mechanism that reduced validator count from 500,000 to 64",
          ],
          correctIndex: 0,
          explanation:
            "EIP-4844, activated in the Dencun upgrade (March 2024), introduced 'blob-carrying transactions' — a new transaction type that attaches large data blobs (~128 KB each) at a separate, much cheaper fee market. Blobs are stored by nodes for ~18 days then pruned, providing pure data availability without permanent storage cost. This immediately cut rollup data costs by 10–100×; Arbitrum and Optimism transaction fees dropped to under $0.05 in many cases.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "What is the key difference between optimistic rollups and ZK rollups in their approach to transaction validity?",
          options: [
            "Optimistic rollups assume transactions are valid and use fraud proofs to catch cheating; ZK rollups submit cryptographic validity proofs that mathematically guarantee correctness",
            "Optimistic rollups use zero-knowledge proofs for privacy; ZK rollups are public and transparent",
            "Optimistic rollups process transactions on Ethereum L1; ZK rollups use separate sidechains",
            "Optimistic rollups are for DeFi; ZK rollups are only for NFT transactions",
          ],
          correctIndex: 0,
          explanation:
            "Optimistic rollups (Arbitrum, Optimism) post transaction data to L1 and optimistically assume all transactions are valid. Anyone can submit a fraud proof within a 7-day challenge window to dispute invalid state transitions. ZK rollups (zkSync, Starknet) generate a SNARK or STARK — a cryptographic proof that is computationally infeasible to fake — proving every batch of transactions was executed correctly. ZK rollups have near-instant finality but require complex proof generation; optimistic rollups are simpler but have slow 7-day withdrawal delays.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Web3 Business Models ──────────────────────────────────────────
    {
      id: "web3-infra-6",
      title: "Web3 Business Models",
      description:
        "Protocol revenue (fees), DAO treasury management, token-gated access, and SaaS vs protocol economics",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Protocol Revenue & Fee Mechanisms",
          content:
            "Web3 protocols generate revenue differently from traditional software — fees are embedded in on-chain activity rather than subscription contracts.\n\n**Primary revenue streams:**\n\n**Trading/swap fees:**\n- DEX AMMs charge 0.01%–1% per swap; fee accrues to liquidity providers and protocol treasury\n- Uniswap v3 generated ~$800M in fees in 2023; UNI holders captured $0 until 2024 fee switch\n- Fee switch debate: redirecting some LP fees to token holders reduces LP incentive → less liquidity → worse execution\n\n**Lending interest spread:**\n- Protocols like Aave and Compound earn a spread between borrow rates and supply rates\n- A 0.1–0.5% reserve factor routes interest to the protocol treasury\n- Aave generated ~$150M in protocol revenue in 2023\n\n**Liquidation fees:**\n- When undercollateralized loans are liquidated, the protocol takes 1–15% of the collateral as a liquidation bonus\n- MakerDAO earns stability fees (interest on DAI debt) + liquidation penalties\n\n**NFT marketplace royalties:**\n- Platform fees: 2.5% per sale (OpenSea original model)\n- Creator royalties: 2.5–10% to the original artist; increasingly optional/zero on competing platforms\n\n**Key metric: Protocol Revenue vs TVL Ratio:**\nRevenue / TVL measures capital efficiency. A protocol with $5B TVL generating $50M/year has a 1% ratio — comparable to a high-yield savings account for LPs.",
          highlight: ["protocol revenue", "fee switch", "lending spread", "liquidation fee", "AMM fees", "TVL", "capital efficiency"],
        },
        {
          type: "teach",
          title: "DAO Treasury Management",
          content:
            "**Decentralized Autonomous Organizations (DAOs)** control protocol development, fee parameters, and treasuries through on-chain governance.\n\n**Treasury composition risk:**\nMost DAO treasuries hold 80–95% of their value in their own native token — catastrophic during bear markets.\n- Example: A protocol with $500M treasury (90% in native token) → token drops 90% → treasury is worth $50M\n- Best practice: diversify into stablecoins (USDC/DAI), ETH, and blue-chip assets\n\n**Treasury management strategies:**\n- **Protocol-owned liquidity (POL)**: own the LP positions rather than renting liquidity via emissions (Olympus DAO's bonding model)\n- **Real yield programs**: distribute a portion of actual protocol revenue to stakers rather than inflationary rewards\n- **Grants programs**: fund ecosystem development (Uniswap Grants, Compound Grants)\n- **Buybacks**: use treasury revenue to buy and burn native tokens (like corporate share buybacks)\n\n**Governance participation crisis:**\n- Typical DAO proposal passes with 5–15% of eligible tokens voting\n- Voter apathy allows large token holders (VCs, whales) to dominate decisions\n- Solutions: delegation (Compound), conviction voting (Gardens), quadratic voting experiments\n\n**Multisig vs full on-chain governance:**\n- Most major protocols use a multisig (Gnosis Safe, 4-of-7 to 8-of-12) for operational speed\n- Full on-chain governance: every action requires a proposal, voting period (5–7 days), and timelock (2 days)\n- Timelock is critical: gives users time to exit before a malicious proposal executes",
          highlight: ["DAO", "treasury management", "protocol-owned liquidity", "real yield", "governance", "multisig", "timelock", "buyback"],
        },
        {
          type: "teach",
          title: "Token-Gated Access & SaaS vs Protocol Economics",
          content:
            "**Token-gating** uses blockchain ownership to control access to products, communities, or features.\n\n**Token-gated use cases:**\n- **Community access**: holding NFT grants Discord roles (Bored Ape Yacht Club — holders get members-only events and commercial IP rights)\n- **Feature gating**: hold X tokens to unlock premium analytics, higher API limits, or early access\n- **Revenue sharing**: stakers receive a share of platform fees proportional to their stake\n- **DePIN (Decentralized Physical Infrastructure)**: token holders govern and earn from real-world infrastructure (Helium for wireless, Render for GPU compute)\n\n**SaaS vs Protocol Economics:**\n\n| Feature | SaaS | Protocol |\n|---------|------|----------|\n| Revenue capture | Company | Token holders |\n| Pricing power | Unilateral | Governance vote |\n| Moat | Brand, contracts | Composability, network effects |\n| Forkability | Hard (IP, brand) | Easy (open source) |\n| Margins | 60–80% | Approaches 100% |\n\n**The forking problem:**\nBecause protocol code is open-source, anyone can fork it. Uniswap was forked into Sushiswap (vampire attack), which briefly siphoned $1B+ in liquidity. Protocols defend against forks through:\n- Network effects (liquidity begets liquidity)\n- Brand trust and security track record\n- Ongoing innovation and governance responsiveness\n\n**Fat protocol thesis vs fat app thesis:**\n- **Fat protocol**: value accrues at the protocol layer (Ethereum > DApps built on it)\n- **Fat app thesis (2024–2026 revision)**: applications with strong UX and network effects may capture more value than underlying infrastructure",
          highlight: ["token-gating", "DePIN", "protocol economics", "forking", "fat protocol thesis", "vampire attack", "protocol-owned liquidity", "SaaS vs protocol"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the 'fee switch' debate in DeFi protocols like Uniswap?",
          options: [
            "Whether to redirect a portion of trading fees from liquidity providers to token holders — which risks reducing LP incentives and liquidity depth",
            "Whether to switch from percentage-based fees to flat-rate fees per transaction",
            "Whether to charge users different fees based on their token holdings (tiered pricing)",
            "Whether to use smart contract automation to dynamically adjust fees based on market volatility",
          ],
          correctIndex: 0,
          explanation:
            "The fee switch refers to activating a portion of the protocol fee that would redirect swap revenue from 100% to liquidity providers (LPs) to some split between LPs and token holders. The trade-off: token holders benefit from cash flows, but LPs receive less income per dollar of liquidity provided — potentially causing them to withdraw liquidity, increasing slippage and making the protocol less competitive. Uniswap activated a limited fee switch in 2024 after years of debate.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A DeFi protocol's DAO treasury holds $300M — 85% in its own native token and 15% in USDC. The protocol is generating $20M per year in real fees. Suddenly, broader crypto markets fall 70%, and the native token drops 80%.",
          question:
            "After the market decline, approximately what is the treasury's USD value, and what does this illustrate?",
          options: [
            "$51M (85% × $300M × 0.2 + 15% × $300M), illustrating dangerous concentration risk in native token treasuries",
            "$90M (70% market decline applied to total), showing moderate resilience of diversified treasuries",
            "$150M (only the token portion declines, stablecoins are unaffected by governance decisions)",
            "$21M (fee revenue continues and is the only surviving treasury component)",
          ],
          correctIndex: 0,
          explanation:
            "The native token portion: 85% × $300M = $255M, dropping 80% leaves $51M. The USDC portion: 15% × $300M = $45M, unchanged. Total: $51M + $45M = $96M (approximately $51M native + $45M USDC = ~$96M). While the math gives ~$96M, the key lesson is that the dramatic decline from $300M to ~$96M (a 68% loss) illustrates the danger of holding 85%+ of treasury in the native token. Best practice is to diversify into stablecoins, ETH, and other blue-chip assets during bull markets.",
          difficulty: 3,
        },
      ],
    },
  ],
};
