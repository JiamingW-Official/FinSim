import type { Unit } from "./types";

export const UNIT_CRYPTO_CYCLES: Unit = {
  id: "crypto-cycles",
  title: "Crypto Market Cycles",
  description:
    "Bitcoin halving mechanics, on-chain cycle indicators, altcoin seasons, and long-run adoption thesis for digital assets",
  icon: "RefreshCw",
  color: "#8b5cf6",
  lessons: [
    /* ================================================================
       LESSON 1 — Bitcoin Halving Cycles
       ================================================================ */
    {
      id: "crypto-cycles-1",
      title: "Bitcoin Halving Cycles",
      description:
        "4-year halving schedule, supply shock mechanics, and stock-to-flow model",
      icon: "Zap",
      xpReward: 90,
      difficulty: "intermediate",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "The Halving Event",
          content:
            "Approximately every **210,000 blocks** (~4 years), the Bitcoin protocol cuts the block reward paid to miners in half. This event is called the **halving** (or halvening).\n\n**Historical halvings**:\n- 2012: 50 BTC → 25 BTC per block\n- 2016: 25 BTC → 12.5 BTC\n- 2020: 12.5 BTC → 6.25 BTC\n- 2024: 6.25 BTC → 3.125 BTC\n\nBitcoin's hard cap of **21 million BTC** is enforced by this schedule. Roughly 93%+ of all Bitcoin has already been mined; the last coin is projected to be mined around 2140.\n\n**Why it matters for price**: Halvings cut the daily issuance of new supply roughly in half overnight. If demand stays constant, basic supply/demand implies upward price pressure. Miners who previously sold coins to cover energy costs now receive fewer coins, further reducing sell-side supply.",
          highlight: ["halving", "block reward", "21 million", "supply shock"],
        },
        {
          type: "teach",
          title: "Stock-to-Flow Model",
          content:
            "The **stock-to-flow (S2F) model** measures an asset's scarcity by dividing total existing supply (stock) by annual new production (flow).\n\n**Formula**: S2F = Stock ÷ Annual Flow\n\n**Comparative S2F ratios**:\n- Gold: ~60 (world gold supply / annual mine output)\n- Bitcoin pre-2020 halving: ~25\n- Bitcoin post-2020 halving: ~56 (comparable to gold)\n- Bitcoin post-2024 halving: ~120 (2× scarcer than gold)\n\n**The thesis**: Historically, higher S2F ratios correlate with higher market valuations. Each halving roughly doubles Bitcoin's S2F ratio, placing it in increasingly scarce company.\n\n**Limitations of S2F**:\n- Model assumes demand is static — ignores demand shocks\n- Price has significantly diverged from model predictions at times\n- Does not account for exchange rates, regulation, or macro conditions\n- Past halvings are limited data points (only 4 events total)\n\nUse S2F as one lens among many, not as a price target.",
          highlight: ["stock-to-flow", "scarcity", "S2F ratio", "model"],
        },
        {
          type: "teach",
          title: "Post-Halving Performance Patterns",
          content:
            "Historically, Bitcoin's largest bull runs have followed halvings by 12–18 months:\n\n**2012 Halving cycle**: BTC rose from ~$12 to ~$1,100 (~91× peak gain)\n**2016 Halving cycle**: BTC rose from ~$650 to ~$20,000 (~31× peak gain)\n**2020 Halving cycle**: BTC rose from ~$8,700 to ~$69,000 (~8× peak gain)\n\n**Pattern observations**:\n- The percentage gain has decreased each cycle (diminishing returns as market cap grows)\n- The bull peak typically arrives 12–18 months after the halving\n- A bear market follows each peak, often lasting 12–14 months\n- Each cycle's bear market low has remained above the prior cycle's low\n\n**Important caveats**: With only 3 complete cycles, sample size is tiny. Macro conditions (interest rates, regulatory environment, institutional participation) increasingly dominate short-term price action and can overwhelm halving mechanics.",
          highlight: ["post-halving", "bull run", "diminishing returns", "cycle low"],
        },
        {
          type: "quiz-mc",
          question:
            "What happens to Bitcoin's daily new supply issuance immediately after a halving event?",
          options: [
            "It is cut in half, reducing the number of new BTC awarded to miners each block",
            "It doubles, incentivising miners to secure the network",
            "It stays the same but miners receive bonus transaction fees",
            "All unmined Bitcoin is released at once to the market",
          ],
          correctIndex: 0,
          explanation:
            "The halving cuts the block reward exactly in half. Miners continue securing the network but receive half as many newly minted BTC per block. This reduces daily new supply, creating a supply shock if demand remains constant or grows.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Bitcoin's stock-to-flow ratio increases after each halving, making it comparably or more scarce than gold in terms of annual production relative to existing supply.",
          correct: true,
          explanation:
            "By the post-2024 halving, Bitcoin's S2F ratio reached approximately 120 — roughly twice gold's ratio of ~60. Each halving roughly doubles the S2F ratio because the flow (annual new supply) is cut in half while the stock (total supply) continues growing slowly.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A friend tells you: 'Bitcoin just had a halving yesterday. I'm buying today because historically BTC peaks immediately after a halving.' You know from your research that post-halving bull runs have typically taken 12–18 months to reach their peaks.",
          question: "What is the most accurate response to your friend's claim?",
          options: [
            "The historical pattern shows peaks arrive 12–18 months after the halving, not immediately — patience is required",
            "Your friend is right — halvings cause instant price spikes",
            "Halvings have no effect on price since miners can simply increase transaction fees",
            "You should sell immediately since halvings always cause a price crash first",
          ],
          correctIndex: 0,
          explanation:
            "All three previous halving cycles showed the bull market peak arriving 12–18 months after the event, not immediately. This lag occurs because it takes time for reduced miner sell pressure and supply shock narrative to be absorbed by the market. Immediate reactions can be volatile and unpredictable.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Market Cycle Psychology
       ================================================================ */
    {
      id: "crypto-cycles-2",
      title: "Market Cycle Psychology",
      description:
        "Accumulation, markup, distribution, and markdown phases; fear/greed dynamics",
      icon: "Brain",
      xpReward: 85,
      difficulty: "intermediate",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "The Four Market Cycle Phases",
          content:
            "Every speculative market — including crypto — tends to move through four repeating phases described by Wyckoff and later refined by Stan Weinstein:\n\n**1. Accumulation** — Price is flat to slightly declining. Smart money (institutions, early adopters, whales) quietly builds positions. Volume is low. Mainstream attention is minimal.\n\n**2. Markup** — Price begins trending upward. Early retail investors notice. Media coverage increases. FOMO begins.\n\n**3. Distribution** — Price is near the top. Smart money sells into retail demand. Price action becomes choppy and volatile. Euphoria peaks. Everyone is convinced 'this time is different.'\n\n**4. Markdown** — Price falls sharply. Retail latecomers hold bags. Capitulation eventually arrives. Hopium persists longer than logic suggests.\n\nCrypto's retail-dominated, 24/7 market amplifies these phases — Bitcoin's markdown phase (bear markets) has historically seen 75–85% drawdowns from all-time highs.",
          highlight: ["accumulation", "markup", "distribution", "markdown", "Wyckoff"],
        },
        {
          type: "teach",
          title: "Retail FOMO vs Smart Money Behaviour",
          content:
            "The single biggest performance gap in crypto comes from when participants buy and sell:\n\n**Smart money (whales, funds, early adopters)**:\n- Accumulate during fear/capitulation when prices are depressed\n- Take profits gradually into retail-driven FOMO\n- Reduce exposure before narratives exhaust\n- Move capital to new sectors before the crowd\n\n**Retail FOMO behaviour**:\n- Wait for confirmation (price already up 3–5×)\n- Buy near the top driven by social media hype\n- Hold through full drawdown hoping to 'get back to even'\n- Sell at the bottom during peak fear\n\n**On-chain evidence**: Blockchain data shows coin age and wallet size at the time of each transaction. Studies consistently show large wallets (1,000+ BTC) accumulate at lows and distribute at highs, while wallets with < 1 BTC show the opposite pattern — buying highs and selling lows.\n\nSelf-awareness about where you are in a cycle is the primary edge available to individual investors.",
          highlight: ["FOMO", "smart money", "accumulation", "distribution", "whale"],
        },
        {
          type: "teach",
          title: "Fear & Greed Index and Social Sentiment",
          content:
            "The **Crypto Fear & Greed Index** (0–100) aggregates multiple signals into a single sentiment reading:\n\n**Components**:\n- Volatility (25%): High volatility → fear\n- Market momentum/volume (25%): Strong buying → greed\n- Social media mentions and sentiment (15%)\n- Surveys (15%)\n- Bitcoin dominance (10%)\n- Google Trends (10%)\n\n**Interpretation as a contrarian indicator**:\n- Score 0–25 (Extreme Fear): Historically strong buying opportunities\n- Score 26–49 (Fear): Cautiously bullish zone\n- Score 50–74 (Greed): Reduce position sizing; don't add aggressively\n- Score 75–100 (Extreme Greed): Historical warning zone; distribution territory\n\n**Social media signals to watch**: Twitter/X crypto mention volume, Reddit post frequency, Google Trends for 'bitcoin' or 'crypto' — spikes in search interest near price peaks have been consistent across all three previous cycles.",
          highlight: ["fear and greed index", "sentiment", "contrarian", "extreme fear", "extreme greed"],
        },
        {
          type: "quiz-mc",
          question:
            "In the Wyckoff market cycle model, during which phase does 'smart money' primarily build its positions?",
          options: [
            "Accumulation — when price is flat/depressed and retail attention is minimal",
            "Markup — when price is rising sharply and media coverage peaks",
            "Distribution — when price is near its all-time high",
            "Markdown — immediately after the price peaks and starts falling",
          ],
          correctIndex: 0,
          explanation:
            "Smart money (institutions, whales) accumulates during the Accumulation phase when prices are depressed and retail investors are disinterested or scared. This allows them to build large positions cheaply before the Markup phase drives prices higher. They then distribute (sell) into the enthusiasm of retail FOMO during Distribution.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A Crypto Fear & Greed Index reading of 90 (Extreme Greed) is historically a bullish signal, suggesting now is a good time to add to positions.",
          correct: false,
          explanation:
            "Extreme Greed readings (75–100) are historically contrarian warning signals, not buy signals. When everyone is euphoric and greedy, most buyers are already in the market, leaving fewer new buyers to push prices higher. All three previous Bitcoin cycle peaks occurred during Extreme Greed readings. Extreme Fear (0–25), by contrast, has historically offered the best risk/reward entry points.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — On-Chain Cycle Indicators
       ================================================================ */
    {
      id: "crypto-cycles-3",
      title: "On-Chain Cycle Indicators",
      description:
        "MVRV Z-Score, NUPL, SOPR, and Puell Multiple — reading buy and sell zones",
      icon: "BarChart2",
      xpReward: 100,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "MVRV Z-Score",
          content:
            "**Market Value to Realized Value (MVRV)** compares Bitcoin's market cap to its 'realized cap' — the value of all coins priced at when they last moved on-chain.\n\n**Realized Cap**: If you last moved your 1 BTC when the price was $30,000, that coin contributes $30,000 to realized cap regardless of today's price.\n\n**MVRV = Market Cap ÷ Realized Cap**\n- MVRV > 1: Average holder is in profit\n- MVRV < 1: Average holder is at a loss\n\n**MVRV Z-Score** normalizes this ratio by standard deviation:\n- **Red zone (Z > 7)**: Historically marks cycle tops (extreme overvaluation; profit-taking signal)\n- **Green zone (Z < 0)**: Historically marks cycle bottoms (extreme undervaluation; accumulation signal)\n- **Yellow zone (0–7)**: Mid-cycle range\n\nThe Z-Score has correctly identified every major Bitcoin top and bottom across all previous cycles. Available for free at glassnode.com.",
          highlight: ["MVRV", "realized cap", "Z-Score", "overvaluation", "undervaluation"],
        },
        {
          type: "teach",
          title: "NUPL and SOPR",
          content:
            "**Net Unrealized Profit/Loss (NUPL)** measures the aggregate unrealized profit or loss as a fraction of market cap.\n\n**NUPL = (Market Cap − Realized Cap) ÷ Market Cap**\n\nNUPL zones:\n- **> 0.75**: Euphoria/Greed — historically cycle top territory\n- **0.5–0.75**: Belief/Denial — late bull market\n- **0.25–0.5**: Optimism/Anxiety — mid-cycle\n- **0–0.25**: Hope/Fear — early recovery\n- **< 0**: Capitulation — historically strong buy zone\n\n---\n\n**Spent Output Profit Ratio (SOPR)** measures whether coins moved on a given day were sold at a profit or loss:\n- **SOPR > 1**: Coins moved today were sold at a profit on average\n- **SOPR < 1**: Coins moved today were sold at a loss on average\n- **Bull market behaviour**: SOPR bounces off 1.0 (sellers regret selling; price rebounds)\n- **Bear market behaviour**: SOPR rejects 1.0 (sellers relieved to break even; price resists)",
          highlight: ["NUPL", "SOPR", "capitulation", "unrealized profit", "spent output"],
        },
        {
          type: "teach",
          title: "Puell Multiple",
          content:
            "The **Puell Multiple** focuses on miner revenue, which is the primary driver of sell-side pressure in the Bitcoin market.\n\n**Formula**: Puell Multiple = Daily Coin Issuance (USD) ÷ 365-Day Moving Average of Daily Issuance (USD)\n\nMiners are forced sellers — they must sell BTC to pay electricity and hardware costs. When the Puell Multiple is very high, miners are receiving outsized revenue and have incentive to sell more, creating headwinds. When it is very low, miners are earning less than their annual average, suggesting sustained sell pressure is exhausted.\n\n**Zones**:\n- **Puell > 4**: Historically marks cycle tops (miners flush, selling hard)\n- **Puell 0.5–2**: Normal operating range\n- **Puell < 0.5**: Historically marks cycle bottoms (miner capitulation complete)\n\n**Halving impact**: Immediately after a halving, the Puell Multiple drops sharply because daily issuance is cut in half. This flush of weak miners exits, leaving only the most efficient producers — setting the stage for the next bull run.",
          highlight: ["Puell Multiple", "miner revenue", "miner capitulation", "sell-side pressure"],
        },
        {
          type: "quiz-mc",
          question:
            "The MVRV Z-Score for Bitcoin is currently at 8.5. Based on historical cycle data, what does this suggest?",
          options: [
            "Bitcoin is in the historically identified top zone — a signal to consider reducing exposure and taking profits",
            "Bitcoin is extremely undervalued and this is a strong buy signal",
            "The metric is unreliable above 7 and should be ignored",
            "Bitcoin is in a neutral mid-cycle accumulation zone",
          ],
          correctIndex: 0,
          explanation:
            "An MVRV Z-Score above 7 has historically marked Bitcoin cycle tops — all three previous peaks (2013, 2017, 2021) occurred with Z-Scores in this red zone. A reading of 8.5 suggests extreme overvaluation relative to realized value and historically has been a signal to take profits or reduce leverage, not add exposure.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When SOPR consistently rejects the 1.0 level from below (bouncing off 1.0 repeatedly), this is a characteristic bull market behaviour pattern.",
          correct: false,
          explanation:
            "You have the interpretation reversed. In a bull market, SOPR *bounces off* 1.0 from above — dips to 1.0 are bought because holders refuse to sell at break-even, causing price to recover. In a bear market, SOPR *rejects* 1.0 from below — rallies to 1.0 are sold by relieved holders who just want to break even, causing price resistance at that level.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You're analysing Bitcoin on-chain data. NUPL = -0.08, Puell Multiple = 0.42, MVRV Z-Score = -0.3. All three indicators are in their respective historically identified 'buy zone' territory.",
          question: "Based on these three on-chain indicators, what cycle phase does this suggest Bitcoin may be in?",
          options: [
            "Deep bear market / capitulation — historically the strongest long-term buying opportunity",
            "Cycle top — all three indicators signal imminent correction",
            "Mid-cycle neutral — no clear directional bias from these readings",
            "Distribution phase — smart money is quietly selling",
          ],
          correctIndex: 0,
          explanation:
            "All three indicators are flashing their historical 'bottom' signals simultaneously: NUPL below zero means average holders are underwater (capitulation), Puell Multiple below 0.5 means miner revenue is deeply suppressed (miner capitulation), and MVRV Z-Score below zero means market value is below realized value. Historically, convergence of multiple on-chain bottom indicators has been the strongest signal for long-term accumulation.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Altcoin Seasons
       ================================================================ */
    {
      id: "crypto-cycles-4",
      title: "Altcoin Seasons",
      description:
        "Bitcoin dominance cycle, alt season timing, and sector rotation within crypto",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "intermediate",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "Bitcoin Dominance and Alt Season Timing",
          content:
            "**Bitcoin dominance** (BTC.D) measures Bitcoin's market cap as a percentage of total crypto market cap.\n\n**Typical cycle pattern**:\n1. **BTC leads the bull market** — Bitcoin rallies first, dominance rises. Alts bleed in BTC terms even as they rise in USD.\n2. **BTC dominance peaks** — Around the time BTC breaks its prior all-time high or shortly after, dominance stalls.\n3. **Capital rotates into large-cap alts (ETH, SOL, BNB)** — Dominance falls; these assets outperform BTC.\n4. **Mid-cap alts surge** — As BTC.D continues falling, capital flows further down the risk curve.\n5. **Micro-cap/meme season** — The final, most speculative phase; 100–1000× moves become common but accompanied by extreme risk.\n6. **BTC.D bottoms and reverses** — Signal that the alt season is exhausted; smart money returns to BTC before overall market tops.\n\n**The Altcoin Season Index** (available at blockchaincenter.net) turns green when 75%+ of the top 50 alts have outperformed Bitcoin over the past 90 days.",
          highlight: ["Bitcoin dominance", "alt season", "BTC.D", "sector rotation", "capital rotation"],
        },
        {
          type: "teach",
          title: "Crypto Sector Rotation",
          content:
            "Within the altcoin universe, capital tends to rotate through sectors in a predictable order as risk appetite escalates:\n\n**Layer 1 blockchains (L1)** — Ethereum, Solana, Avalanche, etc. These benefit first from the alt season narrative because they are the foundational infrastructure. Institutional and developer capital goes here.\n\n**Layer 2 scaling solutions (L2)** — Arbitrum, Optimism, Polygon, etc. Once L1s are established, the narrative shifts to 'which chain will scale best?' L2s rally on usage growth.\n\n**DeFi protocols** — Once the base layers are valued, attention turns to the applications built on them: DEXes, lending protocols, yield aggregators.\n\n**NFTs and gaming** — Consumer-facing, culturally-driven assets. Rally in the speculative peak of cycles when mainstream attention is highest.\n\n**Meme coins** — Pure speculation, no fundamental value. Rally last and crash hardest. High short-term return potential, extreme risk.\n\n**Key insight**: Identifying what sector the market is currently rotating into and positioning *before* mainstream attention arrives is where significant alpha is generated.",
          highlight: ["L1", "L2", "DeFi", "NFT", "meme coins", "sector rotation"],
        },
        {
          type: "teach",
          title: "Liquidity Cascades",
          content:
            "A **liquidity cascade** describes how capital flows through crypto during both bull and bear markets:\n\n**Bull cascade (upward)**:\n- BTC rises → generates USD profits → rotate into ETH → ETH profits rotate into large-cap alts → cascade continues to smaller caps\n- Each level requires the layer above it to keep rising to sustain the rotation\n\n**Bear cascade (downward)**:\n- BTC falls → panic selling of alts to raise BTC or stablecoins → alts fall harder than BTC → micro-caps become illiquid and collapse\n- This is why alts lose 90–95% in bear markets even when BTC 'only' falls 75–80%\n\n**Stablecoin dominance** (USDT + USDC as % of total market cap) is a counter-indicator to BTC.D for measuring overall risk appetite:\n- Rising stablecoin dominance = capital fleeing to safety (bearish)\n- Falling stablecoin dominance = capital deploying into risk assets (bullish)\n\n**Practical implication**: In a bear market, most altcoins are not 'cheap at -80%' — they can easily fall another 80–90% from there. Liquidity in small-cap alts is an illusion in bull markets.",
          highlight: ["liquidity cascade", "stablecoin dominance", "bear market", "capital flow"],
        },
        {
          type: "quiz-mc",
          question:
            "During a typical crypto bull cycle, in what order does capital generally rotate through the market?",
          options: [
            "Bitcoin → Large-cap alts (ETH/L1s) → DeFi/L2s → NFTs/memes",
            "Meme coins → NFTs → DeFi → Bitcoin last",
            "All sectors rise simultaneously with equal magnitude",
            "DeFi → L2s → Bitcoin → meme coins",
          ],
          correctIndex: 0,
          explanation:
            "Historical cycle data shows capital flowing from Bitcoin (least risky) to large-cap Layer 1 alts, then to DeFi and Layer 2 protocols, and finally to speculative NFTs and meme coins at the cycle peak. This progression follows increasing risk appetite and decreasing market cap, meaning gains accelerate but so does volatility and drawdown potential.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "If Bitcoin's dominance is falling sharply, this always means altcoins are in a bull market and it is safe to buy micro-cap tokens.",
          correct: false,
          explanation:
            "Falling Bitcoin dominance does not automatically mean it is safe to buy micro-caps. BTC.D can fall in a bear market if both BTC and alts are falling but alts are falling faster — a 'down dominance' scenario that is actually terrible for altcoin holders. Context matters: is total market cap rising or falling as BTC.D falls? Only when total market cap is also rising does falling BTC.D signal a healthy alt season.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Risk Management Through Cycles
       ================================================================ */
    {
      id: "crypto-cycles-5",
      title: "Risk Management Through Cycles",
      description:
        "DCA strategy, profit-taking frameworks, stablecoin allocation, and tax-loss harvesting",
      icon: "Shield",
      xpReward: 95,
      difficulty: "intermediate",
      duration: 11,
      steps: [
        {
          type: "teach",
          title: "Dollar-Cost Averaging in Crypto",
          content:
            "**Dollar-cost averaging (DCA)** is the practice of investing a fixed dollar amount at regular intervals regardless of price — weekly or monthly contributions.\n\n**Why DCA suits crypto specifically**:\n- Crypto's extreme volatility makes timing the market extremely difficult even for professionals\n- Regular buying automatically purchases more coins when price is low and fewer when price is high\n- Removes emotional decision-making and FOMO-driven timing\n- Creates a lower average cost basis over a full cycle\n\n**Backtested results**: Studies show that DCA into Bitcoin over any rolling 4-year window in its history (including buying at every single peak) has produced positive returns, because each subsequent cycle's low has remained above the previous cycle's low.\n\n**Limitations of DCA**:\n- Does not maximise returns — a lump-sum at the cycle bottom would vastly outperform\n- Requires discipline to continue buying during deep bear markets when pessimism is high\n- Does not protect against a project going to zero — only use DCA for assets with strong long-term thesis",
          highlight: ["DCA", "dollar-cost averaging", "average cost basis", "recurring buy"],
        },
        {
          type: "teach",
          title: "Profit-Taking Frameworks",
          content:
            "Taking profits is psychologically difficult in crypto bull markets — every sale feels premature when price keeps rising. A systematic framework removes emotion:\n\n**Percentage gain ladders**:\n- Sell 10% of position at 2× cost basis (recovering initial capital)\n- Sell another 15% at 3× (locking meaningful gains)\n- Sell 20% at 5× (risk-free at this point regardless of outcome)\n- Let remaining 55% ride with a trailing stop\n\n**On-chain-triggered profit taking**:\n- Begin systematic selling when MVRV Z-Score enters red zone (> 7)\n- Increase sell rate if Fear & Greed > 80 for 14+ consecutive days\n- Stop adding new capital when NUPL enters Euphoria zone (> 0.75)\n\n**Stablecoin parking**: Profits should move into stablecoins (USDC, USDT) or stablecoin yield protocols rather than back to fiat, keeping capital ready for rapid re-deployment at the next cycle bottom.\n\n**Key rule**: Never let a gain of 3× or more fully revert to your cost basis. Set hard stops for a portion of each position.",
          highlight: ["profit-taking", "ladder", "cost basis", "stablecoin", "MVRV trigger"],
        },
        {
          type: "teach",
          title: "Position Sizing and Tax Considerations",
          content:
            "**Position sizing in crypto**:\n- Bitcoin and Ethereum: Core holdings, up to 80–90% of crypto allocation\n- Large-cap alts (top 10–20 by market cap): Satellite positions, each 2–5% of crypto portfolio\n- Mid/small-cap alts: Speculative positions, 0.5–2% each; maximum combined 10% of crypto portfolio\n- Rule of thumb: If losing 100% of a position would prevent you from sleeping, the size is too large\n\n**Tax-loss harvesting in crypto**:\n- Unlike equities, crypto in most jurisdictions has **no wash-sale rule** — you can sell a coin at a loss and immediately repurchase it, locking in the tax loss while maintaining your position\n- This is particularly powerful in bear markets: a $30,000 BTC bought at $50,000 can be sold and repurchased, generating a $20,000 capital loss that offsets gains elsewhere\n- Keep detailed records of every transaction (exchange statements + tools like Koinly or CoinTracker)\n\n**Caution**: Tax laws vary significantly by jurisdiction and evolve rapidly. Always consult a tax professional familiar with crypto before executing wash-sale strategies.",
          highlight: ["position sizing", "tax-loss harvesting", "wash-sale rule", "capital loss", "stablecoin allocation"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader bought 1 ETH at $3,000. ETH is now $9,000 (3×). According to a percentage-gain ladder strategy, what is the primary benefit of selling 10% of the position at the 2× level ($6,000) and 15% at 3× ($9,000)?",
          options: [
            "The original capital is recovered and meaningful gains are locked regardless of what happens next",
            "It guarantees the remaining position will continue to appreciate",
            "It eliminates all tax obligations on the trade",
            "It prevents exchange trading fees from accumulating",
          ],
          correctIndex: 0,
          explanation:
            "Selling at structured profit levels ensures that even if the remaining position drops back to zero, the trader has already recovered their initial investment and locked real profits. This transforms a highly volatile bet into a 'free carry' on the remaining coins. No strategy guarantees future price direction — but systematic profit-taking manages regret and risk.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In most jurisdictions, crypto does not have a wash-sale rule, meaning you can sell a coin at a loss and immediately repurchase it to realise the tax loss while maintaining your market exposure.",
          correct: true,
          explanation:
            "Unlike US equity markets (where the wash-sale rule prohibits claiming a loss if you repurchase the same security within 30 days), most crypto jurisdictions do not apply wash-sale rules to digital assets. This creates a legitimate tax optimisation opportunity in bear markets: realise losses to offset gains, then immediately re-enter the position. Tax laws are jurisdiction-specific and evolving — always verify current rules with a qualified tax advisor.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Long-Run Thesis
       ================================================================ */
    {
      id: "crypto-cycles-6",
      title: "The Long-Run Thesis",
      description:
        "Bitcoin as digital gold, Ethereum as programmable settlement, adoption S-curve, and institutional trends",
      icon: "Globe",
      xpReward: 95,
      difficulty: "intermediate",
      duration: 11,
      steps: [
        {
          type: "teach",
          title: "Bitcoin as Digital Gold",
          content:
            "The **Bitcoin as digital gold** thesis rests on four properties that gold has historically been valued for:\n\n**1. Scarcity**: Gold is scarce because it is rare in the earth's crust. Bitcoin is scarce by code — 21 million hard cap enforced by every node in the network.\n\n**2. Durability**: Gold does not corrode. Bitcoin's private key can persist indefinitely on any medium — paper, hardware, even memory.\n\n**3. Portability**: $1 billion in gold weighs ~17 tonnes. $1 billion in Bitcoin can be moved in seconds to any address on earth for a small transaction fee.\n\n**4. Verifiability**: Verifying gold requires assay testing. Verifying Bitcoin authenticity is instant and cryptographically certain.\n\n**The addressable market**: Global gold market cap is roughly $13–15 trillion. If Bitcoin were to capture even 10% of gold's monetary premium, BTC's market cap would be $1.3–1.5 trillion — significant upside from current levels. At gold parity it would be $13–15 trillion.\n\n**Bull case**: Central bank demand (Poland, Czech Republic, El Salvador have purchased BTC), ETF inflows, and inflation hedging narrative continue to drive institutional adoption.",
          highlight: ["digital gold", "scarcity", "portability", "21 million", "store of value"],
        },
        {
          type: "teach",
          title: "Ethereum as Programmable Settlement",
          content:
            "Where Bitcoin is optimised for being a store of value, **Ethereum** is optimised for programmable money and decentralised applications.\n\n**Key thesis components**:\n\n**Smart contract platform**: Ethereum hosts thousands of decentralised applications (dApps) — DeFi protocols, NFT marketplaces, DAOs, stablecoins. ETH is required as 'gas' to execute any transaction on this network.\n\n**Deflationary mechanism (EIP-1559)**: Since 2021, Ethereum burns a portion of every gas fee. During high activity, ETH supply is net deflationary — more ETH is burned than issued to stakers.\n\n**Triple-point asset thesis** (coined by analyst David Hoffman):\n- ETH as **store of value** (scarce, yield-bearing)\n- ETH as **capital** (collateral in DeFi)\n- ETH as **consumable** (gas burned with every transaction)\n\n**Bear case**: Multi-chain competition (Solana, Sui, Aptos), Layer 2 fee compression, and the risk that transaction fees (and thus burn rate) migrate to L2s over time, reducing ETH scarcity mechanics.",
          highlight: ["Ethereum", "smart contracts", "EIP-1559", "gas burn", "deflationary", "triple-point asset"],
        },
        {
          type: "teach",
          title: "Adoption S-Curve and Institutional Trends",
          content:
            "Technology adoption typically follows an **S-curve**: slow initial uptake, then rapid acceleration as network effects build, then saturation.\n\n**Where is crypto on the S-curve?**\n- Global crypto holders: ~500–600 million people (~6–7% of world population) as of 2024\n- Internet reached this penetration in ~1998; mobile phones by ~2002\n- Historical S-curve suggests 1–2 billion users could be reached within this decade if growth continues\n\n**Institutional milestones (2020–2024)**:\n- MicroStrategy, Tesla, Square added BTC to corporate treasury\n- **Spot Bitcoin ETFs approved** in the US (January 2024) — BlackRock, Fidelity, Invesco ETFs launched\n- Spot Ethereum ETFs approved (May 2024)\n- Sovereign wealth funds and pension funds beginning to allocate (0.5–2% of AUM)\n- BTC became legal tender in El Salvador (2021) and Central African Republic (2022)\n\n**Key risk**: Regulatory crackdowns (China's 2021 mining ban, SEC enforcement) have historically caused sharp drawdowns but have not stopped long-term adoption. Regulatory clarity in major economies is the single biggest catalyst or headwind.",
          highlight: ["S-curve", "adoption", "institutional", "spot ETF", "BlackRock", "regulatory"],
        },
        {
          type: "quiz-mc",
          question:
            "Which property gives Bitcoin a significant advantage over physical gold in terms of cross-border value transfer?",
          options: [
            "Portability — billions of dollars in Bitcoin can be transmitted globally in minutes for minimal fees, whereas physical gold requires physical transportation",
            "Gold is more portable because it has been used as money for thousands of years",
            "Bitcoin's value is guaranteed by the US government, making it more trusted",
            "Bitcoin has a longer track record than gold as a monetary asset",
          ],
          correctIndex: 0,
          explanation:
            "Bitcoin's superior portability is one of its strongest advantages over physical gold. Moving large amounts of gold requires physical security, significant cost, and time. Bitcoin can be sent to any address on earth in minutes for a small transaction fee, and billions of dollars worth can be transported simply by memorising a private key. Gold has a millennia-long track record, which is its advantage over Bitcoin.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Since Ethereum introduced EIP-1559, ETH supply can become net deflationary during periods of high network activity because more ETH is burned as fees than is issued to validators.",
          correct: true,
          explanation:
            "EIP-1559 (implemented August 2021) introduced a base fee that is burned with every Ethereum transaction. During periods of high network activity (DeFi booms, NFT surges), the burn rate exceeds the ~1,700 ETH/day issued to validators, making ETH supply net deflationary. This mechanism is a core component of the 'ultra-sound money' narrative for Ethereum and the triple-point asset thesis.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor is evaluating whether to allocate 5% of their portfolio to Bitcoin. They note: spot BTC ETFs are now available from BlackRock and Fidelity, institutional holdings are growing, global crypto user count is ~600 million (~7% of population), and Bitcoin has survived 4 halvings and multiple 75–85% drawdowns without going to zero.",
          question: "Which statement best characterises Bitcoin's risk/reward profile for a long-term portfolio allocation?",
          options: [
            "Bitcoin has matured past early-adopter stage with institutional validation, but retains high volatility — a small allocation (1–5%) provides asymmetric upside with limited portfolio-level impact if it falls to zero",
            "Bitcoin is risk-free because major institutions now hold it",
            "At 7% global adoption, the S-curve is complete and most future returns have already been realised",
            "The presence of ETFs eliminates Bitcoin's price volatility",
          ],
          correctIndex: 0,
          explanation:
            "The evidence points to Bitcoin being past early-adopter stage (institutional ETFs, corporate treasuries, sovereign adoption) but still in early-majority phase on the technology S-curve. A small allocation (1–5%) limits maximum portfolio damage if Bitcoin hypothetically goes to zero while preserving meaningful upside exposure. Institutions holding Bitcoin does not eliminate volatility — it simply adds a more stable cohort of long-term holders alongside speculative traders. The S-curve suggests significant adoption runway remains.",
          difficulty: 3,
        },
      ],
    },
  ],
};
