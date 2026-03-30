import type { Unit } from "./types";

export const UNIT_CRYPTO_PROTOCOLS: Unit = {
 id: "crypto-protocols",
 title: "Crypto Protocol Mechanics",
 description:
 "Deep dive into blockchain consensus, tokenomics, DeFi protocols, and crypto market structure",
 icon: "",
 color: "#f97316",
 lessons: [
 // Lesson 1: Blockchain Consensus Mechanisms 
 {
 id: "crypto-protocols-1",
 title: "Blockchain Consensus Mechanisms",
 description:
 "Proof of Work, Proof of Stake, The Merge, Tendermint BFT, and finality models",
 icon: "Shield",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Proof of Work: Hash Puzzles & Security Economics",
 content:
 "**Proof of Work (PoW)** secures blockchains by requiring miners to solve computationally expensive cryptographic puzzles before adding a block.\n\n**How it works:**\nMiners repeatedly hash a block header (with a changing nonce) until the output falls below a difficulty target. Bitcoin uses SHA-256. The difficulty auto-adjusts every 2,016 blocks (~2 weeks) to maintain a ~10-minute block time regardless of total hash rate.\n\n**Energy consumption:**\nBitcoin's network consumes ~120–150 TWh/year — comparable to entire countries like Argentina. Each block secures ~$250M+ in cumulative transaction value, which proponents argue justifies the cost. Critics propose this energy expenditure is the protocol's fundamental security budget.\n\n**51% attack economics:**\nAn attacker controlling >50% of hash rate can:\n- Double-spend transactions (spend coins, get confirmed, then replace the chain)\n- Censor specific transactions\n- Cannot: steal coins from others or create coins out of thin air\n\nFor Bitcoin, a 51% attack requires ~$20B+ in mining hardware + enormous ongoing electricity costs. This makes it economically irrational — the attacker would destroy the value of their own holdings. Smaller PoW chains (Ethereum Classic, Bitcoin Gold) have been repeatedly 51%-attacked because their hash rate is a tiny fraction of Bitcoin's.",
 highlight: ["Proof of Work", "nonce", "difficulty target", "51% attack", "double-spend", "hash rate"],
 },
 {
 type: "teach",
 title: "Proof of Stake: Validator Economics & Slashing",
 content:
 "**Proof of Stake (PoS)** replaces energy-intensive mining with economic stake as the security mechanism.\n\n**How validators are selected:**\nValidators lock up (stake) native tokens as collateral. The protocol pseudo-randomly selects block proposers weighted by stake size. A committee of validators attest to (vote on) the proposed block's validity.\n\n**Ethereum's validator economics:**\n- Minimum stake: 32 ETH (~$80K)\n- Staking yield: ~3–5% APY from newly issued ETH + transaction priority fees\n- ~1 million+ validators have collectively staked $50B+\n- Opportunity cost: staked ETH is locked (previously 1–2 year exit queue)\n\n**Slashing conditions:**\nSlashing penalizes validators for provably malicious behavior, destroying a portion of their staked ETH:\n- **Double voting**: signing two different blocks at the same height\n- **Surround voting**: wrapping one attestation around another\n- Initial slash: 1/32 of stake\n- Correlation penalty: if many validators are slashed simultaneously (suggesting coordinated attack), penalties scale up to 100% of stake\n\n**The nothing-at-stake problem:**\nIn naive PoS designs, validators have no cost to vote on multiple competing chain forks — unlike PoW where hash power is exclusively committed to one chain. Ethereum solved this by: (a) requiring validators to attest to specific checkpoints, and (b) slashing validators who equivocate across forks.",
 highlight: ["Proof of Stake", "validator", "slashing", "nothing-at-stake", "double voting", "correlation penalty", "attestation"],
 },
 {
 type: "teach",
 title: "The Merge, Cosmos Tendermint, and Finality Models",
 content:
 "**The Merge (September 15, 2022):**\nEthereum transitioned from PoW to PoS in a single block — the most complex live network upgrade in blockchain history. Key effects:\n- Energy consumption dropped ~99.95% overnight\n- ETH issuance fell ~90% (from ~13,000 ETH/day to ~1,600 ETH/day)\n- Combined with EIP-1559 base fee burns, ETH became net deflationary during high-activity periods\n- Miners became obsolete; validators took over\n\n**Delegated PoS — Cosmos & Tendermint BFT:**\nCosmos uses Tendermint BFT consensus. Token holders delegate stake to a set of validators (up to 175 on Cosmos Hub). Validators earn commission; delegators share rewards (and slashing risk).\n- Tendermint achieves **deterministic finality**: once a block gets 2/3 of validator votes, it is final forever — no reorganization possible\n- Trade-off: requires known, permissioned validator set; less censorship-resistant than Bitcoin\n\n**Algorand PBFT:**\nAlgorand uses a variant of Practical Byzantine Fault Tolerance with rotating committees selected via Verifiable Random Functions (VRF). Achieves finality in ~4 seconds with no forks.\n\n**Finality: Probabilistic vs Deterministic:**\n| Model | Example | How it works |\n|---|---|---|\n| **Probabilistic** | Bitcoin | Each new block makes reorg exponentially harder; 6 confirmations (~60 min) considered final |\n| **Deterministic** | Tendermint, Algorand | 2/3+ honest validator vote = instant, irreversible finality |\n\nFor payment processors, deterministic finality is preferred — a confirmed transaction cannot be reversed. For decentralization maximalists, probabilistic finality with PoW offers greater censorship resistance.",
 highlight: ["The Merge", "EIP-1559", "Tendermint BFT", "deterministic finality", "probabilistic finality", "Algorand", "VRF", "delegated"],
 },
 {
 type: "quiz-mc",
 question:
 "A validator on Ethereum earns 4% APY staking yield. The risk-free rate (US Treasuries) is 5.2%. Ignoring ETH price appreciation, what does this imply about the economics of solo staking?",
 options: [
 "Solo staking has negative opportunity cost — validators could earn more in risk-free Treasuries, so staking demand should be driven by ETH price conviction or pooled liquid staking yields",
 "4% APY is excellent because the staking yield is paid in ETH, which cannot be replicated by Treasuries",
 "The risk-free rate is irrelevant to crypto staking economics",
 "Validators are irrational for staking since they could earn more elsewhere",
 ],
 correctIndex: 0,
 explanation:
 "When the staking yield (4%) is below the risk-free rate (5.2%), rational capital would require additional compensation — such as expected ETH price appreciation or protocol-specific value. This is why liquid staking protocols (Lido, Rocket Pool) gained dominance: they allow users to stake while keeping liquidity (stETH), reducing the opportunity cost. The comparison also explains why staking participation rises when rates fall (2021 bull market) and may moderate when rates are high (2023–2024). Validators are not irrational — they believe ETH price appreciation + 4% yield > 5.2% risk-free.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Ethereum's transition to Proof of Stake (The Merge) reduced its energy consumption by approximately 99.95% but did NOT change the rate of new ETH issuance.",
 correct: false,
 explanation:
 "False. The Merge reduced both energy consumption (~99.95% drop) AND ETH issuance (~90% reduction, from ~13,000 ETH/day to ~1,600 ETH/day). Under PoW, miners required large block rewards to cover hardware and electricity costs. Under PoS, validators require much smaller rewards since their only cost is capital opportunity cost. Combined with EIP-1559's fee burning mechanism (introduced in August 2021), Ethereum became net deflationary during periods of high network activity.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A new Layer 1 blockchain launches using Delegated Proof of Stake (DPoS) with 21 elected 'super delegates' who validate all transactions. The chain achieves 10,000 TPS with sub-second finality. Marketing materials call it 'more decentralized than Ethereum because anyone can vote for delegates.' Three months after launch, analysis reveals that the top 7 delegate slots are controlled by entities linked to the founding team.",
 question:
 "What is the core decentralization vulnerability this scenario illustrates?",
 options: [
 "DPoS with a small delegate set creates a cartel risk — if a majority of delegates collude (13 of 21), they can censor transactions or execute governance attacks, and 'voting rights' mean little if whales control enough tokens to determine delegate elections",
 "The chain is vulnerable to 51% attacks because it uses Proof of Stake",
 "Sub-second finality proves the chain is too centralized to be secure",
 "10,000 TPS is too fast for proper transaction validation",
 ],
 correctIndex: 0,
 explanation:
 "DPoS with 21 validators creates a 'decentralization theater' problem. True decentralization requires that no small group can control consensus. With 21 delegates, controlling 11 (a simple majority) or even 7 (a blocking minority for certain governance actions) is achievable through token concentration. EOS, which pioneered this model, saw evidence of vote-trading cartels among block producers. The voting mechanism sounds democratic but large token holders (including founders with vesting schedules) disproportionately control delegate selection. Ethereum by contrast has 900,000+ validators with no practical coordination mechanism for collusion.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Token Economics & Incentive Design 
 {
 id: "crypto-protocols-2",
 title: "Token Economics & Incentive Design",
 description:
 "Supply mechanics, vesting schedules, token velocity, value accrual, and EIP-1559",
 icon: "Coins",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Token Supply Mechanics",
 content:
 "**Token supply design** is one of the most consequential decisions in protocol design — it determines long-term inflation, scarcity, and holder incentives.\n\n**Fixed supply (Bitcoin):**\n- Hard cap of 21 million BTC, enforced by consensus rules\n- Block reward halves every 210,000 blocks (~4 years): 502512.56.253.125 BTC\n- Current inflation rate ~1.7%, falling toward 0% asymptotically by ~2140\n- Scarcity narrative: 'digital gold' store of value\n- Risk: as block rewards approach zero, security must be funded entirely by transaction fees\n\n**Inflationary supply (pre-Merge ETH, most PoS chains):**\n- New tokens continuously issued to reward validators/stakers\n- Predictable, protocol-controlled inflation funds network security\n- Risk: continuous sell pressure from validators converting rewards to fiat\n\n**Deflationary mechanics (post-Merge ETH with EIP-1559):**\n- EIP-1559 burns the base fee portion of every transaction\n- During high network activity, burn rate can exceed issuance net deflation\n- ETH burned since EIP-1559: >4 million ETH (~$12B+)\n\n**Burn-and-mint equilibrium (BNB, MKR):**\n- Protocols use revenue to buy tokens from market and burn them\n- BNB: Binance burns 20% of quarterly profits in BNB\n- MKR: Maker burns MKR with surplus DAI stability fees\n- Creates direct link between protocol revenue and token scarcity",
 highlight: ["fixed supply", "halving", "EIP-1559", "base fee burn", "deflationary", "burn-and-mint", "token velocity"],
 },
 {
 type: "teach",
 title: "Vesting Schedules & Token Velocity",
 content:
 "**Vesting schedules** control when team members, investors, and advisors can sell their tokens — critical for price stability and long-term alignment.\n\n**Cliff + linear vesting:**\n- Example: 1-year cliff, 4-year total vesting\n- No tokens released for 12 months (cliff)\n- After cliff: 25% released immediately, then 1/36th per month for 3 more years\n- Rationale: prevents early team members from dumping and leaving immediately\n\n**Why it matters for price:**\n- Token unlock events are publicly known from smart contract schedules\n- Large unlocks (>5% of circulating supply) often precede price drops as recipients sell\n- 'Tokenomics calendars' track upcoming unlocks — savvy traders short before major unlocks\n- 2023 example: Aptos (APT) dropped ~40% in the weeks around its first major team unlock\n\n**Token velocity problem:**\nToken velocity = total transaction volume / average token market cap\n- High velocity tokens change hands rapidly limited speculative premium low price per token\n- If users buy a token only to immediately spend it within an app, demand never accumulates\n- Solution: create reasons to hold (staking, governance, fee discounts, collateral requirements)\n\n**Value accrual mechanisms:**\n- **Fee capture**: protocol fees accrue to token holders (GMX esGMX)\n- **Governance**: token grants voting rights over treasury (UNI, COMP)\n- **Staking rewards**: lock tokens to earn yield, reducing circulating supply\n- **Collateral utility**: tokens usable as collateral in DeFi increases persistent demand",
 highlight: ["vesting", "cliff", "token unlock", "token velocity", "value accrual", "fee capture", "governance token"],
 },
 {
 type: "teach",
 title: "EIP-1559 and ETH as Sound Money",
 content:
 "**EIP-1559** (August 2021, 'London' hard fork) transformed Ethereum's fee market and ETH's monetary properties.\n\n**Pre-EIP-1559 (first-price auction):**\nUsers bid gas prices; miners include highest bids. Problems:\n- Unpredictable fees (need to guess right price)\n- Miners captured all fee revenue, no ETH destruction\n- Fee volatility: $0.10 at night, $200 during NFT drops\n\n**EIP-1559 mechanics:**\n- **Base fee**: algorithmically set by protocol based on block fullness; burned (destroyed)\n- **Priority tip**: optional tip paid directly to validators for faster inclusion\n- Base fee adjusts ±12.5% per block targeting 50% full blocks\n- Result: more predictable fees + ETH becomes deflationary during high activity\n\n**Cumulative impact:**\n- ETH burned per day during peak: 5,000–20,000 ETH\n- At low activity: issuance (~1,600 ETH/day) exceeds burn slight inflation\n- At moderate+ activity: burn exceeds issuance deflation\n- 'Ultra-sound money' thesis: ETH has superior monetary properties to gold (yield + deflation)\n\n**Critical perspective:**\nEIP-1559 benefits ETH holders but increases cost for users and reduces validator revenue. L2s (Rollups) reduce L1 fee revenue, potentially making ETH more inflationary long-term as less base fee is burned. The sustainability of ETH's deflationary narrative depends on L1 activity remaining high.",
 highlight: ["EIP-1559", "base fee", "priority tip", "burn", "sound money", "deflationary", "ultra-sound money"],
 },
 {
 type: "quiz-mc",
 question:
 "A governance token (GOV) has no fee capture mechanism, no staking rewards, and is only used for voting on protocol parameters that rarely change. The protocol generates $50M/year in fees, all of which go to liquidity providers. Using the token velocity framework, what is the most likely outcome for GOV's price over time?",
 options: [
 "GOV will likely trend toward zero — without any economic reason to hold it, velocity is extremely high as voters sell immediately after governance events; governance rights with no financial benefit accrue minimal speculative premium",
 "GOV will appreciate because governance rights are always valuable in decentralized protocols",
 "GOV will track the protocol's $50M fee revenue, trading at a multiple of annual fees",
 "GOV will trade based on the total value locked (TVL) in the protocol",
 ],
 correctIndex: 0,
 explanation:
 "This is known as the 'governance token = worthless token' problem. Tokens whose only utility is voting on parameters — with no financial claim on protocol revenue — have no fundamental reason for holders to retain them. UNI (Uniswap) is the canonical example: despite Uniswap being the largest DEX by volume ($1T+ traded), UNI holders receive zero fee revenue; all fees go to LPs. UNI has no fee switch enabled. Result: UNI consistently trades below what its revenue multiples would justify. The 'fee switch' debate in Uniswap governance is precisely about enabling value capture for token holders.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Protocol A: 100M total token supply, 60M held by team/VCs (6-month cliff, 2-year vest), 40M circulating. Yield is 200% APY from token emissions only. Protocol B: 100M total token supply, 20M held by team/VCs (1-year cliff, 4-year vest), 80M circulating. Yield is 8% APY from protocol fees on $500M TVL. Both launch simultaneously. You have $10,000 to allocate for a 12-month hold.",
 question:
 "Which protocol's token is better positioned for long-term value retention and why?",
 options: [
 "Protocol B — lower insider concentration, longer vesting reduces near-term sell pressure, fee-based yield is sustainable real yield vs Protocol A's inflationary emissions that will dilute price as insiders unlock",
 "Protocol A — 200% APY is 25× higher than Protocol B; even if price drops 50%, you still profit",
 "Protocol A — higher APY signals stronger market confidence in the protocol",
 "Both are equivalent; APY and vesting don't affect fundamental token value",
 ],
 correctIndex: 0,
 explanation:
 "Protocol A shows classic warning signs: 60% insider concentration with only a 6-month cliff (insiders can dump in 6 months), and 200% APY from emissions is mathematically self-defeating — to pay 200% APY to current holders, the protocol must mint 2× the circulating supply in a year, causing 50%+ dilution minimum. If any insiders sell during this period, the price collapse amplifies. Protocol B's 8% APY from real fees on $500M TVL = $40M/year in revenue — sustainable and growing with usage. The 4-year vest means insiders are economically aligned long-term. This models the difference between sustainable DeFi protocols (Aave, Compound) and failed 'degen farms' (OlympusDAO forks).",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: AMM Mathematics & Liquidity Provision 
 {
 id: "crypto-protocols-3",
 title: "AMM Mathematics & Liquidity Provision",
 description:
 "Constant product formula, Uniswap v3 concentrated liquidity, impermanent loss, and Curve stableswap",
 icon: "Calculator",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Constant Product AMM: Uniswap v2 Mechanics",
 content:
 "**Automated Market Makers (AMMs)** price assets algorithmically using invariant curves rather than order books.\n\n**Constant product formula: x × y = k**\nA pool holds reserves of two tokens (x and y). Every trade must preserve the product k.\n\n**Worked example:**\nPool: 1,000 ETH (x) × 2,000,000 USDC (y) = k = 2,000,000,000\nImplied price: 2,000,000 / 1,000 = $2,000/ETH\n\nTrader buys 10 ETH:\n- New ETH reserve: 990\n- New USDC reserve: 2,000,000,000 / 990 = 2,020,202\n- Trader pays: 2,020,202 - 2,000,000 = 20,202 USDC\n- Effective price: $2,020/ETH vs $2,000 spot 1% price impact\n\n**Price impact grows non-linearly:**\n- Buying 1% of pool (10 ETH): ~1% price impact\n- Buying 5% of pool (50 ETH): ~5.3% price impact\n- Buying 20% of pool: ~25% price impact\n\n**LP fee economics (Uniswap v2: 0.3%):**\n- Each trade pays 0.3% fee to LPs\n- Fees accrue within the pool, increasing k over time\n- LPs receive pro-rata share of fees when they withdraw\n- Annual fee APY depends on trading volume: a $10M pool doing $1M/day volume earns 365 × $3,000 / $10M = ~11% APY from fees alone\n\n**Arbitrage maintains price parity:**\nWhen AMM price diverges from external markets, arbitrageurs profit by buying the underpriced token in the AMM and selling on CEX (or vice versa). This corrects the price but causes impermanent loss for LPs.",
 highlight: ["constant product", "x*y=k", "price impact", "LP fee", "arbitrage", "impermanent loss"],
 },
 {
 type: "teach",
 title: "Concentrated Liquidity: Uniswap v3",
 content:
 "**Uniswap v3 concentrated liquidity** allows LPs to specify a price range [P_low, P_high] for their liquidity, dramatically improving capital efficiency.\n\n**V2 vs V3 capital efficiency:**\n- V2: liquidity is spread uniformly across [0, ] — most capital sits unused at extreme prices\n- V3: LP concentrates capital in, say, $1,800–$2,200 for ETH/USDC\n- A V3 LP in a $100 range earns the same fees as a V2 LP with 4,000× more capital\n\n**Ticks and price ranges:**\nPrices are discretized into 'ticks' (log-spaced at 0.01% intervals). LPs choose tick lower and tick upper to define their range.\n\n**Range order behavior:**\nWhen price is:\n- Inside range: LP holds a mix of both tokens, earns fees\n- Below range: LP holds 100% of token X (the cheaper one)\n- Above range: LP holds 100% of token Y (the more expensive one)\n\nThis means V3 LPs must actively manage positions — if price moves out of range, they stop earning fees.\n\n**Effective use cases:**\n- Stable pairs (USDC/USDT): extremely tight ranges near-zero impermanent loss, high fee income\n- Directional range orders: act like limit orders (e.g., LP USDC between $1,900–$2,000 as 'buy wall' for ETH)\n- Active management: protocols like Gamma and Arrakis auto-rebalance V3 positions\n\n**Risk of V3 vs V2:**\nHigher capital efficiency amplifies both gains AND impermanent loss for equivalent capital deployed in a tight range. Out-of-range positions earn nothing while still subject to holding risk.",
 highlight: ["concentrated liquidity", "tick", "price range", "capital efficiency", "range order", "active management", "out-of-range"],
 },
 {
 type: "teach",
 title: "Impermanent Loss & Curve Stableswap",
 content:
 "**Impermanent loss (IL)** is the opportunity cost of being an LP versus simply holding the tokens.\n\n**IL formula:**\nIL = 2r / (1 + r) - 1\n\nWhere r = new price ratio / initial price ratio\n\n| r (price change) | IL |\n|---|---|\n| 1.25× (25% up) | -0.6% |\n| 1.5× (50% up) | -2.0% |\n| 2× (100% up) | -5.7% |\n| 4× (300% up) | -20.0% |\n| 10× (900% up) | -42.5% |\n\n**The IL breakeven calculation:**\nIL is 'impermanent' only if price returns to entry. Fee income must offset IL for the LP to profit vs holding.\n- At 2× price: IL = -5.7%. For a $10K position, that's $570 loss to hold\n- To break even in 1 year, fees must generate >5.7% APY\n- For volatile pairs (ETH/SHIB), IL often exceeds fee income\n\n**Curve Finance: Stableswap invariant**\nCurve is optimized for assets that trade near 1:1 (stablecoins, stETH/ETH, WBTC/renBTC).\n\nThe stableswap invariant blends constant-product (x*y=k) with constant-sum (x+y=k):\n- Near the peg: behaves like constant-sum near-zero slippage\n- Far from peg: transitions to constant-product price protection against one-sided depletion\n\nResult: Curve enables $100M stablecoin swaps with only 0.01–0.04% slippage vs 5%+ on Uniswap v2. This makes Curve the dominant venue for institutional stablecoin liquidity.",
 highlight: ["impermanent loss", "IL formula", "breakeven", "Curve Finance", "stableswap", "constant-sum", "constant-product blend"],
 },
 {
 type: "quiz-mc",
 question:
 "You provide equal-value liquidity to a Uniswap v2 ETH/USDC pool when ETH = $2,000. ETH price rises to $4,000 (r = 2). Using IL = 2r/(1+r) - 1, what is your approximate impermanent loss versus holding?",
 options: [
 "-5.7% (IL = 2×2/(1+2) - 1 = 2×1.414/3 - 1 -5.7%)",
 "-20.0% (price doubled, so loss quadruples to 20%)",
 "-2.0% (small divergence from entry price)",
 "0% (impermanent loss only applies to non-stable pairs)",
 ],
 correctIndex: 0,
 explanation:
 "Applying the formula: r = 4,000/2,000 = 2. IL = 2×2/(1+2) - 1 = 2×1.4142/3 - 1 = 2.8284/3 - 1 = 0.9428 - 1 = -0.0572 = -5.7%. This means your LP position is worth 5.7% less than if you had simply held 50% ETH and 50% USDC. To justify being an LP vs holding, the 0.3% fee income must generate at least 5.7% over your holding period. For a pool with high volume (e.g., $50M daily volume on $10M TVL = 5% daily fee APY), fees can easily overcome this IL.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "In Uniswap v3, a liquidity provider whose position is 'out of range' (current price has moved outside their specified tick range) continues to earn trading fees but at a reduced rate compared to an in-range position.",
 correct: false,
 explanation:
 "False. An out-of-range Uniswap v3 position earns zero trading fees. When price moves outside the LP's chosen range, all their liquidity is converted entirely into one token (the one the price moved away from) and no longer participates in any trades. The LP must manually reset their range to start earning fees again. This is a key difference from v2, where all positions always earn some fees regardless of price movement. The higher capital efficiency of v3 comes with the requirement for active management — passive LPs in volatile markets often fare worse in v3 than v2.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Lending Protocols & Yield Strategies 
 {
 id: "crypto-protocols-4",
 title: "Lending Protocols & Yield Strategies",
 description:
 "Aave/Compound mechanics, health factors, flash loans, yield aggregators, and real vs token yield",
 icon: "Landmark",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Utilization-Based Interest Rate Models",
 content:
 "**Aave and Compound** are the two largest DeFi lending protocols, together managing $10B+ in deposits.\n\n**Core mechanism:**\n1. Lenders deposit assets receive aTokens/cTokens (interest-bearing)\n2. Borrowers post collateral borrow up to their LTV limit\n3. Interest paid by borrowers flows to lenders (minus a protocol reserve fee ~10–20%)\n\n**Utilization rate:**\nUtilization = Total borrowed / Total supplied\n\n**Interest rate model (Compound V3 style):**\nRates are a kinked function of utilization:\n- Below kink (e.g., 80%): rate rises linearly from 0% 5% borrow APY\n- Above kink: rate rises steeply from 5% 100%+ at 100% utilization\n\nThis creates automatic market equilibrium:\n- Low utilization low rates attracts more borrowers\n- High utilization high rates attracts more lenders, discourages borrowers\n- Target: keep utilization near the kink (80% for most assets)\n\n**Supply vs borrow rate relationship:**\nSupply APY Borrow APY × Utilization × (1 - Reserve Factor)\nExample: 8% borrow rate × 90% utilization × 80% (after 20% reserve) = 5.76% supply APY\n\n**Risk-tiered collateral:**\nAssets are assigned LTV limits based on liquidity and volatility:\n- ETH: 82.5% LTV (well-established, liquid)\n- LINK: 70% LTV (mid-cap volatility)\n- Long-tail assets: 40–65% LTV or not accepted as collateral\n- Isolation mode: new/risky assets can only be used in isolated positions with a debt ceiling",
 highlight: ["utilization rate", "kinked rate model", "supply APY", "borrow APY", "LTV", "reserve factor", "isolation mode"],
 },
 {
 type: "teach",
 title: "Health Factor & Liquidation Mechanics",
 content:
 "**Health factor** is the primary risk metric in DeFi lending — it determines whether a position is safe or at risk of liquidation.\n\n**Health factor formula:**\nHealth Factor = Σ(Collateral × Liquidation Threshold) / Total Borrowed (in USD)\n\nExample:\n- Deposited: 1 ETH = $2,000 at 82.5% liquidation threshold\n- Borrowed: 1,500 USDC\n- Health factor = (2,000 × 0.825) / 1,500 = 1,650 / 1,500 = 1.10\n\nIf ETH price drops to $1,818:\n- Health factor = (1,818 × 0.825) / 1,500 = 1,500 / 1,500 = 1.00 liquidation threshold\n\n**Liquidation process:**\n1. Health factor drops below 1.0\n2. Liquidators identify the unhealthy position\n3. Liquidator repays up to 50% of the outstanding debt\n4. Liquidator receives the equivalent collateral value plus a **liquidation bonus** (typically 5–10%)\n5. Example: repay $750 USDC receive $750 + 5% = $787.50 worth of ETH collateral\n\n**Cascading liquidations:**\nA large price drop can trigger thousands of simultaneous liquidations, creating selling pressure on the collateral asset, which drops prices further, triggering more liquidations — a feedback loop. The May 2021 crypto crash and the LUNA collapse both featured cascading DeFi liquidation spirals.\n\n**Self-preservation strategies:**\n- Maintain health factor >1.5 as a buffer\n- Set price alerts at buffer prices\n- Use Aave's e-mode for correlated assets (stETH/ETH: 93% LTV)\n- Repay debt or add collateral proactively during downturns",
 highlight: ["health factor", "liquidation threshold", "liquidation bonus", "cascading liquidation", "e-mode", "50% close factor"],
 },
 {
 type: "teach",
 title: "Flash Loans, Yield Aggregators & Real Yield",
 content:
 "**Flash loans** are uncollateralized loans that must be borrowed and repaid atomically within a single transaction.\n\n**How they work:**\nIn one blockchain transaction (atomic execution):\n1. Borrow any amount (Aave v3: up to protocol liquidity)\n2. Execute arbitrage/strategy\n3. Repay loan + 0.05% fee\n4. If repayment fails entire transaction reverts no loss\n\n**Legitimate uses:**\n- DEX arbitrage: buy on Uniswap, sell on SushiSwap in one tx\n- Collateral swap: change collateral without closing position\n- Self-liquidation: avoid 10% penalty by repaying with own flash loan\n- One-click leverage unwind: repay debt withdraw collateral sell in one tx\n\n**Attack uses:** Flash loans funded DeFi's largest exploits — $182M Beanstalk governance attack, $130M Cream Finance.\n\n**Yield aggregators (Yearn Finance):**\n- Vaults auto-deploy capital into the highest-yielding strategies\n- Auto-compound: harvests rewards and reinvests, maximizing APY\n- Strategy examples: supply to Aave + borrow stablecoins + LP on Curve + stake LP tokens\n- Management fee: ~2%; performance fee: ~20% of yield\n- APY calculation: base yield × (1 + r/n)^n where n = compounds per year\n\n**Real yield vs token incentive yield:**\n| Type | Source | Sustainability |\n|---|---|---|\n| Real yield | Protocol revenue (fees, interest spreads) | Sustainable |\n| Token incentives | Protocol mints new tokens to reward LPs | Inflationary; dries up |\n- GMX, Gains Network: 100% of fees distributed to stakers in ETH/USDC real yield\n- Most 2021 yield farms: >90% token emissions Ponzi yield; APY collapses as tokens are sold",
 highlight: ["flash loan", "atomic", "yield aggregator", "Yearn", "auto-compound", "real yield", "token incentive", "APY"],
 },
 {
 type: "quiz-mc",
 question:
 "You deposit 10 ETH ($20,000) as collateral on Aave with a liquidation threshold of 82.5%, and borrow 14,000 USDC. What is your health factor, and at approximately what ETH price will you be liquidated?",
 options: [
 "HF = 1.18; liquidation at ETH $1,697 (when 10 ETH × LT = 14,000)",
 "HF = 1.43; liquidation at ETH $1,400 (when borrowed = deposited)",
 "HF = 0.82; you are already liquidatable",
 "HF = 1.00; you are exactly at the liquidation threshold",
 ],
 correctIndex: 0,
 explanation:
 "Health Factor = (Collateral × LT) / Borrowed = (20,000 × 0.825) / 14,000 = 16,500 / 14,000 = 1.179 1.18. Liquidation occurs when HF = 1.00: (ETH_price × 10 × 0.825) / 14,000 = 1.0 ETH_price = 14,000 / 8.25 = $1,697. So if ETH drops from $2,000 to $1,697 (a 15% decline), your position becomes liquidatable. At this point, liquidators can repay up to $7,000 of your debt and claim ETH collateral at a discount (typically 5% bonus), incentivizing fast liquidation to protect the protocol's solvency.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "DeFi Protocol X offers 180% APY on its native TOKEN stablecoin farm. The yield is 100% from TOKEN emissions. The protocol has $5M TVL. Protocol Y offers 9% APY on USDC, sourced 100% from real lending interest on $800M TVL. A crypto influencer calls Protocol X 'the best yield in DeFi' and Protocol Y 'boring old money.' You have $50,000 to deploy for 6 months.",
 question:
 "Which protocol offers genuinely superior risk-adjusted yield for a 6-month deployment, and why?",
 options: [
 "Protocol Y — 9% real yield on $800M TVL represents ~$72M annual revenue (sustainable); Protocol X's 180% APY from emissions on $5M TVL mathematically requires ~$9M in new TOKEN minting per year (180% of $5M), which will continuously dilute TOKEN price toward zero",
 "Protocol X — 180% APY means even if TOKEN drops 90%, you still earn 18% in dollar terms over 6 months",
 "Protocol X — first-mover advantage means early depositors always profit before APY compresses",
 "Both are equivalent; APY should be evaluated the same regardless of source",
 ],
 correctIndex: 0,
 explanation:
 "Protocol X exhibits the classic Ponzi yield structure: 180% APY on $5M TVL requires ~$9M worth of new tokens minted annually — nearly 2× the entire TVL. Each new token minted dilutes existing holders. Early depositors can profit if they exit before prices collapse, but this is a zero-sum game where late entrants subsidize early ones. Protocol Y's 9% APY from lending interest on $800M TVL = ~$72M real annual revenue, making it fully sustainable. The 'boring' label is the tell: sustainable DeFi yields from real economic activity typically range 4–15% APY. Anything above 50% from token emissions is a major red flag.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Crypto Market Structure & Risk 
 {
 id: "crypto-protocols-5",
 title: "Crypto Market Structure & Risk",
 description:
 "CEX vs DEX, MEV, cross-chain bridges, bridge exploits, and stablecoin taxonomy",
 icon: "AlertTriangle",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "CEX vs DEX: Market Structure Comparison",
 content:
 "**Centralized exchanges (CEX)** and **decentralized exchanges (DEX)** represent fundamentally different market structures with distinct trade-offs.\n\n**CEX (Coinbase, Binance, Kraken):**\n- Traditional central limit order book (CLOB): buy and sell orders matched by price-time priority\n- Custody: exchange holds user assets in its own wallets (single point of failure)\n- Advantages: deep liquidity, fast execution (<1ms), sophisticated order types (stop-loss, OCO), leverage\n- Disadvantages: custodial risk (FTX collapse: $8B+ in customer funds stolen), KYC required, withdrawal limits, centralized control\n- FTX collapse (Nov 2022): largest custodial failure in crypto history — CZ's tweet triggered a bank run, revealing FTX had used customer funds for Alameda trading\n\n**DEX (Uniswap, dYdX, GMX):**\n- Self-custody: users trade directly from their wallets via smart contracts\n- AMM model (Uniswap): no order book; algorithmic pricing via x*y=k\n- Hybrid CLOB (dYdX v4): uses Cosmos-based order book for perpetual futures\n- GMX: uses Chainlink price feeds + liquidity pool; no price impact for large trades\n- Advantages: non-custodial (no FTX-style risk), permissionless (any token can launch), on-chain transparency\n- Disadvantages: slower (12-second block times), gas fees, MEV exposure, limited order types, complex UX\n\n**Market share shift:**\nPost-FTX, DEX volume spiked to ~20% of CEX volume. Long-term, hybrid models (CEX UX + DEX custody) are emerging via protocols like Vertex, Drift, and HyperLiquid.",
 highlight: ["CEX", "DEX", "CLOB", "AMM", "custodial risk", "FTX", "non-custodial", "market structure"],
 },
 {
 type: "teach",
 title: "MEV: Maximal Extractable Value",
 content:
 "**MEV (Maximal Extractable Value)** is the profit validators/miners can extract by reordering, inserting, or censoring transactions within a block.\n\n**Why MEV exists:**\nBlock producers control transaction ordering. Pending transactions are visible in the public mempool before inclusion. This creates opportunities to profit from other users' transactions.\n\n**MEV attack types:**\n\n**Frontrunning:**\nBot sees pending DEX trade submits identical trade with higher gas gets included first user's trade moves price bot sells into user's trade for profit\nExample: Bot sees $500K ETH buy on Uniswap buys ETH first user's trade pushes price up 3% bot sells for $15K profit\n\n**Sandwich attack:**\nBot sees large pending swap buys the token first (frontrun) user's trade pushes price up bot sells immediately (backrun)\nUser pays: worse price + gas fees. Bot earns: full price impact between front and back runs\n\n**Arbitrage MEV (neutral):**\nAfter a large trade moves an AMM price, bots immediately arbitrage against other venues. Beneficial: restores price parity. But bots extract profits that could otherwise accrue to LPs.\n\n**Flashbots & MEV mitigation:**\nFlashbots created **MEV-Boost**: a marketplace where block builders bid for block construction rights, routing MEV to validators instead of shadowy searchers. ~95% of Ethereum blocks are now built by MEV-Boost relays.\n\n**User protections:**\n- **Slippage tolerance**: set low (0.5%) to reject sandwiched trades\n- **Private RPC** (Flashbots Protect, MEV Blocker): submits transactions directly to block builders, bypassing public mempool\n- **CowSwap**: batch auctions solve MEV by matching opposite trades internally",
 highlight: ["MEV", "frontrunning", "sandwich attack", "mempool", "Flashbots", "MEV-Boost", "private RPC", "slippage tolerance"],
 },
 {
 type: "teach",
 title: "Bridge Security & Stablecoin Taxonomy",
 content:
 "**Cross-chain bridge trust models:**\nBridges are the most exploited infrastructure in crypto — over $2.5B stolen in 2022 alone.\n\n| Trust Model | Example | Security | Speed |\n|---|---|---|---|\n| Multisig | Ronin, Harmony | Low (compromise 5/9 keys) | Fast |\n| Optimistic (fraud proof) | Arbitrum Bridge | High | 7-day withdraw delay |\n| Light client / ZK | zkBridge, Polyhedra | Highest | Fast (minutes) |\n| Liquidity network | Stargate, Across | Medium (LP + oracle risk) | Minutes |\n\n**Infamous bridge hacks:**\n- **Ronin Bridge ($625M, Mar 2022)**: Axie Infinity bridge controlled by 5-of-9 multisig. LAZARUS Group (North Korea) phished and compromised 5 validator keys. Largest DeFi hack ever.\n- **Wormhole ($320M, Feb 2022)**: Signature verification bug allowed attacker to forge guardian signatures, minting 120,000 wETH on Solana without collateral. Jump Crypto bailed out the protocol.\n- **Nomad ($190M, Aug 2022)**: A routine configuration update accidentally marked all messages as pre-approved. Within hours, a community-wide copycat attack drained nearly all funds.\n\n**Stablecoin taxonomy:**\n\n**Fiat-backed (USDC, USDT):** 1:1 USD reserves held by custodian. Risk: custodian fraud/insolvency, regulatory seizure. USDC briefly de-pegged to $0.87 when SVB bank (holding Circle's reserves) failed.\n\n**Crypto-backed (DAI, crvUSD):** Over-collateralized with crypto assets. Transparent, decentralized. Risk: collateral price crash causes liquidation cascade. DAI survived the 2022 bear market.\n\n**Algorithmic (UST — failed):** Maintained peg via mint/burn arbitrage with a paired volatile token (LUNA). Death spiral: UST loses peg arbitrageurs mint LUNA to restore LUNA supply explodes LUNA crashes confidence lost more UST sold total collapse. $40B+ destroyed in 72 hours.",
 highlight: ["bridge", "multisig", "optimistic bridge", "ZK bridge", "Ronin", "Wormhole", "Nomad", "fiat-backed", "crypto-backed", "algorithmic stablecoin", "death spiral", "UST"],
 },
 {
 type: "quiz-mc",
 question:
 "Which stablecoin design is most vulnerable to a death spiral, and why?",
 options: [
 "Algorithmic stablecoins (like UST) backed by a volatile governance token — the peg relies on arbitrage confidence; if confidence breaks, the reflex of minting the volatile token causes hyperinflation of that token, destroying both assets simultaneously",
 "Fiat-backed stablecoins (like USDC) because they depend on a centralized bank holding reserves",
 "Crypto-backed stablecoins (like DAI) because crypto collateral can drop in value",
 "All stablecoins face equal death spiral risk since any peg can break",
 ],
 correctIndex: 0,
 explanation:
 "Algorithmic stablecoins with reflexive mechanisms (Terra/UST + LUNA) have the highest death spiral risk by design. The mechanism: UST de-pegs arbitrageur burns UST to mint $1 of LUNA but if everyone does this simultaneously, LUNA supply hyperinflates LUNA price collapses $1 of LUNA is worth less than $1 confidence in the arbitrage mechanism breaks more UST sold acceleration. DAI (crypto-backed) survived because over-collateralization provides a buffer — if ETH drops 50%, a 150% collateral ratio still covers the debt. USDC (fiat-backed) briefly de-pegged but recovered when Circle confirmed funds were recovered. Only the algorithmic design has a structural positive feedback loop to zero.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A DeFi researcher presents three investment opportunities: (A) Bridge a large amount of ETH via a 3-of-5 multisig bridge to earn 15% APY on a new chain. (B) Use a CEX for daily trading of 10+ altcoins, keeping $100K+ on the exchange for fast execution. (C) Provide stablecoin liquidity on a protocol offering 400% APY from its native governance token emissions, with $2M TVL. You have $50,000 and must choose only one to deploy for 3 months.",
 question:
 "Rank these opportunities from least to most risky, and identify the primary risk for the highest-risk option.",
 options: [
 "Least risky: none are acceptable. If forced to choose: CEX (B) — regulated exchanges have insurance and transparency; Bridge (A) has catastrophic hack risk; DeFi farm (C) has near-certain token inflation collapse. Primary risk for (C): token emissions cause 90%+ price decay, making 400% APY worth near zero in real terms",
 "Least risky: DeFi farm (C) because 400% APY can offset any loss in 3 months",
 "Least risky: Bridge (A) because 15% APY justifies the risk of cross-chain movement",
 "All three carry equivalent risk since crypto is inherently speculative",
 ],
 correctIndex: 0,
 explanation:
 "Risk ranking: (C) highest risk — 400% APY from emissions on $2M TVL is mathematically a Ponzi: requires $8M/year in new token issuance on $2M TVL. Token will likely lose 80–99% of value in 3 months. (A) high risk — 3-of-5 multisig bridge is exactly the structure that lost $625M (Ronin) and $100M (Harmony). Keeping large funds in a multisig bridge for 3 months exposes you to catastrophic, total-loss hack risk. (B) moderate risk — regulated CEX (Coinbase, Kraken) has better transparency and US regulatory oversight, but still custodial risk (FTX precedent). Best practice would be to not keep $100K+ on any exchange, but among these three, CEX risk is most manageable with proper platform selection.",
 difficulty: 3,
 },
 ],
 },
 ],
};
