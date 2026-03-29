import { Unit } from "./types";

export const unitHedgeFundStrategies: Unit = {
  id: "unit-hedge-fund-strategies",
  title: "Hedge Fund Strategies & Alpha",
  description:
    "Explore the sophisticated strategies used by professional hedge funds to generate alpha — from long/short equity and global macro to quantitative models and multi-strategy platforms.",
  icon: "TrendingUp",
  color: "#6366f1",
  lessons: [
    // ─── Lesson 1: Long/Short Equity ──────────────────────────────────────────
    {
      id: "hf-strat-1",
      title: "📈 Long/Short Equity",
      description:
        "Master the foundational hedge fund strategy: simultaneously holding long positions in undervalued stocks and short positions in overvalued ones to profit in any market environment.",
      icon: "TrendingUp",
      xpReward: 120,
      difficulty: "intermediate",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "What Is Long/Short Equity?",
          content:
            "Long/short equity (L/S) is the oldest and most widespread hedge fund strategy. Managers buy stocks they believe will rise (**long**) and sell short stocks they believe will fall (**short**).\n\nThis dual-sided approach has two key advantages:\n\n- **Market hedge**: shorts can offset losses from broad market declines\n- **Alpha both ways**: the fund earns from winners rising AND losers falling\n\nUnlike a traditional mutual fund that only profits when the market rises, a well-run L/S book can generate returns in flat or falling markets — provided the longs outperform the shorts.",
          highlight: ["long", "short", "alpha"],
        },
        {
          type: "teach",
          title: "Gross vs. Net Exposure",
          content:
            "Two metrics define the risk posture of any L/S fund:\n\n**Gross Exposure** = |Long %| + |Short %|\nReflects total leverage and market activity. A fund with 130% long and 80% short has 210% gross exposure.\n\n**Net Exposure** = Long % − Short %\nReflects directional market bias. The same fund has +50% net — it still has meaningful upside market risk.\n\n- A **market-neutral** fund targets net exposure near 0%\n- A **long-biased** fund may run 60–80% net long\n- High gross exposure with low net exposure signals heavy two-sided activity (more alpha, more stock-specific risk)",
          highlight: ["gross exposure", "net exposure", "market-neutral"],
        },
        {
          type: "quiz-mc",
          question:
            "A hedge fund holds 150% long exposure and 70% short exposure. What are the gross and net exposures?",
          options: [
            "Gross 80%, Net 220%",
            "Gross 220%, Net 80%",
            "Gross 150%, Net 70%",
            "Gross 220%, Net -80%",
          ],
          correctIndex: 1,
          explanation:
            "Gross exposure = |150%| + |70%| = 220%. Net exposure = 150% − 70% = 80% (long-biased). The fund has significant market risk due to its positive net exposure.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Fundamental vs. Quantitative L/S",
          content:
            "Long/short equity splits into two broad schools:\n\n**Fundamental L/S**\n- Analysts perform deep company research: management quality, competitive moats, earnings quality, valuation\n- Portfolios are concentrated (20–60 positions)\n- Holding periods: months to years\n- Alpha source: information edge, variant perception\n\n**Quantitative L/S**\n- Systematic models rank thousands of stocks by factor scores (value, momentum, quality)\n- Portfolios are diversified (hundreds of positions)\n- Holding periods: days to weeks\n- Alpha source: disciplined factor exposure, rapid rebalancing\n\nMany large funds blend both — using quant screens to generate ideas that analysts then investigate deeply.",
          highlight: [
            "fundamental",
            "quantitative",
            "factor scores",
            "variant perception",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A market-neutral long/short fund aims to profit exclusively from broad market movements rather than individual stock selection.",
          correct: false,
          explanation:
            "Market-neutral funds aim to eliminate broad market (beta) exposure by balancing longs and shorts, so profits come from stock selection (alpha) — the relative performance of longs vs. shorts — not from directional market moves.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Factor Neutrality & Risk Management",
          content:
            "Sophisticated L/S funds control exposures beyond just market beta. **Factor neutrality** means deliberately offsetting unintended tilts:\n\n- **Sector neutral**: long Goldman Sachs, short Morgan Stanley (both financials) — isolates stock-specific alpha\n- **Beta neutral**: balance portfolio beta to stay insensitive to index moves\n- **Factor neutral**: hedge out unintended momentum, size, or value tilts\n\nPosition sizing uses a **Kelly-fraction** or **volatility-targeting** approach: higher-conviction ideas get larger weights, but position sizes are capped (often 5–10% of NAV) to prevent single-name blowups.\n\n**Stop-losses** on short positions are especially important — a short that doubles causes a 100% loss on that leg, creating \"short squeeze\" risk.",
          highlight: [
            "factor neutrality",
            "sector neutral",
            "Kelly-fraction",
            "short squeeze",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A L/S manager is long a regional bank and short a large money-center bank. What type of trade is this?",
          options: [
            "A macro trade expressing a view on interest rates",
            "A sector-neutral relative value trade",
            "A momentum factor trade",
            "A market-neutral index arbitrage",
          ],
          correctIndex: 1,
          explanation:
            "Being long one bank and short another within the same sector creates a sector-neutral relative value trade. The manager profits if the long bank outperforms the short, regardless of how the banking sector as a whole moves.",
          difficulty: 2,
        },
      ],
    },
    // ─── Lesson 2: Global Macro ───────────────────────────────────────────────
    {
      id: "hf-strat-2",
      title: "🌍 Global Macro",
      description:
        "Understand how macro hedge funds identify and trade large-scale economic themes across currencies, interest rates, equities, and commodities using top-down thesis development.",
      icon: "Globe",
      xpReward: 130,
      difficulty: "advanced",
      duration: 12,
      steps: [
        {
          type: "teach",
          title: "The Global Macro Approach",
          content:
            "Global macro managers take positions across **all asset classes** — equities, fixed income, currencies, commodities — based on macroeconomic and geopolitical analysis.\n\nThe process starts top-down:\n\n1. **Identify a macro thesis**: e.g., \"The European Central Bank will cut rates faster than the market expects\"\n2. **Find the best instrument**: EUR/USD short, Bund futures long, European bank equities short\n3. **Size the position**: based on conviction, volatility, and portfolio risk budget\n4. **Define the exit**: price target, time horizon, or thesis invalidation trigger\n\nLegendary macro managers include George Soros (broke the Bank of England in 1992) and Ray Dalio (\"All Weather\" framework). The strategy requires deep knowledge of monetary policy, fiscal dynamics, and cross-asset correlations.",
          highlight: [
            "top-down",
            "macro thesis",
            "thesis invalidation",
            "cross-asset",
          ],
        },
        {
          type: "teach",
          title: "Carry Trades: Borrowing Low, Lending High",
          content:
            "The **carry trade** is one of global macro's core strategies: borrow in a low-interest-rate currency and invest in a high-interest-rate currency, pocketing the interest rate differential.\n\n**Example**: USD rates at 5%, JPY rates at 0.1%\n- Borrow ¥100M at 0.1% → convert to USD → invest at 5%\n- Annual carry: ~4.9% before currency moves\n\n**The risk**: carry trades \"go up the stairs and down the elevator.\" They unwind violently when risk sentiment deteriorates and investors rush to cover shorts in the funding currency (JPY carry unwind of 2008, 2022).\n\nKey metrics for carry attractiveness:\n- **Interest rate differential**: the raw carry\n- **Sharpe of carry**: carry ÷ historical carry volatility\n- **Positioning**: overcrowded carry trades are fragile",
          highlight: [
            "carry trade",
            "interest rate differential",
            "funding currency",
            "carry unwind",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In a classic JPY carry trade, which scenario would most likely cause a rapid, painful unwind?",
          options: [
            "The Bank of Japan raises interest rates unexpectedly",
            "US equity markets rise 10%",
            "Oil prices fall 5%",
            "The US Federal Reserve holds rates steady",
          ],
          correctIndex: 0,
          explanation:
            "An unexpected Bank of Japan rate hike would narrow the interest rate differential (reducing carry), AND cause JPY to appreciate as investors rush to buy back JPY to repay their borrowings. This two-sided hit (less carry + adverse FX move) triggers a rapid, disorderly unwind.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Position Sizing in Macro",
          content:
            "Macro sizing is driven by **conviction, volatility, and correlation**:\n\n**Volatility-targeted sizing**\n- Target a fixed dollar volatility per position (e.g., 1% of NAV per day)\n- Size = (Target Vol) ÷ (Instrument daily vol)\n- A less volatile bond future gets a larger notional than a volatile EM currency\n\n**Kelly Criterion (fractional)**\n- Bet size = (Edge) ÷ (Odds)\n- Most practitioners use ¼ or ½ Kelly to account for model uncertainty\n\n**Portfolio-level risk budget**\n- Sum of marginal VaR contributions should not breach total fund VaR limit\n- Correlated positions (e.g., EUR short + European equity short) consume the same risk budget faster\n\nMacro funds often express the same thesis through multiple instruments to maximize convexity — e.g., options instead of futures for asymmetric payoffs.",
          highlight: [
            "volatility-targeted",
            "Kelly Criterion",
            "risk budget",
            "convexity",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "In a volatility-targeted position sizing framework, a more volatile asset receives a larger notional position than a less volatile asset with the same conviction level.",
          correct: false,
          explanation:
            "Volatility targeting works the opposite way: to achieve the same dollar risk (e.g., 1% of NAV daily vol), you must hold a SMALLER notional in high-volatility assets and a LARGER notional in low-volatility assets. This ensures each position contributes equally to total portfolio risk.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "FX Positioning & Macro Signals",
          content:
            "Currency positioning integrates several analytical frameworks:\n\n**Purchasing Power Parity (PPP)**: Long-run fair value — a currency trading far below PPP is 'cheap' but may stay cheap for years.\n\n**Current Account**: Persistent deficits are structurally bearish for a currency (more selling to fund imports).\n\n**Real Interest Rate Differentials**: Higher real rates attract capital inflows. Monitor breakeven inflation vs. nominal rates.\n\n**Sentiment & Positioning (COT Report)**: The CFTC Commitment of Traders report reveals speculative positioning. Extreme crowded longs in a currency are a contrarian warning.\n\nMacro managers synthesize all four into a **scorecard** — assigning weights to valuation, flows, rates, and sentiment to build a composite currency view.",
          highlight: [
            "PPP",
            "real interest rate",
            "COT Report",
            "scorecard",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The CFTC Commitment of Traders (COT) report shows record speculative net long positions in the USD. How would a contrarian macro trader interpret this?",
          options: [
            "Strong bullish signal — institutions are loading up on USD",
            "Neutral — COT data is too lagged to be useful",
            "Bearish warning — extreme positioning increases the risk of a sharp reversal",
            "Buy signal — trend-following funds are always right",
          ],
          correctIndex: 2,
          explanation:
            "Extreme speculative positioning is a contrarian signal. When almost everyone is already long USD, there are fewer buyers left to push it higher — and a small adverse catalyst can force mass liquidation, causing a rapid reversal. Macro traders use COT as a sentiment/positioning crowding indicator.",
          difficulty: 3,
        },
      ],
    },
    // ─── Lesson 3: Quantitative Strategies ───────────────────────────────────
    {
      id: "hf-strat-3",
      title: "🤖 Quantitative Strategies",
      description:
        "Explore systematic trading approaches: statistical arbitrage, pairs trading, multi-factor models, and the execution algorithms that power quant hedge funds.",
      icon: "BarChart2",
      xpReward: 140,
      difficulty: "advanced",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "Statistical Arbitrage Foundations",
          content:
            "Statistical arbitrage (**stat arb**) exploits small, persistent mispricings between related securities using quantitative models. Unlike traditional arbitrage, stat arb profits are probabilistic — they work on average across many trades, not with certainty on each trade.\n\n**Core requirements**:\n- **Mean reversion signal**: the spread between related securities tends to revert to a historical mean\n- **Fast execution**: edges are small (basis points) and disappear quickly\n- **Scale**: hundreds or thousands of positions needed to diversify away idiosyncratic risk\n\n**Examples of stat arb universes**:\n- S&P 500 index components vs. ETF (SPY)\n- ADR vs. local share (e.g., BABA US vs. 9988 HK)\n- On-the-run vs. off-the-run Treasuries\n- Convertible bond vs. underlying equity",
          highlight: [
            "stat arb",
            "mean reversion",
            "mispricings",
            "idiosyncratic risk",
          ],
        },
        {
          type: "teach",
          title: "Pairs Trading: The Classic Stat Arb",
          content:
            "**Pairs trading** involves finding two historically correlated stocks, then trading the divergence from their typical relationship.\n\n**The mechanics**:\n1. Calculate the **spread**: Price(A) − β × Price(B), where β is the hedge ratio\n2. Compute z-score: (Spread − Mean) ÷ StdDev\n3. **Enter**: Long the cheap stock, short the expensive one when |z-score| > 2\n4. **Exit**: Close both legs when z-score reverts to near 0\n5. **Stop**: Cut the position if |z-score| > 3 (regime change)\n\n**Key risks**:\n- **Cointegration breakdown**: the historical relationship permanently breaks (e.g., Volkswagen's short squeeze in 2008)\n- **Execution risk**: the spread can widen further before reverting\n- **Parameter instability**: the hedge ratio β can shift over time, requiring frequent recalibration",
          highlight: [
            "pairs trading",
            "z-score",
            "cointegration",
            "hedge ratio",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In a pairs trade, Stock A is at a z-score of +2.5 relative to Stock B (A is expensive, B is cheap). What is the correct trade?",
          options: [
            "Long A, Short B — ride the momentum",
            "Short A, Long B — bet on mean reversion",
            "Long both A and B — the pair is trending up",
            "Short both A and B — the spread is at an extreme",
          ],
          correctIndex: 1,
          explanation:
            "A z-score of +2.5 means Stock A is significantly overpriced relative to Stock B. The mean-reversion trade is to short the expensive leg (A) and go long the cheap leg (B), expecting the spread to narrow back toward its historical mean.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Multi-Factor Models: Momentum, Value, Quality",
          content:
            "Quantitative equity funds rank stocks by systematic **factor scores** derived from decades of academic research:\n\n**Momentum (12-1 month return)**\n- Stocks that outperformed recently continue to outperform in the near term\n- Signal: 12-month return, skipping the most recent month (reversal effect)\n\n**Value (P/E, P/B, EV/EBITDA)**\n- Cheap stocks outperform expensive stocks over the long run\n- Signal: composite of multiple valuation ratios\n\n**Quality (ROE, earnings stability, low leverage)**\n- High-quality companies with consistent earnings outperform over time\n- Signal: return on equity, accruals ratio, interest coverage\n\n**Size**: Small-cap premium\n**Low Volatility**: Low-beta stocks often outperform on a risk-adjusted basis\n\nFactors are combined into a **composite alpha score** that ranks every stock in the universe. The top decile is bought; the bottom decile is shorted.",
          highlight: [
            "momentum",
            "value",
            "quality",
            "composite alpha score",
            "factor scores",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "In quantitative factor investing, the momentum factor uses the most recent month's return as its primary signal because it captures the latest price trend.",
          correct: false,
          explanation:
            "The standard momentum factor uses the 12-month return EXCLUDING the most recent month (i.e., months 12 to 2). The most recent month is intentionally omitted because it tends to exhibit short-term reversal — stocks that just surged often pull back briefly, which would contaminate the longer-term momentum signal.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Execution Algorithms & Market Impact",
          content:
            "Alpha generation is only half the battle — **execution** determines how much of that alpha survives to the P&L.\n\n**TWAP (Time-Weighted Average Price)**: Splits an order evenly across time. Simple but predictable — other algorithms can front-run it.\n\n**VWAP (Volume-Weighted Average Price)**: Trades in proportion to historical intraday volume profile. Minimizes market impact for liquid stocks.\n\n**Implementation Shortfall (IS)**: Minimizes the gap between decision price and execution price. Trades faster when price moves against you.\n\n**Participation Rate**: Limits trading to X% of market volume to avoid moving the price.\n\n**The cost of poor execution**:\n- A 10 bps alpha signal can be entirely consumed by 5–8 bps of market impact + 2–3 bps of commission\n- Large quant funds must carefully model **capacity** — the maximum AUM before trading costs erode the alpha",
          highlight: [
            "TWAP",
            "VWAP",
            "implementation shortfall",
            "market impact",
            "capacity",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A quant fund has identified a factor alpha of 15 bps per trade. If average market impact is 8 bps and commissions are 3 bps, what is the net realized alpha per trade?",
          options: [
            "15 bps — execution costs don't affect alpha",
            "7 bps — after market impact only",
            "4 bps — after both market impact and commissions",
            "-11 bps — execution costs always exceed factor alpha",
          ],
          correctIndex: 2,
          explanation:
            "Net realized alpha = Gross alpha − Market impact − Commissions = 15 − 8 − 3 = 4 bps. While positive, this is a thin margin. If transaction costs increase even slightly (e.g., due to AUM growth), the strategy can become unprofitable — highlighting why execution quality and capacity management are critical for quant funds.",
          difficulty: 2,
        },
      ],
    },
    // ─── Lesson 4: Multi-Strategy & Fund of Funds ─────────────────────────────
    {
      id: "hf-strat-4",
      title: "🏗️ Multi-Strategy & Fund of Funds",
      description:
        "Learn how capital is allocated across strategies, how risk budgets work, and how fee structures like 2&20 shape the economics of the hedge fund industry.",
      icon: "Layers",
      xpReward: 110,
      difficulty: "intermediate",
      duration: 10,
      steps: [
        {
          type: "teach",
          title: "Multi-Strategy Platform Architecture",
          content:
            "A **multi-strategy hedge fund** (or \"multi-strat\") runs several independent strategy pods under one roof — equity L/S, fixed income, commodities, quant — each managed by a dedicated portfolio manager (PM).\n\n**Key advantages**:\n- **Diversification**: uncorrelated strategies reduce aggregate volatility\n- **Capital efficiency**: risk capital can be dynamically reallocated to the best opportunities\n- **Shared infrastructure**: one prime broker, one technology stack, one compliance team\n\nThe **central risk desk** aggregates all PM positions, monitors total factor exposures and VaR, and enforces drawdown limits. If a PM's book hits its drawdown threshold, capital is reclaimed automatically.\n\nFirms like Millennium Management, Citadel, and Point72 operate this model, running hundreds of PM pods globally.",
          highlight: [
            "multi-strategy",
            "PM pods",
            "central risk desk",
            "drawdown limits",
          ],
        },
        {
          type: "teach",
          title: "Risk Budgeting: Allocating Volatility",
          content:
            "Rather than allocating capital by dollar amount, sophisticated multi-strats allocate **risk** — measured in volatility or VaR — to each PM pod.\n\n**Risk budgeting process**:\n1. Set total fund target volatility (e.g., 10% annualized)\n2. Estimate each strategy's standalone volatility and correlations with others\n3. Solve for weights that achieve the target portfolio vol, given correlations\n4. Assign capital so each PM consumes their risk budget but no more\n\n**Marginal VaR contribution** is the key metric: how much does each additional dollar of PM X's risk increase total fund risk? Low-correlation strategies receive more generous budgets because their risk diversifies.\n\n**Rebalancing**: when correlations spike (e.g., a crisis), previously uncorrelated strategies suddenly move together. The risk desk must reduce exposure across the board to maintain the fund's target vol.",
          highlight: [
            "risk budgeting",
            "marginal VaR",
            "target volatility",
            "correlation spike",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A multi-strategy fund has two PM pods. Pod A (equity L/S) and Pod B (fixed income arb) historically have near-zero correlation. During a market crisis, their correlation spikes to +0.8. What should the risk desk do?",
          options: [
            "Increase allocations to both pods — high correlation means they are both working",
            "Reduce allocations to maintain the overall portfolio's target volatility",
            "Close Pod B entirely since it is now redundant with Pod A",
            "Do nothing — correlation spikes are temporary and self-correct",
          ],
          correctIndex: 1,
          explanation:
            "When previously uncorrelated strategies become correlated, portfolio volatility increases above target — two positions that used to offset each other now move together, amplifying total swings. The risk desk must reduce allocations across the board to bring portfolio volatility back to the target level.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Fund of Funds: Diversification at the Fund Level",
          content:
            "A **Fund of Funds (FoF)** invests in a portfolio of hedge funds rather than directly in securities. The FoF manager's job is to:\n\n- **Select** top-performing fund managers across strategies\n- **Allocate** capital across those funds based on risk/return profiles\n- **Monitor** ongoing performance, risk, and operational quality\n- **Rebalance** as manager performance and strategy outlooks change\n\n**Benefits for investors**:\n- Access to otherwise closed top-tier funds\n- Built-in diversification (no single-manager concentration)\n- Operational due diligence performed by the FoF team\n\n**The key criticism**: FoFs add a **second layer of fees** on top of the underlying fund fees, which severely erodes returns — especially in low-alpha environments.",
          highlight: [
            "fund of funds",
            "second layer of fees",
            "operational due diligence",
            "diversification",
          ],
        },
        {
          type: "teach",
          title: "The 2&20 Fee Structure & High-Water Mark",
          content:
            "Hedge funds traditionally charge **2&20**: a 2% annual management fee plus 20% performance fee on profits.\n\n**Management fee** (2%): charged on AUM regardless of performance. Pays for operations, salaries, infrastructure.\n\n**Performance fee** (20%): charged on profits above a hurdle rate (often 0% or the risk-free rate).\n\n**High-water mark (HWM)**: the fund must recover all previous losses before charging new performance fees. If a $1B fund falls to $800M, it must return to $1B before earning performance fees again — preventing managers from earning fees on the same gains twice.\n\n**The math impact**:\n- Gross return: 10%\n- After 2% management fee: 8%\n- After 20% performance fee on 8%: 6.4% net\n- A FoF adds another layer: ~1% management + 10% performance = net ~4.5%\n\nInstitutional investors increasingly negotiate lower fees (\"1&10\" or \"0&30\" structures).",
          highlight: [
            "2&20",
            "management fee",
            "performance fee",
            "high-water mark",
            "hurdle rate",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A hedge fund with a high-water mark provision can charge a performance fee even when the fund's current NAV is below its previous peak NAV.",
          correct: false,
          explanation:
            "The high-water mark prevents this. If the fund's NAV is below its previous peak, the fund must first recover to that peak before any new performance fees can be charged. This protects investors from paying performance fees twice on the same gains, and aligns manager incentives with investor outcomes over the full investment cycle.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "A hedge fund charges 2% management fee and 20% performance fee. An investor allocates $1,000,000 and the fund earns a 15% gross return in year one. Approximately what is the investor's net return?",
          options: [
            "15.0% — fees are negligible",
            "13.0% — only the management fee is deducted",
            "11.0% — only the performance fee is deducted",
            "Approximately 10–10.4% — after both management and performance fees",
          ],
          correctIndex: 3,
          explanation:
            "Management fee = 2% × $1,000,000 = $20,000. Gross profit = 15% × $1,000,000 = $150,000. Performance fee = 20% × $150,000 = $30,000. Net to investor ≈ $1,000,000 + $150,000 − $20,000 − $30,000 = $1,100,000 (10% net). Exact calculation varies by fee basis, but the key insight is that 2&20 reduces a 15% gross return to roughly 10–10.4% net.",
          difficulty: 2,
        },
      ],
    },
  ],
};
