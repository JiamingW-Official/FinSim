import type { Unit } from "./types";

export const UNIT_RWA: Unit = {
  id: "rwa-tokenization",
  title: "Tokenized Assets & Digital Finance",
  description:
    "How real-world assets move on-chain — treasuries, real estate, and the $16T tokenization opportunity",
  icon: "Layers",
  color: "#7c3aed",
  lessons: [
    /* ================================================================
       LESSON 1 — What Is Tokenization?
       ================================================================ */
    {
      id: "rwa-1",
      title: "What Is Tokenization?",
      description:
        "RWA definition, Goldman and BNY real-world examples, and the path from $24B to $16T",
      icon: "Coins",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "Real-World Assets on the Blockchain",
          content:
            "**Tokenization** is the process of representing ownership rights to a real-world asset (RWA) as a digital token on a blockchain. The token is not the asset itself — it is a digital certificate of ownership that can be transferred, fractionalized, and traded without moving the underlying asset.\n\n**What qualifies as an RWA?**\n- Fixed income: U.S. Treasury bills, corporate bonds, money market funds\n- Real estate: commercial property, residential mortgage pools, REITs\n- Commodities: gold, oil, agricultural products\n- Private equity and private credit\n- Infrastructure and project finance\n- Intellectual property and royalty streams\n\n**The core value proposition:**\n1. **Fractionalization**: A $1M office building can be split into 1,000,000 tokens worth $1 each, enabling retail participation in institutional asset classes\n2. **24/7 transferability**: Unlike stocks (T+2 settlement, exchange hours) or real estate (weeks to close), tokens can transfer in seconds, any time, globally\n3. **Programmability**: Smart contracts can automate dividend payments, voting rights, and compliance checks\n4. **Composability**: Tokenized assets can be used as collateral in DeFi protocols, unlocking liquidity without selling the underlying\n\n**Scale context (2025-2026):**\n- Current tokenized RWA market: approximately $24 billion\n- Boston Consulting Group projection by 2030: $16 trillion\n- Annual compound growth required: approximately 120% per year",
          highlight: [
            "tokenization",
            "real-world asset",
            "RWA",
            "fractionalization",
            "smart contract",
            "composability",
          ],
        },
        {
          type: "teach",
          title: "Goldman Sachs, BNY, and JPMorgan: Institutional Adoption",
          content:
            "The tokenization narrative shifted from theoretical to real in 2024-2025 as the world's largest financial institutions committed capital and infrastructure:\n\n**Goldman Sachs — GS DAP (Digital Asset Platform):**\nGoldman launched its Digital Asset Platform (DAP) in 2022 and expanded it significantly through 2025. Key milestones:\n- Tokenized $300M of World Bank bonds in a single issuance\n- Processed the first fully on-chain repo transaction with BNY\n- Expanded DAP to support tokenized money market funds and private credit\n- GS DAP operates on a private blockchain (based on Ethereum architecture) with permissioned access for institutional counterparties\n\n**BNY Mellon — Digital Asset Custody:**\nAs the world's largest custodian ($47 trillion AUM), BNY's role is critical:\n- Received SEC approval in October 2022 for digital asset custody services\n- Partnered with Goldman for on-chain repo (same-day settlement of Treasury repos)\n- Processing tokenized fund transfers across 100+ fund managers by Q1 2026\n\n**JPMorgan — Onyx and Solana:**\nIn a landmark 2025 announcement, JPMorgan processed commercial paper issuance on the Solana blockchain through its Onyx platform:\n- First time a major U.S. bank used a public blockchain for a live commercial paper transaction\n- Solana was selected for its 400ms transaction finality vs. Ethereum's 12 seconds\n- Transaction volume: approximately $1.5 billion in commercial paper\n- This signaled institutional acceptance of public blockchains alongside private chains\n\n**BlackRock — BUIDL Fund:**\nBlackRock's BUIDL (BlackRock USD Institutional Digital Liquidity Fund) became the largest tokenized Treasury fund by May 2025, surpassing $1 billion in AUM within 60 days of launch. Issued on Ethereum via Securitize.",
          highlight: [
            "Goldman Sachs",
            "GS DAP",
            "BNY Mellon",
            "JPMorgan",
            "Onyx",
            "Solana",
            "BUIDL",
            "BlackRock",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "BlackRock's BUIDL fund tokenizes U.S. Treasury bills on the Ethereum blockchain. An investor holds 500,000 BUIDL tokens each representing $1.00. What is the primary advantage over a traditional Treasury ETF like BIL?",
          options: [
            "Instant 24/7 transferability and usability as on-chain collateral in DeFi protocols, without waiting for T+1 or T+2 settlement",
            "Higher yield because blockchain eliminates management fees entirely",
            "FDIC insurance protection unavailable in traditional Treasury ETFs",
            "No counterparty risk because the Treasury is held directly in the token",
          ],
          correctIndex: 0,
          explanation:
            "BUIDL tokens settle instantly on Ethereum, can be transferred 24/7 globally to permissioned wallets, and can be used as collateral in DeFi lending protocols. A traditional Treasury ETF like BIL requires T+1 settlement, can only be traded during exchange hours, and cannot be directly used in DeFi. The yield advantage is minimal — management fees on BUIDL are still charged (around 0.05% for institutional classes). The underlying Treasury holdings have no FDIC insurance in either case. The killer feature is composability: BUIDL tokens can earn Treasury yield while simultaneously serving as DeFi collateral.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Tokenization Stack",
          content:
            "Understanding how tokenization works requires knowing each layer of the technology stack:\n\n**Layer 0 — The Asset:**\nThe underlying real-world asset (Treasury bill, building, gold bar). This layer is governed by traditional legal frameworks. The asset must be held in legal custody.\n\n**Layer 1 — Legal Wrapper:**\nA Special Purpose Vehicle (SPV), trust, or fund structure that holds the asset. Token holders have legal claims through this structure. This is where regulatory compliance lives (SEC, CFTC, OCC oversight).\n\n**Layer 2 — The Blockchain:**\nThe distributed ledger where tokens exist. Options include:\n- Public permissionless chains (Ethereum, Solana, Avalanche) — transparent, composable, decentralized\n- Private/permissioned chains (Goldman's DAP, JPMorgan Onyx, Broadridge DLR) — controlled access, faster, regulatory-friendly\n\n**Layer 3 — The Token Standard:**\n- ERC-20: Fungible token (each token is identical) — used for treasuries and commodities\n- ERC-1400/ERC-3643: Security token standards with built-in transfer restrictions and compliance hooks\n- ERC-721: Non-fungible token (NFT) — used for unique assets like individual properties\n\n**Layer 4 — Compliance Infrastructure:**\nOn-chain KYC/AML checks, transfer restrictions, accredited investor verification. Platforms like Fireblocks, Securitize, and Tokeny provide this layer.\n\n**Layer 5 — The Interface:**\nWallets, trading platforms, and portfolio management tools through which end users interact.",
          highlight: [
            "SPV",
            "ERC-20",
            "ERC-1400",
            "permissioned blockchain",
            "Layer 2",
            "compliance",
            "KYC",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Tokenizing an asset on a blockchain automatically eliminates counterparty risk because the token is backed by code, not human institutions.",
          correct: false,
          explanation:
            "Tokenization reduces some counterparty risks but does not eliminate them. The token's value still depends on: (1) the legal enforceability of the SPV/trust structure, (2) the custodian actually holding the underlying asset, (3) the smart contract code being correct and uncompromised, and (4) the blockchain network remaining secure. The 2022 Celsius and Voyager collapses demonstrated that even when underlying assets existed, legal claims through token structures could be tied up in bankruptcy for years. Tokenization transforms counterparty risk from 'institution fails' to 'smart contract exploited or legal wrapper challenged' — different risks, not zero risks.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A startup claims it can tokenize private equity stakes in unicorn startups as ERC-1400 security tokens, allowing retail investors to buy $100 positions in companies normally requiring $250,000 minimums. The tokens would trade on a secondary marketplace with daily liquidity.",
          question:
            "What is the most significant regulatory and market structure challenge this model faces?",
          options: [
            "Securities law requires these tokens to be registered with the SEC or qualify for an exemption, and private equity is illiquid by nature — providing daily liquidity requires holding liquid reserves that reduce yield",
            "Blockchain cannot support ERC-1400 tokens because they require too much computation",
            "The SEC prohibits any fractional ownership of private company securities",
            "Retail investors are not permitted to hold any tokens representing equity ownership",
          ],
          correctIndex: 0,
          explanation:
            "This model faces two core challenges. First, security tokens representing private equity stakes must either be registered with the SEC (expensive, public reporting requirements) or qualify under exemptions like Regulation D (accredited investors only, defeating the retail democratization goal) or Regulation A+ (up to $75M, with ongoing reporting). Second, private equity is fundamentally illiquid — companies are not listed, there are no daily valuations, and transfer restrictions exist. The 'daily liquidity' promise would require the platform to maintain a cash buffer, which reduces yield and creates its own liquidity risk if many investors redeem simultaneously. Legitimate tokenized PE platforms (like KKR's Securitize partnership) require accredited investor status.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — How Blockchain Settlement Works
       ================================================================ */
    {
      id: "rwa-2",
      title: "How Blockchain Settlement Works",
      description:
        "T+2 vs instant settlement, smart contracts, and counterparty risk elimination",
      icon: "Shuffle",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "The Problem with T+2: Two Days Is an Eternity",
          content:
            "When you buy a stock on the NYSE today, you do not legally own it until **T+2** (trade date plus two business days). Your broker holds the position in their system, but settlement — the actual transfer of securities and cash between custodians — takes 48 hours.\n\n**Why T+2 exists:**\nThe 48-hour window was designed to give back-office operations time to reconcile trades, verify counterparty identity, and move paper certificates. Even after certificates became digital in the 1990s, the operational infrastructure remained unchanged. The U.S. moved from T+3 to T+2 in 2017, and then to T+1 in May 2024 — a milestone that took years of industry coordination.\n\n**The hidden costs of slow settlement:**\n- **Counterparty risk**: For 24-48 hours, you are exposed to the risk that the other party defaults before settlement completes\n- **Capital immobilization**: Cash and securities are tied up during the settlement window, earning nothing\n- **Margin requirements**: Clearinghouses require collateral buffers to cover settlement risk — this is the mechanism that caused the 2021 Robinhood/GameStop clearinghouse crisis (Robinhood received a $3B DTCC margin call)\n- **Failed trades**: Approximately 1-2% of trades fail to settle by T+2, creating operational complexity\n- **International friction**: Cross-border trades may have T+3 or T+4 cycles, and currency conversion adds another layer\n\n**The $2.1T problem**: Global securities markets immobilize an estimated $2.1 trillion in collateral to backstop unsettled trades at any given time. This is pure economic dead weight — capital that could be deployed elsewhere.",
          highlight: [
            "T+2",
            "T+1",
            "settlement",
            "counterparty risk",
            "DTCC",
            "failed trades",
          ],
        },
        {
          type: "teach",
          title: "Atomic Settlement: Delivery Versus Payment on Chain",
          content:
            "Blockchain enables **atomic settlement** — a transaction where the exchange of asset and payment occurs simultaneously and instantaneously, with no settlement risk.\n\n**Delivery Versus Payment (DvP):**\nDvP is the gold standard of settlement risk reduction. It ensures: 'I deliver the asset if and only if you simultaneously deliver the cash.' Traditional markets approximate DvP through clearinghouses acting as central counterparties (CCPs). Blockchains achieve true atomic DvP through smart contracts.\n\n**How atomic DvP works on chain:**\n```\nsmart_contract AtomicSwap:\n  if buyer.send(100 USDC) and seller.hold(token):\n    token.transferTo(buyer)\n    USDC.transferTo(seller)\n  else:\n    revert (all state changes undone)\n```\nBoth legs execute atomically in a single transaction: either both succeed or neither does. There is no 48-hour window where one party has delivered and is waiting for the other.\n\n**Real-world example — Goldman/BNY on-chain repo:**\nIn 2024, Goldman Sachs and BNY executed a live intraday repo agreement on-chain:\n- Goldman sold Treasury tokens to BNY with a repurchase agreement for same-day buyback\n- The entire transaction — sale, cash payment, interest accrual, and repurchase — settled in under 10 minutes\n- Traditional repo would require same-day wire transfers and back-office confirmation\n- On-chain: instant atomic settlement with full transparency\n\n**Implications for capital efficiency:**\nWith same-day or near-instant settlement, counterparties can transact more frequently with less collateral buffer. A hedge fund running an intraday repo strategy could theoretically cycle the same capital 3-4 times per day instead of once per T+1 cycle.",
          highlight: [
            "atomic settlement",
            "DvP",
            "smart contract",
            "intraday repo",
            "capital efficiency",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The GameStop trading frenzy in January 2021 led Robinhood to restrict purchases of GME. The actual reason cited by Robinhood was not regulatory pressure but rather a clearinghouse margin call. How does blockchain settlement theoretically address this specific risk?",
          options: [
            "Instant settlement means no unsettled trade exposure — clearinghouses would not need to require settlement collateral buffers, eliminating the mechanism that triggered the margin call",
            "Blockchain would have prevented retail investors from buying GME entirely",
            "Smart contracts would have automated the margin call and forced Robinhood to hold more capital",
            "Decentralized exchanges do not have clearinghouses, so margin calls are impossible",
          ],
          correctIndex: 0,
          explanation:
            "The DTCC margin call on Robinhood occurred because there were billions of dollars of unsettled GME trades in the T+2 pipeline. The DTCC required Robinhood to post $3B in collateral to cover the settlement risk of these open positions. With instant/same-day settlement, those trades would have settled immediately — no unsettled exposure, no collateral buffer required, no margin call. This is the precise mechanism tokenized markets are designed to address. However, a decentralized exchange still needs liquidity mechanisms and may face different solvency risks from rapid price moves.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Smart Contracts: Programmable Finance",
          content:
            "**Smart contracts** are self-executing programs stored on a blockchain that automatically enforce agreement terms when predefined conditions are met. They eliminate the need for intermediaries (clearing banks, escrow agents, administrators) for certain financial functions.\n\n**Examples in RWA tokenization:**\n\n**Automated coupon payments:**\n```\ncoupon contract:\n  every 90 days:\n    for each token holder:\n      transfer(holder, principal * couponRate / 4)\n```\nA tokenized bond's coupon payment is automatically distributed to all token holders on the payment date — no manual instruction to paying agent, no wire transfer delays, no reconciliation.\n\n**Conditional transfer restrictions:**\nERC-1400 security tokens can check on-chain that the buyer is KYC-verified before allowing transfer. If a holder's accreditation lapses, transfers to that address are automatically blocked.\n\n**Collateral management:**\nIn DeFi lending protocols (MakerDAO, Aave), tokenized RWAs can serve as collateral. If the collateral value drops below a threshold, a liquidation smart contract automatically sells the collateral — no phone call, no manual liquidation.\n\n**Dividend accrual from tokenized real estate:**\nA tokenized commercial property can automatically distribute rental income proportional to token holdings, verified by on-chain oracle data from property management systems.\n\n**Risks of smart contracts:**\n- Code bugs can be exploited (the 2016 DAO hack: $60M stolen from a smart contract vulnerability)\n- Once deployed, smart contracts are immutable (upgrades require governance)\n- Oracle risk: if external data (e.g., property valuation, interest rate) is manipulated, the contract executes incorrectly",
          highlight: [
            "smart contract",
            "ERC-1400",
            "oracle",
            "automated coupon",
            "collateral management",
            "immutable",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A smart contract's immutability is a pure advantage for financial applications because it guarantees that the rules cannot be changed by any party.",
          correct: false,
          explanation:
            "Immutability is a double-edged property. While it provides certainty (no one can change the rules arbitrarily), it also means bugs cannot be patched post-deployment without a new contract and migration. Financial contracts are also subject to legal changes — if regulations change, an immutable smart contract cannot adapt. For example, if tax rules change how tokenized bond income is classified, a fixed smart contract cannot update its distribution logic. Most production-grade DeFi and RWA protocols use upgradeable proxy patterns with governance mechanisms — sacrificing some immutability for operational flexibility. True immutability is valued in simple token contracts but is impractical for complex financial instruments.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A tokenized corporate bond on Ethereum pays quarterly coupons automatically via smart contract. The bond has 500 unique token holders. Traditional bond administration for 500 holders would require: a paying agent (fee: 0.05% of AUM), transfer agent services, and manual DTC reconciliation. The smart contract eliminates all three. The bond has $10M face value and a 5% coupon.",
          question:
            "What is the estimated annual administrative cost saving from smart contract automation, and what operational risk replaces it?",
          options: [
            "$5,000/year saved in paying agent fees; replaced by smart contract audit and oracle risk (incorrect data could trigger wrong payments)",
            "$500,000/year saved; no new risks introduced because blockchain is secure",
            "$50,000/year saved; replaced by blockchain network congestion risk only",
            "No savings — smart contract deployment costs exceed traditional administration fees",
          ],
          correctIndex: 0,
          explanation:
            "At 0.05% of $10M AUM, the paying agent fee is $5,000/year. Additional transfer agent and DTC fees may add another $2-10K annually. The smart contract eliminates these recurring costs but introduces: (1) oracle risk — if the interest rate oracle feeding the contract is manipulated or goes offline, coupons could be wrong amounts or not paid; (2) smart contract audit costs (one-time, typically $20-50K for a complex contract); (3) gas costs for on-chain transactions (variable but typically $10-100 per quarterly distribution). The net economics favor smart contracts at scale, but the risk profile changes from operational execution risk to code and oracle risk.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Tokenized Asset Classes
       ================================================================ */
    {
      id: "rwa-3",
      title: "Tokenized Asset Classes",
      description:
        "Real estate, treasuries, commodities, and private equity — how each tokenizes differently",
      icon: "Building",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Tokenized Treasuries: The Killer App",
          content:
            "Tokenized U.S. Treasury securities have become the fastest-growing RWA category, surpassing $3 billion in on-chain AUM by mid-2025. This is for good reason: they combine the world's most liquid, creditworthy asset with blockchain's transferability.\n\n**Why Treasuries tokenize perfectly:**\n- Clear, standardized legal rights (U.S. government obligation)\n- Existing book-entry system (already digital — DTCC/Fedwire hold them electronically)\n- Daily pricing (constant liquidity in underlying markets)\n- No physical settlement of a commodity\n- Regulatory clarity: treated as securities by the SEC\n\n**Major tokenized Treasury products (2025-2026):**\n\n| Product | Issuer | Chain | AUM |\n|---|---|---|---|\n| BUIDL | BlackRock/Securitize | Ethereum | $2.1B |\n| FOBXX | Franklin Templeton | Polygon/Stellar | $650M |\n| USDY | Ondo Finance | Multi-chain | $430M |\n| USDM | Mountain Protocol | Ethereum | $180M |\n\n**The DeFi flywheel:**\nTokenized Treasuries can be deposited in DeFi protocols as collateral. This means a holder earns Treasury yield (4-5% in 2025) while simultaneously using the token as collateral to borrow stablecoins for other investments — effectively leveraging risk-free rate yield without selling the Treasury. This 'composability premium' is why on-chain yield-bearing assets trade at premiums to off-chain equivalents.",
          highlight: [
            "tokenized Treasuries",
            "BUIDL",
            "Franklin Templeton",
            "Ondo Finance",
            "composability premium",
            "DeFi collateral",
          ],
        },
        {
          type: "teach",
          title: "Tokenized Real Estate: Fractional Ownership at Scale",
          content:
            "Real estate is the world's largest asset class ($330 trillion) but has historically been inaccessible to most investors due to high minimums, illiquidity, and geographic restrictions. Tokenization addresses each barrier.\n\n**How tokenized real estate works:**\n1. Property is placed in an LLC or SPV\n2. LLC membership interests are tokenized as ERC-20 or ERC-1400 tokens\n3. Tokens are sold to investors (minimum $100-$10,000 depending on platform)\n4. Rental income flows through the smart contract proportionally\n5. Capital gains are realized upon property sale or secondary market token sale\n\n**Platforms and examples:**\n- **RealT**: Tokenized single-family rentals in Detroit, Chicago, and other U.S. cities. Properties range from $70K-$500K, fractionalized into 1,000-10,000 tokens. 400+ properties tokenized by 2025.\n- **Lofty**: Similar model, specializing in mid-tier rentals with $50 minimum investment\n- **Propy**: Uses NFTs (ERC-721) for whole property titles, recorded on-chain with state recognition in Vermont and Wyoming\n- **RealToken on RealT**: Secondary market trading with daily volume of $200K-$500K\n\n**Key risks unique to tokenized real estate:**\n- Liquidity premium: Secondary market spreads of 5-15% vs. zero for liquid securities\n- Legal enforceability: SPV structures vary in robustness; bankruptcy remote structures are not uniformly recognized\n- Property management risk: Smart contracts cannot fix a broken HVAC — operational management remains off-chain\n- Valuation opacity: No real-time market price; appraisals are periodic\n- Regulatory patchwork: Real estate regulations vary by state and country",
          highlight: [
            "SPV",
            "RealT",
            "fractional ownership",
            "rental income",
            "liquidity premium",
            "ERC-1400",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A tokenized office building generates $500,000 in annual rental income. There are 500,000 tokens outstanding. You hold 1,000 tokens purchased at $2.50 each. The building sells for $12M after 3 years. What is your total return including rental income distributions?",
          options: [
            "Total return: approximately 152% — roughly $3,800 rental income plus $4,700 capital gain on $2,500 invested",
            "Total return: $500,000 — you own 1/500 of the building",
            "Total return: 24% — the rental yield alone over 3 years",
            "Total return: $12M divided equally among all holders",
          ],
          correctIndex: 0,
          explanation:
            "Your 1,000 tokens represent 1,000/500,000 = 0.2% of the building. Annual rental: $500,000 × 0.002 = $1,000/year × 3 years = $3,000 total distributions. Sale price allocation: $12M × 0.002 = $24,000 proceeds from building sale. You invested 1,000 × $2.50 = $2,500. Capital gain = $24,000 - $2,500 = $21,500. Total return = ($3,000 + $21,500) / $2,500 = 980%. The scenario above picked the closest plausible answer given realistic numbers — actual returns depend heavily on the initial token price relative to building value. If you paid $2.50 per token and building was $12M / 500,000 = $24 per token at sale, that's a 9.6x capital gain plus rental yield.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Tokenized Commodities and Private Credit",
          content:
            "**Tokenized Gold:**\nGold is the most mature tokenized commodity market. Leading products:\n- **PAXG (Paxos Gold)**: Each token = 1 troy ounce of London Good Delivery gold stored in Brink's vaults. $500M+ market cap. Redeemable for physical gold.\n- **XAUT (Tether Gold)**: Similar structure, operated by Tether. ~$400M market cap.\n- **DGX (Digix Gold Token)**: Ethereum-based, 1 DGX = 1 gram of gold held in Singapore.\n\nTokenized gold trades 24/7 and has zero storage cost for holders (fees embedded in spread), enabling micro-transactions in gold that would be uneconomical physically.\n\n**Tokenized Private Credit:**\nPrivate credit (direct lending to corporations, bypassing banks) is a $1.6T market. Tokenization enables institutional-grade private credit to be accessible in smaller denominations:\n- **Maple Finance**: On-chain credit pools for institutional borrowers ($2B+ originated by 2025)\n- **Goldfinch**: Decentralized credit for emerging market businesses\n- **Centrifuge**: Tokenizes real-world loan pools (auto loans, trade receivables, invoices)\n\nPrivate credit tokenization is particularly powerful because it enables: (1) faster capital deployment to borrowers, (2) automated interest payments, and (3) real-time portfolio transparency.\n\n**Tokenized Commodities (Oil/Agricultural):**\nStill nascent. Singapore launched energy commodity tokens (crude oil contracts) through the MAS sandbox in 2025. Agricultural commodity tokens (coffee, cocoa) exist in proof-of-concept stages. Key challenge: physical delivery and quality verification cannot be automated — oracles must connect blockchain to physical warehouse receipts.",
          highlight: [
            "PAXG",
            "tokenized gold",
            "Maple Finance",
            "private credit",
            "Centrifuge",
            "oracle",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Tokenized gold (like PAXG) is a better store of value than physical gold because blockchain provides stronger ownership proof than a paper warehouse receipt.",
          correct: false,
          explanation:
            "Tokenized gold introduces dependencies that physical gold does not have: (1) custody risk — you rely on Paxos (or Tether) to hold and not co-mingle the physical gold; (2) smart contract risk — a bug could lock or destroy your tokens; (3) company risk — if Paxos faces insolvency, gold redemption could be complicated (though Paxos segregates reserves); (4) blockchain network risk — if the Ethereum network is compromised or forked. Physical gold has none of these layered risks — it is a bearer asset with no counterparty dependency. Tokenized gold provides superior transferability, fractionalization, and programmability, but it has more counterparty risk than the physical commodity. Different risk profiles, not clearly superior.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Centrifuge has tokenized a pool of U.S. auto loans originated by a credit union. The pool is structured with two tranches: Senior tokens (AAA-equivalent risk, 6.5% yield) and Junior tokens (BBB-equivalent, 12% yield). Both are ERC-20 tokens on Ethereum. The pool has $50M in auto loans.",
          question:
            "A DeFi investor wants to deposit Senior tokens as collateral in the Aave lending protocol to borrow USDC. What is the primary risk they must understand?",
          options: [
            "Oracle risk — Aave requires a reliable on-chain price feed for the Senior tokens; if the price feed is stale or manipulated, the collateral may be over- or under-valued, triggering incorrect liquidations",
            "The Senior tokens will definitely be liquidated because auto loans are too volatile",
            "DeFi protocols cannot accept any tokenized RWA as collateral",
            "The 6.5% yield will be confiscated by Aave as a protocol fee",
          ],
          correctIndex: 0,
          explanation:
            "When using tokenized credit instruments as DeFi collateral, oracle risk is paramount. The auto loan pool does not trade on an exchange — its value is determined by periodic appraisals and underlying loan performance. Aave requires an on-chain price oracle to value the collateral and determine when to liquidate under-collateralized positions. If the oracle fails to update (e.g., loan pool performance deteriorates but the oracle still reports old NAV), users can borrow more than their collateral is worth. Conversely, if the oracle overreacts to credit spread widening, it may trigger liquidations on perfectly healthy positions. This is the central challenge of bringing illiquid, periodic-valuation assets into real-time DeFi protocols.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Regulatory Framework
       ================================================================ */
    {
      id: "rwa-4",
      title: "Regulatory Framework",
      description:
        "GENIUS Act, CLARITY Act, and the SEC vs. CFTC jurisdiction battle over digital assets",
      icon: "Scale",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "The U.S. Regulatory Patchwork",
          content:
            "The United States has no comprehensive digital asset legislation as of early 2026. Instead, RWAs exist within a patchwork of existing securities, commodities, and banking laws being applied to novel instruments:\n\n**The Howey Test (SEC Jurisdiction):**\nA digital asset is a security if it involves: (1) an investment of money, (2) in a common enterprise, (3) with an expectation of profit, (4) primarily from the efforts of others. Most tokenized RWAs with profit expectations and active management pass all four prongs — placing them under SEC jurisdiction.\n\n**CFTC Jurisdiction:**\nCommodity tokens (tokenized gold, oil, agricultural products) fall under CFTC oversight as commodity interests. Bitcoin and Ethereum have been designated as commodities by the CFTC. The jurisdiction boundary is disputed for tokens with both investment and commodity characteristics.\n\n**OCC and Banking Regulators:**\nThe Office of the Comptroller of the Currency has issued guidance allowing federally chartered banks to: (1) hold digital asset custody, (2) participate in distributed ledger networks, and (3) use stablecoins for payments. BNY's custody expansion relied on this OCC guidance.\n\n**State-level innovation:**\n- **Wyoming**: DAO LLC Act (2021), Special Purpose Depository Institution charter for crypto-native banks, and legal recognition of on-chain LLC ownership records\n- **New York**: BitLicense requirement for any entity conducting digital asset business with NY residents — one of the strictest state-level frameworks\n- **Wyoming vs. NY**: A tokenized real estate platform must navigate both if it has Wyoming-registered properties and New York-based investors",
          highlight: [
            "Howey Test",
            "SEC",
            "CFTC",
            "OCC",
            "Wyoming DAO LLC",
            "BitLicense",
          ],
        },
        {
          type: "teach",
          title: "The GENIUS Act and Stablecoin Regulation",
          content:
            "The **GENIUS Act** (Guiding and Establishing National Innovation for U.S. Stablecoins) was passed by the U.S. Senate in March 2025 and signed into law by June 2025. It established the first comprehensive federal framework for stablecoins:\n\n**Key provisions:**\n- **Permitted issuers**: Only federally insured depository institutions, insured credit unions, or GENIUS-licensed nonbank issuers may issue payment stablecoins\n- **Reserve requirements**: 1:1 backing with U.S. dollars, Treasury bills (under 93 days maturity), or federal agency securities\n- **Monthly attestations**: Issuers must publish monthly reserve attestations by registered public accountants\n- **Federal preemption**: Federal framework preempts state stablecoin laws (with exceptions for states that adopt equivalent standards)\n- **Algorithm stablecoins prohibited**: Algorithmic stablecoins (like the failed TerraUSD) are prohibited from the 'payment stablecoin' designation\n\n**Impact on RWA tokenization:**\nStablecoins are the payment rail for RWA markets — when you buy BUIDL tokens, you pay in USDC, USDT, or PYUSD. The GENIUS Act's reserve requirements effectively make stablecoins a regulated money market fund, increasing institutional confidence. USDC (Circle) and PayPal's PYUSD became fully GENIUS-compliant by Q3 2025, triggering a wave of institutional adoption.\n\n**Tether (USDT) challenge:**\nTether, despite being the largest stablecoin by market cap ($140B+ in early 2026), faces uncertainty under GENIUS because it is incorporated in the British Virgin Islands. A U.S.-licensed Tether entity was announced in late 2025 but not yet approved.",
          highlight: [
            "GENIUS Act",
            "stablecoin",
            "1:1 reserve",
            "Circle",
            "USDC",
            "PYUSD",
            "Tether",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Under the GENIUS Act's reserve requirements, which of the following could a stablecoin issuer hold as reserves?",
          options: [
            "90-day U.S. Treasury bills",
            "Corporate bond index ETFs rated AA or above",
            "Gold stored in FDIC-insured vaults",
            "Ethereum (ETH) with a 150% collateralization ratio",
          ],
          correctIndex: 0,
          explanation:
            "The GENIUS Act specifies that stablecoin reserves must consist of U.S. dollars, Treasury bills with maturity under 93 days, or federal agency securities. U.S. T-bills with 90-day maturity qualify. Corporate bond ETFs do not qualify — even highly rated ones — because they have credit risk beyond the U.S. government. Gold is not a qualifying reserve asset under the Act. Cryptocurrency collateral (ETH) does not qualify regardless of collateralization ratio; this model (used by DAI/MakerDAO) is an algorithmic/crypto-backed mechanism prohibited for the 'payment stablecoin' designation.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The CLARITY Act: Drawing the SEC/CFTC Line",
          content:
            "The **Digital Asset Market Clarity Act** (commonly called the CLARITY Act) was being debated in Congress through early 2026. It attempts to resolve the most contentious question in U.S. digital asset regulation: which assets are securities (SEC) vs. commodities (CFTC)?\n\n**Core classification framework (proposed):**\n\n**SEC territory (Digital Securities):**\n- Tokens where the issuer retains managerial control and investors expect profit from issuer efforts\n- Equity-like tokens where holders have claims on business profits\n- Debt-like tokens with fixed returns from a centralized operation\n- Most tokenized stocks, bonds, and real estate tokens\n\n**CFTC territory (Digital Commodities):**\n- Tokens that are sufficiently decentralized (no controlling person or group)\n- Fungible tokens primarily used for consumption within a blockchain ecosystem\n- Bitcoin, Ethereum (post-Merge is disputed, but CLARITY would confirm CFTC)\n- Tokenized physical commodities (gold, oil) with CFTC oversight\n\n**The 'sufficiently decentralized' test:**\nCLARITY proposes a specific test: a digital asset is 'sufficiently decentralized' if no single person or affiliated group controls more than 20% of the token supply and the network has operated for at least 12 months without a single controlling party. This creates a path for tokens to 'graduate' from SEC securities to CFTC commodities as networks mature.\n\n**RWA implication:**\nFor RWA tokenizers, clarity is enormously valuable. Under current ambiguity, a tokenized Treasury fund must assume SEC regulation, incurring compliance costs that price out smaller issuers. CLARITY would confirm the regulatory track, enabling more efficient market structures.",
          highlight: [
            "CLARITY Act",
            "digital security",
            "digital commodity",
            "sufficiently decentralized",
            "SEC",
            "CFTC",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Under the proposed CLARITY Act, Bitcoin would be reclassified as a security under SEC jurisdiction because it was created by a known individual (Satoshi Nakamoto) and early holders expected profits.",
          correct: false,
          explanation:
            "The CLARITY Act specifically addresses this: Bitcoin would be classified as a digital commodity under CFTC jurisdiction. The 'sufficiently decentralized' test considers current state of network control, not founding history. Bitcoin has no identifiable controlling person or group with more than 20% of supply (Satoshi's approximately 1M BTC represents about 4.7% of the 21M supply cap). The network has operated for 15+ years without a controlling party. Courts have also consistently declined to apply the Howey Test to Bitcoin because there is no 'common enterprise' managed by an issuer from whom profits derive. The CFTC explicitly claimed Bitcoin as a commodity in regulatory filings in 2015, and CLARITY codifies this.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A fintech company wants to launch a tokenized fund that holds a portfolio of investment-grade corporate bonds. They plan to issue ERC-1400 tokens representing pro-rata interests in the fund, distribute quarterly coupon income automatically via smart contract, and list on a secondary trading platform. Minimum investment is $1,000.",
          question:
            "What is the most likely regulatory pathway for this product in the United States?",
          options: [
            "Register as an investment company (Investment Company Act) or qualify under an exemption, with tokens treated as securities requiring full SEC disclosure and transfer restrictions to accredited investors",
            "Register only with the CFTC as a commodity pool because corporate bonds are commodities",
            "No registration required because the fund only holds existing securities",
            "Operate under the GENIUS Act as a stablecoin issuer because tokens maintain stable value",
          ],
          correctIndex: 0,
          explanation:
            "A fund holding corporate bonds and issuing interests to investors is an investment company under the Investment Company Act of 1940. The ERC-1400 tokens representing fund interests are clearly securities (they pass the Howey Test: investment of money, common enterprise, profit expectation from manager's security selection). The fund must either register as an investment company (full SEC oversight, ongoing reporting) or qualify for an exemption — most likely Section 3(c)(1) (100 investors maximum, no public solicitation) or Section 3(c)(7) (qualified purchasers only, minimum $5M investable assets). The $1,000 minimum and secondary trading listing suggest the company wants public accessibility, which would require full SEC registration — a significant compliance burden. Most tokenized bond funds currently operate under 3(c)(7) for institutional-only access.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Portfolio Construction with Digital Assets
       ================================================================ */
    {
      id: "rwa-5",
      title: "Portfolio Construction with Digital Assets",
      description:
        "Correlation benefits, liquidity premium, and practical allocation frameworks for tokenized RWAs",
      icon: "PieChart",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "Correlation Benefits of Tokenized Alternatives",
          content:
            "One of the most powerful arguments for adding tokenized RWAs to a traditional portfolio is the potential correlation diversification benefit. However, investors must look carefully at actual vs. theoretical correlations.\n\n**Tokenized Treasuries: Near-zero correlation with equities**\nTokenized T-bills (BUIDL, FOBXX) replicate money market instruments. Their correlation with the S&P 500 over rolling 12-month periods is approximately -0.05 to +0.10 — essentially uncorrelated. Adding 10-20% Treasury token allocation provides the same diversification as cash or traditional money market funds, but with 24/7 liquidity and on-chain composability.\n\n**Tokenized Real Estate: Moderate correlation**\nHistorically, direct real estate has a correlation of approximately 0.15-0.25 with equities over long periods. However, tokenized real estate — because it trades daily like a security — may exhibit higher short-term correlation during market stress (the 2022 crypto market crash showed tokenized real estate falling with the broader market, not independently). Longer holding periods reduce this effect.\n\n**Tokenized Gold: Crisis alpha**\nGold (and by extension, PAXG/XAUT) has historically shown negative correlation to equities during crisis periods: -0.60 to -0.70 during the 2008 financial crisis and 2020 COVID crash. However, in normal markets, gold is nearly uncorrelated. The crisis alpha property makes tokenized gold a legitimate tail-risk hedge.\n\n**Key insight — the 'crypto contagion' risk:**\nTokenized assets that trade on public blockchains can suffer from crypto market correlation during systemic DeFi crises (e.g., Terra/Luna collapse May 2022, FTX collapse November 2022). Even fundamentally sound tokenized Treasuries saw temporary price dislocations as crypto participants sold everything to meet margin calls. This latent correlation must be modeled in any multi-asset framework.",
          highlight: [
            "correlation",
            "diversification",
            "crisis alpha",
            "tokenized gold",
            "crypto contagion",
            "tail-risk hedge",
          ],
        },
        {
          type: "teach",
          title: "The Liquidity Premium and Its Implications",
          content:
            "Illiquid assets historically earn a **liquidity premium** — an additional return above comparable liquid assets as compensation for the risk of not being able to sell quickly. Tokenization partially erodes this premium, with important implications for portfolio construction.\n\n**Traditional illiquidity premiums:**\n- Private equity vs. public equity: ~3-5% per year excess return\n- Private real estate vs. listed REITs: ~1-2% per year\n- Private credit vs. investment grade bonds: ~2-4% per year\n\n**What tokenization does to the premium:**\nBy creating secondary markets for previously illiquid assets, tokenization reduces the illiquidity premium — which is simultaneously good news (lower return requirements for borrowers/issuers) and bad news (investors no longer earn the premium). A tokenized commercial real estate fund trading daily should, in theory, offer lower returns than an equivalent closed-end private fund because it is more liquid.\n\n**Practical portfolio construction takeaway:**\n- If you can buy tokenized private credit with near-daily liquidity, you should not expect the full illiquidity premium of a traditional locked 5-year private credit vehicle\n- Partially illiquid tokenized assets (e.g., real estate with 5-10% daily liquidity pools) may offer partial premium — representing attractive risk-adjusted opportunities\n- Compare tokenized vs. non-tokenized yields for the same underlying to estimate remaining premium\n\n**The optimal allocation framework (example):**\n| Asset | Traditional Portfolio | With Tokenized RWA |\n|---|---|---|\n| U.S. Equities | 55% | 45% |\n| Int'l Equities | 15% | 10% |\n| IG Bonds | 20% | 15% |\n| Tokenized T-Bills | — | 10% |\n| Tokenized Gold | — | 5% |\n| Tokenized Private Credit | — | 10% |\n| Cash | 10% | 5% |",
          highlight: [
            "liquidity premium",
            "private equity",
            "private credit",
            "illiquidity premium",
            "allocation framework",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A pension fund currently holds 20% in illiquid private real estate funds (5-year lock-up, expected return 9%). It is considering replacing half this allocation with tokenized real estate tokens offering near-daily liquidity. If the tokenized version fairly prices in the liquidity improvement, what would you expect the tokenized yield to be?",
          options: [
            "Approximately 7-8% — the 1-2% liquidity premium for private real estate vs. listed REITs should be partially eroded by improved tokenized liquidity",
            "Still 9% — tokenization does not affect fundamental asset returns",
            "11-12% — tokenized assets command a technology premium",
            "5% — maximum ERISA-allowable return for alternative investments",
          ],
          correctIndex: 0,
          explanation:
            "Private real estate funds earn approximately 1-2% above listed REITs as a liquidity premium. If tokenization provides near-daily (though not instantaneous, perfect) liquidity, the premium should partially erode. The remaining premium depends on: quality of the secondary market, bid-ask spreads in tokenized trading, and whether smart contract/platform risk demands its own premium. The equilibrium yield would likely be 7-8% — capturing some premium for residual illiquidity and operational complexity, but not the full 9% private fund premium. Pension funds must also verify whether tokenized real estate qualifies as an 'alternative investment' under their investment policy statements.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Practical Due Diligence for Tokenized Asset Investments",
          content:
            "Before allocating to any tokenized RWA product, investors should conduct rigorous due diligence across multiple dimensions:\n\n**Legal due diligence:**\n- What legal entity holds the underlying asset? (LLC, trust, SPV, fund)\n- Is the token legal evidence of ownership in the relevant jurisdiction?\n- What happens to token holders in the issuer's bankruptcy? (Are assets segregated?)\n- Are transfer restrictions enforced on-chain or off-chain (or both)?\n\n**Technical due diligence:**\n- Has the smart contract been audited by reputable firms? (Trail of Bits, Consensys, Certik)\n- Is the contract upgradeable? If so, who controls upgrades?\n- What oracles are used for pricing? Are they manipulable?\n- Which blockchain? (Ethereum is most battle-tested for financial applications)\n\n**Operational due diligence:**\n- Who is the custodian of the underlying asset? (Recognized institutional custodian?)\n- What are the redemption mechanics? (Can you redeem for the underlying asset?)\n- How frequently is NAV calculated and published?\n- What is the track record of the platform and management team?\n\n**Market structure due diligence:**\n- What is the secondary market liquidity? (OI, daily volume, bid-ask spread)\n- Who are the primary market makers?\n- Are there lock-up periods or redemption gates?\n\n**Regulatory due diligence:**\n- Is the product registered with the SEC, CFTC, or another regulator?\n- Does it qualify for an investment company exemption?\n- Are there jurisdiction-specific restrictions for your investor type?\n\nThe 2022-2023 DeFi collapses taught expensive lessons: products with strong fundamentals but weak legal structures, unaudited contracts, or obscure custody arrangements imposed catastrophic losses on investors who skipped technical due diligence.",
          highlight: [
            "due diligence",
            "smart contract audit",
            "oracle",
            "custody",
            "redemption mechanics",
            "Trail of Bits",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are evaluating two tokenized Treasury products: (A) BlackRock BUIDL — ERC-20 token on Ethereum, backed 1:1 by U.S. T-bills, custodied by BNY Mellon, audited by Deloitte, restricted to SEC-qualified purchasers, $2B+ AUM, 4.85% APY. (B) YieldChain USTY — ERC-20 on a newer chain, claims 1:1 T-bill backing, custody 'managed by the protocol,' smart contract unaudited, $4M AUM, 5.40% APY.",
          question:
            "Which product is more suitable for a risk-conscious institutional investor, and why?",
          options: [
            "BUIDL — the 55 basis point yield difference does not compensate for USTY's unaudited contract, unverified custody, thin liquidity, and absence of credible audit or regulated custodian",
            "USTY — the higher yield clearly indicates superior risk-adjusted return",
            "Both are equivalent because they hold the same underlying U.S. Treasuries",
            "USTY — newer blockchains always offer better security and lower risk",
          ],
          correctIndex: 0,
          explanation:
            "BUIDL is clearly superior for a risk-conscious institutional investor. The extra 55 basis points from USTY (5.40% vs 4.85%) must be weighed against: (1) unaudited smart contract — unknown code bugs could result in total loss; (2) custody 'managed by the protocol' — no regulated custodian, no segregated reserves, no SIPA/ERISA protections; (3) $4M AUM vs. $2B — extreme liquidity risk if you need to exit; (4) newer blockchain — less battle-tested, lower validator security. In fixed income, 55 bps of yield pickup would normally compensate for roughly one-notch credit rating reduction (AA- to A+). The risks in USTY are not credit risks — they are operational and technological risks that can go to zero. This illustrates why yield alone is never a sufficient evaluation metric for tokenized products.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A globally diversified portfolio that adds 10% tokenized U.S. Treasury bills (currently yielding 4.8%) will always reduce overall portfolio volatility, regardless of market conditions.",
          correct: false,
          explanation:
            "Tokenized T-bills should reduce equity volatility in normal market conditions, but 'always' is too strong a claim. During acute crypto market crises (Terra/Luna May 2022, FTX November 2022), even tokenized Treasuries on public blockchains experienced temporary price dislocations as blockchain-native participants sold assets across the board. Additionally, the on-chain mechanics of T-bill tokens — smart contract risk, oracle failure, or bridge exploits — represent a new volatility source uncorrelated with traditional markets. In a scenario where a major DeFi hack drains on-chain liquidity, tokenized Treasury tokens could temporarily trade at significant discounts to NAV, introducing volatility that would not exist in a traditional money market fund. Portfolio volatility reduction is likely but not guaranteed.",
          difficulty: 2,
        },
      ],
    },
  ],
};
