import type { Unit } from "./types";

export const UNIT_CRYPTO_REGULATION: Unit = {
  id: "crypto-regulation",
  title: "Crypto Regulation & Legal Frameworks",
  description:
    "Navigate the evolving legal landscape of cryptocurrency — SEC/CFTC jurisdiction, AML/KYC compliance, stablecoin rules, DeFi legality, and tax treatment",
  icon: "⚖️",
  color: "#6366f1",
  lessons: [
    // ─── Lesson 1: Regulatory Landscape ─────────────────────────────────────────
    {
      id: "crypto-regulation-1",
      title: "⚖️ The Global Regulatory Landscape",
      description:
        "SEC vs CFTC jurisdiction debate, the Howey test for securities, MiCA in Europe, FATF travel rule, and jurisdictional arbitrage",
      icon: "Scale",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏛️ Who Regulates Crypto? The US Turf War",
          content:
            "The United States has no single crypto regulator — instead, two agencies compete for jurisdiction:\n\n**SEC (Securities and Exchange Commission):**\n- Claims authority over crypto assets that qualify as **securities**\n- Led aggressive enforcement under Chair Gensler (2021–2024), filing suits against Coinbase, Binance, and dozens of tokens\n- View: most tokens beyond Bitcoin and Ether are unregistered securities\n\n**CFTC (Commodity Futures Trading Commission):**\n- Classifies Bitcoin and Ether as **commodities** (like gold or oil)\n- Has oversight of crypto derivatives markets (futures, swaps)\n- Generally viewed as more pro-innovation than the SEC\n\n**Other agencies with a stake:**\n- **FinCEN** (Treasury): anti-money laundering (AML) and Bank Secrecy Act compliance\n- **OCC**: national bank charters, crypto custody rules for banks\n- **IRS**: tax treatment of crypto as property\n- **OFAC**: sanctions enforcement (blocked Tornado Cash in 2022)\n\n**The core problem:** Crypto assets often do not fit neatly into 1930s-era securities laws written for stocks and bonds. Congress has repeatedly failed to pass comprehensive crypto legislation, leaving the regulatory void filled by agency rulemaking and enforcement actions.",
          highlight: ["SEC", "CFTC", "securities", "commodities", "FinCEN", "OFAC"],
        },
        {
          type: "teach",
          title: "🧪 The Howey Test: Is Your Token a Security?",
          content:
            "The **Howey test** (SEC v. W.J. Howey Co., 1946) is the legal standard used to determine if an asset is a security. An investment contract exists when there is:\n1. An **investment of money**\n2. In a **common enterprise**\n3. With an **expectation of profits**\n4. **Derived primarily from the efforts of others**\n\n**Applied to crypto:**\n- **Bitcoin**: Likely NOT a security — no central issuer, no ongoing management team driving value, mining is decentralized\n- **Ether**: The SEC has stated (in 2024) it does not intend to pursue Ether as a security — the Ethereum Foundation's role has diminished since the Merge\n- **Most ICO tokens (2017–2018)**: Securities — sold by a company promising profits from the team's development work\n- **XRP (Ripple)**: Court found XRP sold to institutions was a security; programmatic sales to retail were not (2023 ruling)\n\n**Safe harbor proposals:**\nFormer SEC Commissioner Hester Peirce proposed a 3-year safe harbor allowing crypto networks to achieve \"sufficient decentralization\" before securities laws apply — never adopted but widely discussed.\n\n**Practical implication:** If the SEC deems your token a security and it was sold without registration, the issuer faces significant legal and financial liability.",
          highlight: ["Howey test", "security", "investment contract", "decentralization", "XRP", "Ripple"],
        },
        {
          type: "teach",
          title: "🇪🇺 MiCA: Europe's Unified Crypto Framework",
          content:
            "The **Markets in Crypto-Assets (MiCA) regulation** entered full force in the EU in December 2024 — the world's most comprehensive crypto framework from a major jurisdiction.\n\n**Key provisions:**\n- **Issuance rules**: Token issuers must publish a whitepaper with standardized disclosures (similar to a securities prospectus)\n- **CASP licensing**: Crypto Asset Service Providers (exchanges, custodians, advisors) must register with national competent authorities\n- **Stablecoin rules**: Asset-referenced tokens (ARTs) and e-money tokens (EMTs) face strict reserve and redemption requirements; large stablecoins face transaction caps (200M EUR/day)\n- **Market abuse**: Insider trading and market manipulation prohibitions apply to crypto\n- **Consumer protections**: Mandatory disclosures, conflicts of interest rules\n\n**FATF Travel Rule:**\nThe Financial Action Task Force (FATF) — the global AML standard-setter — requires that **Virtual Asset Service Providers (VASPs)** collect and transmit originator/beneficiary information for transfers above $1,000. Implemented differently across jurisdictions but now mandated in EU, UK, Singapore, and others.\n\n**Jurisdictional arbitrage:**\nCompanies have historically moved to crypto-friendly jurisdictions:\n- **UAE (Dubai VARA)**: Crypto hub with clear licensing\n- **Singapore (MAS)**: Tech-forward but increasingly strict post-FTX\n- **Cayman Islands / BVI**: Popular for token issuance structures\nMiCA reduces EU arbitrage by applying rules based on where customers are located, not just where the company is incorporated.",
          highlight: ["MiCA", "CASP", "FATF", "Travel Rule", "VASP", "jurisdictional arbitrage"],
        },
        {
          type: "quiz-mc",
          question:
            "Under the Howey test, which factor is NOT required for an asset to be classified as an investment contract (security)?",
          options: [
            "A physical commodity backing the investment",
            "An investment of money in a common enterprise",
            "Expectation of profits from the efforts of others",
            "A common enterprise pooling investor funds",
          ],
          correctIndex: 0,
          explanation:
            "The Howey test has four elements: (1) investment of money, (2) in a common enterprise, (3) with an expectation of profits, (4) derived from the efforts of others. Physical commodity backing is not required — in fact, securities are typically non-physical financial instruments. An asset-backed commodity like gold is typically regulated as a commodity, not a security.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The EU's MiCA regulation only applies to crypto companies physically headquartered within EU member states.",
          correct: false,
          explanation:
            "False. MiCA applies based on where customers are located, not just where the company is incorporated. A company headquartered in the Cayman Islands that actively markets to EU retail customers must comply with MiCA's CASP licensing requirements. This extraterritorial scope is specifically designed to prevent regulatory arbitrage.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: US Crypto Regulation ─────────────────────────────────────────
    {
      id: "crypto-regulation-2",
      title: "🇺🇸 US Crypto Regulation Deep Dive",
      description:
        "SEC enforcement actions, the Ripple XRP case, exchange registration, custody rules, and Bitcoin/Ethereum ETF approval history",
      icon: "Flag",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⚔️ Major SEC Enforcement Actions",
          content:
            "The SEC's enforcement-first approach shaped the US crypto landscape from 2018–2024:\n\n**Ripple Labs (SEC v. Ripple, filed 2020):**\n- SEC alleged XRP was an unregistered security, seeking $1.3B in penalties\n- 2023 partial ruling: programmatic sales to retail investors on exchanges were NOT securities; institutional sales to sophisticated buyers WERE securities\n- Landmark case — first court to find on-exchange retail crypto sales may not be securities\n- Settlement reached in 2024\n\n**Coinbase (SEC Wells Notice, 2023):**\n- SEC alleged Coinbase operated an unregistered exchange and broker-dealer\n- Coinbase chose to fight, arguing the SEC lacked clear authority under existing law\n- Case highlighted the absence of congressional action to clarify crypto rules\n\n**Binance (DOJ + SEC, 2023):**\n- Criminal charges for operating without proper US registration, money laundering\n- CEO Changpeng Zhao (CZ) pleaded guilty to BSA violations, $4.3B settlement\n- Separate SEC civil suit for wash trading, commingling customer funds\n\n**FTX (DOJ, 2022):**\n- Not primarily an SEC case but had regulatory implications\n- CEO Sam Bankman-Fried convicted of fraud, sentenced to 25 years\n- Accelerated calls for crypto exchange regulation requiring segregation of customer funds\n\n**Pattern:** Enforcement targeted exchanges operating without registration, token sales that looked like securities, and outright fraud — not the technology itself.",
          highlight: ["Ripple", "XRP", "Coinbase", "Binance", "FTX", "SEC enforcement", "Wells Notice"],
        },
        {
          type: "teach",
          title: "🏦 Exchange Registration & Custody Rules",
          content:
            "**Exchange registration requirements:**\nTraditional exchanges (NYSE, Nasdaq) register as both a **national securities exchange** and a **broker-dealer** under the Securities Exchange Act of 1934. For crypto:\n- No \"crypto exchange\" registration category exists under current US law\n- Exchanges trading securities tokens would need exchange + broker-dealer registration\n- Most major exchanges (Coinbase, Kraken) are registered as **Money Services Businesses (MSBs)** with FinCEN — a lower-standard AML registration\n- Several states require additional **BitLicense** (NY) or money transmitter licenses\n\n**Custody rules:**\n- The SEC's **Safeguarding Rule** (proposed 2023) would require registered investment advisers to use **qualified custodians** for all client crypto assets\n- Qualified custodians = banks, broker-dealers with strict segregation requirements\n- This would exclude most standalone crypto custodians\n- **SAB 121** (SEC Staff Accounting Bulletin, 2022): Required banks to record crypto held in custody as a balance sheet liability — effectively discouraging banks from offering crypto custody. Congress passed a resolution to overturn it in 2024; Biden vetoed; it was eventually reversed under SEC leadership changes.\n\n**Institutional grade custody:**\n- Coinbase Custody, Fidelity Digital Assets, BitGo operate as regulated custodians in various states\n- Hardware security modules (HSMs) + multi-party computation (MPC) for key security\n- Cold storage requirements (typically 90–95% of assets offline)",
          highlight: ["MSB", "qualified custodian", "BitLicense", "SAB 121", "custody", "segregation"],
        },
        {
          type: "teach",
          title: "📈 Bitcoin & Ethereum ETF Approval History",
          content:
            "The approval of spot cryptocurrency ETFs was a decade-long battle:\n\n**Bitcoin ETF Timeline:**\n- **2013**: Winklevoss twins file first Bitcoin ETF application — rejected\n- **2017–2021**: Multiple applications (VanEck, Bitwise, WisdomTree) rejected on grounds of market manipulation risk and insufficient surveillance agreements\n- **2021**: ProShares Bitcoin Strategy ETF (BITO) approved — first Bitcoin **futures** ETF. Futures ETFs have contango drag and don't hold spot Bitcoin\n- **January 2024**: SEC approves 11 spot Bitcoin ETFs simultaneously (BlackRock IBIT, Fidelity FBTC, Invesco, Bitwise, ARK, and others). Court forced the issue after Grayscale won its case (GBTC v. SEC, 2023 — court ruled SEC was \"arbitrary and capricious\" rejecting spot while approving futures)\n- IBIT became one of the fastest ETFs ever to reach $10B in AUM\n\n**Ethereum ETF Timeline:**\n- **May 2024**: SEC approves spot Ethereum ETFs (BlackRock ETHA, Fidelity FETH, etc.) — faster approval after Bitcoin ETF precedent\n- Initial approval did NOT include staking yield, reducing appeal vs. holding ETH directly\n\n**Investment implications:**\n- Spot ETFs hold actual Bitcoin/Ether in qualified custody\n- Enable 401(k)/IRA/institutional access without self-custody risk\n- Management fees: 0.12%–0.25% (competitive, lower than gold ETFs)\n- No more contango drag or futures roll costs",
          highlight: ["spot ETF", "Bitcoin ETF", "Ethereum ETF", "BITO", "Grayscale", "IBIT", "FBTC"],
        },
        {
          type: "quiz-mc",
          question:
            "In the 2023 SEC v. Ripple ruling, what distinction did the court make regarding XRP sales?",
          options: [
            "Institutional sales were securities; programmatic retail exchange sales were not",
            "All XRP sales were found to be securities violations",
            "All XRP sales were found to not be securities because XRP is a commodity",
            "The court ruled XRP is only a security when sold in the United States",
          ],
          correctIndex: 0,
          explanation:
            "The court drew a critical distinction: XRP sold directly to institutions via contracts (with an expectation of profit from Ripple's efforts) were investment contracts (securities). However, programmatic sales on public exchanges to retail buyers — where the buyer may not have known they were buying from Ripple specifically — did not meet the Howey test criteria. This was the first major court ruling to find that on-exchange crypto sales may not constitute securities offerings.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The SEC approved futures-based Bitcoin ETFs before it approved spot Bitcoin ETFs.",
          correct: true,
          explanation:
            "True. The ProShares Bitcoin Strategy ETF (BITO) — a futures-based ETF — was approved in October 2021. Spot Bitcoin ETFs were not approved until January 2024, after the Grayscale court victory. The SEC's position was that futures markets (regulated by the CFTC under CME oversight) provided stronger manipulation protections than spot markets, even though most practitioners argued the opposite.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: AML/KYC Requirements ─────────────────────────────────────────
    {
      id: "crypto-regulation-3",
      title: "🔍 AML/KYC & Chain Analytics",
      description:
        "Crypto exchange compliance, chain analytics tools, suspicious activity reporting, and travel rule implementation",
      icon: "Search",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📋 KYC/AML at Crypto Exchanges",
          content:
            "Crypto exchanges operating as **Money Services Businesses (MSBs)** under FinCEN must comply with the Bank Secrecy Act (BSA):\n\n**Know Your Customer (KYC):**\n- Collect government ID, proof of address, date of birth\n- Screen against OFAC sanctions lists (SDN list)\n- Politically Exposed Persons (PEP) screening\n- Enhanced Due Diligence (EDD) for high-risk customers, large transactions\n\n**KYC tiers at exchanges:**\n| Tier | Verification | Limits |\n|------|-------------|--------|\n| 0 | Email only | View only |\n| 1 | Name + email | $2,000/day |\n| 2 | Government ID | $50,000/day |\n| 3 | ID + proof of address + source of funds | Unlimited |\n\n**Anti-Money Laundering (AML) program requirements:**\n- Written AML compliance program\n- Designated BSA compliance officer\n- Ongoing employee training\n- Independent testing/audit\n- Transaction monitoring system\n\n**Currency Transaction Reports (CTRs):** File with FinCEN for cash transactions >$10,000\n**Suspicious Activity Reports (SARs):** File within 30 days of detecting suspicious activity regardless of dollar amount\n\n**Why it matters for traders:** Heavy KYC reduces privacy but enables exchange banking relationships, institutional participation, and regulatory legitimacy. Exchanges without KYC face de-banking and enforcement.",
          highlight: ["KYC", "AML", "BSA", "FinCEN", "SAR", "CTR", "OFAC", "MSB"],
        },
        {
          type: "teach",
          title: "🔗 Blockchain Analytics: Chainalysis & Elliptic",
          content:
            "Unlike cash, cryptocurrency transactions are permanently recorded on a public blockchain — making them **traceable** by anyone with the right tools.\n\n**Chain analytics firms:**\n- **Chainalysis**: Market leader; contracts with DOJ, IRS, Interpol, 70+ countries; provides Reactor (investigation tool) and KYT (Know Your Transaction, real-time risk scoring)\n- **Elliptic**: UK-based; similar capabilities, OFAC screening\n- **TRM Labs**: Newer entrant, strong in DeFi forensics\n- **CipherTrace**: Acquired by Mastercard\n\n**How clustering works:**\nAnalysts use **heuristics** to link wallet addresses to real-world entities:\n- **Common input ownership**: Inputs spent in the same transaction likely belong to the same wallet\n- **Change address detection**: Identifies which output is change vs. payment\n- **Exchange deposit patterns**: Funds flowing to known exchange deposit addresses\n- **Dust attacks**: Sending tiny amounts to many wallets to then trace where they consolidate\n\n**Risk scoring:**\nTransactions receive risk scores based on exposure to:\n- Darknet markets, ransomware wallets, mixing services\n- Sanctioned entities (OFAC designations)\n- High-risk exchanges in non-KYC jurisdictions\n\n**Limitations:** Privacy coins (Monero, Zcash shielded) and well-used mixing substantially reduce traceability. Hardware wallets used carefully leave minimal on-chain footprint.",
          highlight: ["Chainalysis", "Elliptic", "blockchain analytics", "clustering", "risk scoring", "KYT"],
        },
        {
          type: "teach",
          title: "✈️ The Travel Rule for Crypto",
          content:
            "The **Travel Rule** (FATF Recommendation 16) requires financial institutions to \"travel\" originator and beneficiary information alongside wire transfers. In 2019, FATF extended this to Virtual Asset Service Providers (VASPs).\n\n**What information must travel:**\n- Originator: name, account number/wallet address, address/ID number\n- Beneficiary: name, wallet address\n- Threshold: typically $1,000 USD equivalent\n\n**Implementation challenges — the \"VASP Discovery Problem\":**\n- Traditional wire transfers use SWIFT — a centralized messaging network\n- Crypto has no equivalent — how does Exchange A know Exchange B's technical endpoint?\n- **IVMS 101**: Standard data format for Travel Rule messages\n- **Solutions**: Notabene, Sygna Bridge, TRP (Travel Rule Protocol), VerifyVASP — competing protocols, not yet standardized globally\n\n**Current status by jurisdiction:**\n- **EU**: Fully implemented under MiCA/Transfer of Funds Regulation\n- **US**: Final rule expected but not yet in force for crypto (FinCEN proposed 2020)\n- **Singapore/Switzerland/UK**: Implemented\n- **Challenge**: Transfers to unhosted wallets (self-custody) — do you need beneficiary info for someone's own hardware wallet?\n\n**Unhosted wallet rules:** US proposed requiring name/address collection for any transfer to an unhosted wallet above $3,000. Crypto community pushed back strongly; final rules remain unsettled.",
          highlight: ["Travel Rule", "FATF", "VASP", "IVMS 101", "unhosted wallet", "originator", "beneficiary"],
        },
        {
          type: "quiz-mc",
          question:
            "What is a Suspicious Activity Report (SAR) in the context of crypto exchange compliance?",
          options: [
            "A report filed with FinCEN when exchanges detect potentially illegal financial activity, regardless of transaction size",
            "A report required only for transactions above $10,000 involving known criminals",
            "An annual audit report that exchanges file with the SEC documenting all unusual trades",
            "A report filed with the IRS when customers fail to complete KYC verification",
          ],
          correctIndex: 0,
          explanation:
            "SARs (Suspicious Activity Reports) are filed with FinCEN (not the SEC or IRS) when a financial institution — including crypto exchanges — detects activity that may indicate money laundering, fraud, terrorist financing, or other crimes. Critically, there is no minimum dollar threshold for SARs; they are filed based on suspicious patterns, not just transaction size. Currency Transaction Reports (CTRs) are the $10,000-threshold reports.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Blockchain transactions on public chains like Bitcoin are fully anonymous because wallet addresses do not display the owner's real name.",
          correct: false,
          explanation:
            "False. Public blockchains are pseudonymous, not anonymous. Every transaction is permanently recorded and publicly visible. Chain analytics firms like Chainalysis use clustering heuristics, exchange data from KYC'd platforms, and other techniques to link wallet addresses to real-world identities. Law enforcement has successfully traced and prosecuted numerous crypto-related crimes using blockchain forensics, including the 2016 Bitfinex hackers who were arrested in 2022.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 4: Stablecoin Regulation ────────────────────────────────────────
    {
      id: "crypto-regulation-4",
      title: "💵 Stablecoin Regulation",
      description:
        "Algorithmic vs collateralized stablecoins, reserve requirements, payment stablecoin frameworks, and CBDC competition",
      icon: "DollarSign",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏗️ Types of Stablecoins & Failure Modes",
          content:
            "Stablecoins aim to maintain a stable value (usually $1) but use very different mechanisms:\n\n**1. Fiat-collateralized (centralized):**\nExamples: USDC (Circle), USDT (Tether), BUSD (defunct)\n- Each token backed 1:1 by fiat dollars in bank accounts + short-term Treasuries\n- Issuer holds reserves; users trust issuer's attestation\n- Risk: bank failure (USDC briefly de-pegged to $0.87 during Silicon Valley Bank collapse, March 2023)\n- Tether controversy: alleged insufficient reserves, $41M CFTC settlement (2021)\n\n**2. Crypto-collateralized (decentralized):**\nExample: DAI (MakerDAO) → now USDS\n- Over-collateralized: $150+ of ETH locked to mint $100 DAI\n- Maintains peg through algorithmic liquidations\n- Risk: collateral value crashes faster than liquidations can execute (\"black swan\" liquidation cascade)\n\n**3. Algorithmic (uncollateralized):**\nExample: TerraUSD (UST) / LUNA — **FAILED May 2022**\n- No real reserves — peg maintained through algorithmic mint/burn between UST and LUNA\n- Anchor Protocol offered 20% APY on UST deposits (unsustainable)\n- Bank run: $40B+ market cap evaporated in 5 days; wiped out ~$60B total ecosystem value\n- Systemic contagion: Three Arrows Capital, Celsius, Voyager all went bankrupt\n- Lesson: Algorithmic stablecoins without real collateral are reflexively unstable under stress\n\n**4. Commodity-backed:**\nExample: PAXG (gold), Tether Gold\n- Each token backed by physical gold in vault\n- Lower volatility than pure crypto collateral",
          highlight: ["USDC", "USDT", "DAI", "TerraUSD", "UST", "algorithmic stablecoin", "collateralized", "de-peg"],
        },
        {
          type: "teach",
          title: "📜 Payment Stablecoin Legislation",
          content:
            "The collapse of TerraUSD accelerated legislative efforts to regulate stablecoins:\n\n**US Stablecoin Bills:**\n- **GENIUS Act (2025)**: Senate bill establishing federal framework for \"payment stablecoins\"\n  - Issuers must be federally or state-chartered with Federal Reserve oversight\n  - 1:1 reserve requirement (cash + short-term Treasuries only)\n  - Monthly attestations; annual audits above $50B\n  - Prohibits algorithmic stablecoins that lack full reserves\n  - Non-bank issuers capped at $10B market cap before requiring bank charter\n- **STABLE Act (House version)**: Similar framework, slightly different bank charter requirements\n\n**EU MiCA stablecoin rules (in force 2024):**\n- **E-money tokens (EMTs)**: Pegged to single fiat currency → licensed as e-money institution\n- **Asset-referenced tokens (ARTs)**: Backed by basket of assets → additional authorization required\n- Daily transaction cap: 200M EUR equivalent for large stablecoins (threatened USDT's EU operations)\n- Tether initially withdrew EUR-pegged stablecoins from EU rather than comply; USDC retained EU availability\n\n**Reserve requirements:**\n- Cash held at regulated banks or short-term government securities\n- Segregated from issuer's operating funds\n- Redemption at par within 1 business day\n- The SVB collapse showed why reserve composition matters — USDC held ~8% at SVB",
          highlight: ["GENIUS Act", "payment stablecoin", "reserve requirements", "EMT", "ART", "MiCA", "STABLE Act"],
        },
        {
          type: "teach",
          title: "🏦 CBDCs: Central Bank Digital Currencies",
          content:
            "**Central Bank Digital Currencies (CBDCs)** are digital forms of sovereign currency issued directly by central banks:\n\n**Two models:**\n- **Retail CBDC**: Individuals hold accounts directly with the central bank (disintermediation risk for commercial banks)\n- **Wholesale CBDC**: Only used for interbank settlement and financial institutions\n\n**Global status (2025):**\n- **Launched**: China (digital yuan / e-CNY) — 260M+ wallets, used for government payments; Nigeria (eNaira, struggling adoption); Bahamas (Sand Dollar)\n- **Piloting**: ECB digital euro (retail pilot ongoing), India (e-Rupee)\n- **Cancelled/paused**: UK CBDC (\"Britcoin\") design phase; US — politically contentious\n\n**US political controversy:**\n- Republicans oppose retail CBDC as government surveillance tool\n- Executive order in 2023 banned federal agencies from promoting CBDCs\n- Privacy concerns: every transaction traceable by the government\n\n**CBDC vs private stablecoins:**\n| Feature | CBDC | Private Stablecoin |\n|---------|------|-----------------|\n| Issuer | Central bank | Private company |\n| Credit risk | Sovereign (zero) | Issuer insolvency |\n| Privacy | Government visibility | Varies |\n| Programmability | Government-controlled | Smart contract |\n| Interest bearing | Potentially | Rare |\n\n**Impact on DeFi:** CBDCs issued on programmable blockchains could compete with or displace private stablecoins in some use cases.",
          highlight: ["CBDC", "digital yuan", "e-CNY", "digital euro", "retail CBDC", "wholesale CBDC", "programmable money"],
        },
        {
          type: "quiz-mc",
          question:
            "What was the primary mechanism that caused TerraUSD (UST) to collapse in May 2022?",
          options: [
            "Its algorithmic peg relied on LUNA token demand; a bank run caused reflexive selling that destroyed both assets",
            "UST's reserves held in Bitcoin were liquidated at a loss during a crypto market crash",
            "A smart contract hack drained the collateral vault backing UST",
            "The US Treasury sanctioned UST, forcing all exchanges to delist it simultaneously",
          ],
          correctIndex: 0,
          explanation:
            "UST was an algorithmic stablecoin with no real collateral. The peg was maintained by allowing $1 of LUNA to be burned to mint 1 UST (and vice versa). When a large holder began selling UST, the peg slipped, causing panic. As UST de-pegged, the algorithm minted more LUNA to maintain the peg — hyperinflating LUNA's supply and crashing its price. This death spiral fed on itself reflexively, wiping out $60B+ in days. There was no reserve vault, no hack, and no sanctions involved in the initial collapse.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under the proposed GENIUS Act framework, fully algorithmic stablecoins without real reserves would be permitted to operate as payment stablecoins in the US.",
          correct: false,
          explanation:
            "False. The GENIUS Act explicitly prohibits payment stablecoins that are endogenously collateralized (algorithmic) and lack 1:1 reserves in high-quality liquid assets. The TerraUSD collapse was a key driver of this legislation — lawmakers specifically wanted to prevent a repeat of algorithmic stablecoin failures that caused systemic contagion across crypto markets.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: DeFi & Smart Contract Legality ───────────────────────────────
    {
      id: "crypto-regulation-5",
      title: "🤖 DeFi & Smart Contract Legality",
      description:
        "DEX regulatory questions, DAO legal status, smart contract liability, and sanctions compliance including the Tornado Cash case",
      icon: "Code",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🔄 DEX Regulation: The Unanswered Questions",
          content:
            "**Decentralized exchanges (DEXs)** like Uniswap operate through autonomous smart contracts — there is no company executing trades on behalf of users. This creates profound regulatory questions:\n\n**Is a DEX an exchange?**\n- Traditional exchanges must register with the SEC under the Exchange Act\n- DEXs argue they are \"non-custodial software\" — users trade peer-to-peer via smart contracts\n- SEC Uniswap Wells Notice (April 2024): SEC signaled intent to sue Uniswap Labs as an unregistered securities exchange and broker\n- Uniswap Labs contested this, arguing the protocol (smart contracts) is separate from the frontend interface they operate\n\n**The \"sufficient decentralization\" defense:**\n- If a protocol is truly decentralized (no controlling party), can regulations apply?\n- Ethereum's Vitalik Buterin and others argue genuinely decentralized protocols cannot be regulated the same as companies\n- Courts have not yet fully resolved this\n\n**Frontend vs protocol distinction:**\n- Uniswap Labs controls the website frontend — regulators can compel it to block certain tokens or jurisdictions\n- The underlying smart contracts on Ethereum are immutable — no one can stop them from running\n- This creates a \"soft\" compliance layer where frontends self-censor while the protocol remains permissionless\n\n**CFTC action on prediction markets:**\nPolymarket (prediction market DEX) settled with CFTC in 2022 for $1.4M for operating unregistered commodity interest swaps — even as a DEX, the protocol's operators were held liable.",
          highlight: ["DEX", "Uniswap", "Wells Notice", "sufficient decentralization", "frontend", "protocol", "CFTC"],
        },
        {
          type: "teach",
          title: "🏛️ DAO Legal Status & Liability",
          content:
            "**Decentralized Autonomous Organizations (DAOs)** use token-based governance to manage protocols — but their legal status is deeply uncertain:\n\n**The liability problem:**\n- Most DAOs have no legal entity — they exist only as code and token voting\n- In the absence of legal structure, courts may treat DAO members as a **general partnership**\n- General partners have **unlimited personal liability** for the partnership's debts and legal obligations\n\n**CFTC v. bZeroX/Ooki DAO (2022):**\n- CFTC sued the Ooki DAO for operating an illegal trading platform\n- Court held that DAO token holders who voted on governance proposals are personally liable\n- DAO was ordered to pay $643K; enforcement difficult as DAO has no bank accounts\n- Created significant concern: voting on DAO governance = accepting legal liability?\n\n**Legal wrappers:**\nDAOs increasingly adopt legal structures to limit member liability:\n- **Wyoming DAO LLC**: Wyoming was first US state to legally recognize DAOs (2021)\n- **Marshall Islands DAO**: Offshore option\n- **Cayman Foundation**: Used by Compound, Uniswap Foundation\n- **Vermont BBCA**: Blockchain-based LLC structure\n\n**Governance token risks:**\nIf governance tokens convey economic rights + management control, they may be securities (Howey test). Protocol teams often avoid granting cash flow rights to tokens specifically to avoid securities classification.",
          highlight: ["DAO", "general partnership", "unlimited liability", "Ooki DAO", "Wyoming DAO LLC", "governance token", "legal wrapper"],
        },
        {
          type: "teach",
          title: "🌪️ Tornado Cash & Sanctions Compliance",
          content:
            "**Tornado Cash** is a crypto mixing protocol that obscures transaction trails by pooling deposits and withdrawals:\n\n**How it works:**\n- Users deposit ETH or ERC-20 tokens and receive a cryptographic \"note\"\n- Other users (possibly the same person from a new wallet) present the note to withdraw\n- On-chain, deposits and withdrawals cannot be linked — breaking the transaction trail\n- Primarily used for legitimate privacy, but also used by North Korean hackers (Lazarus Group) to launder stolen funds\n\n**OFAC Sanctions (August 2022):**\n- US Treasury's OFAC added Tornado Cash smart contract addresses to the SDN (Specially Designated Nationals) list\n- First time OFAC sanctioned **code** (immutable smart contracts) rather than a person or company\n- Immediately illegal for US persons to interact with Tornado Cash\n- GitHub removed the code repository; Circle (USDC) froze funds in sanctioned addresses\n- Infura and Alchemy blocked RPC access to the contracts\n\n**Legal challenge (Van Loon v. Department of Treasury, 5th Circuit 2024):**\n- Court ruled OFAC **exceeded its authority** by sanctioning immutable smart contracts — they are not \"property\" of a foreign national that can be blocked\n- Partial win for crypto privacy advocates — sanctions on the immutable contracts overturned\n- Sanctions on the **DAO** and individuals (Roman Storm, developer — arrested 2023) remained\n\n**Lesson for developers:** Writing privacy tools can create personal criminal liability even if the code itself is protected speech.",
          highlight: ["Tornado Cash", "OFAC", "SDN list", "sanctions", "mixing", "Roman Storm", "immutable smart contracts", "Van Loon"],
        },
        {
          type: "quiz-mc",
          question:
            "In the CFTC v. Ooki DAO case, what set a concerning precedent for DAO participants?",
          options: [
            "DAO token holders who voted on governance proposals could be held personally liable for the DAO's legal violations",
            "DAOs must register as commodity pools and only accredited investors can hold governance tokens",
            "All DAO smart contracts require CFTC approval before deployment on public blockchains",
            "Governance token holders must file quarterly disclosures similar to corporate directors",
          ],
          correctIndex: 0,
          explanation:
            "The Ooki DAO case held that members who voted on governance proposals — the core activity of DAO participation — could be treated as members of an unincorporated association and held personally liable. This is concerning because participating in DAO governance (seen as a civic/voting activity) could expose participants to unlimited liability as general partners. The case pushed many protocols to establish legal wrappers (Wyoming DAO LLCs, foundations) to provide liability shields for token holders.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The 5th Circuit Court's 2024 ruling in Van Loon v. Department of Treasury fully restored Tornado Cash and removed all sanctions against the protocol.",
          correct: false,
          explanation:
            "False. The 5th Circuit ruled that OFAC exceeded its authority by sanctioning immutable smart contracts specifically, because they are not \"property\" owned by a foreign national. However, the ruling did not remove all sanctions — sanctions on the Tornado Cash DAO, its associated persons, and the developer Roman Storm (who was arrested on money laundering charges in 2023) remained in effect. The ruling was a partial victory for crypto privacy advocates but did not fully rehabilitate Tornado Cash.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 6: Tax Treatment ─────────────────────────────────────────────────
    {
      id: "crypto-regulation-6",
      title: "💰 Crypto Tax Treatment",
      description:
        "Crypto as property under IRS guidance, taxable events, NFT and DeFi income taxation, the wash sale rule gap, and Form 1099-DA",
      icon: "Receipt",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📊 IRS Property Treatment & Taxable Events",
          content:
            "**IRS Notice 2014-21** established the foundational US tax treatment: **cryptocurrency is property**, not currency. This has major implications:\n\n**Taxable events:**\n1. **Selling crypto for USD** — capital gain/loss based on cost basis and holding period\n2. **Trading crypto for crypto** — e.g., swapping ETH for BTC is a taxable sale of ETH\n3. **Buying goods/services with crypto** — treated as a sale at fair market value\n4. **Receiving crypto as income** — mining rewards, staking rewards, airdrops, wages in crypto are ordinary income at FMV when received\n5. **DeFi transactions** — each swap on Uniswap is a taxable event\n\n**Non-taxable events:**\n- Buying crypto with USD (establishes cost basis, no tax yet)\n- Transferring crypto between your own wallets\n- Gifting crypto (recipient inherits basis; gift tax rules apply above annual exclusion)\n- Receiving crypto as a loan (not income if true loan structure)\n\n**Capital gains treatment:**\n- **Short-term** (held <1 year): Taxed as ordinary income (up to 37%)\n- **Long-term** (held ≥1 year): Preferential rates (0%, 15%, or 20% depending on income bracket)\n- **Net Investment Income Tax**: Additional 3.8% for high earners applies to crypto gains\n\n**Cost basis methods:**\nIRS allows FIFO (default), HIFO (highest cost first — minimizes gains), and specific identification (requires adequate records).",
          highlight: ["IRS property", "taxable event", "cost basis", "capital gains", "FIFO", "HIFO", "ordinary income"],
        },
        {
          type: "teach",
          title: "🖼️ NFT & DeFi Income Taxation",
          content:
            "**NFT Taxation:**\n- **Creating/minting an NFT**: Not a taxable event (same as creating art)\n- **Selling an NFT you created**: Ordinary income (like selling artwork you made)\n- **Selling an NFT you purchased as investment**: Capital gain/loss\n- **NFT as collectible**: IRS Notice 2023-27 examined whether some NFTs qualify as \"collectibles\" — subject to 28% maximum capital gains rate (higher than the usual 20% rate for long-term assets). Still being clarified.\n- **Royalties received**: Ordinary income when received\n\n**DeFi Income Taxation:**\n- **Staking rewards**: IRS concluded in Jarrett v. United States (2023) that staking rewards are income when received (not when sold). The Jarretts initially received a refund but IRS reversed position.\n- **Liquidity pool fees**: Income when received (if separable from principal)\n- **Yield farming/liquidity mining rewards**: Ordinary income at FMV when tokens received\n- **DEX swaps**: Every swap is a taxable event (crypto-to-crypto exchange)\n- **Airdrop tokens**: Ordinary income when received (at FMV), even if unsolicited\n- **Hard forks**: Ordinary income when you gain dominion and control over new tokens\n\n**Reporting complexity:** A DeFi power user might generate thousands of taxable events per year — swaps, liquidity additions/removals, reward claims — requiring dedicated crypto tax software (Koinly, TaxBit, CoinTracker).",
          highlight: ["NFT taxation", "staking rewards", "DeFi income", "airdrop", "collectible", "liquidity pool", "yield farming"],
        },
        {
          type: "teach",
          title: "🚿 Wash Sale Rules & Form 1099-DA",
          content:
            "**The Wash Sale Rule — Current Gap:**\nThe wash sale rule (IRC Section 1091) prevents investors from claiming a tax loss if they buy the same security within 30 days before or after selling it at a loss.\n\n**Crypto exception (for now):**\n- The wash sale rule currently applies only to **securities** under Section 1091\n- Because the IRS treats crypto as **property** (not securities), the wash sale rule does NOT currently apply to crypto\n- This allows **tax loss harvesting** without a 30-day waiting period: sell Bitcoin at a loss, immediately rebuy Bitcoin, claim the tax loss, reset cost basis\n- This is a significant planning opportunity unavailable to stock investors\n\n**Legislative risk:** The Biden administration's Build Back Better bill (2021) proposed extending wash sales to crypto — it did not pass. Similar proposals keep resurfacing. Investors using this strategy should monitor legislation closely.\n\n**Form 1099-DA (Digital Asset):**\n- The IRS finalized regulations in 2024 requiring crypto brokers (exchanges, custodians) to report transactions on a new **Form 1099-DA**\n- Implementation phased: Centralized exchanges (Coinbase, Kraken) must report starting for **2025 tax year** (forms due in early 2026)\n- DeFi protocol reporting deferred to later years (significant technical challenges)\n- Brokers must report: gross proceeds, cost basis (when available), date acquired/sold\n- Significantly increases IRS's ability to match reported crypto gains to tax returns\n- Similar to 1099-B for stock sales — taxpayers who fail to report will face matching notices",
          highlight: ["wash sale rule", "tax loss harvesting", "Form 1099-DA", "property", "Section 1091", "cost basis reporting", "1099-B"],
        },
        {
          type: "quiz-mc",
          question:
            "Under current IRS rules, which of the following crypto transactions is NOT a taxable event?",
          options: [
            "Transferring Bitcoin from your Coinbase account to your personal hardware wallet",
            "Swapping Ethereum for USDC on Uniswap",
            "Receiving Bitcoin as payment for freelance work",
            "Selling Ethereum that has appreciated in value for US dollars",
          ],
          correctIndex: 0,
          explanation:
            "Transferring crypto between wallets you own is not a taxable event — you haven't disposed of the asset or received income, you've just moved it. All the others are taxable: swapping crypto-for-crypto is treated as selling the first asset (taxable gain/loss), receiving crypto for work is ordinary income, and selling crypto for USD triggers capital gain/loss. Always keep records of transfer transactions to prove you weren't selling when questioned by the IRS.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Elena bought 1 Bitcoin for $20,000 in January 2023. In November 2023 — just 10 months later — the price fell to $16,000 and she sold, realizing a $4,000 loss. She immediately repurchased 1 Bitcoin the same day at $16,000.",
          question:
            "What are the tax implications of Elena's transaction under current IRS rules?",
          options: [
            "She can claim the $4,000 loss immediately; the wash sale rule does not currently apply to crypto",
            "The $4,000 loss is disallowed under the wash sale rule since she immediately repurchased Bitcoin",
            "She must wait 30 days before the loss is recognized, and her new basis is $20,000",
            "She owes short-term capital gains taxes because she held less than one year",
          ],
          correctIndex: 0,
          explanation:
            "Because the IRS classifies cryptocurrency as property (not a security), the wash sale rule (IRC Section 1091) currently does NOT apply to crypto. Elena can immediately claim the $4,000 short-term capital loss on her tax return, reset her cost basis to $16,000, and immediately repurchase. This is a common tax loss harvesting strategy in crypto. Note: legislative risk exists — Congress has proposed extending wash sale rules to crypto multiple times. Also note: her new basis is $16,000 (she actually purchased at that price), not $20,000.",
          difficulty: 2,
        },
      ],
    },
  ],
};
