import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_FINANCE: Unit = {
  id: "behavioral-finance",
  title: "Behavioral Finance",
  description:
    "Understand cognitive biases, prospect theory, market anomalies, and how to exploit behavioral edges",
  icon: "Brain",
  color: "#8b5cf6",
  lessons: [
    // ─── Lesson 1: Prospect Theory & Loss Aversion ────────────────────────────
    {
      id: "bf-1",
      title: "🧠 Prospect Theory & Loss Aversion",
      description:
        "Kahneman & Tversky's value function, loss aversion coefficient, certainty effect, and the disposition effect",
      icon: "Brain",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📐 The S-Curve Value Function",
          content:
            "In 1979, psychologists **Daniel Kahneman** and **Amos Tversky** published Prospect Theory — the most influential paper in behavioral economics and a direct challenge to the idea that people make rational, utility-maximizing decisions.\n\nThe core insight: people evaluate outcomes relative to a **reference point** (usually the status quo), not absolute wealth levels. And the function that maps outcomes to perceived value has a distinctive **S-shape**:\n\n**Gains domain (upper-right curve):**\n- Concave — each additional dollar gained is valued less than the previous dollar\n- Going from $0 to $100 feels better than $900 to $1,000, even though both are identical dollar gains\n- Reflects diminishing marginal sensitivity to gains\n\n**Losses domain (lower-left curve):**\n- Convex — each additional dollar lost is valued more painfully than the previous dollar\n- Going from $0 to -$100 hurts more than -$900 to -$1,000\n- Same diminishing sensitivity but in the loss domain\n\n**The critical asymmetry:** The loss curve is *steeper* than the gain curve. A $1,000 loss creates approximately **2.25× the emotional pain** of the pleasure a $1,000 gain generates. This ratio is called the **loss aversion coefficient (λ ≈ 2.25)**.\n\nKahneman was awarded the **Nobel Prize in Economics in 2002** for this work.",
          highlight: ["Kahneman", "Tversky", "Prospect Theory", "S-curve", "loss aversion coefficient", "reference point"],
        },
        {
          type: "teach",
          title: "🎲 Certainty Effect & Reflection Effect",
          content:
            "Two additional distortions arise from the S-shaped value function:\n\n**The Certainty Effect:**\nPeople **overweight outcomes that are certain** relative to outcomes that are merely probable — even when the expected values are identical.\n\nKahneman & Tversky's classic choice:\n- Option A: 100% chance of winning $3,000\n- Option B: 80% chance of winning $4,000 (EV = $3,200)\n\nMost people choose A — sacrificing $200 in expected value for certainty. In markets: investors exit winning positions early to lock in 'sure' gains, even when holding has higher expected value.\n\n**The Reflection Effect:**\nSwitch the above to losses:\n- Option C: 100% chance of losing $3,000\n- Option D: 80% chance of losing $4,000 (EV = -$3,200)\n\nNow most people choose D — they become **risk-seeking** to avoid a certain loss. In markets: investors hold losing positions (gambling on recovery) rather than taking the certain smaller loss.\n\nResult:\n- **Risk-averse for gains** → sell winners too early\n- **Risk-seeking for losses** → hold losers too long\n\nThis is the behavioral foundation of the **disposition effect** — one of the most damaging trading mistakes.",
          highlight: ["certainty effect", "reflection effect", "risk-averse", "risk-seeking", "expected value"],
        },
        {
          type: "teach",
          title: "💼 The Disposition Effect in Practice",
          content:
            "**The Disposition Effect** (Shefrin & Statman, 1985): Investors systematically sell winners too early and hold losers too long.\n\nThis emerges directly from Prospect Theory:\n- When a position is profitable, investors are in the **gain domain** → risk-averse → prefer the certainty of booking the gain\n- When a position is losing, investors are in the **loss domain** → risk-seeking → prefer to gamble on recovery rather than take the certain loss\n\n**Empirical evidence:**\n- Study of 10,000+ brokerage accounts: investors were **1.5× more likely** to sell a winner than a loser on any given day\n- Mutual fund managers exhibit the same bias despite professional training\n- Stocks that investors held (losers) subsequently underperformed; stocks they sold (winners) continued to outperform — the bias has real return costs\n\n**Why this destroys returns:**\n- Tax inefficiency: realizing gains early triggers capital gains taxes; holding losers forgoes tax-loss harvesting benefits\n- Return drag: you keep the underperformers and shed the outperformers\n- Momentum: winners tend to keep winning; by selling, you miss momentum returns\n\n**The fix:** Pre-commit to exit rules *before* entry, when your thinking is unbiased by gains or losses. Use trailing stops for winners; set hard stops for losers.",
          highlight: ["disposition effect", "sell winners", "hold losers", "brokerage accounts", "trailing stops", "pre-commit"],
        },
        {
          type: "quiz-mc",
          question:
            "You are offered two options: (A) a guaranteed $500 gain, or (B) a 60% chance of gaining $900 (EV = $540). Most people pick A despite lower expected value. Which Prospect Theory concept explains this?",
          options: [
            "Certainty effect — people overweight certain outcomes vs. probabilistic ones, sacrificing EV for guarantee",
            "Reflection effect — risk-seeking behavior in the loss domain",
            "Loss aversion — the fear that Option B could result in $0",
            "Anchoring — fixating on the $500 reference point",
          ],
          correctIndex: 0,
          explanation:
            "The certainty effect (part of Prospect Theory) explains why people systematically prefer certain outcomes over probabilistic ones with higher expected value. Option A ($500 certain) beats Option B (EV $540) in most people's choices, despite being $40 worse in expected value terms. In trading, this manifests as exiting winning trades early to lock in 'sure' profits rather than holding for larger expected gains.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "According to the reflection effect in Prospect Theory, investors become risk-averse when their position is at a loss, preferring the certainty of a smaller loss over gambling on a recovery.",
          correct: false,
          explanation:
            "The reflection effect says the opposite: investors become **risk-seeking** in the loss domain. They prefer to gamble on a recovery (Option D: 80% chance of losing more) rather than accept a certain smaller loss (Option C: 100% chance of losing less). This is why traders hold losers too long — the pain of certain loss drives them to take on more risk in hopes of avoiding that loss. Risk-seeking in losses is the mirror image of risk-aversion in gains.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Two investors both hold a stock that fell 25%. Investor A has a cost basis of $100 (stock now at $75). Investor B entered at $80 (stock also at $75). Prospect Theory predicts both will be reluctant to sell — but Investor A should be significantly more reluctant. The stock has a 50% chance of recovering to $100 and a 50% chance of falling to $50.",
          question: "What does Prospect Theory predict about each investor, and why?",
          options: [
            "Both exhibit the disposition effect, but Investor A more strongly — the larger unrealized loss (-$25 vs -$5) places Investor A deeper in the loss domain, amplifying risk-seeking behavior",
            "Investor B is more reluctant — the smaller loss ($5) feels more certain and triggers loss aversion",
            "Prospect Theory predicts identical behavior for both since the current stock price is the same",
            "Investor A is actually more likely to sell — larger losses override the risk-seeking impulse",
          ],
          correctIndex: 0,
          explanation:
            "Prospect Theory evaluates outcomes relative to each investor's reference point (their purchase price). Investor A is $25 in the hole; Investor B is only $5 down. Because Investor A is deeper in the loss domain, the value function's convexity amplifies risk-seeking behavior more strongly. Larger unrealized losses create greater reluctance to realize them — which is why investors often 'double down' on large losers rather than cutting them. Both investors see the same stock, but face different behavioral pressures due to different reference points.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Cognitive Biases in Markets ────────────────────────────────
    {
      id: "bf-2",
      title: "🔍 Cognitive Biases in Markets",
      description:
        "Anchoring, representativeness, availability heuristic, overconfidence, and hindsight bias",
      icon: "Search",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⚓ Anchoring & Representativeness",
          content:
            "**Anchoring Bias:**\nThe first number you see becomes a cognitive anchor — you make insufficient adjustments away from it even when it is irrelevant.\n\nMarket manifestations:\n- **Analyst estimates**: Analysts anchor to prior-year earnings, adjusting too slowly for structural changes. When a company transforms its business model, estimates lag reality by quarters.\n- **52-week high**: A stock at $75 feels 'cheap' when the 52-week high is $180 — even if intrinsic value is $60. The $180 anchor distorts judgment.\n- **IPO anchor**: Early trading price becomes the reference, causing investors to dismiss whether the price reflects fair value vs. early speculation.\n- **Round numbers**: $100, $50, $1,000 act as psychological anchors for price targets, creating support/resistance that is self-fulfilling through anchoring alone.\n\n**Representativeness Heuristic:**\nJudging probability by how closely something resembles a prototype, ignoring base rates.\n\n- **Hot hand fallacy in fund selection**: A fund manager with 3 stellar years is assumed to be skilled, ignoring that even random coin-flippers produce 3-year streaks. Base rate: most outperformance is luck.\n- **Pattern projection**: 'This chart looks exactly like Apple in 2012' — short records get misread as reliable causal patterns.\n- **Story stocks**: Companies that 'look like' early-stage transformational companies get valued like them, regardless of actual business quality.",
          highlight: ["anchoring", "52-week high", "analyst estimates", "representativeness", "hot hand fallacy", "base rates"],
        },
        {
          type: "teach",
          title: "📰 Availability Heuristic & Overconfidence",
          content:
            "**Availability Heuristic:**\nEstimating probability by how easily examples come to mind — vivid, recent, or dramatic events are overweighted.\n\nTrading consequences:\n- After a crash: 'The market could collapse again any day' — crash risk feels much higher than base rates justify\n- After meme stock mania: every retail-driven surge feels like a meme opportunity, even in unrelated contexts\n- Media amplification: dramatic corporate failures dominate headlines; the thousands of stable, profitable companies generate no news — creating a survivorship-distorted probability map\n- Post-pandemic: supply chain disruptions, inflation, remote work effects all feel more permanent because they're vivid and recent\n\n**Overconfidence Bias:**\nTraders consistently overestimate both their skill and the precision of their forecasts.\n\nDocumented evidence:\n- **80% paradox**: Studies show 80% of investors believe they are above-average investors — mathematically impossible for the majority\n- **Gender gap**: Men trade 67% more than women and earn 1% less annually (Barber & Odean, 2001) — overconfidence drives overtrading and transaction costs\n- **Precision bias**: Asked for 90% confidence intervals on stock price forecasts, investors' actual correct ranges cover only 50–60% of outcomes — they are far more certain than accuracy warrants\n- **Streak effect**: Win streaks spike overconfidence exactly when humility is most needed\n\nOverconfidence is the one bias that is highly correlated with trading frequency — the most confident traders trade most and earn least.",
          highlight: ["availability heuristic", "overconfidence", "80% paradox", "overtrading", "precision bias"],
        },
        {
          type: "teach",
          title: "🔮 Hindsight Bias & Its Hidden Cost",
          content:
            "**Hindsight Bias:** After an event occurs, people believe they 'knew it all along' — even when they demonstrably did not.\n\n'I knew the 2008 crisis would happen.'\n'It was obvious Tesla would go to $1,000.'\n'Anyone could see the dot-com bubble was going to burst.'\n\nAt the time, very few predicted these outcomes. The hindsight bias rewrites memory to make outcomes seem inevitable.\n\n**Why hindsight bias is dangerous for learning:**\n- It prevents genuine post-trade review — 'I knew I should have held, so next time I'll just hold' replaces actual analysis\n- It inflates confidence without improving skill — you feel like you understood the market when you only rationalized after the fact\n- It makes rare events (crashes, short squeezes) feel more predictable than they are, leading to overconfidence in predictions\n- **No lesson is learned** from mistakes that are reinterpreted as 'what I knew all along'\n\n**The fix: Write predictions down before they happen.**\n- Maintain a predictions journal: 'I believe X will happen because Y. I will review this in 4 weeks.'\n- When you revisit, your original thesis is preserved — hindsight cannot rewrite a written record\n- Track your hit rate over 50+ predictions; most traders are shocked to find accuracy well below their felt confidence\n- This creates genuine calibration — the foundation of probabilistic thinking",
          highlight: ["hindsight bias", "predictions journal", "calibration", "post-trade review", "wrote down"],
        },
        {
          type: "quiz-mc",
          question:
            "A fund manager has delivered top-decile returns for 5 consecutive years. Investors pour money in, assuming strong skill. A statistician notes that in a universe of 1,000 managers, approximately 31 would achieve a 5-year top-decile streak by pure chance (~0.9^5 ≈ 59% stay in bottom 90%, so ~10^5 = 1 in 100,000... actually 0.1^5 × 1000 = 0.1 → about 1 in 10,000; simpler: 1,000 managers × (1/3)^5 ≈ 0.4 per quintile streak). Which bias explains investors' neglect of this base rate?",
          options: [
            "Representativeness — the track record 'looks like' a skilled manager and investors ignore the statistical base rate of lucky streaks",
            "Anchoring — investors anchor to the 5-year return figure",
            "Availability heuristic — the 5-year period is vivid and recent",
            "Overconfidence — the manager's own belief in his skill",
          ],
          correctIndex: 0,
          explanation:
            "Representativeness causes investors to judge the manager as skilled because his track record 'resembles' a skilled manager prototype. They neglect the base rate: in a large universe of managers, multi-year streaks occur by chance alone. Kahneman called this 'the law of small numbers' — people see patterns in short sequences that have no predictive validity. Proper evaluation requires base-rate thinking: what fraction of managers with this track record are genuinely skilled vs. lucky?",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Hindsight bias primarily causes investors to be too pessimistic about future events because they remember past crashes so vividly.",
          correct: false,
          explanation:
            "Hindsight bias does not make investors pessimistic — it makes them falsely certain. After a crash, hindsight bias causes investors to believe they 'knew it was coming,' which inflates confidence rather than creating appropriate humility. The availability heuristic (not hindsight bias) makes recent crashes feel more likely to recur. Hindsight bias's main harm is preventing genuine learning from mistakes, because outcomes are reinterpreted as having been predictable, so no actual analytical lesson is extracted.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "After a biotech stock surges 200% on FDA approval news, a retail investor tells friends: 'I always knew it would get approved — the trial data was obviously strong.' Her trade log shows she actually sold half her position two weeks before the announcement, citing 'uncertainty about the outcome.' The FDA approval genuinely surprised the market.",
          question: "What is this investor exhibiting, and what is the concrete harm?",
          options: [
            "Hindsight bias — her memory is rewriting the past, preventing her from learning why she undersized the position and sold early",
            "Overconfidence — she is bragging to friends about a lucky outcome",
            "Availability heuristic — the 200% surge makes future FDA plays feel more achievable",
            "Representativeness — she is projecting this stock's pattern to all biotech names",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook hindsight bias case. Her trade log proves she was uncertain (she sold half before announcement), but after the event her memory reconstructs a narrative of prescient certainty. The concrete harm: she misses the lesson about position sizing under genuine uncertainty. Instead of analyzing 'how should I size a position in binary-outcome events?' she concludes she is good at FDA prediction — a false lesson that will lead to oversizing future binary bets.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Market Anomalies & Behavioral Arbitrage ────────────────────
    {
      id: "bf-3",
      title: "📈 Market Anomalies & Behavioral Arbitrage",
      description:
        "PEAD, value premium, momentum effect, calendar anomalies, and limits to arbitrage",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🚀 Post-Earnings Announcement Drift (PEAD)",
          content:
            "**Post-Earnings Announcement Drift (PEAD)** is one of the most replicated and studied anomalies in finance — and one of the clearest signatures of behavioral bias.\n\n**What it is:**\nAfter a company reports earnings that *surprise* the market (beat or miss expectations), prices do not immediately adjust to full information. Instead, they **drift** in the direction of the surprise for 3–6 months.\n\n- Positive surprise → stock keeps drifting up\n- Negative surprise → stock keeps drifting down\n\n**Why it persists (behavioral explanation):**\n- Investors **underreact** to earnings surprises — they update beliefs too slowly\n- Anchoring to prior expectations: 'The company usually earns ~$1 per quarter' — a $1.40 beat takes time to be recalibrated into a new baseline\n- Attention limits: most investors don't read full earnings transcripts; they react to headlines and gradually absorb details over weeks\n- Institutional sluggishness: large fund mandates prevent immediate position changes post-earnings\n\n**Exploiting PEAD:**\n- After a large positive surprise, buy the stock within a few days post-announcement\n- Hold for 3–6 months (the average drift window)\n- Use Standardized Unexpected Earnings (SUE) rank: top-quintile positive surprises historically outperform bottom-quintile by ~8–10% over 60 trading days\n- First documented by Ball & Brown in 1968 — the anomaly has persisted for 50+ years despite widespread knowledge of it",
          highlight: ["PEAD", "underreaction", "earnings surprise", "drift", "SUE rank", "Ball Brown"],
        },
        {
          type: "teach",
          title: "💎 Value Premium & Momentum Effect",
          content:
            "**Value Premium:**\nStocks trading at low multiples (P/E, P/B, EV/EBITDA) historically outperform high-multiple 'glamour' stocks over long horizons.\n\nBehavioral explanation — **overreaction and extrapolation**:\n- Investors extrapolate recent growth rates too far into the future, overpaying for glamour companies\n- They overreact to bad news for cheap/value companies, driving prices below fair value\n- Mean reversion eventually disappoints glamour investors and surprises value investors\n- Fama and French (1992) formalized this as the value factor; debate continues: behavioral mispricing vs. distress risk premium\n\n**Momentum Effect:**\nStocks that have performed well over the past 3–12 months tend to continue outperforming for another 3–12 months (Jegadeesh & Titman, 1993).\n\nBehavioral explanation — **underreaction**:\n- Markets underreact to good news → prices drift up gradually\n- Anchoring prevents immediate full repricing\n- Herding amplifies as more investors pile in after the trend becomes visible\n- Evidence: ~1% per month alpha in long-short momentum strategies across 40+ countries\n\n**The irony:** Value and momentum represent opposite behavioral failures:\n- Value exploits **overreaction** (too negative on bad stocks)\n- Momentum exploits **underreaction** (too slow to reprice good stocks)\nBoth can be true simultaneously in different parts of the market.",
          highlight: ["value premium", "glamour stocks", "overreaction", "momentum effect", "underreaction", "Jegadeesh Titman"],
        },
        {
          type: "teach",
          title: "📅 Calendar Anomalies & Limits to Arbitrage",
          content:
            "**Calendar Anomalies:**\nPredictable return patterns based on calendar timing — violations of market efficiency driven by behavioral patterns.\n\n- **January Effect**: Small-cap stocks outperform in January. Explanation: tax-loss selling in December (investors dump losers for tax deductions) → prices suppressed → January rebound as reinvestment occurs.\n- **Turn-of-month effect**: Last 3 and first 3 trading days of each month outperform mid-month. Linked to monthly salary/pension fund inflows.\n- **Day-of-week effect**: Historically, Friday returns are positive (optimism before weekend); Monday returns are negative (weekend news, pessimism). Effect has weakened with electronic trading.\n- **Pre-holiday effect**: Days before major holidays show positive abnormal returns.\n\n**Why don't these get arbitraged away?**\n**Limits to Arbitrage** (Shleifer & Vishny, 1997):\n1. **Noise trader risk**: Even if you are right fundamentally, mispricing can worsen before correcting — you can lose before being proven right\n2. **Short selling costs**: Borrowing fees, dividends on short positions, margin requirements\n3. **Career risk**: Fund managers who take contrarian positions face redemptions if the position runs against them before correcting\n4. **Synchronization risk**: You need other arbitrageurs to trade simultaneously — coordination failure leaves mispricing uncorrected\n\nResult: Behavioral biases create predictable patterns, but the *cost and risk* of exploiting them limits how quickly they are arbitraged away — allowing anomalies to persist for decades.",
          highlight: ["January effect", "turn-of-month", "limits to arbitrage", "noise trader risk", "career risk", "Shleifer Vishny"],
        },
        {
          type: "quiz-mc",
          question:
            "A company reports earnings that beat consensus estimates by 40%. You are considering exploiting PEAD. Based on behavioral finance research, which strategy best captures the anomaly?",
          options: [
            "Buy the stock within a few days post-announcement and hold for 3–6 months, capturing the gradual underreaction drift",
            "Short the stock immediately after the pop — overreaction will reverse within a week",
            "Wait 6 months for the full underreaction to play out, then buy on mean reversion",
            "Buy on the day before earnings — the market pre-prices positive surprises",
          ],
          correctIndex: 0,
          explanation:
            "PEAD is driven by investor underreaction — prices drift upward for 3–6 months as the market gradually incorporates the positive surprise. The optimal strategy is to buy shortly after the announcement (once the initial surge settles) and hold through the drift period. Shorting after a pop exploits overreaction, which is the opposite of the PEAD mechanism. The anomaly is well-documented: top-quintile positive surprises outperform bottom-quintile by ~8–10% over 60 trading days, on average.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "If a market anomaly is widely known and published in academic journals, rational arbitrageurs will immediately trade away all excess returns, so anomalies cannot persist once discovered.",
          correct: false,
          explanation:
            "The limits to arbitrage framework explains why anomalies persist even after being published. Noise trader risk, short selling costs, career risk, and synchronization failure prevent full arbitrage. PEAD has been documented since 1968, yet still generates excess returns. The momentum effect was published in 1993 and remains exploitable. The barriers to arbitrage — not ignorance — are what sustain these anomalies. A well-known anomaly that requires risk, capital, and patience to exploit will survive alongside sophisticated investors.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A hedge fund manager correctly identifies that a stock is 50% overvalued due to momentum herding and investor overreaction. She short sells. The stock then rallies another 30% over the next 6 months as momentum continues. Her fund suffers heavy losses. Investors withdraw capital. She is forced to close the short — just before the stock collapses 60%.",
          question: "Which concept from behavioral arbitrage theory does this illustrate?",
          options: [
            "Limits to arbitrage — noise trader risk and career risk prevented rational arbitrage from correcting the mispricing before it became untenable",
            "Overconfidence — the manager was wrong about the overvaluation",
            "Herding — she followed other short sellers into an overcrowded trade",
            "PEAD — the post-earnings drift continued beyond her position horizon",
          ],
          correctIndex: 0,
          explanation:
            "This is the canonical illustration of Shleifer & Vishny's limits to arbitrage. The manager was fundamentally correct (the stock was overvalued) but could not sustain the position long enough for the mispricing to correct. Noise trader risk (momentum extended mispricing) and career risk (fund redemptions forced closure) are the exact barriers arbitrage theory predicts. As Keynes noted: 'The market can remain irrational longer than you can remain solvent.' Smart money cannot always correct mispricing within the timeframe required to survive.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Social & Herding Behavior ─────────────────────────────────
    {
      id: "bf-4",
      title: "🐑 Social & Herding Behavior",
      description:
        "Herding models, information cascades, bubble mechanics, sentiment indicators, and meme stocks",
      icon: "Users",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏛️ Institutional Herding & Career Concerns",
          content:
            "**Herding** in financial markets occurs when investors mimic each other's trades rather than acting on independent analysis.\n\n**Why institutions herd (career concerns model):**\nThe career concerns model (Scharfstein & Stein, 1990) explains rational institutional herding:\n- If a fund manager underperforms by following the crowd, the blame is diffused — 'everyone was wrong'\n- If a manager takes a contrarian position and is wrong alone, career damage is severe\n- The asymmetry creates incentives to mimic peers, even when private analysis suggests a different view\n- *Being wrong in a crowd is survivable; being wrong alone is career-ending*\n\nEmpirical evidence:\n- Mutual fund managers buy stocks that other managers recently purchased\n- Analysts herd on recommendations — upgrading after peers upgrade, downgrading after peers downgrade\n- Institutional holdings are more correlated than would be expected if managers traded independently\n- This herding amplifies price movements — many institutions buying simultaneously drives prices above fundamental value\n\n**The individual investor version:**\n- Social proof: 'If 1 million Reddit users are buying, they must know something'\n- FOMO amplifies social herding — fear of missing a move others are experiencing\n- Herding feels rational (others may have information you lack) but is self-reinforcing",
          highlight: ["herding", "career concerns model", "mutual fund managers", "social proof", "FOMO", "Scharfstein Stein"],
        },
        {
          type: "teach",
          title: "🌊 Information Cascades & Bubble Mechanics",
          content:
            "**Information Cascades** (Bikhchandani, Hirshleifer & Welch, 1992):\nA cascade occurs when rational individuals observe others' actions and conclude the aggregate signal outweighs their own private information — even if the crowd is wrong.\n\nClassic sequence:\n1. Person A has a positive private signal → buys\n2. Person B has a positive signal, also saw A buy → buys (reinforced)\n3. Person C has a **negative** private signal but sees A and B buying → ignores own signal, buys to follow the herd\n4. From C onward: all private signals are overridden; the cascade locks in regardless of underlying truth\n\nCascades are *fragile*: a single credible public signal can instantly reverse them, triggering cascade collapse.\n\n**Kindleberger's 5-Stage Bubble Model:**\n1. **Displacement**: A new technology or policy captures imagination (internet, cheap credit, crypto)\n2. **Boom**: Prices rise, media attention grows, credit expands, new investors enter\n3. **Euphoria**: Traditional valuation abandoned — 'this time is different.' Everyone is making money. Leverage soars.\n4. **Distress**: Insiders quietly exit. Prices plateau. Cracks appear. Margin calls begin.\n5. **Revulsion**: Panic selling, forced liquidations, credit withdrawal, prices overshoot downward\n\nEach stage feeds the next through positive feedback loops until external shock or credit tightening triggers the turn.",
          highlight: ["information cascade", "Bikhchandani", "5 stages", "Kindleberger", "displacement", "euphoria", "revulsion"],
        },
        {
          type: "teach",
          title: "📊 Sentiment Indicators & Meme Stocks",
          content:
            "**Behavioral Sentiment Indicators:**\n\n- **AAII Investor Sentiment Survey**: Weekly survey of retail investors' bullish/bearish/neutral outlook. Historically a contrarian signal — extreme bullishness near tops, extreme bearishness near bottoms.\n- **Put/Call Ratio**: High P/C (many puts vs. calls) indicates fear and excessive bearishness — often a contrarian buy signal. Low P/C indicates complacency — often a warning.\n- **VIX (CBOE Volatility Index)**: 'Fear gauge' measuring implied volatility in S&P 500 options. VIX > 30 typically signals panic; VIX < 15 signals complacency. Contrarian: extreme VIX spikes often coincide with near-term market bottoms.\n- **Short Interest**: High short float can signal either informed bearish conviction OR potential short-squeeze fuel.\n\n**Meme Stocks and Social Sentiment:**\nGameStop (2021) demonstrated a new dynamic:\n- Reddit's WallStreetBets coordinated retail buying, driving a heavily shorted stock from $20 to $483 in 2 weeks\n- Social sentiment (measured by Reddit post volume, Twitter mentions) became a leading indicator — preceding price moves by hours\n- Information driven by social narrative (vs. fundamentals) can temporarily overwhelm traditional valuation\n- However: social momentum is highly unstable — when the narrative shifts, the reversal is fast and brutal\n\n**Key distinction**: Social sentiment creates momentum-driven moves, not fundamental value. Trading social sentiment requires precise risk management and fast exits.",
          highlight: ["AAII survey", "put/call ratio", "VIX", "fear gauge", "meme stocks", "GameStop", "social sentiment"],
        },
        {
          type: "quiz-mc",
          question:
            "A meme stock (XYZ) has no earnings, $5 in intrinsic value by any fundamental method, but is trading at $180 driven by Reddit hype and a short squeeze. A value investor shorts at $180; a momentum trader goes long. Three weeks later, XYZ crashes to $22. Which perspective does behavioral finance support?",
          options: [
            "Both were reasonable given their strategies — the value investor was correct about fundamentals but faced limits to arbitrage risk; the momentum trader captured the social cascade but needed an exit strategy",
            "The value investor was always correct and the momentum trader was foolish — fundamentals always win",
            "The momentum trader was right and the value investor was wrong — social sentiment is a valid fundamental",
            "Both were wrong — no rational strategy works on meme stocks",
          ],
          correctIndex: 0,
          explanation:
            "Behavioral finance recognizes that fundamentals and social cascades can coexist but operate on different timescales. The value investor was fundamentally correct (social cascade artificially inflated price) but faced the classic limits-to-arbitrage problem — the short could have run to $400 before reversing, triggering margin calls. The momentum trader was correct in identifying the social cascade but needed a clear exit rule; riding social momentum requires accepting it is not fundamental and requires fast exits when sentiment shifts.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "The VIX is a direct measure of current market volatility — it tracks how much the S&P 500 has moved over the past 30 days.",
          correct: false,
          explanation:
            "The VIX measures *implied* volatility — the market's forecast of future volatility derived from options pricing — not historical realized volatility. It reflects the price investors are paying for options protection (their fear level), not what volatility has been. A high VIX means market participants are paying elevated premiums for downside protection, indicating fear or uncertainty about the near future. Historical volatility (how much the market actually moved) is a different, backward-looking measure.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "In early 2000, the AAII sentiment survey showed 75% bulls — an all-time record high. The put/call ratio had fallen to 0.35 (extreme complacency). Three months later the Nasdaq peaked and fell 78% over the next two years. An investor using these sentiment indicators as contrarian signals would have been positioned defensively.",
          question: "How should behavioral finance practitioners use sentiment indicators?",
          options: [
            "As contrarian signals — extreme bullishness near tops and extreme bearishness near bottoms, combined with other evidence, suggests mean reversion is likely",
            "As momentum signals — extreme bullishness confirms the uptrend and suggests buying aggressively",
            "Sentiment indicators have no predictive value and should be ignored in favor of pure fundamentals",
            "Only the VIX is a valid indicator; AAII surveys are too small a sample to be useful",
          ],
          correctIndex: 0,
          explanation:
            "Behavioral finance uses sentiment indicators as contrarian tools. Extreme bullishness (AAII 75% bulls, low put/call) signals that most market participants are already long and optimistic — there are few additional buyers left to push prices higher, while any disappointment triggers selling. Extreme bearishness signals the opposite. The 2000 case is emblematic: maximum sentiment at the market peak is a behavioral signature of the euphoria phase in Kindleberger's bubble model. These signals work best when multiple sentiment indicators align and diverge sharply from historical norms.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Debiasing & Behavioral Alpha ───────────────────────────────
    {
      id: "bf-5",
      title: "🎯 Debiasing & Behavioral Alpha",
      description:
        "Pre-mortem analysis, investment checklists, probabilistic thinking, reference class forecasting, and exploiting others' biases",
      icon: "CheckSquare",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🔍 Pre-Mortem Analysis & Investment Checklists",
          content:
            "**Pre-Mortem Analysis** (Gary Klein, 1989):\nImagine that your investment has failed — it is now 12 months later and the position lost 40%. Working backward, explain *why* it failed.\n\nThis technique exploits **prospective hindsight**: by hypothetically placing yourself in the future after failure, the brain activates the same pattern-recognition systems it uses for hindsight — identifying risks that forward-looking overconfidence suppresses.\n\nHow to implement:\n1. Before any significant investment decision, write: 'It is now [date + 1 year]. My investment in [X] lost 35%. What happened?'\n2. List 5–10 specific reasons: missed earnings, competitive disruption, regulatory change, valuation multiple compression, leverage blowup\n3. For each risk, ask: 'Is this risk currently priced in? What would I see in the data if this were happening?'\n4. Decide: are you adequately compensated for the risks you just identified?\n\n**Investment Checklists** (inspired by Atul Gawande's surgical checklists):\nSystematically override intuition on high-stakes decisions:\n\n□ Does the business have durable competitive advantages?\n□ Is management aligned with shareholders (incentive check)?\n□ Is valuation reasonable vs. normalized earnings and growth?\n□ What is the bear case, and am I taking it seriously?\n□ What would I need to see to EXIT this position?\n□ Am I buying because of FOMO or genuine analysis?\n□ What is my position size relative to conviction and portfolio risk?\n\nInvestors who use written checklists show 20–30% fewer cognitive-bias-driven errors in studies of decision quality.",
          highlight: ["pre-mortem", "prospective hindsight", "investment checklist", "bear case", "overconfidence"],
        },
        {
          type: "teach",
          title: "📊 Probabilistic Thinking & Bayesian Updating",
          content:
            "Most investors think in terms of single-point forecasts: 'I think this stock will hit $200.' Behavioral finance practitioners think in **probability distributions**.\n\n**Probabilistic thinking:**\n- Instead of 'AAPL will hit $250,' think: '40% chance above $250, 35% chance $200–$250, 25% chance below $200'\n- Assign probabilities to scenarios, then calculate expected value across all of them\n- This forces engagement with the full distribution of outcomes, not just the base case\n- Keeps you from falling into narrative bias — the story that makes the investment compelling\n\n**Bayesian Framework for Updating:**\nBayes' theorem provides a mathematical structure for updating beliefs as new information arrives:\n\n`P(hypothesis | evidence) ∝ P(evidence | hypothesis) × P(hypothesis)`\n\nIn plain terms:\n- Start with a **prior** belief (the base rate): 'Most analyst upgrades precede stock outperformance ~55% of the time'\n- Observe **new evidence**: 'This analyst has a 72% track record over 5 years'\n- **Update** your posterior belief accordingly: 'This upgrade is worth more than average'\n\n**Avoiding the base rate neglect (a representativeness failure):**\n- Before acting on specific information, always ask: 'What is the base rate for this type of situation?'\n- New IPOs: base rate of 5-year underperformance vs. the market is ~65%\n- Fund manager outperformance: base rate of sustained outperformance over 10 years is ~5%\n- Incorporating base rates prevents over-updating on vivid but statistically weak signals",
          highlight: ["probabilistic thinking", "probability distribution", "Bayesian", "prior", "base rate", "posterior"],
        },
        {
          type: "teach",
          title: "🌍 Reference Class Forecasting & Building Behavioral Alpha",
          content:
            "**Reference Class Forecasting** (Philip Tetlock, Daniel Kahneman):\nWhen estimating outcomes, use the **outside view** (base rates from comparable situations) rather than the **inside view** (the specific details of this situation that make it feel unique).\n\n**Inside view problem:** Project managers estimate their project will take 12 months because the team is skilled and the plan is detailed — ignoring that 80% of comparable projects run 40% over schedule. The inside view is compelling but overconfident.\n\n**Outside view solution:**\n1. Identify the reference class: 'What kind of project is this most similar to?'\n2. Find the base rate: 'How long do projects like this typically take?'\n3. Adjust for specific factors: 'Our team is above average — adjust 10% faster'\n4. Produce a forecast centered on the base rate with meaningful uncertainty range\n\n**Kahneman's law:** 'The inside view is almost always too optimistic. The outside view is almost always more accurate.'\n\n**Building Behavioral Alpha — Exploiting Others' Biases:**\nUnderstanding biases enables systematic strategies:\n- **PEAD**: Buy large positive earnings surprises within days, hold 60–90 days (exploits underreaction)\n- **Value + reversal**: Buy 52-week lows with fundamental support (exploits overreaction to bad news)\n- **Sell into euphoria**: Trim exposure when AAII bullishness > 65% (exploits herding)\n- **Pre-announcement drift**: Monitor options unusual activity before earnings — informed buying before news exploits anchoring of uninformed investors\n- **Systematic rules over intuition**: Rules based on documented biases outperform discretionary intuition-based decisions in backtests consistently\n\nBehavioral alpha is durable because biases are hardwired — they persist even among participants who understand them, including you.",
          highlight: ["reference class forecasting", "outside view", "inside view", "base rate", "behavioral alpha", "Tetlock", "Kahneman"],
        },
        {
          type: "quiz-mc",
          question:
            "Two funds both delivered 15% annualized returns over 3 years. Fund A holds 40 diversified positions; Fund B holds 5 concentrated positions. How should an investor use reference class forecasting to evaluate which manager demonstrated more skill?",
          options: [
            "Fund A more likely demonstrates skill — 40 positions give a larger statistical sample of decisions; a 3-year run with 5 positions has a high probability of being lucky (base rate: ~12% chance of 15% annual return with 5 random picks)",
            "Fund B demonstrates more skill — concentrated conviction requires deeper research and signals higher confidence",
            "Both demonstrate equal skill — identical returns mean identical skill levels regardless of portfolio construction",
            "Reference class forecasting cannot be applied to manager evaluation — each manager is unique",
          ],
          correctIndex: 0,
          explanation:
            "Reference class forecasting applied to manager evaluation requires asking: 'Given the number of independent bets made, what is the base rate of achieving this return by chance?' Fund B made roughly 15 independent bets over 3 years (5 positions × 3 years), while Fund A made roughly 120. The probability of a 15% annual return from 15 random bets is meaningfully higher than from 120, simply by luck. Skill attribution requires sufficient 'sample size' of decisions — which is why short-track-record, concentrated managers are statistically more likely to be lucky than skilled, even with identical raw returns.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Debiasing techniques, such as pre-mortem analysis and checklists, can fully eliminate cognitive biases in investment decision-making with enough practice.",
          correct: false,
          explanation:
            "Cognitive biases are largely hardwired neurological tendencies — they cannot be fully eliminated, even among experts who understand them deeply. Kahneman himself acknowledges he still falls prey to biases he has studied for 50 years. What debiasing techniques do is reduce the *impact* of biases by creating structural safeguards that catch errors before they translate into action. Checklists, pre-mortems, written predictions, and rule-based systems reduce the frequency and magnitude of bias-driven errors — they do not eliminate the biases themselves. This is why systematic, rules-based approaches consistently outperform purely discretionary judgment in repeated decision environments.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor is evaluating two fund managers, both with exactly 8% annualized returns over 3 years (vs. 7% benchmark). Manager X runs a quantitative momentum strategy with 500+ trades per year. Manager Y is a macro discretionary manager who made 6 major calls over 3 years. The investor wants to assess true skill vs. luck.",
          question: "Applying reference class and probabilistic thinking, which manager's track record is more statistically meaningful?",
          options: [
            "Manager X — 500+ trades per year generates a large sample of independent decisions, making the 1% outperformance statistically more likely to reflect skill than luck",
            "Manager Y — 6 macro calls require deeper expertise and therefore demonstrate greater skill per trade",
            "Both are equally meaningful — 3 years is always sufficient to distinguish skill from luck",
            "Neither — 3 years is too short to evaluate any strategy",
          ],
          correctIndex: 0,
          explanation:
            "Statistical significance of alpha requires sufficient observations. Manager X with 1,500+ trades over 3 years provides a meaningful sample — 1% consistent outperformance across that many independent trades has very low probability of occurring by chance alone. Manager Y made 6 calls — a coin-flipper has a 1/64 chance of calling 6 consecutive outcomes correctly. With only 6 data points, even a skilled manager's track record is statistically indistinguishable from luck. Reference class: of macro managers with similar 3-year returns on 6 calls, what fraction are genuinely skilled vs. fortunate? The answer is 'we cannot know with 6 observations.'",
          difficulty: 3,
        },
      ],
    },
  ],
};
