import type { Unit } from "./types";

export const UNIT_RISK_MANAGEMENT: Unit = {
  id: "risk-management",
  title: "Risk Management Mastery",
  description: "Advanced techniques to protect capital and survive any market",
  icon: "ShieldCheck",
  color: "#ef4444",
  lessons: [
    /* ================================================================
       LESSON 1 — Position Sizing Fundamentals
       ================================================================ */
    {
      id: "rm-1",
      title: "Position Sizing Fundamentals",
      description:
        "Kelly criterion, fixed fractional, and risk-per-trade frameworks",
      icon: "Calculator",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Why Position Sizing Is Your #1 Risk Tool",
          content:
            "**Position sizing** — deciding how much capital to commit to each trade — is the most powerful lever in risk management. Two traders with identical entries and exits will have vastly different outcomes if one sizes correctly and the other does not.\n\nThere are four core methods:\n\n**1. Fixed Dollar** — always risk the same dollar amount (e.g., $500/trade). Simple but does not scale with account growth.\n\n**2. Fixed Fractional (% Risk)** — risk a constant percentage of current equity (e.g., 1%). Sizes grow with wins and shrink with losses automatically.\n\n**3. Kelly Criterion** — a mathematical formula that maximizes long-run geometric growth given your win rate and average win/loss ratio.\n\n**4. Anti-Martingale** — scale up after winners, scale down after losers. Opposite of the dangerous martingale strategy.\n\nProfessionals use fixed-fractional or Kelly-based sizing. Fixed dollar ignores account growth; martingale compounds losses.",
          visual: "risk-pyramid",
          highlight: [
            "position sizing",
            "fixed fractional",
            "Kelly Criterion",
            "anti-martingale",
          ],
        },
        {
          type: "teach",
          title: "Fixed Fractional: The Professional Standard",
          content:
            "The **fixed percentage rule** is the bedrock of institutional risk management.\n\n**Formula**: Shares = (Account Equity × Risk %) / (Entry − Stop)\n\nExample: $50,000 account, 1% risk, buy at $100, stop at $96.\nRisk per share = $4. Risk budget = $500. Shares = 500 / 4 = **125 shares**.\n\nMost professional retail traders risk **0.5%–2%** per trade. Hedge funds often use 0.1%–0.5%. Beginners should start at 0.5%.\n\n**Why it works**: automatic feedback loop. On a losing streak position sizes shrink, slowing the drawdown. On a winning streak they grow, accelerating gains. This convex payoff structure is the foundation of capital preservation.",
          highlight: ["0.5%–2%", "risk budget", "automatic feedback"],
        },
        {
          type: "quiz-mc",
          question:
            "You have a $60,000 account and risk 1.5% per trade. Your entry is $80 and stop-loss is $74. How many shares do you buy?",
          options: ["150 shares", "900 shares", "75 shares", "200 shares"],
          correctIndex: 0,
          explanation:
            "Risk budget = $60,000 × 1.5% = $900. Risk per share = $80 − $74 = $6. Shares = $900 / $6 = **150 shares**. Total position value is $12,000 (20% of account), but maximum capital at risk is capped at $900.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Kelly Criterion in Practice",
          content:
            "**Kelly % = W − (1 − W) / R**\n\nWhere W = win rate, R = average win ÷ average loss.\n\nExample: 55% win rate, average win $450, average loss $300 (R = 1.5).\nKelly = 0.55 − (0.45 / 1.5) = 0.55 − 0.30 = **25%**\n\nFull Kelly is mathematically optimal but dangerously volatile — estimates of W and R are noisy. A bad run can cause 50%+ drawdowns at full Kelly.\n\n**Solution**: use **half-Kelly or quarter-Kelly**. Half-Kelly achieves ~75% of maximum growth with dramatically lower variance. Quarter-Kelly achieves ~50% of max growth with very low volatility.\n\nKelly gives you a ceiling — always trade below it.",
          highlight: ["Kelly %", "half-Kelly", "quarter-Kelly"],
        },
        {
          type: "quiz-tf",
          statement:
            "The anti-martingale approach means increasing your position size after a series of winning trades.",
          correct: true,
          explanation:
            "Anti-martingale is the opposite of martingale. In martingale you double down after losses (extremely dangerous). In anti-martingale you increase size during winning streaks and reduce it during losing streaks — aligning your largest bets with your best form. This is the rationale behind professionals' 'confidence scaling.'",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader has a 50% win rate, average winner $800, average loser $400 (R = 2.0). Account is $100,000.",
          question:
            "What is the full Kelly percentage, and what fraction should be used in practice?",
          options: [
            "Full Kelly = 25%, use half-Kelly (12.5%) in practice",
            "Full Kelly = 50%, use full Kelly since win rate is only 50%",
            "Full Kelly = 12.5%, use full Kelly since it is already conservative",
            "Full Kelly = 40%, use quarter-Kelly (10%)",
          ],
          correctIndex: 0,
          explanation:
            "Kelly = W − (1−W)/R = 0.50 − (0.50/2.0) = 0.50 − 0.25 = **25%**. Full Kelly says risk 25% per trade — massively aggressive. Half-Kelly (12.5%) is the practical recommendation, giving ~75% of the theoretical growth rate with far lower drawdown risk.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Stop Loss Mastery
       ================================================================ */
    {
      id: "rm-2",
      title: "Stop Loss Mastery",
      description:
        "Hard stops, mental stops, ATR-based stops, and time-based exits",
      icon: "ShieldAlert",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Stop-Losses: Non-Negotiable Rules",
          content:
            "A **stop-loss** is a predetermined exit price that limits your loss on a trade. It is not a suggestion — it is a rule.\n\nWithout a stop, a small loss can become catastrophic. A 50% drawdown requires a 100% gain to break even. A 75% drawdown requires a 300% gain. Recovery math is brutally non-linear.\n\n**The four functions of a stop-loss**:\n1. Caps capital loss on a single trade\n2. Forces you to define the point where your thesis is wrong\n3. Removes emotion from the exit decision\n4. Preserves capital needed for the next opportunity\n\n**Hard stops vs mental stops**: hard stops are orders entered with your broker; mental stops exist only in your head. Research consistently shows mental stops fail — when price hits a mental stop, inertia, rationalization, and loss aversion cause traders to hold far too long.",
          visual: "candlestick",
          highlight: ["stop-loss", "thesis invalidation", "hard stop", "mental stop"],
        },
        {
          type: "teach",
          title: "ATR-Based Stops: Volatility-Adjusted Protection",
          content:
            "**Average True Range (ATR)** measures a stock's normal daily volatility. Stops as a multiple of ATR adapt to how much a stock naturally moves.\n\n**Formula**: Stop = Entry − (ATR × multiplier)\nCommon multipliers: 1.5× (tight), 2× (standard), 3× (wide/trend)\n\nExample: stock at $50, ATR(14) = $1.20, 2× multiplier.\nStop = $50 − $2.40 = **$47.60**\n\n**Why this beats fixed stops**: a 2% fixed stop on a stock with a 3% daily ATR will be hit by normal noise constantly. ATR-based stops 'breathe' with the market.\n\n**Chandelier Stop**: a popular trailing variant — Stop = Highest Close (last N bars) − ATR × multiplier. Ratchets up as the trade gains, locking in profits without capping upside.",
          highlight: ["ATR", "multiplier", "Chandelier Stop", "volatility-adjusted"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock is trading at $120. Its ATR(14) is $3.00. You use a 2.5× ATR stop. Where do you place your stop-loss?",
          options: ["$112.50", "$115.00", "$117.00", "$109.00"],
          correctIndex: 0,
          explanation:
            "Stop distance = ATR × multiplier = $3.00 × 2.5 = $7.50. Stop = $120.00 − $7.50 = **$112.50**. This stop is calibrated to the stock's natural volatility — far less likely to be triggered by routine noise than an arbitrary 5% fixed stop.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Structure-Based and Time-Based Stops",
          content:
            "**Structure-based stops** are placed just beyond a key technical level — below support for longs, above resistance for shorts. If the stock violates that level, the setup is broken.\n\n**Common placements**:\n- Below the prior swing low (breakout longs)\n- Below the consolidation base (flag/cup patterns)\n- Below the 20-day moving average (trend-following longs)\n\n**Round number trap**: never place your stop exactly at $50.00. Everyone else does too — prices often sweep to $49.80 before reversing. Place at $49.80 instead.\n\n**Time-based stops**: if a trade does not move in your favor within 3–5 days, exit regardless of price. Capital tied up in a non-performing trade has an opportunity cost. Breakouts that do not follow through within 3–5 bars have lost their momentum.",
          highlight: ["swing low", "round number trap", "time-based stop", "stop sweep"],
        },
        {
          type: "quiz-tf",
          statement:
            "You should widen your stop-loss if the trade moves against you slightly, to give it more room to recover.",
          correct: false,
          explanation:
            "Widening a stop after a trade moves against you is one of the most dangerous habits in trading. It violates your predefined risk plan and is driven by emotional reluctance to take a loss. The original stop was placed where your thesis is wrong — widening it means you will lose more before admitting the trade failed.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought a stock at $95 for a breakout. The prior swing low support is at $92. ATR(14) = $1.80; a 2× ATR stop gives $91.40. The round number $90 is nearby.",
          question: "Where is the most logical stop placement?",
          options: [
            "$91.80 — just below the $92 support, avoiding the $90 round-number trap",
            "$90.00 — round numbers are strong psychological support",
            "$93.20 — exactly 2% below entry for clean risk calculation",
            "$91.40 — the ATR stop takes precedence over all other methods",
          ],
          correctIndex: 0,
          explanation:
            "The best stop uses structure (just below the $92 swing low) and avoids the $90 crowd-level where stops are commonly swept. $91.80 places you below support with a small buffer. The ATR stop ($91.40) confirms this zone, adding conviction that the placement is well-calibrated.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Portfolio Risk Management
       ================================================================ */
    {
      id: "rm-3",
      title: "Portfolio Risk Management",
      description:
        "Correlation, diversification, max drawdown limits, and rebalancing",
      icon: "PieChart",
      xpReward: 85,
      steps: [
        {
          type: "teach",
          title: "Diversification: The Only Free Lunch",
          content:
            "**Diversification** reduces portfolio risk without reducing expected return — but it has limits. Every stock's risk has two components:\n\n- **Idiosyncratic (specific) risk** — unique to that company (earnings miss, lawsuit, fraud). Can be diversified away.\n- **Systematic (market) risk** — affects all stocks (recessions, rate hikes, market panics). Cannot be diversified away.\n\nResearch shows ~90% of diversification benefit is captured with **20–30 uncorrelated stocks**. Beyond 30, each addition delivers minimal benefit while making the portfolio harder to manage.\n\n**The diversification trap**: owning 50 tech stocks is not diversification — it is a concentrated tech bet disguised as diversity. True diversification requires different return drivers: sectors, geographies, asset classes.",
          visual: "portfolio-pie",
          highlight: [
            "idiosyncratic risk",
            "systematic risk",
            "20–30 uncorrelated",
          ],
        },
        {
          type: "teach",
          title: "Correlation and Max Drawdown Limits",
          content:
            "**Correlation** measures how two assets move relative to each other, from −1.0 to +1.0.\n\n- **+1.0**: Move in lockstep (e.g., two semiconductor ETFs)\n- **0**: No relationship (e.g., a gold miner and a software company)\n- **−1.0**: Perfect inverse (very rare in practice)\n\nCorrelations spike toward +1.0 during market crises (**correlation breakdown**) — exactly when you need diversification most, it evaporates.\n\n**Max drawdown limits** prevent catastrophic losses at the portfolio level:\n- Daily loss limit: stop trading when down 3% in a day\n- Weekly loss limit: reduce size when down 5% in a week\n- Monthly loss limit: review strategy when down 10% in a month\n\nThese limits, set when you are calm, protect you when emotions take over.",
          highlight: ["correlation", "correlation breakdown", "max drawdown limit"],
        },
        {
          type: "quiz-mc",
          question:
            "You hold 40 stocks in your portfolio but they are all growth tech companies. Which risk have you NOT reduced?",
          options: [
            "Systematic risk",
            "Idiosyncratic risk",
            "Company-specific risk",
            "Earnings surprise risk",
          ],
          correctIndex: 0,
          explanation:
            "**Systematic risk** — broad market/sector risk — cannot be eliminated by diversification. A portfolio of highly correlated assets has not even reduced idiosyncratic risk effectively. All 40 tech stocks will fall together when interest rates rise or the NASDAQ drops. True diversification requires uncorrelated return drivers.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Concentration Limits and Risk Parity",
          content:
            "Professional portfolio managers use **concentration limits** — rules capping the weight of any position, sector, or theme.\n\n**Typical limits**:\n- No single stock: more than 10–20% of portfolio equity\n- No single sector: more than 25–30% of portfolio equity\n- No correlated cluster: more than 40% of total risk budget\n\n**The 5% rule**: many hedge funds cap any single position at 5% of AUM. Losing 100% of a 5% position affects the portfolio by 5% — painful but survivable.\n\n**Risk parity thinking**: position size % is not the same as risk contribution %. A 5% position in a volatile biotech contributes more risk than a 10% position in a stable utility. Size each position so its **volatility contribution** to the portfolio is equal, not its dollar weight.",
          highlight: ["concentration limits", "5% rule", "risk parity", "volatility contribution"],
        },
        {
          type: "quiz-tf",
          statement:
            "Two stocks with a correlation of 0.95 provide nearly as much diversification benefit as two stocks with a correlation of 0.30.",
          correct: false,
          explanation:
            "A correlation of 0.95 means the stocks move almost identically — adding the second provides almost zero diversification. A correlation of 0.30 indicates a weak positive relationship, meaningfully reducing portfolio variance. Genuine diversification requires low or negative correlations between holdings.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have $100,000 and build a portfolio: 30% NVDA, 25% AMD, 20% MSFT, 15% GOOGL, 10% SPY.",
          question: "What is the primary problem with this allocation?",
          options: [
            "Excessive tech concentration — NVDA, AMD, MSFT, and GOOGL are all highly correlated mega-cap tech",
            "Too many positions — a concentrated portfolio in 3 names would be more efficient",
            "SPY should be the largest position, not the smallest",
            "The allocation is well-diversified since all four companies are in different sub-sectors",
          ],
          correctIndex: 0,
          explanation:
            "NVDA, AMD, MSFT, and GOOGL are large-cap technology companies with very high mutual correlations (often 0.7–0.9+). In a tech sell-off, all four drop together — 90% of the portfolio moves in the same direction. True diversification would include assets from different sectors with different economic drivers: energy, consumer staples, financials, international, or bonds.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Risk/Reward Ratios
       ================================================================ */
    {
      id: "rm-4",
      title: "Risk/Reward Ratios",
      description:
        "Minimum R:R standards, expectancy formula, and trade selection discipline",
      icon: "Scale",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Risk-Reward Ratio: The Gateway Filter",
          content:
            "The **Risk-Reward Ratio (R:R)** compares the potential loss (distance to stop) to the potential gain (distance to target).\n\nR:R = (Target Price − Entry) / (Entry − Stop Price)\n\nExample: Entry $50, Stop $48, Target $56.\nR:R = ($56 − $50) / ($50 − $48) = $6 / $2 = **3:1**\n\nThe **minimum professional standard** is **1:2 R:R** (risk $1 to make $2). Many traders require 1:3 or better.\n\n**Why this matters with win rate**: at 1:2 R:R, you only need to be right **34% of the time** to break even. At 1:3, you need only **25%**. A high R:R creates a margin of safety — you can be wrong more often than you are right and still profit over time.",
          visual: "candlestick",
          highlight: ["R:R ratio", "1:2", "1:3", "break-even win rate"],
        },
        {
          type: "teach",
          title: "Expectancy: The Math Behind Your Edge",
          content:
            "**Expectancy** tells you how much you expect to make per dollar risked, averaged over many trades.\n\n**Formula**: Expectancy = (Win Rate × Avg Win) − (Loss Rate × Avg Loss)\n\nOr in R-multiples: Expectancy = (W × Avg Win R) − (L × 1)\n\nExample: 45% win rate, average win 2.5R, average loss 1R.\nExpectancy = (0.45 × 2.5) − (0.55 × 1) = 1.125 − 0.55 = **+0.575R per trade**\n\nA system with positive expectancy makes money over enough trades even with a sub-50% win rate. A system with negative expectancy loses money even if you win 70% of the time (if the losses are large enough).\n\n**The law of large numbers**: expectancy only delivers its promise over many trades. Short-term results are dominated by variance — expect drawdowns even from excellent systems.",
          highlight: ["expectancy", "R-multiples", "positive expectancy", "variance"],
        },
        {
          type: "quiz-mc",
          question:
            "System A: 40% win rate, average win 3R, average loss 1R. System B: 70% win rate, average win 0.8R, average loss 1R. Which has higher expectancy?",
          options: [
            "System A (+0.60R) is higher than System B (+0.26R)",
            "System B because the win rate is much higher",
            "They are equal — win rate and R:R always balance out",
            "System A (+1.20R) is far higher than System B (+0.26R)",
          ],
          correctIndex: 0,
          explanation:
            "System A: (0.40 × 3) − (0.60 × 1) = 1.20 − 0.60 = **+0.60R**. System B: (0.70 × 0.8) − (0.30 × 1) = 0.56 − 0.30 = **+0.26R**. System A wins despite a lower win rate. High R:R compensates for lower win rates — this is why many momentum traders are right only 40% of the time but still profit consistently.",
          difficulty: 3,
        },
        {
          type: "teach",
          title: "Trade Selection: Only Take High R:R Setups",
          content:
            "Applying R:R discipline means **rejecting trades** that do not meet your minimum threshold, even if the setup looks attractive.\n\n**The pre-trade checklist**:\n1. Identify your stop level (structure-based or ATR-based)\n2. Identify your realistic target (next resistance, measured move)\n3. Calculate R:R = (Target − Entry) / (Entry − Stop)\n4. If R:R < 2.0, skip the trade — no exceptions\n\n**Common mistake**: moving the target higher to manufacture an acceptable R:R. The target must be set based on where the market will realistically go, not on what number you need to reach.\n\n**The asymmetric compounding effect**: trading only 1:3+ setups means even a 30% win rate generates +0.60R expectancy per trade. Over 200 trades that is +120R — compounded on a 1% risk budget, it turns $10,000 into nearly $34,000.",
          highlight: ["trade selection", "minimum 2:1", "pre-trade checklist", "asymmetric compounding"],
        },
        {
          type: "quiz-tf",
          statement:
            "A trading system with a 35% win rate can be consistently profitable over the long run.",
          correct: true,
          explanation:
            "Absolutely. If the average winner is large enough relative to the average loser, a 35% win rate system has positive expectancy. Example: 35% wins at 4R, 65% losses at 1R → expectancy = (0.35 × 4) − (0.65 × 1) = 1.40 − 0.65 = +0.75R per trade. Many successful trend-following CTAs have win rates below 40%.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are evaluating a trade. Entry: $200. Stop: $190 (risk = $10). Two possible targets: $220 (R:R 2:1) or $240 (R:R 4:1). Your historical win rate on similar setups is 45%.",
          question:
            "Which target maximizes expected value?",
          options: [
            "Target $240 — expectancy (0.45×4)−(0.55×1) = +1.25R vs $220 expectancy of +0.35R",
            "Target $220 — a closer target has a higher probability of being reached",
            "Both give equal expected value since the risk is the same",
            "Split the position: half to $220 and half to $240",
          ],
          correctIndex: 0,
          explanation:
            "Target $220: expectancy = (0.45 × 2) − (0.55 × 1) = 0.90 − 0.55 = **+0.35R**. Target $240: expectancy = (0.45 × 4) − (0.55 × 1) = 1.80 − 0.55 = **+1.25R**. If the 45% win rate applies equally to both targets, the $240 target delivers 3.6× higher expected value. The key assumption is that your win rate estimate is accurate for the extended target.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Psychological Risk Control
       ================================================================ */
    {
      id: "rm-5",
      title: "Psychological Risk Control",
      description:
        "Revenge trading, overtrading, discipline systems, and emotional circuit breakers",
      icon: "Brain",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "Revenge Trading: The Emotional Death Spiral",
          content:
            "**Revenge trading** is entering a new trade immediately after a loss — usually larger and more aggressive — in an attempt to 'make it back' quickly. It is driven entirely by emotion, not edge.\n\n**The revenge trading cycle**:\n1. Take a loss → feel frustrated and humiliated\n2. Enter a larger trade to recover faster\n3. This trade also loses (market conditions are often adverse)\n4. Loss is now significantly larger than the original\n5. Spiral continues until the account is seriously damaged\n\n**Why it always fails**: the decision is made under emotional stress, without your normal analysis process. You are trading to relieve emotional pain, not to profit. The market has no obligation to give you your money back.\n\n**The mandatory cooling-off rule**: after a loss exceeding 2× your normal risk, stop trading for the rest of the day. After three consecutive losses, stop for 24 hours.",
          highlight: [
            "revenge trading",
            "cooling-off rule",
            "emotional stress",
            "death spiral",
          ],
        },
        {
          type: "teach",
          title: "Overtrading: When More Becomes Less",
          content:
            "**Overtrading** means taking too many trades — either beyond your edge count or at times when no genuine setup exists.\n\n**Forms of overtrading**:\n- **Frequency overtrading**: taking 20 trades a day when your edge appears only 2–3 times\n- **Size overtrading**: position sizes beyond your risk plan\n- **Boredom trading**: entering trades because you need to be 'in the market'\n\n**The math of overtrading**: if your system has +0.5R expectancy on genuine setups but you also take 10 forced trades per day with −0.2R expectancy, you may be net negative even with a good system.\n\n**Solution — the trade quota**: define a maximum number of trades per day (e.g., 3–5). When your quota is reached, close your platform. Quality always beats quantity in trading.",
          highlight: ["overtrading", "boredom trading", "trade quota", "forced trades"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader loses on three consecutive trades today, totaling a 3% account loss. They see a high-momentum stock and are tempted to size up to 3% risk to recover losses in one trade. What is the correct response?",
          options: [
            "Stop trading for the day — frustration signals compromised judgment, sizing up risks a 6%+ total loss",
            "Take the trade at 3% — high momentum is a genuine signal worth exploiting",
            "Take the trade at 1.5% — a small size increase is a reasonable compromise",
            "Take the trade at 1% normal size since the setup qualifies",
          ],
          correctIndex: 0,
          explanation:
            "Three consecutive losses is the exact trigger for the cooling-off rule. The emotional state (frustration, desire to recover) clouds judgment. The 'high momentum' observation may be a rationalization, not objective edge reading. Stopping costs nothing but preserves capital. Revenge trading with 3% risk after a 3% down day risks ending down 6% or more — a severe drawdown from one session.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Building a Discipline System",
          content:
            "Discipline is not willpower — it is **system design**. Willpower is finite and degrades under stress. Systems are automatic.\n\n**Core components of a discipline system**:\n\n1. **Pre-market routine**: review key levels, set daily loss limit, identify the 2–3 best setups — before markets open.\n\n2. **Trade journal**: log every trade with entry reason, exit reason, emotion rating (1–10), and R multiple. Patterns in poor decisions become visible.\n\n3. **Circuit breakers**: hard rules that force a pause — e.g., stop trading if down 2% in a session, if you enter 3 trades in 10 minutes, or if you override a stop.\n\n4. **End-of-day review**: a 5-minute review of every trade taken vs. the plan. Was the trade in the plan? Was sizing correct? Was emotion a factor?\n\nProfessional traders at top firms follow process-driven protocols. Their edge is not intelligence — it is consistency.",
          highlight: [
            "discipline system",
            "trade journal",
            "circuit breakers",
            "pre-market routine",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Emotional discipline in trading can be treated as a skill that improves with deliberate practice, just like technical analysis.",
          correct: true,
          explanation:
            "Emotional discipline is absolutely a trainable skill. Deliberate practice — journaling, reviewing past emotional mistakes, setting and following rules — builds the same neural pathways as any other skill. Top trading firms run psychology programs and require traders to journal precisely because they know emotional control is trainable. 'I am just emotional' is not a fixed trait — it is a skill gap.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader has been profitable for three months but notices their win rate dropped from 52% to 38% this month. They also notice they have been taking an average of 8 trades per day vs. their normal 3.",
          question:
            "What is the most likely root cause, and what should they do?",
          options: [
            "Overtrading — the extra 5 forced trades per day likely lack genuine edge; reduce to 3 high-quality setups and review the journal",
            "Their edge has permanently disappeared — they should stop trading and find a new strategy",
            "The market has changed — they should increase trade frequency to adapt",
            "A 38% win rate is still profitable if R:R is above 1.6:1 — no action needed",
          ],
          correctIndex: 0,
          explanation:
            "The simultaneous drop in win rate and increase in trade frequency is a classic overtrading signature. The extra trades are almost certainly low-quality or emotionally driven. The prescription: reduce to the 3-trade quota that worked before, review the journal for which trade types are failing, and check whether the extra trades are being taken near the end of sessions or after losses (revenge patterns). The edge is not gone — it is being diluted.",
          difficulty: 3,
        },
      ],
    },
  ],
};
