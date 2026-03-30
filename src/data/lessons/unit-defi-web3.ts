import type { Unit } from "./types";

export const UNIT_DEFI_WEB3: Unit = {
 id: "defi-web3",
 title: "DeFi & Web3",
 description:
 "Master DeFi protocols, AMMs, L2 scaling, DAO governance, NFTs, and advanced DeFi risk management",
 icon: "Link",
 color: "#6366f1",
 lessons: [
 // Lesson 1: DeFi Protocols Deep Dive 
 {
 id: "defi-web3-1",
 title: "DeFi Protocols Deep Dive",
 description:
 "AMMs, lending protocols, yield farming mechanics, impermanent loss, and flash loans",
 icon: "Zap",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Automated Market Makers (AMMs)",
 content:
 "**Automated Market Makers (AMMs)** replaced traditional order books with algorithmic pricing using liquidity pools.\n\n**Uniswap constant product formula: x × y = k**\nTwo tokens (x and y) are held in a pool. The product k must remain constant after every trade.\n\nExample: Pool has 100 ETH (x) and 200,000 USDC (y) k = 20,000,000\nIf a trader buys 10 ETH:\n- New ETH reserve: 90\n- New USDC reserve: 20,000,000 / 90 = 222,222\n- Trader pays: 222,222 - 200,000 = 22,222 USDC\n- Effective price: $2,222/ETH (vs spot $2,000) — this difference is **price impact**\n\n**Price impact** grows with trade size relative to pool depth. A $100K trade in a $1M pool causes ~10% slippage.\n\n**LP tokens:** When you deposit into a pool, you receive LP (liquidity provider) tokens representing your share. These tokens earn a pro-rata portion of swap fees (typically 0.3% on Uniswap v2).\n\n**Concentrated liquidity (Uniswap v3):**\nLPs can concentrate liquidity within custom price ranges (ticks) instead of across the full [0, ] curve. A LP providing liquidity only between $1,800–$2,200 ETH achieves up to 4,000× capital efficiency versus v2 — earning the same fees with far less capital. However, if the price leaves the range, the LP earns zero fees until price returns.",
 highlight: ["AMM", "constant product", "LP tokens", "price impact", "concentrated liquidity", "tick"],
 },
 {
 type: "teach",
 title: "Lending Protocols: Aave & Compound",
 content:
 "**DeFi lending** allows users to borrow and lend crypto assets without intermediaries, governed by smart contracts.\n\n**Collateralization ratio:**\nDeFi loans are over-collateralized. To borrow $1,000 USDC you might need to deposit $1,500 ETH (150% collateral ratio). The **loan-to-value (LTV)** limit is set per asset — riskier assets have lower LTV (e.g., LINK at 70% vs ETH at 82%).\n\n**Health factor:**\nHealth factor = (Collateral value × Liquidation threshold) / Borrowed amount\n- Health factor > 1: position is safe\n- Health factor < 1: position is liquidatable\n\nWhen a position becomes undercollateralized, liquidators repay part of the debt and receive the collateral at a 5–15% discount — incentivizing rapid liquidation.\n\n**Interest rate models (utilization-based):**\nInterest rate = f(utilization ratio), where utilization = borrowed / total supplied\n- Low utilization low rates (e.g., 1% borrow APY) to attract borrowers\n- High utilization (>90%) rates spike sharply (e.g., 50–100% APY) to discourage borrowing and incentivize new supply\n- This creates an automatic equilibrium mechanism\n\n**Flash loans:**\nUncollateralized loans that must be borrowed AND repaid within a single blockchain transaction (one atomic execution). If repayment fails, the entire transaction reverts — no loss possible.\n\nLegitimate uses: arbitrage across DEXes, collateral swaps, self-liquidation to avoid penalty, one-click position migration between protocols.",
 highlight: ["collateralization", "health factor", "liquidation", "utilization rate", "flash loan", "atomic"],
 },
 {
 type: "teach",
 title: "Yield Farming Mechanics",
 content:
 "**Yield farming** is the practice of deploying capital across DeFi protocols to maximize returns from multiple simultaneous sources.\n\n**LP token staking:**\nProvide liquidity receive LP tokens stake LP tokens in the protocol's farm earn additional governance token emissions on top of swap fees.\n\n**Token emissions schedule:**\nMost protocols emit tokens on a declining schedule (e.g., 1,000 tokens/day in month 1, 500 in month 2). Early farmers earn the highest token APY, but selling pressure from emissions often erodes token price.\n\n**APY vs APR:**\n- **APR** (Annual Percentage Rate): simple interest, no compounding\n- **APY** (Annual Percentage Yield): includes effect of compounding\n- APY = (1 + APR/n)^n - 1 where n = compounding periods\n- A 100% APR compounded daily = 171.5% APY\n\n**Impermanent Loss (IL):**\nWhen the price ratio of tokens in an LP position changes, LPs underperform simply holding the tokens. The formula:\n\nIL = 2r / (1 + r) - 1\n\nWhere r = new price / old price\n\nAt 2× price increase (r = 2): IL = 22 / 3 - 1 -5.7%\nAt 4× price increase (r = 4): IL = 2×2 / 5 - 1 = -20%\n\n**Real yield vs inflationary yield:**\n- **Real yield**: fees generated from actual protocol revenue (sustainable)\n- **Inflationary yield**: token emissions funded by new token issuance (unsustainable — dilutes holders)\n- Protocols like GMX and Curve pioneered real yield models",
 highlight: ["yield farming", "LP token staking", "emissions", "APY", "APR", "impermanent loss", "real yield"],
 },
 {
 type: "quiz-mc",
 question:
 "If you provide equal-value ETH and USDC liquidity to a Uniswap v2 pool and ETH price doubles (r = 2), what is approximately your impermanent loss compared to simply holding both tokens?",
 options: [
 "-5.7% (using IL = 22/3 - 1)",
 "-20% (price doubled so loss doubles)",
 "-2.0% (small moves have small impact)",
 "0% (impermanent loss only applies if you withdraw)",
 ],
 correctIndex: 0,
 explanation:
 "Using the impermanent loss formula IL = 2r/(1+r) - 1 where r = 2: IL = 2×2/(1+2) - 1 = 2×1.414/3 - 1 = 0.943 - 1 = -5.7%. This means your LP position is worth 5.7% less than if you had just held the two tokens separately. The loss is 'impermanent' because if the price returns to the original ratio, the loss disappears — but if you withdraw while the price is different, it becomes permanent.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Flash loans in DeFi are uncollateralized because they must be borrowed and repaid within the same blockchain transaction — if repayment fails, the entire transaction reverts as if the loan never happened.",
 correct: true,
 explanation:
 "True. Flash loans exploit the atomic nature of blockchain transactions. Because all steps (borrow use funds repay + fee) execute atomically in one transaction, there is zero counterparty risk — if the final repayment step fails, the EVM reverts every state change including the initial loan disbursement. This makes uncollateralized lending safe for the protocol. Legitimate uses include arbitrage, collateral swaps, and self-liquidation.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are evaluating a yield farm offering 800% APY on a new token. The farm launched 3 days ago and has $2M TVL. The APY comes primarily from token emissions (90%) and swap fees (10%). The token has no external exchange listing yet. A friend says 'get in early for maximum yield.'",
 question:
 "What is the primary risk of this yield farming opportunity?",
 options: [
 "Inflationary yield from emissions will likely cause token price to collapse as early farmers sell, making the 800% APY illusory in dollar terms",
 "The 10% real yield from swap fees is too low to sustain the protocol",
 "Small TVL means gas fees will consume most of your farming profits",
 "The protocol cannot be trusted without a 3-year track record",
 ],
 correctIndex: 0,
 explanation:
 "This is a classic 'mercenary capital' farm. 90% of the yield is inflationary token emissions. Early farmers receive tokens at low cost but are incentivized to immediately sell them — driving the token price down faster than new participants can earn. The 800% APY is calculated at current token price, which will likely collapse as supply floods the market. Real yield (10% from fees) on $2M TVL = ~$200K/year — far less than the $16M/year implied by 800% APY. Look for protocols where >50% of yield is real yield from genuine protocol revenue.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Blockchain Infrastructure 
 {
 id: "defi-web3-2",
 title: "Blockchain Infrastructure",
 description:
 "Consensus mechanisms, Layer 2 scaling, cross-chain bridges, and bridge security risks",
 icon: "Network",
 xpReward: 80,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Consensus Mechanisms Compared",
 content:
 "**Consensus mechanisms** define how a decentralized network agrees on the canonical state of the ledger — and who earns the right to add new blocks.\n\n**Proof of Work (PoW):**\nMiners race to find a hash below a target difficulty (SHA-256 for Bitcoin). Winner earns block reward. Security is proportional to hash rate — a 51% attack requires controlling majority of global mining power, which costs billions of dollars in hardware and electricity for major chains.\n- Bitcoin: ~500 EH/s hash rate, ~120 TWh/year energy consumption\n- Downside: inherently wasteful; smaller PoW chains are vulnerable (Ethereum Classic was 51%-attacked multiple times)\n\n**Proof of Stake (PoS):**\nValidators lock up native tokens as collateral. They are pseudo-randomly selected to propose blocks proportional to stake. **Slashing** destroys a validator's staked tokens for provably malicious behavior (double-signing).\n- Ethereum: 32 ETH minimum stake (~$80K), 99.9% less energy than PoW, ~$50B+ staked securing the network\n\n**Delegated PoS (DPoS):**\nToken holders vote for a small set of delegates (e.g., 21 on EOS, 27 on TRON). Delegates validate all blocks. Faster but more centralized — criticized for cartel behavior among top delegates.\n\n**Proof of History (PoH — Solana):**\nA cryptographic clock encoding a verifiable sequence of events into the chain itself. Allows validators to agree on transaction ordering without communication overhead enables 65,000 TPS theoretical throughput with sub-second finality. Trade-off: higher hardware requirements and historical network outages during demand spikes.",
 highlight: ["Proof of Work", "Proof of Stake", "slashing", "Delegated PoS", "Proof of History", "51% attack"],
 },
 {
 type: "teach",
 title: "Layer 2 Scaling Solutions",
 content:
 "**Layer 2 (L2)** solutions inherit Ethereum's security while dramatically increasing throughput and reducing fees.\n\n**Optimistic Rollups (Arbitrum, Optimism, Base):**\nTransactions are executed off-chain and batched. The batch is posted to Ethereum L1 with the assumption that it is valid ('optimistic'). A **7-day fraud proof window** allows anyone to challenge invalid state transitions. After 7 days with no challenge, the state is finalized. Withdrawal from L2 to L1 takes up to 7 days unless using a bridge liquidity provider.\n- Arbitrum: $15B+ TVL, largest L2 by liquidity\n- Fees: typically $0.01–0.10 per transaction vs $1–50 on L1\n\n**ZK Rollups (zkSync Era, Starknet, Polygon zkEVM):**\nGenerate a **ZK-SNARK** (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) proof that cryptographically proves the validity of every state transition. No challenge window needed — **instant finality** as soon as the proof is verified on L1.\n- Mathematically stronger guarantees than optimistic rollups\n- More computationally expensive to generate proofs (historically required specialized hardware)\n- zkSync Era, Scroll, and Linea are leading implementations\n\n**State channels (Lightning Network on Bitcoin):**\nTwo parties lock funds on-chain, then transact off-chain by signing updated balance sheets. Only the final settlement is posted to the blockchain. Enables millions of micropayments for the cost of two on-chain transactions. Limited to pre-defined counterparties.\n\n**Validium:**\nLike ZK rollups but data is stored off-chain (by a data availability committee). Lower fees but weaker security guarantee — data could theoretically be withheld.",
 highlight: ["Optimistic Rollup", "ZK rollup", "ZK-SNARK", "fraud proof", "7-day window", "instant finality", "Lightning Network"],
 },
 {
 type: "teach",
 title: "Cross-Chain Bridges & Their Risks",
 content:
 "**Cross-chain bridges** allow assets to move between different blockchains. They are the most hacked infrastructure in all of crypto.\n\n**Lock-and-mint mechanism:**\n1. User locks 1 ETH in a bridge smart contract on Ethereum\n2. Bridge mints 1 'wrapped ETH' (wETH) on the destination chain (e.g., Solana)\n3. The wrapped token is redeemable 1:1 by burning it and unlocking the original\n\nThe locked assets are a single honeypot — all security depends on the bridge contracts and the off-chain validators/oracles that verify cross-chain messages.\n\n**Major bridge exploits:**\n- **Ronin Bridge (Mar 2022): $625M** — Axie Infinity's bridge; attacker compromised 5 of 9 validator keys (North Korea LAZARUS group)\n- **Wormhole Bridge (Feb 2022): $320M** — Signature verification bug allowed minting 120,000 wETH without collateral\n- **Nomad Bridge (Aug 2022): $190M** — A configuration error made any message appear pre-approved; copycat attacks drained $190M in hours\n- **Harmony Horizon (Jun 2022): $100M** — Compromised 2-of-5 multisig\n\n**Total stolen from bridges 2021–2023: >$2.5 billion**\n\n**Bridge risk assessment:**\n- **Canonical bridges** (Arbitrum Bridge, Optimism Bridge): secured by L2 fraud/ZK proofs — highest security but slowest\n- **Third-party bridges** (Stargate, Across): use liquidity pools + messaging protocols; faster but additional trust assumptions\n- **Trusted multi-sig bridges**: avoid — Ronin had only 9 validators",
 highlight: ["bridge", "lock-and-mint", "canonical bridge", "Ronin", "Wormhole", "Nomad", "multisig"],
 },
 {
 type: "quiz-mc",
 question:
 "What is the key difference between ZK rollups and Optimistic rollups in terms of withdrawal finality?",
 options: [
 "ZK rollups achieve instant finality via cryptographic proofs; Optimistic rollups have a 7-day fraud proof window before L1 finality",
 "Optimistic rollups are faster because they skip proof generation entirely and settle immediately",
 "ZK rollups require a 30-day challenge window while Optimistic rollups use instant ZK proofs",
 "Both have identical 7-day withdrawal windows but ZK rollups are cheaper",
 ],
 correctIndex: 0,
 explanation:
 "ZK rollups generate a ZK-SNARK proof that cryptographically proves the validity of every batch — Ethereum can verify this proof instantly, enabling near-immediate finality. Optimistic rollups assume validity but allow a 7-day challenge window during which anyone can submit a fraud proof if the batch contains invalid transactions. This 7-day window is why withdrawing from Optimistic rollups to Ethereum L1 takes a week (unless you use a liquidity provider who fronts the L1 funds).",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Canonical bridges (like the official Arbitrum or Optimism bridges) are generally safer than third-party bridges because their security is derived from the rollup's own fraud or ZK proof mechanisms rather than a separate set of trusted validators.",
 correct: true,
 explanation:
 "True. Canonical bridges inherit the security of the rollup itself — for Optimistic rollups, the 7-day fraud proof window; for ZK rollups, the cryptographic validity proof. This means you only trust the same math that secures the entire L2. Third-party bridges typically introduce additional trust assumptions through their own validator sets, multisigs, or oracle systems — as demonstrated by the Ronin ($625M), Wormhole ($320M), and Nomad ($190M) hacks, all of which targeted non-canonical bridge infrastructure.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You need to move $50,000 USDC from Ethereum mainnet to Arbitrum to participate in a yield farming opportunity. You have three options: (A) Official Arbitrum Bridge — takes 7 days to move funds back to Ethereum, (B) A third-party bridge with instant withdrawals backed by a 5-of-9 multisig with anonymous validators, (C) Stargate Finance — uses liquidity pools and LayerZero messaging with instant bridging.",
 question:
 "Which option represents the best risk/reward tradeoff for a $50,000 transfer?",
 options: [
 "Official Arbitrum Bridge (A) — canonical bridge inherits Arbitrum's security; the 7-day withdrawal delay only matters if you need funds back on L1 quickly",
 "Third-party multisig bridge (B) — anonymous validators with 5-of-9 is fine since they'd lose reputation if hacked",
 "Stargate (C) is always superior since it has instant withdrawals and LayerZero is unhackable",
 "Never bridge large amounts — keep all funds on Ethereum mainnet regardless of opportunity cost",
 ],
 correctIndex: 0,
 explanation:
 "The official Arbitrum Bridge is the safest option for a large transfer. Its security is backed by Arbitrum's fraud proof system — not a separate set of validators. The 7-day withdrawal window is a manageable trade-off when you plan to use funds on Arbitrum for yield farming anyway. Anonymous 5-of-9 multisig bridges are high risk — Harmony Horizon used a similar structure and was drained for $100M when two keys were compromised. Stargate/LayerZero is more reputable than anonymous multisigs but still introduces trust assumptions. For large sums, canonical bridges are the prudent choice.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: NFTs & Digital Ownership 
 {
 id: "defi-web3-3",
 title: "NFTs & Digital Ownership",
 description:
 "ERC-721/1155 standards, NFT valuation frameworks, market cycles, and creator economics",
 icon: "ImageIcon",
 xpReward: 70,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "NFT Mechanics & Standards",
 content:
 "**Non-Fungible Tokens (NFTs)** are unique digital assets whose ownership and provenance are recorded on a blockchain.\n\n**ERC-721 (unique NFTs):**\nEach token has a unique tokenId. No two tokens are identical. Standard used by CryptoPunks, Bored Ape Yacht Club, and most PFP (profile picture) collections. Each token is independently owned and transferable.\n\n**ERC-1155 (multi-token standard):**\nA single contract can contain both fungible (identical) and non-fungible tokens. Useful for gaming items: 10,000 identical common swords (fungible) + 1 unique legendary sword (non-fungible) in the same contract. Batch transfers save gas vs multiple ERC-721 transactions.\n\n**Metadata storage:**\nThe NFT token itself is a pointer — the actual image/media lives elsewhere:\n- **IPFS (InterPlanetary File System)**: content-addressed, decentralized storage. Link won't break if a server shuts down. Standard for 'decentralized' NFT storage.\n- **On-chain storage**: SVG or base64-encoded art embedded directly in the contract. Fully permanent but expensive. Used by Autoglyphs, Chain Runners.\n- **Centralized servers**: some early NFTs used HTTP URLs — if the company shuts down, the art disappears. Verify before buying.\n\n**Royalty enforcement (EIP-2981):**\nEIP-2981 is an on-chain royalty standard that signals creator royalty percentage to marketplaces. However, enforcement is voluntary — marketplaces like Blur made royalties optional in 2022 to attract volume. Blur's 0% royalty default eroded creator revenue while capturing 60%+ market share from OpenSea.",
 highlight: ["ERC-721", "ERC-1155", "IPFS", "on-chain storage", "royalty", "EIP-2981"],
 },
 {
 type: "teach",
 title: "NFT Valuation Frameworks",
 content:
 "**NFT valuation** is more subjective than traditional assets but several analytical frameworks help assess relative value.\n\n**Rarity score:**\nEach trait (background, eyes, clothing) has a frequency. Rarer combinations score higher. Tools like Rarity Sniper and trait normalization methods compute a composite rarity score. However, rarity is only one input — a rare trait that the community considers ugly may not command a premium.\n\n**Floor price:**\nThe lowest listed price in a collection — the minimum you'd pay to own any token. Floor price tracks sentiment and liquidity. A rising floor with rising volume signals organic demand; a rising floor with falling volume may indicate thin liquidity.\n\n**Volume trends:**\nDaily/weekly trading volume reveals momentum. Declining volume on a falling floor = distribution phase (holders exiting). Spikes on an otherwise flat floor = wash trading suspicion.\n\n**Holder distribution (whale concentration):**\nCheck what percentage of supply is held by the top 10 wallets. >30% concentration in a few wallets = whale manipulation risk. Scattered ownership across thousands of wallets signals more organic community adoption.\n\n**Project utility:**\n- **Access & events**: Bored Ape holders get ApeFest tickets and merch drops\n- **Governance**: some NFTs grant DAO voting rights proportional to holdings\n- **Staking**: lock NFT to earn token rewards\n- **IP rights**: some collections (Bored Apes) grant commercial licensing rights to the holder\n- **Speculative-only NFTs** with no utility are purely demand-driven and historically experience 90%+ drawdowns from peak",
 highlight: ["rarity score", "floor price", "volume", "whale concentration", "utility", "holder distribution"],
 },
 {
 type: "teach",
 title: "NFT Market Cycles & Economics",
 content:
 "**NFT market cycles** follow boom-bust patterns even more extreme than crypto broadly.\n\n**2021–2022 PFP mania:**\nCryptoPunks (2017, free to claim) sold for $11.8M. Bored Ape #8817 sold for $3.4M. New collections launched daily with 'art' generated overnight. Total NFT volume peaked at $17B in January 2022. By late 2022 floor prices had fallen 90–99%. The majority of NFT collections are now near-worthless.\n\n**Blue chips vs speculative:**\n- **Blue chips** (CryptoPunks, BAYC, Fidenzas): still trade millions of dollars with established communities and cultural cachet. Have held value better — but still down 50–80% from peaks.\n- **Speculative collections**: 99%+ have zero trading volume. Often created as cash grabs during mania.\n\n**Wash trading detection:**\nWash trading inflates reported volume to create the appearance of demand:\n- Same wallet buys and sells to itself (easily detectable by address analysis)\n- Coordinated wallets trade between themselves\n- Chainalysis estimated 58% of NFT volume in 2022 was wash trading on certain platforms\n- Warning signs: volume >> floor × supply, same wallets appearing repeatedly in transaction history\n\n**Creator vs speculator economics:**\n- Creators earned: primary sale (100%) + royalties on secondary sales (2.5–10%)\n- Blur's move to 0% royalties transferred value from creators to traders\n- Speculators profit only on price appreciation — zero-sum game once royalties are removed\n- Sustainable NFT projects align creator and holder incentives through shared revenue",
 highlight: ["PFP mania", "blue chip", "wash trading", "royalties", "creator economics", "floor price"],
 },
 {
 type: "quiz-mc",
 question:
 "Why did the introduction of optional royalties on marketplaces like Blur significantly harm NFT creators, even though it attracted more trading volume?",
 options: [
 "Optional royalties mean creators receive 0% of secondary sales revenue — all value from trading accrues to buyers and sellers, not the artists who created the work",
 "Blur's optional royalties caused the blockchain to slow down, making transactions more expensive for creators",
 "Royalties were never enforceable on Ethereum — EIP-2981 only applies to Solana NFTs",
 "More trading volume increases gas fees so much that creators' primary sale profits are consumed by network costs",
 ],
 correctIndex: 0,
 explanation:
 "EIP-2981 is a royalty signaling standard, not an enforcement mechanism — marketplaces can choose to ignore it. When Blur made royalties optional (and defaulted to 0%) to attract volume-sensitive traders, creators stopped receiving their 2.5–10% cut on every secondary sale. For a collection trading millions of dollars per month, this eliminated hundreds of thousands of dollars in creator revenue. Traders benefited from lower transaction costs, but creator incentives to build long-term community value were gutted.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In NFT markets, a higher rarity score always correlates with a higher market price for that NFT within the same collection.",
 correct: false,
 explanation:
 "False. Rarity score is one factor but not the sole determinant of NFT price. Community aesthetics matter significantly — a statistically rare trait that most collectors find unattractive may sell for less than a common but visually appealing combination. Additionally, 'holy grail' traits that are rare AND desirable command the largest premiums. Market sentiment, the overall collection floor price, holder whale activity, and broader crypto market conditions all influence individual NFT prices regardless of rarity rank.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are evaluating two NFT collections to potentially invest 2 ETH: Collection A is a 2-year-old 'blue chip' PFP with 10,000 items, floor at 5 ETH, 4,000 unique holders, daily volume of 50 ETH, and commercial IP rights for holders. Collection B launched last week with 10,000 items, floor at 0.1 ETH, 300 unique holders (top 5 wallets hold 60%), daily volume of 500 ETH (mostly from the same 20 wallets), and promises 'revolutionary metaverse utility.'",
 question:
 "Which collection shows stronger indicators of genuine value, and why?",
 options: [
 "Collection A — established holder base, organic volume, real utility (IP rights), low whale concentration despite lower speculative volume",
 "Collection B — 10× the trading volume signals massive demand and the low floor means higher upside",
 "Collection B — metaverse utility promises are more forward-looking and indicate institutional interest",
 "Neither — NFTs are purely speculative and have no analytical framework for valuation",
 ],
 correctIndex: 0,
 explanation:
 "Collection A shows hallmarks of genuine value: 2-year track record, 4,000 distributed holders (not whale-concentrated), volume proportional to floor (50 ETH daily on a 5 ETH floor is reasonable), and real utility via commercial IP rights. Collection B shows multiple red flags: only 300 unique holders with 60% concentrated in 5 wallets (manipulation risk), launched 1 week ago, and 500 ETH volume from only 20 wallets (classic wash trading pattern — volume far exceeds what organic trading at 0.1 ETH floor would produce). High volume in newly launched collections with concentrated holders is the most common wash trading signature.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: DAO Governance 
 {
 id: "defi-web3-4",
 title: "DAO Governance",
 description:
 "DAO structure, token voting, governance attacks, voter apathy, and treasury management",
 icon: "Users",
 xpReward: 75,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "DAO Structure & Proposal Lifecycle",
 content:
 "**Decentralized Autonomous Organizations (DAOs)** are internet-native organizations governed by token holders through on-chain voting rather than traditional corporate hierarchy.\n\n**Token-weighted voting:**\nVoting power is proportional to governance token holdings (1 token = 1 vote in most systems). Alternatives include quadratic voting (vote power = tokens, reducing whale dominance) and reputation-weighted voting.\n\n**Quorum requirements:**\nMany DAOs require a minimum percentage of total tokens to vote for a proposal to be valid (typically 4–10%). This prevents small groups from passing proposals during low-participation periods — but high quorum thresholds can cause governance gridlock.\n\n**Proposal lifecycle (Uniswap governance example):**\n1. **Discussion** (Forum post on governance.uniswap.org) — community debates for 1–2 weeks\n2. **Temperature Check** (Snapshot off-chain vote) — gauge sentiment without gas cost; typically 5M UNI threshold\n3. **Snapshot vote** — formal off-chain vote; gas-free, binding by convention\n4. **On-chain vote** (Governor Bravo contract) — requires 40M UNI to submit, 40M quorum\n5. **Timelock execution** — 2-day delay after passage before execution (emergency action capability)\n6. **Multisig execution** — for operational actions, a 4-of-6 or 5-of-9 multisig executes approved budgets\n\n**Examples of DAO decisions:**\n- Uniswap: deploying v3 to new chains, fee switch activation\n- MakerDAO: adding new collateral types, adjusting stability fees\n- Compound: setting collateral ratios, adding new markets",
 highlight: ["DAO", "token-weighted voting", "quorum", "Snapshot", "timelock", "multisig", "proposal lifecycle"],
 },
 {
 type: "teach",
 title: "Governance Attacks & Voter Apathy",
 content:
 "**DAO governance is a significant attack surface** — several protocols have lost funds or control to governance exploits.\n\n**Governance token accumulation:**\nAn attacker accumulates a large portion of governance tokens (often through open-market purchases) and uses that voting power to pass a malicious proposal — such as transferring the treasury to an attacker-controlled wallet. Smaller DAOs with low token prices are most vulnerable.\n\n**Flash loan governance attack (bZx/Beanstalk):**\nThe most sophisticated attack: borrow governance tokens via flash loan use borrowed voting power to pass a malicious proposal in the same transaction repay the flash loan. The key insight is that borrowing and voting happened atomically before any off-chain challenge was possible.\n- **Beanstalk Protocol (Apr 2022)**: Attacker flash-loaned $1B in funds, acquired 79% of BEAN governance tokens, voted to approve their own malicious proposal, and drained $182M from the protocol — all in one transaction. Beanstalk had no timelock.\n\n**Voter apathy:**\nTypical DAO participation rates are **<5% of token supply**. Reasons: gas costs for on-chain voting, complexity of proposals, token holders who bought for speculation rather than governance. Low participation concentrates effective power in a few active voters — defeating the purpose of decentralization.\n\n**Timelock as protection:**\nA mandatory delay (typically 2–7 days) between a proposal passing and its execution. This gives the community time to detect malicious proposals and exit before they execute. Flash loan attacks cannot exploit timelocked contracts because the loan cannot remain open across blocks.",
 highlight: ["governance attack", "flash loan vote", "voter apathy", "timelock", "Beanstalk", "quorum"],
 },
 {
 type: "teach",
 title: "DAO Treasury Management",
 content:
 "**DAO treasuries** collectively hold billions of dollars in assets and require sophisticated management to ensure long-term protocol sustainability.\n\n**Diversification from native token:**\nMany DAO treasuries are 90%+ native governance token — effectively undiversified. If the token price falls 80%, the treasury shrinks proportionally, threatening the protocol's ability to pay contributors. Best practice: diversify 20–40% of treasury into stablecoins (USDC, DAI) and blue-chip assets (ETH, BTC).\n\n**Runway calculation:**\nAnnual operational expenses / Stablecoin portion of treasury = Runway in years\n\nExample: $5M/year burn rate, $10M in stablecoins = 2-year runway\nWarning sign: runway < 18 months without a clear path to protocol revenue.\n\n**Contributor compensation:**\nDAOs pay core contributors via:\n- **Streaming payments** (Sablier, Superfluid): continuous per-second payment streams in tokens\n- **Milestone-based grants**: payment upon deliverable completion\n- **Token vesting**: 4-year vest with 1-year cliff (aligns long-term incentives)\n\n**Grants programs:**\n- **Uniswap Grants Program (UGP)**: funds ecosystem development, tooling, research (~$1M+/quarter)\n- **Gitcoin Grants**: quadratic funding mechanism — matching funds are amplified by number of unique donors rather than size\n- **Compound Grants**: contributor grants up to $100K for protocol improvements\n\n**Risk**: excessive spending on speculative grants without clear ROI can deplete treasury faster than protocol revenue replenishes it.",
 highlight: ["treasury", "diversification", "runway", "contributor compensation", "vesting", "Gitcoin", "grants"],
 },
 {
 type: "quiz-mc",
 question:
 "How did the Beanstalk Protocol flash loan governance attack work, and what safeguard would have prevented it?",
 options: [
 "Attacker flash-loaned enough to get 79% of voting power, passed a malicious proposal instantly in one transaction, and drained $182M — a timelock would have blocked this by requiring a multi-day delay before execution",
 "Attacker gradually bought 51% of BEAN tokens over 6 months, then voted to change governance rules — only more decentralization would have helped",
 "Attacker exploited a bug in the ERC-20 standard to mint infinite governance tokens — better auditing would have prevented this",
 "Attacker used a sandwich attack during the governance vote to manipulate token prices — MEV protection would have blocked this",
 ],
 correctIndex: 0,
 explanation:
 "Beanstalk had no timelock. The attacker flash-loaned ~$1B in stablecoins, used them to acquire 79% of outstanding BEAN governance tokens instantaneously, immediately voted to approve their own malicious proposal (which transferred the treasury to their wallet), collected $182M, repaid the flash loan, and kept the profit — all within a single Ethereum transaction block. A timelock with even a 2-day delay would have been an absolute defense: flash loans cannot persist across blocks, so the attacker would have needed to hold the tokens for 2+ days (impossible with a flash loan).",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A DAO where 70% of governance tokens are held by a single venture capital firm has better governance outcomes than one with widely distributed token ownership, because the VC has expertise and long-term incentives to make good decisions.",
 correct: false,
 explanation:
 "False. High token concentration undermines the core value proposition of DAOs — decentralized, community governance. A single entity holding 70% can unilaterally pass any proposal, effectively making it a centralized organization with a governance theater facade. Even assuming good intentions, concentrated ownership creates single points of failure (regulatory pressure, key person risk, conflict of interest). Well-designed DAOs aim for broad token distribution with no single entity holding more than 10–20%, combined with mechanisms like timelocks and quorum requirements to prevent capture.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are advising a DAO with $50M treasury (85% in native token, 10% ETH, 5% USDC = $2.5M stablecoins), $4M annual operating budget, and 2 active core contributors. A proposal has been submitted to spend $8M over 2 years on grants for ecosystem development, funded by selling native tokens at current prices.",
 question:
 "What is the most critical concern with the current treasury and the proposed grants program?",
 options: [
 "The DAO has only 7.5 months of stablecoin runway ($2.5M / $4M annual burn), and the grants proposal would require selling tokens at potentially unfavorable prices — the DAO should first secure 18+ months of stablecoin runway before committing to large grants",
 "The grants program is too small — ecosystem development requires at least $20M to be competitive with other protocols",
 "Having only 2 contributors is ideal for efficiency; the DAO should not hire more people regardless of treasury size",
 "The 85% native token allocation is actually safe because the token is unlikely to decline",
 ],
 correctIndex: 0,
 explanation:
 "The critical issue is runway: $2.5M stablecoins / $4M annual burn = 7.5 months — dangerously short. If crypto markets decline 50% (common), the native token treasury loses $21M in value and the DAO may be unable to fund operations. The $8M grants proposal would require selling native tokens into what could be a bear market, further depressing price. Best practice: first diversify 20–30% of treasury into stablecoins to reach 18+ months runway (~$6M), then commit to grants only from surplus. A DAO that runs out of operational funding cannot execute its roadmap regardless of grants made.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: DeFi Risk Management 
 {
 id: "defi-web3-5",
 title: "DeFi Risk Management",
 description:
 "Smart contract risk, oracle manipulation, portfolio construction, and tax treatment of DeFi income",
 icon: "Shield",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Smart Contract Risk",
 content:
 "**Smart contract risk** is the probability of losing funds due to bugs, design flaws, or exploits in protocol code. It is the dominant risk in DeFi — billions have been lost to smart contract exploits.\n\n**Audit importance:**\nReputable audits from Trail of Bits, OpenZeppelin, Certora, or Consensys Diligence examine code for known vulnerability patterns. However, audits are point-in-time assessments — they cannot guarantee safety, only reduce probability of known bug classes.\n\n**Bug bounties:**\nProtocols offer rewards ($50K–$10M) for responsible disclosure of vulnerabilities. Immunefi is the dominant platform — over $100M paid out to white-hat hackers. Larger bug bounties signal that the protocol takes security seriously.\n\n**Time-tested code:**\nThe longer a protocol handles large TVL without incident, the more confident you can be in its security. Aave v2 and Uniswap v2 have operated for 3+ years with $1B+ TVL — their code is battle-tested. Brand-new protocols with $100M TVL on day 1 are significantly riskier.\n\n**Formal verification:**\nMathematically proves that code behaves as specified for all possible inputs. Used by protocols like MakerDAO and Certora clients. More rigorous than audits but expensive and covers only specified properties.\n\n**Common exploit patterns:**\n- **Reentrancy**: attacker's contract calls back into the vulnerable contract before state is updated (TheDAO hack, $60M, 2016)\n- **Oracle manipulation**: attacker manipulates the price feed a protocol relies on (see Lesson on oracle attacks)\n- **Integer overflow/underflow**: Solidity pre-0.8.0 would silently wrap arithmetic (fixed by SafeMath or Solidity 0.8+)\n- **Access control flaws**: admin functions accessible to unexpected callers\n- **Logic errors**: protocol behaves as coded but not as intended",
 highlight: ["audit", "bug bounty", "reentrancy", "oracle manipulation", "formal verification", "integer overflow"],
 },
 {
 type: "teach",
 title: "Oracle Manipulation Attacks",
 content:
 "**Price oracles** feed real-world asset prices into smart contracts. Manipulating these feeds is one of the most lucrative attack vectors in DeFi.\n\n**How oracle manipulation works:**\nA DeFi protocol uses the spot price from a DEX as its price feed. An attacker:\n1. Flash-loans a massive amount of token A\n2. Dumps token A on the DEX price crashes artificially\n3. The protocol's oracle reads this manipulated price\n4. Attacker exploits the protocol at the fake price (e.g., borrows token B at artificially favorable collateral ratio)\n5. Repays flash loan; protocol is drained\n\n**Mango Markets ($115M, Oct 2022):**\nAttacker accumulated a large position in MNGO perpetuals, then pumped the MNGO spot price by 5–10× using their own funds — not a flash loan. Their perpetual P&L artificially inflated to $423M. They borrowed against this 'profit' and drained the protocol's treasury. The exploit was debated as market manipulation vs legitimate trading.\n\n**TWAP vs spot oracles:**\n**Time-Weighted Average Price (TWAP)** oracles compute the average price over a time window (e.g., 30 minutes). Manipulating a TWAP requires sustaining a false price for the entire window, which is extremely capital-intensive and visible to arbitrageurs. Uniswap v2/v3 TWAP is the de facto DeFi oracle standard.\n\n**Chainlink:**\nDecentralized oracle network with 30+ independent nodes aggregating data from multiple CEX/DEX sources. Highly resistant to manipulation — attacking Chainlink requires compromising a majority of its node operators simultaneously.\n\n**Multi-oracle approach:**\nBest-in-class protocols use Chainlink as primary + Uniswap TWAP as fallback, with circuit breakers if the two deviate by more than 10%. This virtually eliminates oracle manipulation risk.",
 highlight: ["oracle", "TWAP", "Chainlink", "Mango Markets", "spot price", "flash loan", "manipulation"],
 },
 {
 type: "teach",
 title: "Portfolio Approach to DeFi",
 content:
 "**Constructing a DeFi portfolio** requires systematic risk management — treating DeFi protocols like individual stocks with company-specific risk, not like a monolithic asset class.\n\n**Blue chip protocols (lower risk):**\n- **Aave**: Largest lending protocol, $12B+ TVL, 3+ years without exploit, multiple audits, active bug bounty, $16M insurance pool\n- **Uniswap**: Largest DEX by volume, $5B+ TVL, battle-tested v2/v3 contracts, governance by UNI holders\n- **Curve Finance**: Dominant stablecoin DEX, $2B+ TVL, critical infrastructure for most yield strategies\n- **Lido Finance**: Largest liquid staking protocol (stETH), $20B+ staked ETH\n\n**Speculative protocols (higher risk):**\nNew forks, anonymous teams, protocols with <$100M TVL, protocols offering 100%+ APY from emissions, no audit or only 1 audit from a less reputable firm.\n\n**Position sizing:**\nApply a tiered approach:\n- Blue chip protocols: up to 30–40% of DeFi allocation each\n- Mid-tier protocols: 5–15% each with audits and 6+ months track record\n- Speculative/new: 1–5% each (expect some to go to zero)\n- Never allocate more than you can afford to lose entirely in any single protocol\n\n**Exit liquidity considerations:**\nIn a crisis, every DeFi user rushes to withdraw simultaneously. Large positions in small pools may face significant slippage. Check that pool depth can absorb your position without >2% price impact.\n\n**Tax treatment of DeFi income (US):**\n- Swap transactions: taxable events (capital gains/loss on each swap)\n- LP fees earned: ordinary income when received\n- Token emissions/farming rewards: ordinary income at fair market value when received\n- Impermanent loss: no tax benefit until you withdraw (realize the loss)\n- Consult a crypto-specialized CPA — regulations vary by jurisdiction and continue to evolve",
 highlight: ["blue chip", "position sizing", "exit liquidity", "Aave", "Uniswap", "tax", "ordinary income"],
 },
 {
 type: "quiz-mc",
 question:
 "A reentrancy attack in a smart contract works by:",
 options: [
 "Calling back into the vulnerable contract before it updates its internal state, allowing the attacker to repeatedly drain funds in a single transaction",
 "Replaying the same valid transaction multiple times to double-spend tokens",
 "Manipulating the contract's price oracle to borrow more than the collateral is worth",
 "Overflowing an integer variable so that a large balance wraps around to zero, allowing free token minting",
 ],
 correctIndex: 0,
 explanation:
 "Reentrancy exploits the ordering of state updates in a vulnerable contract. The pattern: (1) attacker calls withdraw(); (2) contract sends ETH to attacker's malicious contract; (3) attacker's contract immediately calls back into withdraw() BEFORE the original call has updated the balance; (4) contract sees balance unchanged and sends ETH again; (5) repeat until drained. TheDAO hack in 2016 used this pattern to drain $60M ETH. The fix is to update state before external calls (checks-effects-interactions pattern) or use a reentrancy guard mutex.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "If a DeFi protocol has been audited by a reputable security firm, users can be confident that the protocol contains no exploitable bugs.",
 correct: false,
 explanation:
 "False. Audits significantly reduce but cannot eliminate smart contract risk. Euler Finance was audited by multiple reputable firms including Halborn and Sherlock — yet suffered a $197M exploit in March 2023 due to a donation accounting vulnerability that auditors missed. Other audited protocols that were exploited include Compound (governance bug), Balancer (read-only reentrancy), and Yearn Finance. Audits are a point-in-time assessment of known vulnerability classes — they cannot catch all logic errors, novel attack vectors, or interactions with external protocols. Treat audits as necessary but not sufficient due diligence.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You have $20,000 to allocate to DeFi yield strategies. You are evaluating three protocols: Protocol A is Aave v3, 3+ years old, $12B TVL, 4 audits, Chainlink oracles, offering 4% APY on USDC. Protocol B launched 2 months ago, $50M TVL, 1 audit from an unknown firm, offering 40% APY via token emissions (no real yield). Protocol C is a Uniswap v3 LP position on ETH/USDC in the $1,800–$2,200 range, offering estimated 15% APY from fees, with impermanent loss risk.",
 question:
 "Which allocation strategy best balances risk and return across these three options?",
 options: [
 "$12,000 in Protocol A (60%), $6,000 in Protocol C (30%), $2,000 in Protocol B (10%) — largest allocation to battle-tested protocol, meaningful LP position, small speculative bet",
 "$20,000 in Protocol B (100%) — highest APY maximizes returns and you can always exit before a hack",
 "$10,000 each in A and B — diversification means you split evenly across all available options",
 "$20,000 in Protocol A — DeFi is too risky so only blue-chip allocations are acceptable",
 ],
 correctIndex: 0,
 explanation:
 "The tiered allocation (60/30/10) reflects each protocol's risk profile. Protocol A (Aave) deserves the largest allocation — 3+ years, $12B TVL, 4 audits, Chainlink oracles, and 4% APY is a real yield from protocol revenue. Protocol C (Uniswap LP) offers 15% real yield but carries impermanent loss risk if ETH moves outside $1,800–$2,200 — a 30% allocation is appropriate for the risk. Protocol B's 40% APY is 100% emissions-based with a 2-month-old unproven protocol and anonymous auditor — a 10% speculative allocation is reasonable while capping downside. Concentration in Protocol B ignores the fundamental rule: new protocols with inflationary yield have failed the majority of the time.",
 difficulty: 3,
 },
 ],
 },
 ],
};
