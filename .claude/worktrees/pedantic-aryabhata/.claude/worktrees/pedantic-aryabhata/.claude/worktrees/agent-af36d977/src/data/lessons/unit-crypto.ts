import type { Unit } from "./types";

export const UNIT_CRYPTO: Unit = {
  id: "crypto",
  title: "Cryptocurrency & Digital Assets",
  description:
    "Bitcoin, Ethereum, DeFi, stablecoins, crypto trading mechanics, and portfolio allocation",
  icon: "Bitcoin",
  color: "#f97316",
  lessons: [
    /* ================================================================
       LESSON 1 — Bitcoin Fundamentals
       ================================================================ */
    {
      id: "crypto-bitcoin",
      title: "Bitcoin Fundamentals",
      description: "Proof of work, the halving cycle, scarcity model, and monetary properties",
      icon: "Coins",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "What Bitcoin Is and Why It Exists",
          content:
            "Bitcoin was created in 2008 by the pseudonymous Satoshi Nakamoto, launching in January 2009. The genesis block contained a reference to a bank bailout headline, signaling its ideological foundation: **a decentralized monetary system with no central authority**.\n\nBitcoin solves the **double-spend problem** for digital assets without requiring a trusted third party (bank). Before Bitcoin, digital files could be copied infinitely -- preventing this for digital money required either a central ledger or a cryptographic solution. Bitcoin uses the latter.\n\n**Core properties Bitcoin aims to provide**:\n- **Decentralized**: No single entity controls issuance or transactions\n- **Fixed supply**: Exactly 21 million BTC will ever exist\n- **Permissionless**: Anyone can send and receive without approval\n- **Censorship-resistant**: No authority can reverse valid transactions\n- **Transparent**: All transactions are publicly verifiable on the blockchain\n\n**What Bitcoin is NOT**:\n- Anonymous (transactions are pseudonymous, publicly visible)\n- A company (no CEO, no headquarters, no employees)\n- A government currency (no legal tender status in most jurisdictions)\n\nBitcoin is best understood as **digital scarcity** -- the first time in human history where a purely digital object can be provably scarce.",
          highlight: ["Bitcoin", "decentralized", "21 million", "double-spend", "digital scarcity"],
        },
        {
          type: "teach",
          title: "Proof of Work: How Bitcoin Achieves Consensus",
          content:
            "Bitcoin uses **Proof of Work (PoW)** as its consensus mechanism -- the process by which the network agrees on the valid state of the ledger.\n\n**How mining works**:\n1. Transactions broadcast to the network are collected into a block\n2. Miners compete to find a hash (a cryptographic output) that satisfies a target difficulty\n3. This requires massive computational effort (trillions of guesses per second network-wide)\n4. The winning miner broadcasts the block; other nodes verify and accept it\n5. The winner receives the **block reward** (newly issued BTC) plus transaction fees\n\n**Why PoW provides security**: To rewrite Bitcoin's history (attack the blockchain), an attacker would need to redo all the computational work for the blocks they want to change plus outpace the honest network going forward. At Bitcoin's current hash rate, this would require more electricity than many countries consume -- economically infeasible.\n\n**Difficulty adjustment**: Bitcoin automatically adjusts mining difficulty every 2,016 blocks (~2 weeks) to maintain an average 10-minute block time. If more miners join, difficulty increases. If miners leave, difficulty decreases. This self-correcting mechanism ensures predictable issuance regardless of total mining power.\n\n**Energy debate**: Bitcoin mining consumes substantial electricity, comparable to a medium-sized country. Proponents argue this energy expenditure is the cost of trustless security. Critics argue the energy use is wasteful.",
          highlight: ["proof of work", "mining", "hash", "difficulty adjustment", "block reward"],
        },
        {
          type: "teach",
          title: "The Bitcoin Halving and Scarcity Model",
          content:
            "Bitcoin's supply schedule is hardcoded into the protocol:\n\n**Issuance schedule**:\n- Blocks are mined every ~10 minutes\n- Each block issues a **block reward** to the miner\n- Every 210,000 blocks (~4 years), the block reward is cut in half: **the halving**\n\n**Historical halvings**:\n- 2009 (genesis): 50 BTC/block\n- 2012 (1st halving): 25 BTC/block\n- 2016 (2nd halving): 12.5 BTC/block\n- 2020 (3rd halving): 6.25 BTC/block\n- 2024 (4th halving): 3.125 BTC/block\n\n**Total supply**: 21 million BTC hard cap. ~19.7 million already mined. The remaining ~1.3 million will be issued over the next ~120 years, with the last Bitcoin mined around 2140.\n\n**Stock-to-Flow (S2F) model**: This model, popularized by analyst PlanB, measures scarcity as existing supply / annual production. Post-2024, Bitcoin's S2F ratio exceeds gold (SF ~60), the traditional scarcity benchmark.\n\n**Halving significance**: Each halving reduces new supply by 50%, while demand may remain constant or grow. If demand stays flat, reduced supply issuance is theoretically price-supportive. Bitcoin's four major bull markets have each followed halvings, though correlation does not guarantee causation.",
          highlight: ["halving", "block reward", "21 million", "stock-to-flow", "scarcity"],
        },
        {
          type: "quiz-mc",
          question:
            "The 2024 Bitcoin halving reduced the block reward from 6.25 BTC to 3.125 BTC. Approximately how many new BTC are issued per day at this rate?",
          options: [
            "~450 BTC/day (144 blocks/day x 3.125 BTC/block)",
            "~900 BTC/day (pre-halving rate)",
            "~4,500 BTC/day",
            "~50 BTC/day",
          ],
          correctIndex: 0,
          explanation:
            "Bitcoin mines approximately 1 block every 10 minutes: 6 blocks/hour x 24 hours = 144 blocks/day. At 3.125 BTC/block: 144 x 3.125 = 450 BTC/day. Annualized: ~164,250 new BTC/year post-2024 halving, compared to ~328,500/year pre-halving. Compare this to Bitcoin's circulating supply of ~19.7 million: the annual issuance rate is now less than 0.9% of total supply -- lower than gold's estimated annual mining rate of ~1.5% of above-ground stock.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Bitcoin transactions are completely anonymous -- there is no way to trace who sent or received funds.",
          correct: false,
          explanation:
            "Bitcoin is **pseudonymous**, not anonymous. Every transaction is permanently recorded on the public blockchain, visible to anyone. Transactions are linked to addresses (cryptographic strings) rather than real names, but blockchain analytics companies (Chainalysis, Elliptic) can often de-anonymize users by clustering addresses, analyzing exchange KYC data, and tracing transaction flows. Law enforcement has successfully traced and seized Bitcoin in numerous criminal cases. True anonymity in crypto requires additional privacy tools (Monero, CoinJoin, Lightning Network in some configurations).",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor argues: 'Bitcoin has no intrinsic value because it is not backed by anything -- at least gold has industrial uses.' How do you evaluate this argument?",
          question: "Which response most accurately addresses the 'backed by nothing' claim?",
          options: [
            "Bitcoin's value derives from its monetary properties (scarcity, portability, verifiability, censorship resistance) and network adoption -- similar to how fiat currencies derive value from institutional trust rather than physical backing",
            "The argument is correct -- Bitcoin has no value because it lacks physical backing",
            "Bitcoin is backed by the energy used to mine it, making it equivalent to a commodity",
            "Bitcoin's intrinsic value comes from its price history",
          ],
          correctIndex: 0,
          explanation:
            "The 'not backed by anything' critique applies equally to modern fiat currency -- the US dollar has not been backed by gold since 1971. Value in any monetary system derives from collective belief, network effects, and utility. Bitcoin's monetary properties (fixed supply, global portability, 24/7 settlement, no counterparty risk, permissionless) are genuinely novel. Gold's industrial use represents a small fraction of its value -- most of gold's market cap reflects its monetary premium. Whether Bitcoin's monetary properties justify its market capitalization is debatable, but the 'no backing' argument is not a decisive refutation.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 2 — Ethereum and Smart Contracts
       ================================================================ */
    {
      id: "crypto-ethereum",
      title: "Ethereum and Smart Contracts",
      description: "The EVM, gas mechanics, DeFi primitives, and the Merge to Proof of Stake",
      icon: "Code",
      xpReward: 85,
      steps: [
        {
          type: "teach",
          title: "Ethereum: A World Computer",
          content:
            "Ethereum, proposed by Vitalik Buterin in 2013 and launched in 2015, extended Bitcoin's core innovation with a critical addition: **programmability**.\n\nWhere Bitcoin is a ledger that tracks BTC ownership, Ethereum is a **decentralized world computer** that can execute arbitrary code (smart contracts) in a trustless environment.\n\n**Key concepts**:\n\n**Smart Contracts**: Programs stored on the blockchain that automatically execute when specified conditions are met. No intermediary needed -- the code IS the contract. Examples: 'Release these funds when both parties sign' or 'If the price of ETH exceeds $2,000, pay 1 ETH to this address.'\n\n**Ethereum Virtual Machine (EVM)**: The computational environment that runs smart contracts. Every Ethereum node runs the EVM and executes the same code, reaching consensus on outputs. The EVM is Turing-complete -- it can run any computation given sufficient resources.\n\n**Ether (ETH)**: Ethereum's native asset. Used to pay for computation (gas), as collateral in DeFi, and as a store of value. Unlike Bitcoin's fixed 21M cap, Ethereum's supply policy has evolved; since the Merge and EIP-1559, ETH is approximately deflationary under most network conditions.",
          highlight: ["Ethereum", "smart contracts", "EVM", "Turing-complete", "programmability"],
        },
        {
          type: "teach",
          title: "Gas: Ethereum's Computational Fuel",
          content:
            "Every operation on Ethereum requires computational resources. **Gas** is the unit measuring this computation, and users pay for gas in ETH.\n\n**How gas works**:\n- Every operation (addition, storage write, contract call) has a fixed gas cost set by the protocol\n- Users specify a **gas limit** (maximum they will spend) and a **base fee** (minimum required by the network, burned)\n- Users can add a **priority fee (tip)** to incentivize miners/validators to include their transaction faster\n- If a transaction runs out of gas mid-execution, it reverts (changes undone) but the gas is still consumed\n\n**EIP-1559 (August 2021)**: Redesigned the fee market:\n- Base fee is algorithmically set based on network congestion and **burned** (removed from supply)\n- Only the priority fee goes to validators\n- Result: When network activity is high, more ETH is burned, potentially making ETH deflationary\n\n**Gas price example**: Sending ETH costs 21,000 gas. If base fee = 15 gwei and priority fee = 2 gwei:\n- Total fee = 21,000 x (15 + 2) gwei = 357,000 gwei = 0.000357 ETH\n- At ETH = $3,000: ~$1.07 for a simple transfer\n- Complex DeFi operations: 100,000-500,000+ gas, potentially $5-50+ during congestion\n\n**Layer 2 solutions** (Arbitrum, Optimism, Base): Execute transactions off the main chain, batch them, and post proofs to Ethereum. Reduce gas costs by 10-100x while inheriting Ethereum's security.",
          highlight: ["gas", "base fee", "EIP-1559", "gwei", "Layer 2", "burn"],
        },
        {
          type: "quiz-mc",
          question:
            "Under EIP-1559, what happens to the base fee component of Ethereum transaction costs?",
          options: [
            "It is burned (destroyed), reducing ETH supply",
            "It is paid to validators as income",
            "It is sent to the Ethereum Foundation",
            "It accumulates in a treasury for network development",
          ],
          correctIndex: 0,
          explanation:
            "EIP-1559 introduced a burned base fee: every transaction destroys the base fee in ETH rather than paying it to miners/validators. Only the priority fee (tip) goes to validators. This creates a feedback loop: more network activity -> higher base fee -> more ETH burned -> lower net ETH issuance. Since the Merge (September 2022), when issuance also dropped significantly, Ethereum has been approximately deflationary during periods of moderate-to-high network activity. This contrasts sharply with Bitcoin's fixed issuance schedule.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Merge: Proof of Stake",
          content:
            "In September 2022, Ethereum transitioned from Proof of Work to **Proof of Stake (PoS)** in an event called **the Merge**.\n\n**How Proof of Stake works**:\n- Validators (instead of miners) secure the network\n- To become a validator, you must stake 32 ETH as collateral\n- Validators are randomly selected to propose and attest to blocks, proportional to their stake\n- If validators behave dishonestly (attempt to double-sign or attack the network), they face **slashing** -- losing a portion of their staked ETH\n- Honest validators earn staking rewards (~3-5% APY currently)\n\n**Merge vs PoW comparison**:\n- Energy consumption: Down ~99.95% (no more massive mining farms)\n- ETH issuance: Reduced from ~13,000 ETH/day to ~1,700 ETH/day\n- Security model: Economic rather than computational -- attacking PoS requires buying and risking enormous ETH\n\n**Liquid Staking Derivatives (LSDs)**: Most individual investors cannot lock 32 ETH. Protocols like Lido (stETH) and Rocket Pool (rETH) allow staking any amount of ETH and receiving a liquid token representing staked ETH plus accrued rewards. These tokens can be used in DeFi while still earning staking yield.\n\n**Validator slashing risk**: Improper validator configuration (running duplicate validators) can result in substantial ETH loss. Liquid staking protocols socialize this risk across all depositors.",
          highlight: ["Proof of Stake", "the Merge", "slashing", "staking", "liquid staking"],
        },
        {
          type: "quiz-tf",
          statement:
            "Proof of Stake is less secure than Proof of Work because it does not require any real-world resources to attack the network.",
          correct: false,
          explanation:
            "PoS security is based on **economic cost, not physical cost**. Attacking Ethereum's PoS network requires accumulating and risking a large fraction of the staked ETH (currently ~$100 billion+). A successful attack would likely collapse the value of the attacker's stake, making the attack economically self-defeating. PoW security is based on the cost of computing hardware and electricity; PoS security is based on the cost of ETH at risk. Security researchers generally consider mature PoS systems comparably secure to PoW, with different tradeoff profiles.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A developer wants to build an application where users can automatically receive royalty payments whenever their digital artwork is resold, without any platform intermediary or trust in a third party.",
          question: "Which technology makes this trustless, automatic royalty system possible?",
          options: [
            "Smart contracts on Ethereum (or compatible EVM chain) -- self-executing code enforces royalty logic without intermediaries",
            "A centralized database maintained by the marketplace",
            "Bitcoin's blockchain -- fixed supply ensures artist payment",
            "A legal contract -- traditional enforcement is sufficient",
          ],
          correctIndex: 0,
          explanation:
            "This is a canonical smart contract use case. The royalty logic ('send 5% of every secondary sale to this artist address') is encoded directly in the NFT contract. When a resale transaction occurs, the contract automatically routes the royalty payment -- no intermediary can override, delay, or steal it. Neither Bitcoin (limited scripting language, not Turing-complete) nor a centralized database (requires trust in the operator) nor a legal contract (requires enforcement by courts) can provide the same trustless automatic execution.",
          difficulty: 1,
        },
      ],
    },
    /* ================================================================
       LESSON 3 — DeFi Protocols
       ================================================================ */
    {
      id: "crypto-defi",
      title: "DeFi Protocols",
      description: "AMMs, liquidity pools, yield farming, lending protocols, and the risks involved",
      icon: "Zap",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "What DeFi Is",
          content:
            "**Decentralized Finance (DeFi)** refers to financial applications built on public blockchains (primarily Ethereum and compatible chains) that operate without centralized intermediaries.\n\nIn traditional finance, a bank holds your money, an exchange matches your trades, and a broker holds your securities. Each intermediary requires trust, charges fees, operates with business hours, and can freeze your access.\n\nDeFi replaces these intermediaries with **smart contracts** -- code that holds funds and executes rules automatically. Key properties:\n- **Non-custodial**: Your private keys hold your assets (no bank can freeze them)\n- **Permissionless**: Anyone with a wallet can interact, no KYC required\n- **Transparent**: All code and transactions are public\n- **Composable**: Protocols can be combined ('money legos') to create new products\n\n**DeFi TVL (Total Value Locked)**: A measure of assets deposited in DeFi protocols. At peak (November 2021), DeFi TVL exceeded $250 billion. As of 2024, approximately $50-100 billion depending on market conditions.\n\n**Major DeFi categories**:\n- Decentralized Exchanges (DEXs): Uniswap, Curve, Balancer\n- Lending/Borrowing: Aave, Compound, MakerDAO\n- Yield Aggregators: Yearn Finance, Convex\n- Derivatives: dYdX, GMX, Synthetix\n- Stablecoins: DAI, FRAX, crvUSD",
          highlight: ["DeFi", "TVL", "non-custodial", "permissionless", "composable"],
        },
        {
          type: "teach",
          title: "Automated Market Makers (AMMs) and Liquidity Pools",
          content:
            "Traditional exchanges use **order books**: buyers post bids, sellers post asks, orders match when prices cross. AMMs replace order books with a mathematical formula.\n\n**Uniswap's Constant Product Formula**: x * y = k\n- x = amount of Token A in the pool\n- y = amount of Token B in the pool\n- k = constant that must be maintained after every trade\n\n**Example**: A pool contains 100 ETH and 300,000 USDC. k = 30,000,000.\nA trader buys 10 ETH: new x = 90 ETH. New y = 30,000,000 / 90 = 333,333 USDC. Trader paid 33,333 USDC for 10 ETH. Effective price: $3,333/ETH (vs $3,000/ETH initial). The **price impact** is 11% -- buying large relative to pool size moves the price significantly.\n\n**Liquidity Providers (LPs)**: Anyone can deposit token pairs into a pool and earn a share of trading fees (typically 0.05-1% per trade). In return, they receive LP tokens representing their pool share.\n\n**Impermanent Loss (IL)**: The key LP risk. If the price of one token changes relative to the other, LPs end up with less value than if they had simply held the tokens. IL is 'impermanent' only if prices return to the original ratio -- if they do not, the loss becomes permanent. IL is a fundamental risk of providing liquidity.",
          highlight: ["AMM", "constant product formula", "liquidity pool", "impermanent loss", "LP tokens"],
        },
        {
          type: "quiz-mc",
          question:
            "You provide liquidity to a 50/50 ETH/USDC pool. ETH price doubles (from $2,000 to $4,000) while USDC remains $1. What is the impermanent loss scenario?",
          options: [
            "You end up with fewer ETH and more USDC than you deposited -- arbitrageurs rebalance the pool, and your position is worth less than simply holding the original ETH",
            "You profit more than holding -- the pool automatically buys more ETH as it rises",
            "There is no loss -- USDC is stable so the pool is balanced",
            "You receive 2x more ETH because the price doubled",
          ],
          correctIndex: 0,
          explanation:
            "When ETH doubles, arbitrageurs buy cheap ETH from the pool until it reflects market price, rebalancing by selling USDC back. This leaves LPs with less ETH and more USDC than they deposited. If you had simply held 0.5 ETH + $1,000 USDC = value of $3,000 when ETH = $4,000. But your pool position (due to rebalancing) might be worth ~$2,828 -- an impermanent loss of ~5.7%. IL grows with the magnitude of price divergence. At a 4x price change, IL is ~20%; at 10x, IL approaches 43%.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Lending Protocols and Yield Farming",
          content:
            "**Lending Protocols (Aave, Compound)**:\nUsers deposit assets to earn interest; other users borrow against collateral.\n\n- **Overcollateralization**: DeFi loans are typically 150-200% collateralized. To borrow $1,000 USDC, you must deposit $1,500-2,000 in ETH.\n- **Liquidation**: If collateral value falls below the minimum ratio (e.g., 120%), your collateral is automatically sold to repay the loan. No grace period.\n- **Interest rates**: Algorithmically determined by utilization (borrowed / available). High utilization = high rates.\n- **Flash loans**: Uncollateralized loans that must be borrowed and repaid in a single transaction. Used for arbitrage, liquidations, and certain attacks.\n\n**Yield Farming**:\nThe practice of moving assets between DeFi protocols to maximize returns. Strategies include:\n1. Deposit ETH as collateral on Aave to borrow stablecoins\n2. Deposit stablecoins in Curve for LP fees plus CRV rewards\n3. Deposit Curve LP tokens in Convex for additional CVX rewards\n4. Compound rewards by reinvesting\n\n**APY vs APR**: DeFi yields often display APY (compounded) which can appear much higher than actual returns when market prices of reward tokens decline.\n\n**Sustainability warning**: High APYs in DeFi are often funded by token emissions. When token prices fall, real yields collapse. Many 'high yield' farms have effectively zero or negative real returns once accounting for token price decline.",
          highlight: ["lending", "liquidation", "overcollateralization", "yield farming", "flash loans"],
        },
        {
          type: "quiz-tf",
          statement:
            "In DeFi lending protocols, if your collateral value drops below the liquidation threshold, you have 24 hours to add more collateral before it is sold.",
          correct: false,
          explanation:
            "DeFi liquidations are **immediate and automated**. There is no grace period. Smart contracts continuously monitor collateralization ratios. When a position falls below the liquidation threshold (typically 120-150% depending on the protocol and asset), **liquidators** -- bots scanning the blockchain -- atomically repay a portion of the debt and seize the collateral at a discount (liquidation bonus of 5-15%). This happens within seconds of the threshold being breached. The automated, immediate nature of DeFi liquidations is both a feature (removes moral hazard) and a risk (no human intervention possible).",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A DeFi protocol advertises '500% APY' on a new liquidity pool for its governance token. The rewards are paid in the protocol's native token, which launched 3 weeks ago.",
          question: "What is the most likely outcome for investors chasing this yield?",
          options: [
            "The APY compresses rapidly as more capital enters and the reward token price falls -- early entrants may profit but latecomers face near-zero or negative real returns",
            "The 500% APY is sustainable because smart contracts guarantee it",
            "All participants earn equal returns regardless of entry timing",
            "500% APY always indicates a legitimate, established protocol",
          ],
          correctIndex: 0,
          explanation:
            "High APY pools follow a predictable pattern called the **yield farming lifecycle**: (1) Protocol launches high emissions to attract TVL, (2) Early depositors earn high rewards in the new token, (3) They sell the reward token to capture profits, (4) Selling pressure depresses the token price, (5) The APY (which appeared high because it assumed reward token value) collapses in USD terms, (6) Capital exits, (7) APY collapses further. This cycle, often called 'farm and dump,' has played out hundreds of times. Sustainable DeFi yields come from actual economic activity (fees) not token emissions.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 4 — Stablecoins Deep Dive
       ================================================================ */
    {
      id: "crypto-stablecoins",
      title: "Stablecoins Deep Dive",
      description: "Fiat-backed, crypto-backed, and algorithmic stablecoins: mechanisms and failure modes",
      icon: "DollarSign",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "What Stablecoins Are and Why They Exist",
          content:
            "**Stablecoins** are cryptocurrencies designed to maintain a stable value, typically pegged 1:1 to the US dollar. They solve the primary barrier to DeFi adoption: cryptocurrency volatility.\n\n**Why stablecoins matter**:\n- Crypto users can hold dollar-equivalent value without exiting to traditional banking\n- DeFi lending, trading, and savings can be denominated in stable units\n- Enable fast, cheap cross-border transfers without currency volatility\n- Bridge between crypto and traditional finance\n\n**The stablecoin trilemma**: Stability, decentralization, and capital efficiency are difficult to achieve simultaneously. Different designs make different tradeoffs.\n\n**Total stablecoin market cap**: ~$150 billion (2024), dominated by USDT (~70 billion), USDC (~30 billion), DAI/USDS (~5 billion).\n\n**Three main design categories**:\n1. Fiat-backed (USDT, USDC): Backed by real dollars held by a central entity\n2. Crypto-backed (DAI): Over-collateralized by on-chain crypto assets\n3. Algorithmic: Attempts to maintain the peg through code and economic incentives (no full collateral backing)\n\nStablecoins are not risk-free -- each design has specific failure modes that have materialized in various incidents.",
          highlight: ["stablecoin", "peg", "stablecoin trilemma", "USDT", "USDC", "DAI"],
        },
        {
          type: "teach",
          title: "Fiat-Backed Stablecoins: USDT and USDC",
          content:
            "**Fiat-backed stablecoins** maintain their peg by holding an equivalent amount of fiat currency (or near-equivalent assets) in a bank or custodian.\n\n**USDT (Tether)**:\n- Largest stablecoin by market cap (~$70B+)\n- Issued by Tether Limited (British Virgin Islands)\n- Historically controversial: In 2021, CFTC fined Tether $41M for misrepresenting reserves\n- Reserves composition has been disputed; includes cash, T-Bills, commercial paper, and other assets\n- No full independent audit published; quarterly attestations only\n- De facto dominant in crypto trading, especially on non-US exchanges\n\n**USDC (USD Coin)**:\n- Issued by Circle (US-regulated)\n- Reserves: ~100% US Treasury bills and cash (monthly attestations by Grant Thornton)\n- March 2023 Silicon Valley Bank Crisis: Circle had $3.3B in SVB deposits. USDC briefly de-pegged to $0.87 before the FDIC guaranteed all deposits\n- More transparent, more regulatory-compliant, more popular in US DeFi\n\n**Key risks of fiat-backed stablecoins**:\n1. **Counterparty risk**: The issuer could mismanage reserves, face insolvency, or be shut down by regulators\n2. **Bank failure risk**: USDC proved reserves can be at risk in traditional banking crises\n3. **Regulatory risk**: Governments could mandate freezing addresses (Tether and Circle have both frozen addresses by law enforcement request)\n4. **Centralization**: A single company can blacklist your address -- censorship resistant in name only",
          highlight: ["USDT", "USDC", "reserves", "counterparty risk", "de-peg"],
        },
        {
          type: "teach",
          title: "Crypto-Backed and Algorithmic Stablecoins",
          content:
            "**Crypto-backed (DAI/USDS, by MakerDAO)**:\nUsers lock ETH (or other approved collateral) in a smart contract vault and mint DAI, maintaining overcollateralization (typically 150%+ collateral ratio).\n- If collateral falls below the minimum ratio, it is automatically liquidated\n- Stability is maintained algorithmically through interest rates (stability fee) and DAI Savings Rate\n- More decentralized than fiat-backed but capital inefficient (need $150 collateral for $100 stablecoin)\n- DAI has maintained its peg through multiple severe market crashes (2018, 2020, 2022)\n\n**Algorithmic stablecoins (no full collateral backing)**:\nAttempt to maintain the peg through seigniorage mechanics -- expanding and contracting supply algorithmically, often with a paired governance/seigniorage token.\n\n**TerraUSD (UST) Collapse -- May 2022**:\nThe largest stablecoin failure in history. UST maintained its peg through a mechanism where burning UST minted LUNA (Terra's governance token) and vice versa. When confidence faltered:\n1. Large UST sell pressure broke the peg slightly\n2. Arbitrageurs burned UST to mint and sell LUNA, creating LUNA inflation\n3. LUNA price crashed from $80 to $0.01 in days\n4. The mint/burn mechanism required ever more LUNA to support UST, creating hyperinflation\n5. UST de-pegged to ~$0.05; ~$40 billion in value destroyed\n\n**Lesson**: Algorithmic stablecoins without full collateral backing are fundamentally vulnerable to reflexive death spirals when confidence breaks.",
          highlight: ["DAI", "overcollateralization", "algorithmic stablecoin", "TerraUSD", "death spiral"],
        },
        {
          type: "quiz-mc",
          question:
            "The TerraUSD (UST) collapse in May 2022 demonstrated what fundamental flaw in its design?",
          options: [
            "Circular backing: UST's stability relied on LUNA's price, which depended on UST's stability -- creating a reflexive collapse once confidence broke",
            "The protocol was hacked and funds were stolen",
            "There was insufficient liquidity to support the peg",
            "Regulatory action caused the collapse",
          ],
          correctIndex: 0,
          explanation:
            "UST's death spiral was a classic reflexive failure: UST needed LUNA to have value to maintain its peg, but LUNA's value depended on UST maintaining its peg. The mint/burn mechanism meant that when UST lost its peg, the protocol minted enormous quantities of LUNA to absorb UST redemptions, inflating LUNA supply massively and crashing LUNA's price. As LUNA crashed, UST lost its backing mechanism, accelerating de-pegging, requiring more LUNA minting, further crashing LUNA. This circular dependency without external collateral made collapse inevitable once sentiment turned. The system was structurally identical to historical currency crises that forced currency boards to abandon fixed pegs.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "USDC is completely risk-free because it is backed 1:1 by US dollars held in regulated US banks.",
          correct: false,
          explanation:
            "USDC's March 2023 de-peg to $0.87 demonstrated this is false. Circle had $3.3 billion (8% of reserves) deposited at Silicon Valley Bank when SVB failed. USDC lost its peg because market participants were uncertain whether Circle could cover full redemptions. The FDIC's extraordinary decision to guarantee all SVB deposits restored the peg, but the incident proved that even fully-backed, highly-regulated stablecoins carry: (1) bank failure risk, (2) concentrated counterparty risk, (3) temporary de-peg risk during crises. Stablecoins are lower risk than volatile crypto assets but are not risk-free.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You hold $50,000 in USDT in a DeFi protocol earning 8% APY. A friend argues you should move to a bank savings account earning 4.5% APY because 'money is money.'",
          question: "How do you evaluate the risk-adjusted comparison?",
          options: [
            "USDT carries Tether counterparty risk, DeFi smart contract risk, and blockchain risk -- the 3.5% yield premium may not adequately compensate for these combined risks vs FDIC-insured bank deposits",
            "USDT is equivalent to dollars so the comparison is purely about yield",
            "The bank account is definitely inferior because 8% > 4.5%",
            "USDT is safer because it is blockchain-based and decentralized",
          ],
          correctIndex: 0,
          explanation:
            "The 3.5% yield difference needs to compensate for multiple additional risk layers: (1) **Tether risk**: If CFTC/SEC action or reserve issues cause USDT to de-peg, you could lose a significant portion. (2) **Smart contract risk**: The DeFi protocol contract could have a bug exploited for total loss (billions have been lost to DeFi exploits). (3) **Bridge/custody risk**: Moving funds on-chain carries additional risks. The bank account has: FDIC insurance up to $250K, no smart contract risk, no stablecoin de-peg risk. A rational investor must assess whether 3.5% extra yield adequately compensates for these compound risks.",
          difficulty: 2,
        },
      ],
    },
    /* ================================================================
       LESSON 5 — Crypto Trading Mechanics
       ================================================================ */
    {
      id: "crypto-trading",
      title: "Crypto Trading Mechanics",
      description: "Perpetual futures, funding rates, liquidations, leverage risks, and exchange types",
      icon: "TrendingUp",
      xpReward: 85,
      steps: [
        {
          type: "teach",
          title: "Spot vs Derivatives Markets",
          content:
            "Crypto markets operate across two main categories:\n\n**Spot Markets**: Immediate delivery of the actual asset. You buy 1 BTC, you receive 1 BTC in your wallet. No expiry, no leverage required, no funding costs.\n\n**Derivatives Markets**: Contracts derived from the price of an asset. Primary crypto derivatives:\n\n**Perpetual Futures (Perps)**:\n- Track the underlying spot price through a **funding rate** mechanism\n- No expiry date (unlike traditional futures)\n- Allow leverage (2x-125x depending on exchange)\n- Available on centralized exchanges (Binance, Bybit, OKX) and decentralized (GMX, dYdX)\n- Dominate crypto trading volume: daily perp volume often exceeds spot volume 4-5x\n\n**Dated Futures**: Expire at a set date (like traditional futures). Less popular than perps in crypto.\n\n**Options**: Right but not obligation to buy (call) or sell (put) at a specific price. Growing market on Deribit, Lyra, and major centralized exchanges.\n\n**Why derivatives dominate crypto trading volume**:\n1. Leverage amplifies both gains and losses\n2. Ability to short (profit from price declines)\n3. No need to hold the actual asset for speculation\n4. 24/7 trading globally\n\nFor most retail investors, spot markets with long-term holding are appropriate. Derivatives are primarily tools for sophisticated speculation and hedging.",
          highlight: ["spot", "perpetual futures", "perps", "derivatives", "leverage"],
        },
        {
          type: "teach",
          title: "Funding Rates: How Perps Maintain Price Parity",
          content:
            "Perpetual futures have no expiry, so they need a mechanism to keep the contract price close to the spot price. This is achieved through **funding rates**.\n\n**How funding rates work**:\n- Every 8 hours (varies by exchange), a payment transfers between longs and shorts\n- If the perp price > spot price (premium): Longs pay shorts (funding rate is positive)\n- If the perp price < spot price (discount): Shorts pay longs (funding rate is negative)\n- The payment incentivizes arbitrageurs to trade until the perp tracks spot\n\n**Typical funding rates**: 0.01% per 8 hours is 'neutral.' During bull markets, rates can reach 0.1-0.5% per 8 hours (annualized: 109-546%!). During bear markets, rates can go negative.\n\n**Funding rate implications**:\n- Holding a long perp position costs money when rates are positive (you pay shorts)\n- Basis trades: Short spot + long perp or long spot + short perp to earn funding\n- High positive funding signals euphoria/overleveraged market (historically precedes corrections)\n- Extreme negative funding signals extreme fear (historically precedes bounces)\n\n**Example**: You hold $100,000 BTC long perp. Funding rate = 0.1% per 8 hours = 0.3% per day. Daily funding cost: $300. Annual cost if sustained: ~109% of position value. High leverage with sustained positive funding is a wealth destroyer even in flat markets.",
          highlight: ["funding rate", "longs pay shorts", "basis trade", "8 hours", "premium"],
        },
        {
          type: "teach",
          title: "Leverage and Liquidations",
          content:
            "**Leverage** allows you to control a position larger than your deposited margin.\n\n**Example**: 10x leverage on $1,000 margin = $10,000 position in BTC.\n- If BTC rises 10%: Position gains $1,000. Return on margin: 100%.\n- If BTC falls 10%: Position loses $1,000. Margin is wiped. **Liquidation.**\n\n**Liquidation mechanics**:\n- Exchanges monitor your margin ratio continuously\n- At the **liquidation price**, your position is forcibly closed\n- With 10x leverage on BTC, a ~9-10% adverse move triggers liquidation\n- With 100x leverage, a ~1% adverse move triggers liquidation\n- You lose your entire margin (though exchanges typically have a maintenance margin buffer before full liquidation)\n\n**Liquidation cascades**: In volatile markets, liquidations trigger price moves that hit more liquidation levels, causing cascading auto-sells. Bitcoin has experienced 20-30% drops in single hours partly due to liquidation cascades.\n\n**Liquidation data**: Exchanges report aggregate liquidation data. Days with $500M-$2B in liquidations are common in volatile crypto markets. Major liquidation events often signal local bottoms or tops.\n\n**Cross margin vs isolated margin**:\n- **Isolated**: Only the margin allocated to one position is at risk\n- **Cross**: All account balance can be used to prevent liquidation -- losing one trade can drain your entire account\n\nRule of thumb: Retail traders should avoid leverage above 3-5x and use isolated margin only.",
          highlight: ["leverage", "liquidation", "liquidation cascade", "isolated margin", "cross margin"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader opens a $50,000 BTC long perpetual futures position with 20x leverage, depositing $2,500 in margin. BTC drops 4.5%. What happens?",
          options: [
            "The position is liquidated -- 4.5% loss on $50,000 = $2,250, approaching the $2,500 margin (maintenance margin triggers liquidation before full depletion)",
            "The trader loses $2,250 and retains $250 in margin",
            "Nothing -- 4.5% is too small to trigger any action",
            "The position gains because BTC will bounce from such a small dip",
          ],
          correctIndex: 0,
          explanation:
            "20x leverage means: $50,000 position / $2,500 margin = 20x. A 4.5% decline = $2,250 loss. With $2,500 margin, the loss represents 90% of margin, and exchanges enforce a **maintenance margin** (typically 0.5-1% of position = $250-500) that triggers liquidation before full depletion. The liquidation engine would close the position, the trader loses most of their $2,500 margin, and the exchange keeps the maintenance margin buffer. This example illustrates why high leverage in volatile crypto markets destroys capital rapidly -- a move that feels small (4.5%) is devastating at 20x.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A positive funding rate on Bitcoin perpetual futures is a bullish signal because it means more traders are long and bullish on price.",
          correct: false,
          explanation:
            "While positive funding reflects net long positioning, historically very high positive funding rates are **contrarian bearish indicators**. Extreme positive funding (0.1%+ per 8 hours) signals an overleveraged long market. These positions are fragile: any price decline triggers forced liquidations (longs getting stopped out), which pushes prices lower, triggering more liquidations. This is why major Bitcoin price crashes often occur precisely when funding rates are at multi-month highs -- the overleveraged structure creates fragility. Contrarian traders use very high funding rates as a signal to reduce long exposure or initiate short positions.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Bitcoin is trading at $60,000. The perpetual futures funding rate has been +0.05% per 8 hours for two weeks. Open interest (total value of open positions) is near all-time highs. You are considering opening a 5x leveraged long.",
          question: "What are the key risks to consider before entering this trade?",
          options: [
            "High sustained positive funding = daily cost of 0.15% on position; elevated open interest = crowded trade vulnerable to cascade liquidations if price drops; 5x leverage means a 19% drop eliminates margin",
            "High funding rates confirm bullish sentiment -- now is the best time to enter leveraged longs",
            "Open interest at highs is always bullish because it means more buyers",
            "Funding rate of 0.05% is negligible -- no meaningful risk",
          ],
          correctIndex: 0,
          explanation:
            "Three compounding risks: (1) **Funding cost**: 0.05%/8hrs = 0.15%/day = ~54%/year annualized. On a $10,000 position at 5x controlling $50,000: $75/day in funding payments. (2) **Crowded trade risk**: High OI near ATH means the long trade is consensus -- consensus trades get cleared when market makers and large players initiate selling pressure to trigger cascades. (3) **Leverage fragility**: At 5x, a 19-20% adverse move eliminates margin. BTC has had 20-40% drops in single days multiple times. The combination of elevated funding + high OI + leverage is historically one of the highest-risk entry points in crypto.",
          difficulty: 3,
        },
      ],
    },
    /* ================================================================
       LESSON 6 — Portfolio Allocation
       ================================================================ */
    {
      id: "crypto-portfolio",
      title: "Portfolio Allocation",
      description: "Crypto correlation with traditional assets, position sizing, and risk management",
      icon: "PieChart",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "Crypto's Role in a Portfolio",
          content:
            "Understanding how cryptocurrency behaves relative to other asset classes is essential before determining allocation.\n\n**Historical return characteristics** (highly time-period dependent):\n- Bitcoin 10-year CAGR: ~80-100% (extremely front-loaded; diminishing as market cap grows)\n- Bitcoin annual volatility: ~70-80% (vs S&P 500 ~15-20%)\n- Maximum drawdowns: Bitcoin has declined 80-85% from peak to trough multiple times (2011, 2013, 2018, 2022)\n\n**Correlation with traditional assets**:\n- Long-term correlation with equities: Low to moderate (~0.1-0.3 over multi-year periods)\n- During stress events (March 2020, 2022): Correlation spikes sharply toward 0.7-0.9 with equities\n- Bitcoin's correlation advantage largely disappears exactly when you need it most (during crises)\n\n**The case for crypto allocation**:\n- Asymmetric upside: Small positions can contribute meaningfully to portfolio returns if asset appreciates\n- Low long-run correlation provides some diversification benefit\n- Store of value / inflation hedge narrative (debated and not consistently demonstrated)\n- Optionality on global adoption of crypto infrastructure\n\n**The case for caution**:\n- Extreme volatility: 80-85% drawdowns are common in crypto bear markets\n- No intrinsic cash flows to anchor valuation (unlike stocks and bonds)\n- Regulatory risk remains significant\n- Operational risk: Lost keys, exchange failures (FTX), smart contract exploits",
          highlight: ["correlation", "volatility", "drawdown", "asymmetric upside", "allocation"],
        },
        {
          type: "teach",
          title: "Position Sizing and the Kelly Criterion",
          content:
            "Given crypto's extreme volatility, position sizing is the most important risk management decision.\n\n**Standard financial advice**: Most financial planners suggest crypto should represent no more than 1-5% of a diversified portfolio. At 5% allocation with an 80% crypto drawdown, total portfolio impact is limited to 4% loss, which is manageable.\n\n**Kelly Criterion (theoretical optimal sizing)**:\nf = (bp - q) / b\nWhere: f = fraction of wealth to bet, b = net odds, p = probability of win, q = probability of loss (1-p).\n\nFor a rough Bitcoin application assuming: 60% probability of meaningful appreciation, expected gain 3x, expected loss 80%:\nf = (3 x 0.60 - 0.40) / 3 = (1.8 - 0.40) / 3 = 1.40/3 = 46.7% (half-Kelly: ~23%)\n\nKelly sizing for crypto is academic -- the input probabilities are highly uncertain. But the framework illustrates a key point: even under optimistic assumptions, aggressive Kelly sizing is surprisingly high, but full Kelly requires accepting catastrophic drawdowns.\n\n**Practical sizing principles**:\n1. Never allocate more than you can afford to lose entirely\n2. Concentration in a single crypto adds idiosyncratic risk; BTC/ETH are lower risk than altcoins\n3. Dollar-cost average into positions rather than lump-sum at market peaks\n4. Have a written exit strategy before entering (price targets, stop losses, or time-based rebalancing)",
          highlight: ["position sizing", "Kelly Criterion", "1-5%", "DCA", "exit strategy"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor has a $200,000 total portfolio and wants crypto exposure. They allocate $40,000 (20%) to Bitcoin. Bitcoin subsequently drops 75% (common in prior bear markets). What is the impact on the total portfolio?",
          options: [
            "Portfolio drops from $200,000 to $170,000 -- 15% total portfolio loss from the crypto position alone",
            "Portfolio drops to $40,000 -- full loss",
            "Portfolio drops to $190,000 -- 5% impact",
            "No impact -- other positions offset crypto losses",
          ],
          correctIndex: 0,
          explanation:
            "Bitcoin drops 75% from $40,000 = loss of $30,000. Remaining crypto value: $10,000. Other $160,000 in traditional assets unaffected. Total portfolio: $160,000 + $10,000 = $170,000. A 15% total portfolio loss. This illustrates why position sizing matters: at 5% allocation ($10,000), the same 75% crypto crash would only cost $7,500 (3.75% total portfolio hit) -- far more digestible. At 50% allocation ($100,000), the crash would reduce the portfolio to $125,000 (37.5% total loss) -- devastating.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Risk Management: Drawdown Psychology and Rebalancing",
          content:
            "Managing a crypto position requires understanding the **psychological** as well as mathematical challenges.\n\n**The 80% drawdown test**: If you bought Bitcoin at $10,000 and it rises to $68,000 (6.8x), you feel successful. Then it falls to $16,000 (an 80% drawdown from peak). Your $10,000 investment is still up 60%, but you have experienced a paper loss of ~$52,000 from your peak position value. Most investors sell here, locking in a fraction of the gains. **The asset that generates the most return also generates the most behavioral failure.**\n\n**Rebalancing strategy**: Set a target allocation (e.g., 5% crypto, 95% traditional). When crypto rises to 10% of portfolio due to appreciation, sell 50% of the crypto gains back to traditional assets. When crypto falls to 2.5%, buy to rebalance back to 5%. This systematically enforces buy-low-sell-high and removes emotion.\n\n**Diversification within crypto**: BTC and ETH have lower risk profiles than altcoins. Bitcoin has the longest track record, deepest liquidity, and most institutional adoption. Altcoins offer higher speculative upside but most have lost 95-99% from peaks and many have gone to zero.\n\n**Tax considerations**: Crypto is treated as property in the US. Every trade is a taxable event. Holding for 12+ months qualifies for long-term capital gains rates (0/15/20%). Short-term trading creates ordinary income tax rates (up to 37%). Tax drag from frequent trading significantly reduces real returns.",
          highlight: ["drawdown psychology", "rebalancing", "BTC/ETH", "altcoins", "tax treatment"],
        },
        {
          type: "quiz-tf",
          statement:
            "Bitcoin is a reliable hedge against inflation because its fixed supply means it will always preserve purchasing power during inflationary periods.",
          correct: false,
          explanation:
            "Empirical evidence does not support Bitcoin as a consistent inflation hedge. During the 2021-2022 inflation surge, Bitcoin fell from $68,000 to $16,000 (-76%) as the Fed hiked rates -- the same period that traditional inflation hedges (TIPS, gold, commodities) performed much better. Bitcoin correlates strongly with risk-off selling during tightening cycles, precisely when inflation is high. Gold has a 50-year track record as an inflation hedge; Bitcoin's track record is too short and volatile to substantiate the claim. The inflation hedge narrative is aspirational and based on monetary theory, not consistent observed behavior.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have a $150,000 portfolio: $100,000 equities, $30,000 bonds, $20,000 cash. A friend insists you should put $75,000 (50% of your portfolio) into ETH because 'crypto is the future and you will regret missing it.'",
          question: "How do you evaluate this recommendation?",
          options: [
            "50% crypto allocation is far above any reasonable risk-adjusted recommendation; standard guidance suggests 1-5% for most investors; a 75% ETH crash (which has happened multiple times) would reduce your $75,000 to $18,750 and devastate your portfolio",
            "If you believe in Ethereum's technology, 50% is justified",
            "Your friend is right -- missing crypto gains would be the bigger regret",
            "50% is reasonable if you have a long time horizon",
          ],
          correctIndex: 0,
          explanation:
            "Ethereum has experienced drawdowns of 90-94% (2018 peak to 2019 trough: $1,400 to $85; 2021 peak $4,800 to 2022 trough $880). A 90% ETH crash from a $75,000 position = $67,500 loss. Your $150,000 portfolio becomes $82,500 -- a 45% total portfolio loss. At 5% allocation ($7,500), the same 90% crash costs $6,750 (4.5% portfolio impact) and is survivable. FOMO ('you will regret missing it') is the most common driver of poor crypto position sizing decisions. Time horizon matters but does not change the mathematics of drawdown risk.",
          difficulty: 2,
        },
      ],
    },
  ],
};
