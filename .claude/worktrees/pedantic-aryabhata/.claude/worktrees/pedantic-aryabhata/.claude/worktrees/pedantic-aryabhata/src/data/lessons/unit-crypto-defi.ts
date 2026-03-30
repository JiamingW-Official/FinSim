import type { Unit } from "./types";

export const UNIT_CRYPTO_DEFI: Unit = {
  id: "crypto-defi",
  title: "Crypto & DeFi Fundamentals",
  description:
    "Understand blockchain technology, crypto asset classes, DeFi protocols, and how to manage risk and build a portfolio in digital assets",
  icon: "⛓️",
  color: "#f59e0b",
  lessons: [
    // ─── Lesson 1: Blockchain Fundamentals ──────────────────────────────────────
    {
      id: "crypto-defi-1",
      title: "⛓️ Blockchain Fundamentals",
      description:
        "Distributed ledgers, consensus mechanisms, wallets, gas fees, and smart contracts",
      icon: "Link",
      xpReward: 75,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "📦 What Is a Blockchain?",
          content:
            "A **blockchain** is a distributed ledger — a database replicated across thousands of independent computers (nodes) worldwide.\n\n**Blocks and hashes:**\nEach block contains a batch of transactions plus a **cryptographic hash** of the previous block. Because every block references the one before it, changing any historical record would invalidate every subsequent hash — making the chain **immutable**.\n\nExample: Block #800,000 contains:\n- Transactions (Alice → Bob: 0.5 BTC)\n- Timestamp\n- Previous block hash: `0000a3f7...`\n- Own hash: `0000d9c2...`\n\n**Why it matters for investors:**\nImmutability removes the need for a central authority (bank, clearinghouse). Transactions settle peer-to-peer, typically in minutes rather than days (T+2 in traditional finance).\n\n**Key properties:**\n- **Decentralized**: no single point of failure or control\n- **Transparent**: all transactions are publicly auditable\n- **Permissionless**: anyone can participate without approval",
          highlight: ["blockchain", "distributed ledger", "cryptographic hash", "immutable", "decentralized"],
        },
        {
          type: "teach",
          title: " Consensus Mechanisms: PoW vs PoS",
          content:
            "Blockchains need a way for thousands of independent nodes to agree on which transactions are valid — this is the **consensus mechanism**.\n\n**Proof of Work (PoW) — Bitcoin:**\n- Miners compete to solve a computationally hard puzzle\n- Winner adds the next block and earns the block reward (currently 3.125 BTC)\n- Security comes from massive energy expenditure — attacking the network requires controlling 51% of global hash power\n- Downside: Bitcoin consumes ~120 TWh/year — comparable to a mid-sized country\n\n**Proof of Stake (PoS) — Ethereum post-Merge (Sep 2022):**\n- Validators lock up (\"stake\") ETH as collateral instead of burning electricity\n- Validators are randomly selected proportional to their stake to propose blocks\n- Slashing: validators who cheat lose their staked ETH\n- Energy use dropped **~99.9%** after the Merge\n- Annual ETH issuance fell from ~4.3% to ~0.5%\n\n**Trade-offs:**\n- PoW: battle-tested (14 years), extremely secure, energy-intensive\n- PoS: greener, higher throughput, but newer and concentrated stake risk",
          highlight: ["Proof of Work", "Proof of Stake", "Merge", "validators", "slashing", "consensus"],
        },
        {
          type: "teach",
          title: " Wallets, Keys & Custody",
          content:
            "**Public/private key cryptography** is the foundation of crypto ownership.\n\n**How it works:**\n- **Private key**: a 256-bit secret number — like a master password. Anyone with it controls the funds.\n- **Public key**: derived from private key via elliptic curve math — your \"account number\"\n- **Address**: hashed form of public key — what you share to receive funds\n\n**Seed phrase (mnemonic):** 12–24 random words that encode your private key (BIP-39 standard). Back it up offline — losing it means losing funds permanently.\n\n**Hot vs Cold wallets:**\n| Type | Examples | Connected? | Risk |\n|------|----------|-----------|------|\n| Hot | MetaMask, Phantom | Always online | Higher (hackable) |\n| Cold | Ledger, Trezor | Air-gapped | Lower (physical loss) |\n\n**Custodial vs Non-custodial:**\n- **Custodial** (Coinbase, Binance): exchange holds private keys. Convenient, but \"not your keys, not your crypto\" — exchange insolvency (FTX) can freeze funds.\n- **Non-custodial** (MetaMask, hardware wallet): you control keys. Full ownership, full responsibility.",
          highlight: ["private key", "seed phrase", "hot wallet", "cold wallet", "custodial", "non-custodial"],
        },
        {
          type: "teach",
          title: " Transaction Mechanics & Smart Contracts",
          content:
            "**Transaction lifecycle on Ethereum:**\n1. User signs transaction with private key and broadcasts to the network\n2. Transaction enters the **mempool** (memory pool) — a waiting area of unconfirmed txs\n3. Validators select transactions, typically prioritizing higher **gas fees** (priority tips)\n4. Block is proposed and attested → transaction confirmed\n5. After ~12 seconds (one slot) the tx is included; finality after ~15 minutes\n\n**Gas fees:**\nGas fee = Gas units used × (Base fee + Priority tip)\nBase fee is burned (EIP-1559); tip goes to validators.\nComplex operations (DeFi swaps) use more gas than simple transfers.\nFees spike during network congestion — can reach $50–200 per transaction.\n\n**Smart contracts:**\nSelf-executing programs stored on Ethereum (or Solana, Avalanche, etc.).\n- Written in Solidity (Ethereum) or Rust (Solana)\n- Execute automatically when conditions are met\n- Cannot be altered once deployed (unless built with upgrade proxy)\n- Power all of DeFi: lending, trading, stablecoins, NFTs\n\nExample: A smart contract for an escrow releases payment automatically when shipping confirmation is received — no bank or lawyer needed.",
          highlight: ["mempool", "gas fees", "smart contracts", "EIP-1559", "finality", "Solidity"],
        },
        {
          type: "quiz-mc",
          question:
            "What changed when Ethereum completed 'The Merge' in September 2022?",
          options: [
            "Switched from Proof of Work to Proof of Stake, reducing energy consumption by ~99.9%",
            "Ethereum merged with Bitcoin to create a single unified blockchain",
            "Transaction fees were eliminated by switching to a fee-free model",
            "Block size was doubled to increase throughput to 100,000 TPS",
          ],
          correctIndex: 0,
          explanation:
            "The Merge transitioned Ethereum from energy-intensive Proof of Work (miners) to Proof of Stake (validators who lock up ETH). Energy consumption fell by approximately 99.9% — from ~80 TWh/year to under 0.1 TWh/year. It did not merge with Bitcoin, eliminate fees, or dramatically increase TPS (that is being addressed by Layer 2 solutions).",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "On a Proof of Work blockchain, losing your seed phrase means you can contact the network administrators to recover your funds.",
          correct: false,
          explanation:
            "False. Blockchains are permissionless and have no administrators. Your seed phrase is the only way to derive your private key. If you lose it and have no backup, your funds are permanently inaccessible — there is no customer support, password reset, or recovery mechanism.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Crypto Asset Classes ─────────────────────────────────────────
    {
      id: "crypto-defi-2",
      title: " Crypto Asset Classes",
      description:
        "Layer 1s, Layer 2s, stablecoins, DeFi tokens, and NFTs — the crypto landscape",
      icon: "Layers",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: " Layer 1 Blockchains",
          content:
            "**Layer 1 (L1)** blockchains are the base settlement layer — they process and finalize transactions on their own network.\n\n**Bitcoin (BTC):**\n- Market cap ~$1.3T (2024); original cryptocurrency\n- Fixed supply of 21 million coins — **digital gold / store of value**\n- Deliberately limited: 7 TPS, 10-minute blocks, no smart contracts on base layer\n- Held by MicroStrategy, Tesla, BlackRock ETF (IBIT) as institutional reserve asset\n\n**Ethereum (ETH):**\n- Market cap ~$400B; the **programmable blockchain**\n- Powers DeFi, NFTs, DAOs, and most major dApps\n- Post-Merge: deflationary at high usage (fees burned > new issuance)\n- EIP-1559 burn mechanism makes ETH \"ultrasound money\" thesis\n\n**Alternatives (alt-L1s):**\n- **Solana (SOL)**: 65,000 TPS, sub-cent fees, major NFT/DeFi hub, but suffered network outages\n- **Avalanche (AVAX)**: subnet architecture, strong institutional adoption\n- **Cardano (ADA)**: peer-reviewed academic approach, slower development pace\n\n**L1 investing thesis**: Owning L1 tokens = owning equity in the platform. Value accrues if the ecosystem grows.",
          highlight: ["Bitcoin", "Ethereum", "Layer 1", "digital gold", "programmable blockchain", "Solana"],
        },
        {
          type: "teach",
          title: " Layer 2 Scaling Solutions",
          content:
            "**Layer 2 (L2)** solutions process transactions off the main chain but inherit Ethereum's security by posting proofs or data back to L1.\n\n**Why L2s exist:**\nEthereum L1 handles ~15 TPS. During bull markets, gas fees hit $50–200 per swap — unusable for everyday transactions. L2s batch thousands of transactions, settle the compressed proof on L1, and reduce fees to cents.\n\n**Types of L2s:**\n\n**Optimistic Rollups** (Arbitrum, Optimism):\n- Assume transactions are valid by default\n- 7-day challenge/fraud proof window to withdraw back to L1\n- Arbitrum holds ~$17B TVL (total value locked)\n\n**ZK-Rollups** (zkSync, StarkNet, Polygon zkEVM):\n- Use zero-knowledge proofs to cryptographically prove validity\n- Instant finality, no challenge window\n- More complex to build but mathematically stronger\n\n**Polygon (MATIC):**\n- Started as a sidechain, now pivoting to ZK tech\n- Widely used for gaming and consumer apps\n\n**Investor angle**: L2 tokens (ARB, OP) capture fee revenue and governance. As Ethereum L2 activity grows, these may accrue more value than L1 base-layer fees.",
          highlight: ["Layer 2", "rollups", "Arbitrum", "Optimism", "ZK-proof", "TVL", "Polygon"],
        },
        {
          type: "teach",
          title: "💵 Stablecoins: Mechanisms & Risks",
          content:
            "**Stablecoins** maintain a peg (usually $1) and are the foundational liquidity layer of DeFi.\n\n**Fiat-backed (centralized):**\n- **USDC** (Circle): 1:1 USD in regulated bank accounts + US Treasuries. Monthly attestations.\n- **USDT** (Tether): Largest by volume (~$110B), backed by mix of cash/T-bills/commercial paper. Less transparent historically.\n- Risk: counterparty risk (bank runs, regulatory seizure)\n\n**Crypto-backed (decentralized):**\n- **DAI** (MakerDAO): Over-collateralized — lock $150 of ETH to mint $100 DAI\n- Peg maintained through liquidations and stability fees\n- Risk: collateral volatility during market crashes\n\n**Algorithmic (no collateral) — CASE STUDY:**\n- **TerraUST / LUNA (2022 collapse):**\n- UST maintained peg via arbitrage: burn $1 LUNA → mint 1 UST, burn 1 UST → mint $1 LUNA\n- When confidence broke in May 2022, death spiral: UST lost peg → panic burn UST → LUNA hyperinflation → more panic\n- **$40B+ wiped in 72 hours**; LUNA went from $80 → $0.0001\n- Contagion toppled Three Arrows Capital, Celsius, Voyager, BlockFi\n\n**Lesson**: Algorithmic stablecoins without hard collateral backing are fundamentally fragile — reflexivity amplifies crashes.",
          highlight: ["stablecoin", "USDC", "DAI", "TerraUST", "algorithmic", "death spiral", "collateral"],
        },
        {
          type: "teach",
          title: " DeFi Tokens & NFTs",
          content:
            "**DeFi Governance Tokens** grant holders voting rights over protocol parameters.\n\n- **UNI** (Uniswap): governance over the largest DEX (~$1.5B daily volume). Holders vote on fee switches, treasury.\n- **AAVE**: governance over the leading lending protocol (~$15B TVL). Fee accrual proposals ongoing.\n- **CRV** (Curve): governance over the dominant stablecoin DEX. veCRV model: lock tokens to boost rewards and direct emissions (\"Curve wars\").\n\n**Utility tokens** grant access to platform features, pay fees, or are burned on usage.\n\n**NFTs (Non-Fungible Tokens):**\nEach NFT is a unique on-chain certificate of ownership (ERC-721 standard).\n\nUse cases (beyond profile pictures):\n- **Gaming**: tradable in-game items with real-world scarcity\n- **Real-world asset (RWA) tokenization**: fractionalized real estate, art, T-bills\n- **Event tickets**: programmable royalties, anti-counterfeiting\n- **Music royalties**: artists sell future revenue streams as NFTs\n\n**Market cycle note**: NFT trading volumes peaked at ~$17B/month in Jan 2022, fell 97%+ by 2023. RWA tokenization ($1.5T+ addressable) is the next narrative.",
          highlight: ["governance token", "UNI", "AAVE", "CRV", "NFT", "RWA", "tokenization"],
        },
        {
          type: "quiz-mc",
          question:
            "What happened to TerraUST and LUNA in May 2022?",
          options: [
            "The algorithmic stablecoin lost its peg, triggering a death spiral that wiped $40B+ as LUNA hyperinflated toward zero",
            "Terra was hacked and $40B was stolen by North Korean hackers from the reserve vault",
            "The SEC shut down Terra for securities violations, freezing all user funds",
            "LUNA merged with another blockchain and UST was redeemed at par value",
          ],
          correctIndex: 0,
          explanation:
            "TerraUST was an algorithmic stablecoin with no hard collateral — its peg relied entirely on LUNA arbitrage mechanics. When selling pressure broke the $1 peg, a death spiral ensued: users burned UST for newly minted LUNA, hyperinflating LUNA supply and crushing its value, which destroyed confidence in UST further. Over $40B in market cap evaporated in 72 hours. The collapse caused contagion across the entire crypto industry.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor is comparing USDC, DAI, and TerraUST (before its collapse). USDC holds 1:1 cash/T-bills in regulated banks. DAI requires $150 collateral to mint $100. TerraUST required no collateral — only LUNA arbitrage mechanics.",
          question:
            "Ranking these from MOST to LEAST likely to maintain a $1 peg during a severe market crash, which order is correct?",
          options: [
            "USDC → DAI → TerraUST: fiat-backed > over-collateralized > uncollateralized",
            "DAI → USDC → TerraUST: crypto-backed overcollateralization is the safest",
            "TerraUST → USDC → DAI: algorithmic is most flexible during volatility",
            "All three are equally safe as they all target $1 peg",
          ],
          correctIndex: 0,
          explanation:
            "USDC is safest because its backing (USD in banks) is independent of crypto market conditions. DAI is second because over-collateralization provides a buffer — ETH must fall far enough to trigger liquidations before the peg breaks. TerraUST was most vulnerable because without real collateral, confidence alone held the peg, and confidence is precisely what evaporates during crashes.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: DeFi Protocols ────────────────────────────────────────────────
    {
      id: "crypto-defi-3",
      title: " DeFi Protocols",
      description:
        "AMMs, lending protocols, yield farming, impermanent loss, and cross-chain bridges",
      icon: "ArrowLeftRight",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🦄 Automated Market Makers (AMMs)",
          content:
            "Traditional exchanges use order books (buyers and sellers post bids/asks). DeFi replaces this with **Automated Market Makers** — algorithmic pricing via liquidity pools.\n\n**Uniswap's constant product formula:**\n`x × y = k`\nWhere x = token A reserves, y = token B reserves, k = constant.\n\nExample: ETH/USDC pool with 100 ETH and 200,000 USDC:\nk = 100 × 200,000 = 20,000,000\n\nIf a trader buys 10 ETH:\nNew ETH = 90 → new USDC = 20,000,000 / 90 = **222,222 USDC**\nTrader paid 222,222 – 200,000 = **22,222 USDC** for 10 ETH\nEffective price: $2,222/ETH vs. starting price $2,000/ETH\n(+11% **price impact** for a 10% pool depletion)\n\n**Key concepts:**\n- **Liquidity providers (LPs)** deposit equal value of both tokens and earn 0.3% fees on every trade\n- **Slippage**: price moves against you during execution — worse in shallow pools\n- **Price impact**: your trade size relative to pool depth determines execution quality\n- Large trades should route through aggregators (1inch) to minimize impact",
          highlight: ["AMM", "liquidity pool", "x*y=k", "price impact", "slippage", "liquidity provider"],
        },
        {
          type: "teach",
          title: " Lending Protocols: AAVE & Compound",
          content:
            "DeFi lending allows anyone to **supply assets to earn yield** or **borrow against collateral** — no banks, no credit checks.\n\n**How it works (AAVE example):**\n1. Lenders deposit USDC → receive aUSDC (interest-bearing token)\n2. Borrowers deposit ETH as collateral → borrow up to 80% of value in USDC\n3. Interest rates adjust algorithmically based on utilization rate\n\n**Utilization rate** = Borrowed / (Deposited + Borrowed)\nAt 50% utilization: USDC supply APY ~2%, borrow APY ~4%\nAt 90% utilization: supply APY ~15%, borrow APY ~30% (incentivizes more deposits)\n\n**Health Factor:**\nHF = (Collateral value × Liquidation threshold) / Borrowed value\nHF > 1.0: position is safe\nHF < 1.0: **liquidation** — a bot automatically sells your collateral to repay the loan (at a penalty)\n\nExample: Deposit $10,000 ETH (80% LTV). Borrow $8,000 USDC.\nETH drops 30% → collateral = $7,000 → HF drops below 1.0 → liquidation.\n\n**Flash loans**: uncollateralized loans that must be borrowed and repaid in a single transaction block. Used for arbitrage and liquidations.",
          highlight: ["AAVE", "Compound", "utilization rate", "health factor", "liquidation", "flash loan", "collateral"],
        },
        {
          type: "teach",
          title: "🌾 Yield Farming & APY vs APR",
          content:
            "**Yield farming** = maximizing returns by providing liquidity or lending across DeFi protocols, often earning both trading fees AND governance token rewards.\n\n**APR vs APY:**\n- **APR** (Annual Percentage Rate): simple interest, no compounding\n- **APY** (Annual Percentage Yield): includes compounding effect\n- APY = (1 + APR/n)^n – 1 (where n = compounding periods per year)\n\nExample: 100% APR compounded daily:\nAPY = (1 + 1.0/365)^365 – 1 = **171% APY**\n\n**Typical yield farming structure:**\n1. Deposit tokens in Uniswap pool → earn 0.3% trading fees (base yield)\n2. Stake LP token in farm → earn protocol governance tokens (bonus yield)\n3. Total APY = fee yield + token emission yield\n\n**Risks of high-APY farms:**\n- Token emissions dilute supply → token price falls → APY was illusory\n- Smart contract exploits\n- Impermanent loss (covered next)\n- Rug pulls: anonymous dev drains liquidity pool and disappears\n\n**Rule of thumb**: Sustainably high yields (>20% APY in stablecoins) almost always carry hidden risks. \"If the yield is real, ask what the risk is.\"",
          highlight: ["yield farming", "APY", "APR", "LP token", "governance token", "rug pull", "token emissions"],
        },
        {
          type: "teach",
          title: " Impermanent Loss & Bridges",
          content:
            "**Impermanent Loss (IL)** is the opportunity cost of providing liquidity versus simply holding both tokens.\n\n**Why it happens:**\nAMM pools rebalance automatically via arbitrage. If ETH doubles, arbitrageurs buy ETH from the pool until the pool price matches the market — leaving you with less ETH and more USDC than if you had just held.\n\n**IL formula (simplified):**\nFor price ratio change r:\nIL = 2√r/(1+r) – 1\n\nIf ETH doubles (r = 2): IL = 2√2/3 – 1 = –5.72%\nIf ETH 4×: IL = 2×2/5 – 1 = –20%\nIL accelerates with larger price swings.\n\n**When IL disappears**: only if price returns to entry level — hence \"impermanent.\" If you withdraw while prices diverged, the loss is realized.\n\n**Breakeven**: Fee income must exceed IL. High-volume, stable pairs (ETH/USDC at 0.3% fee) can often offset moderate IL.\n\n**Cross-chain bridges:**\nBridges allow moving assets between blockchains (e.g., ETH on Ethereum → ETH on Arbitrum).\n- Lock tokens on source chain, mint wrapped tokens on destination\n- Major hack vector: **$2B+** stolen from bridges (Ronin, Wormhole, Nomad)\n- Prefer canonical bridges (slower, safer) over third-party bridges for large amounts",
          highlight: ["impermanent loss", "AMM rebalancing", "bridge", "cross-chain", "Ronin hack", "fee income"],
        },
        {
          type: "quiz-mc",
          question:
            "What is 'impermanent loss' in the context of providing liquidity to an AMM?",
          options: [
            "The loss compared to simply holding both assets, caused by AMM rebalancing when prices diverge",
            "A permanent loss of funds when a smart contract is hacked",
            "The gas fees paid when depositing into a liquidity pool",
            "The loss from slippage on your own trade when the pool is shallow",
          ],
          correctIndex: 0,
          explanation:
            "Impermanent loss is the difference in value between providing liquidity versus holding both tokens outright. When prices diverge, arbitrageurs rebalance the pool, leaving LPs with less of the appreciating asset and more of the depreciating one. It is 'impermanent' only if prices return to the original ratio — if you exit while prices are diverged, the loss is permanent. Trading fee income can offset IL, but large price swings can exceed fee income.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "On AAVE, if your Health Factor drops below 1.0, your collateral can be automatically liquidated by smart contract bots to repay your loan.",
          correct: true,
          explanation:
            "True. When a borrower's Health Factor (collateral value × liquidation threshold / borrowed value) falls below 1.0, the position is undercollateralized. Liquidator bots monitor the blockchain and immediately repay part of the loan in exchange for the collateral at a discount (liquidation bonus, typically 5–10%). This is fully automated — there is no grace period or customer service call.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Crypto Risk Analysis ─────────────────────────────────────────
    {
      id: "crypto-defi-4",
      title: " Crypto Risk Analysis",
      description:
        "Volatility, regulatory risk, smart contract exploits, custody risk, and on-chain metrics",
      icon: "ShieldAlert",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: " Volatility & Correlation Dynamics",
          content:
            "Crypto is the most volatile major asset class. Understanding its risk profile is essential before investing.\n\n**Bitcoin volatility benchmarks:**\n- Annualized volatility: ~60–80% (vs ~15–20% for S&P 500)\n- Historical drawdowns: BTC has had 5+ drawdowns exceeding 80%\n  - 2011: –94% | 2013–15: –87% | 2017–18: –84% | 2021–22: –77%\n- **Beta to S&P 500** typically ranges **1.5–3.0×** in normal markets\n\n**Correlation regime shift:**\nCrypto was marketed as \"uncorrelated\" to equities — often true during normal periods (correlation ~0.1–0.3). However, during **risk-off crashes** (COVID March 2020, rate hike cycle 2022), correlation spikes toward **1.0** — crypto sells off with everything else as investors raise cash.\n\nThis is called **\"correlation going to 1 in a crisis\"** — the diversification benefit disappears precisely when you need it most.\n\n**Altcoin volatility:**\nAltcoins typically have beta of 1.5–3.0× relative to BTC. In a BTC bear market, alts often fall 2–5× more. Small-cap tokens can go to zero entirely.\n\n**Practical implication**: Even a 5% crypto allocation can dominate your portfolio's volatility contribution.",
          highlight: ["volatility", "drawdown", "beta", "correlation", "risk-off", "altcoin"],
        },
        {
          type: "teach",
          title: "⚖️ Regulatory Risk",
          content:
            "Regulation is the single biggest binary risk for crypto — laws can change overnight, affecting prices dramatically.\n\n**United States — SEC enforcement:**\n- SEC under Gensler (2021–2024) took aggressive enforcement: sued Coinbase, Binance, Ripple (XRP), Kraken\n- Core debate: are crypto tokens **securities** (SEC jurisdiction) or **commodities** (CFTC jurisdiction)?\n- XRP ruling (2023): secondary market XRP sales are not securities — partial win for industry\n- Spot Bitcoin ETF approved Jan 2024: first major regulatory green light in the US\n\n**Europe — MiCA (Markets in Crypto-Assets):**\n- Comprehensive framework effective 2024–2025\n- Requires stablecoin issuers to hold 1:1 reserves; bans algorithmic stablecoins above €200M market cap\n- Creates legal clarity — positive for institutional adoption\n\n**China bans:**\n- China banned crypto trading and mining multiple times (2017, 2021)\n- 2021 ban caused Bitcoin to fall ~50% as miners relocated\n- China's digital yuan (e-CNY) is the government's preferred alternative\n\n**Investor takeaway**: Regulatory clarity = institutional adoption = higher liquidity and valuations. Regulatory crackdowns = short-term pain but surviving assets often recover stronger.",
          highlight: ["SEC", "MiCA", "securities", "regulatory risk", "spot Bitcoin ETF", "enforcement"],
        },
        {
          type: "teach",
          title: " Smart Contract Risk & Hacks",
          content:
            "Smart contracts are code — and code has bugs. The permissionless nature of DeFi means attackers can exploit vulnerabilities instantly, with no recourse.\n\n**2022 DeFi hack total: ~$3.8 billion stolen**\nMajor incidents:\n- **Ronin Network (Axie Infinity)**: $625M — 5 of 9 validator private keys compromised via social engineering (North Korea)\n- **Wormhole bridge**: $320M — integer overflow bug in Solana-side contract\n- **Nomad bridge**: $190M — flawed initialization meant any user could drain funds\n- **Beanstalk Protocol**: $182M — flash loan governance attack (voted to send funds in 1 block)\n\n**Attack types:**\n- **Reentrancy**: contract calls external contract before updating state (The DAO hack, 2016, $60M)\n- **Flash loan attacks**: borrow billions uncollateralized to manipulate prices in the same transaction\n- **Rug pulls**: developers drain admin-controlled liquidity; most common in new meme coins\n- **Oracle manipulation**: manipulate price feeds to trick lending protocol into allowing undercollateralized borrows\n\n**Risk mitigation:**\n- Use only audited protocols (Certik, Trail of Bits, Consensys Diligence)\n- Check time-in-market — older protocols have survived more attack attempts\n- Diversify across protocols — never keep all DeFi exposure in one smart contract",
          highlight: ["smart contract risk", "reentrancy", "flash loan attack", "rug pull", "oracle manipulation", "audit"],
        },
        {
          type: "teach",
          title: " Custody Risk & On-Chain Metrics",
          content:
            "**\"Not your keys, not your crypto\" — FTX case study:**\nFTX was the second-largest crypto exchange. In November 2022:\n- CoinDesk revealed FTX's sister firm Alameda Research held most of its balance sheet in FTT (FTX's own token)\n- Binance announced it would sell all FTT holdings → bank run\n- FTX halted withdrawals within 72 hours; filed for Chapter 11\n- ~$8B in customer funds missing; Sam Bankman-Fried arrested and convicted\n- Lesson: exchanges (even \"reputable\" ones) can be insolvent — always verify proof of reserves\n\n**On-chain risk metrics for Bitcoin:**\n\n**NVT Ratio** (Network Value to Transactions):\nNVT = Market Cap / Daily On-Chain Transaction Volume\nHigh NVT (>100) = network is overvalued relative to use → bearish signal\nLow NVT (<50) = undervalued → bullish signal (similar to P/E for stocks)\n\n**Active Addresses**: Rising active addresses = growing adoption. Falling addresses during price rise = divergence (bearish)\n\n**Exchange Outflows**: When Bitcoin moves off exchanges into cold wallets (outflows spike), supply available for selling decreases → bullish. Inflows = potential selling pressure → bearish.\n\n**SOPR (Spent Output Profit Ratio)**: Whether coins are being moved at profit or loss. SOPR < 1 in bear markets (capitulation); SOPR > 1 in bull markets.",
          highlight: ["FTX", "custody risk", "NVT ratio", "active addresses", "exchange outflows", "SOPR", "proof of reserves"],
        },
        {
          type: "quiz-mc",
          question:
            "What does 'not your keys, not your crypto' mean in practice?",
          options: [
            "If crypto is held on a centralized exchange, the exchange controls the private keys and you have a credit claim — not actual ownership",
            "You must physically print your private keys on paper or they are legally invalid",
            "Crypto held in hardware wallets is insured by the FDIC up to $250,000",
            "You need a private key to view your balance but not to make transactions",
          ],
          correctIndex: 0,
          explanation:
            "When you hold crypto on an exchange like Coinbase or (formerly) FTX, you don't hold the private keys — the exchange does. Your 'balance' is an IOU from the exchange. If the exchange becomes insolvent (as FTX did), goes offline, or freezes withdrawals, you may lose access to your funds. True ownership requires self-custody: controlling your own private keys via a hardware wallet or non-custodial software wallet.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Bitcoin's NVT ratio has risen from 60 to 140 over the past month. On-chain active addresses are flat. However, Bitcoin's price has risen 40%. Meanwhile, exchange outflows (coins moving to cold wallets) are at a 3-year high.",
          question:
            "How should an on-chain analyst interpret these mixed signals?",
          options: [
            "Cautiously bullish: high NVT and flat addresses suggest overvaluation, but exchange outflows indicate long-term holders accumulating — near-term overbought, but supply squeeze building",
            "Strongly bullish: all signals confirm each other — buy aggressively",
            "Strongly bearish: high NVT always predicts an immediate crash regardless of other signals",
            "The signals are meaningless because on-chain metrics don't predict price movements",
          ],
          correctIndex: 0,
          explanation:
            "On-chain analysis rarely gives clean signals. High NVT (overvaluation signal) combined with flat addresses (weak fundamental growth) suggests the price rise may be speculative. However, high exchange outflows mean coins are moving to cold wallets — holders are not preparing to sell, which reduces near-term supply pressure. A sophisticated analyst would note short-term overextension risk while acknowledging the medium-term bullish supply dynamics.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Crypto Portfolio Strategy ────────────────────────────────────
    {
      id: "crypto-defi-5",
      title: "📐 Crypto Portfolio Strategy",
      description:
        "Sizing, core/satellite allocation, DCA, tax treatment, and custody strategies",
      icon: "PieChart",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⚖️ Sizing Crypto in a Portfolio",
          content:
            "Given crypto's extreme volatility, position sizing is the most critical decision — more important than which coins to buy.\n\n**General framework:**\n- **Conservative (preservation-focused)**: 0–2% of total portfolio\n- **Moderate (balanced growth)**: 2–5%\n- **Aggressive (high risk tolerance)**: 5–10%\n- Beyond 10%: crypto begins to dominate portfolio risk unless you have extremely high tolerance\n\n**The volatility math:**\nIf BTC is 60% annualized vol and you hold 10% of your portfolio:\nContribution to portfolio vol ≈ 0.10 × 60% = 6% — significant for most portfolios\n\n**Max drawdown planning:**\nBefore investing, ask: \"If this drops 80%, am I still OK financially and psychologically?\"\nA 10% allocation that drops 80% = –8% total portfolio impact\nA 50% allocation that drops 80% = –40% total portfolio impact\n\n**Institutional sizing:**\nEndowments (Yale, MIT): 5–15% in \"real assets\" including crypto\nFamily offices: 1–5% allocation increasingly common post-Bitcoin ETF\nRetail financial advisors: most recommend no more than 5%\n\n**Dollar-cost averaging (DCA) reduces timing risk** — spreading purchases over time avoids buying the exact top.",
          highlight: ["position sizing", "portfolio volatility", "max drawdown", "DCA", "allocation", "risk tolerance"],
        },
        {
          type: "teach",
          title: " Core/Satellite Allocation",
          content:
            "The **Core/Satellite** framework helps structure a crypto portfolio to balance stability with upside.\n\n**Core (60–80% of crypto allocation): BTC + ETH**\n- Bitcoin: store of value, institutional adoption, deepest liquidity, lowest volatility among crypto\n- Ethereum: programmable money, revenue-generating network (burns fees), ETF-eligible\n- These are the only two with clear institutional narratives and proven 10+ year track records\n\n**Satellite (20–40%): higher-risk, higher-potential assets**\n- Large-cap L1s (SOL, AVAX): established ecosystems with real usage\n- L2 tokens (ARB, OP): leveraged play on Ethereum growth\n- DeFi blue chips (UNI, AAVE, CRV): real protocol revenue, but governance token value accrual uncertain\n- Caution: Small-cap altcoins and meme coins are speculation, not investment\n\n**Example $10,000 crypto portfolio (5% of $200K net worth):**\n- BTC: $4,000 (40%)\n- ETH: $3,000 (30%)\n- SOL: $1,500 (15%)\n- ARB + OP: $1,000 (10%)\n- DeFi (AAVE/UNI): $500 (5%)\n\n**Rebalancing**: Set thresholds (e.g., rebalance when any position exceeds 25% of crypto portfolio) to avoid concentration.",
          highlight: ["core satellite", "Bitcoin", "Ethereum", "rebalancing", "altcoin", "diversification"],
        },
        {
          type: "teach",
          title: " Tax Treatment of Crypto",
          content:
            "Crypto tax rules are complex and vary by jurisdiction — mistakes are costly. In the **United States** (IRS guidance):\n\n**Taxable events:**\n- Selling crypto for USD → capital gain/loss\n- **Crypto-to-crypto swaps (BTC → ETH)** → **taxable event** (treated as property sale)\n- Using crypto to pay for goods/services → taxable at fair market value\n- Receiving mining or staking rewards → **ordinary income** at receipt\n- Receiving airdrops → ordinary income at fair market value\n\n**Non-taxable events:**\n- Buying crypto with USD (no gain yet)\n- Transferring between your own wallets\n- Gifting crypto (under annual exclusion limits)\n\n**Capital gains rates (US):**\n- Hold > 1 year → long-term rates: 0%, 15%, or 20% (based on income)\n- Hold < 1 year → short-term rates: ordinary income rates (up to 37%)\n- DeFi trades (LP entry/exit, yield claims) are fully taxable — often generate thousands of taxable events\n\n**Crypto-specific considerations:**\n- FIFO vs specific identification: choosing which lot you sold affects your gain\n- Wash sale rules do NOT currently apply to crypto (unlike stocks) — you can harvest losses and immediately rebuy\n- Use tax software (Koinly, TaxBit, CoinTracker) to handle thousands of on-chain transactions",
          highlight: ["taxable event", "crypto-to-crypto", "staking income", "capital gains", "loss harvesting", "FIFO"],
        },
        {
          type: "teach",
          title: "🔐 Custody Strategies",
          content:
            "For crypto holdings above $5,000–10,000, self-custody becomes a serious consideration given exchange risk.\n\n**Hardware wallets (cold storage):**\n- **Ledger**: most popular, supports 5,500+ tokens, Bluetooth mobile app. Note: 2020 data breach exposed customer emails (device security unaffected).\n- **Trezor**: open-source firmware, slightly less polished UX. Model T has touchscreen.\n- Cost: $79–$219. Worth it for meaningful crypto holdings.\n- Best practice: buy only from manufacturer directly — tampered devices have been sold on Amazon.\n\n**Multi-signature (multi-sig):**\n- Requires M-of-N private key signatures to authorize transactions (e.g., 2-of-3)\n- One key on hardware wallet, one on separate device, one in secure offline backup\n- Eliminates single point of failure — even if one key is compromised, funds are safe\n- Protocols: Gnosis Safe (Ethereum), native Bitcoin multi-sig\n\n**Institutional custodians:**\n- For large portfolios: Coinbase Custody (SOC 2), BitGo (SOC 2 Type II), Fidelity Digital Assets\n- Regulated, insured, bankruptcy-remote structures\n- Minimum investments typically $100K–$500K\n\n**Seed phrase backup:**\n- Store on metal (Cryptosteel, Bilodeau) — paper burns, corrodes\n- Never photograph or store digitally\n- Consider splitting via Shamir Secret Sharing for ultimate security",
          highlight: ["hardware wallet", "Ledger", "Trezor", "multi-signature", "seed phrase", "institutional custodian", "cold storage"],
        },
        {
          type: "quiz-mc",
          question:
            "In the United States, if you swap Bitcoin for Ethereum (BTC → ETH), what are the tax implications?",
          options: [
            "It is a taxable event — treated as selling BTC at fair market value, triggering capital gains or losses",
            "No tax is owed until you convert back to USD — crypto-to-crypto swaps are tax-deferred",
            "It is taxed as ordinary income at the full swap value regardless of your purchase price",
            "Crypto-to-crypto swaps are exempt from tax under the like-kind exchange rules (Section 1031)",
          ],
          correctIndex: 0,
          explanation:
            "The IRS treats cryptocurrency as property. Swapping BTC for ETH is treated as selling BTC at its current fair market value and using the proceeds to buy ETH. This triggers a capital gain (if BTC appreciated) or capital loss (if BTC declined) at the moment of the swap. Like-kind exchange rules (Section 1031) explicitly do NOT apply to crypto as of the 2017 Tax Cuts and Jobs Act — they only cover real property.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Receiving staking rewards on Ethereum is not a taxable event until you sell the staked ETH.",
          correct: false,
          explanation:
            "False. The IRS issued guidance (Revenue Ruling 2023-14) that staking rewards are taxable as ordinary income in the year they are received, at the fair market value when they are received. This is similar to receiving dividends. A separate tax event occurs when you eventually sell the staking rewards (capital gains on any appreciation since receipt). This means DeFi yield farmers and stakers often have very complex tax situations.",
          difficulty: 2,
        },
      ],
    },
  ],
};
