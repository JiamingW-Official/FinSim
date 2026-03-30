import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_FINANCE: Unit = {
  id: "behavioral-finance",
  title: "Behavioral Finance",
  description:
    "Why smart people make irrational trading decisions — and the science-backed habits that fix them",
  icon: "Brain",
  color: "#8b5cf6",
  lessons: [
    /* ================================================================
       LESSON 1 — Cognitive Biases in Trading
       ================================================================ */
    {
      id: "behav-1",
      title: "Cognitive Biases in Trading",
      description:
        "Overconfidence, anchoring, availability heuristic, and recency bias — how your brain sabotages your trades",
      icon: "Zap",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "Why Cognitive Biases Matter More Than You Think",
          content:
            "**Cognitive biases** are systematic patterns of deviation from rational judgment — mental shortcuts (heuristics) that helped our ancestors survive but consistently lose money in markets.\n\nThe scale of the problem is staggering:\n- A 2011 University of California Berkeley study of 66,465 retail brokerage accounts found that the most active traders underperformed the least active traders by **7.1% per year** after costs — not because of bad stock selection, but because of behavioral errors that led to unnecessary trading.\n- DALBAR's Quantitative Analysis of Investor Behavior (2022) found the average equity fund investor earned **6.0% annually over 30 years** while the S&P 500 earned **10.7%** — a gap entirely attributable to behavioral mistakes: buying high after strong performance and selling low after drawdowns.\n\n**The four most damaging biases in trading:**\n1. Overconfidence bias\n2. Anchoring bias\n3. Availability heuristic\n4. Recency bias\n\nNone of these are signs of low intelligence. Studies show these biases are stronger in people with above-average confidence in their own abilities — which describes most people who actively manage money.",
          highlight: [
            "cognitive bias",
            "heuristic",
            "overconfidence",
            "anchoring",
            "availability heuristic",
            "recency bias",
          ],
        },
        {
          type: "teach",
          title: "Overconfidence and the Illusion of Control",
          content:
            "**Overconfidence bias** is the tendency to overestimate the accuracy of your own predictions and the quality of your information.\n\n**Evidence:**\n- Terrance Odean's landmark 1999 study found that the stocks retail investors bought **underperformed** the stocks they sold by 3.2% over the following year. They believed they were making superior decisions when they were not.\n- A survey of 2,000 drivers found that 93% rated themselves as above-average drivers. In trading, similar surveys show 74% of individual investors believe they beat the market — while only 12-20% actually do in any given year.\n\n**The illusion of control:**\nActive trading creates the feeling of expertise and mastery — the more decisions you make, the more skill you feel you have. But research shows this is largely illusory. A 2004 study by Glaser & Weber found that the more frequently traders checked their portfolio, the more overconfident they became — regardless of actual performance.\n\n**How it manifests in trading:**\n- Concentrating too heavily in a single stock or sector ('I know this company')\n- Trading before earnings with false confidence in the outcome\n- Not using stop-losses because 'the trade will come back'\n- Increasing position size after a winning streak (confusing luck with skill)\n\n**The antidote:**\nKeep a trading journal that records your predicted outcome AND your reasoning before each trade. Compare to actual outcomes monthly. The error rate will be humbling and corrective.",
          highlight: [
            "overconfidence",
            "illusion of control",
            "trading journal",
            "concentration risk",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader has won 6 consecutive trades and increases her position size from 2% to 5% of her account on the 7th trade, believing she is 'in the zone.' This behavior best illustrates:",
          options: [
            "Overconfidence bias — confusing a short-term winning streak (possibly luck) with genuine skill, and inappropriately increasing risk as a result",
            "The Kelly Criterion applied correctly — a winning streak proves a higher edge warranting larger position sizes",
            "Rational risk management — increasing size when a strategy is working is always correct",
            "Loss aversion — she is risking more to ensure she does not lose her gains",
          ],
          correctIndex: 0,
          explanation:
            "Consecutive wins feel like evidence of skill, but six trades is statistically insufficient to distinguish skill from luck. Even a strategy with a 50% win rate will produce runs of 6 consecutive wins with 1.56% probability — in a pool of 1,000 traders, 15 will have 6-win streaks by pure chance. Increasing position size after a winning streak violates the core principle that position sizing should be based on expected edge (which doesn't change after wins) and current account equity, not emotional momentum. The Kelly Criterion requires estimating true win rate and payoff ratio over many trades — not 6.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Anchoring and Availability Heuristic",
          content:
            "**Anchoring bias:**\nThe tendency to over-rely on the first piece of information encountered when making decisions.\n\n**In trading:**\n- A stock bought at $80 that falls to $50 — the trader anchors to $80 as the 'real' value and holds the loser, hoping to 'get back to even.' This is why investors hold losers far too long.\n- An analyst sets a price target of $150 for a stock at $120. When fundamentals deteriorate, the stock falls to $100, but the analyst anchors to $150 and still calls it undervalued.\n- 52-week highs and lows function as anchors that distort traders' sense of value — a stock near its 52-week low 'feels' cheap even if the underlying business has permanently deteriorated.\n\n**Availability heuristic:**\nThe tendency to judge the probability of an event by how easily examples come to mind — events that are vivid, recent, or emotionally charged feel more likely than base rates justify.\n\n**In trading:**\n- After the 2008 financial crisis, many investors underweighted equities for a decade, convinced another crash was imminent (availability of the crash memory made it feel probable despite historical base rates)\n- After a stock you own suddenly surges 30%, you start seeing 'obvious' reasons it will keep surging — the vivid gain makes continuation feel likely\n- A trader who sees a biotech stock mentioned on CNBC three times in one day overestimates the probability of it being a good investment (availability = prominence = quality in the biased mind)\n\n**Calibration test:**\nWrite down your confidence level (50%-99%) for each prediction. If you are well-calibrated, events you predict at 80% confidence should happen 80% of the time. Most traders find their 80% confident calls happen only 55-60% of the time.",
          highlight: [
            "anchoring",
            "availability heuristic",
            "52-week high",
            "calibration",
            "base rate",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Recency bias causes investors to underweight the possibility of rare but historically documented extreme events, such as market crashes, simply because they have not occurred recently.",
          correct: true,
          explanation:
            "Recency bias (also called recency heuristic or availability through recency) causes people to extrapolate recent experience into the future. In a prolonged bull market, recency bias makes crashes feel impossible — investors increase risk precisely when the market is most extended. The 2000 Dot-Com peak and 2007 housing bubble both featured surveys showing unusually low investor fear because recent years had been so strong. Conversely, right after a crash, recency bias causes investors to expect further declines — many sold equities in March 2009, which proved to be the exact bottom of the GFC. Academic research by Greenwood & Shleifer (2014) found that investor expectations of future returns are strongly positively correlated with recent past returns — the opposite of what fundamental valuation models would predict.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought 100 shares of a technology company at $200 per share. The company reports disappointing earnings, guidance is cut, and three analysts downgrade the stock. It now trades at $140. A friend who bought it at $100 wants to sell. You refuse to sell because 'it will come back to $200.'",
          question:
            "Which biases are most clearly operating in your decision to hold?",
          options: [
            "Anchoring bias (anchored to your $200 cost basis as the 'fair value') and loss aversion (the pain of realizing a $6,000 loss prevents rational reassessment)",
            "Overconfidence and recency bias only",
            "This is rational contrarian investing — buying when others sell is always correct",
            "Availability heuristic — you remember when the stock was at $200 so you believe it will return",
          ],
          correctIndex: 0,
          explanation:
            "Your $200 purchase price is economically irrelevant to future decisions — the stock does not know or care where you bought it. Yet your anchor to $200 distorts your assessment of what the stock is 'worth' and creates a mental threshold ('I won't sell at a loss') that overrides fundamental analysis. Combined with loss aversion, the prospect of crystallizing a $6,000 loss (selling at $140) is emotionally 2-2.5× more painful than an equivalent gain would be pleasurable. Your friend who bought at $100 faces no such anchor and can evaluate the business objectively. The rational question is not 'will it return to $200?' but 'given the deteriorating fundamentals, what is this stock worth, and should I own it at any price?'",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Loss Aversion and Prospect Theory
       ================================================================ */
    {
      id: "behav-2",
      title: "Loss Aversion and Prospect Theory",
      description:
        "Kahneman and Tversky's Nobel Prize framework and the disposition effect that costs investors billions",
      icon: "Scale",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "Prospect Theory: The Science of How We Feel About Money",
          content:
            "In 1979, psychologists Daniel Kahneman and Amos Tversky published **Prospect Theory** in Econometrica — arguably the most cited paper in economics. They demonstrated that human beings do not evaluate outcomes in terms of absolute wealth, but in terms of **gains and losses relative to a reference point** (typically the price paid).\n\n**Three key findings:**\n\n**1. Loss aversion:**\nLosses feel approximately **2 to 2.5 times more painful** than equivalent gains feel good. A $1,000 loss hurts as much as a $2,000-2,500 gain feels good. This is not a feeling — it is measurable in decision-making experiments across cultures.\n\n**2. Diminishing sensitivity:**\nThe emotional impact of gains and losses diminishes as magnitude increases. The difference between losing $10 and $20 feels larger than the difference between losing $1,000 and $1,010 — even though both are $10.\n\n**3. The S-shaped value function:**\nUtility is concave for gains (risk-averse — prefer a certain $500 over a 50% chance of $1,000) but convex for losses (risk-seeking — prefer a 50% chance of losing $1,000 over a certain $500 loss). This asymmetry explains why people gamble to avoid certain losses but play it safe when ahead.\n\n**The Kahneman quotation:**\n'The concept of loss aversion is certainly the most significant contribution of psychology to behavioral economics.' — Daniel Kahneman, Thinking, Fast and Slow (2011)\n\nKahneman received the Nobel Prize in Economic Sciences in 2002. Tversky died in 1996 before the prize was awarded.",
          highlight: [
            "Prospect Theory",
            "Kahneman",
            "Tversky",
            "loss aversion",
            "reference point",
            "S-shaped value function",
            "diminishing sensitivity",
          ],
        },
        {
          type: "teach",
          title: "The Disposition Effect: Selling Winners, Holding Losers",
          content:
            "The most costly consequence of loss aversion in trading is the **disposition effect** — the systematic tendency to:\n- **Sell winners too early** (lock in gains before they can reverse into losses)\n- **Hold losers too long** (avoid realizing the painful loss, hoping for recovery)\n\nThis is exactly backwards from optimal strategy. The disposition effect was documented at scale by Terrance Odean in 1998 using 10,000 trading accounts:\n\n**Odean's findings:**\n- Investors sold winners at a rate 1.68× higher than they sold losers\n- The stocks they sold (winners) outperformed the market by 3.4% over the following year\n- The stocks they held (losers) underperformed the market by 1.1% over the following year\n- Net annual cost of the disposition effect: **approximately 3.4% per year** in foregone returns\n\n**Why it happens:**\n- Holding a losing stock = unrealized loss (no pain yet; still possible to recover)\n- Selling a losing stock = realized loss (permanent, final, painful)\n- The brain treats realized and unrealized losses differently even though they are economically identical\n\n**Institutional evidence:**\nMutual fund managers who exhibit the disposition effect (measurable from their quarterly filings) have lower subsequent performance. A 2012 study by Cici found disposition-prone fund managers underperformed by 4-6% annually.\n\n**The tax dimension:**\nThe disposition effect actually inverts the optimal tax strategy. You should generally hold winners (defer capital gains tax) and sell losers (harvest tax losses). Most retail investors do the opposite.",
          highlight: [
            "disposition effect",
            "sell winners",
            "hold losers",
            "realized vs unrealized",
            "tax-loss harvesting",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "According to Kahneman and Tversky's Prospect Theory, which choice would most people make in this scenario? Option A: Accept a guaranteed loss of $500. Option B: Take a 50% chance of losing $1,000 and a 50% chance of losing nothing.",
          options: [
            "Most people choose Option B (the gamble) — in the loss domain, people become risk-seeking to avoid a certain loss, even when the gamble has the same expected value",
            "Most people choose Option A (the guaranteed loss) — people are always risk-averse regardless of the domain",
            "People split evenly because both options have identical expected values of -$500",
            "People always choose the option with the lower maximum possible loss, which is Option A",
          ],
          correctIndex: 0,
          explanation:
            "Prospect Theory's key insight about the loss domain: people exhibit risk-seeking behavior to avoid a certain loss. Both options have the same expected value (-$500), but most people prefer the gamble (Option B) because the guaranteed $500 loss feels certain and final, while the gamble preserves the possibility of losing nothing. This mirrors trading behavior: a trader holding a $5,000 losing position often holds (taking the risk of further loss) rather than selling (accepting the certain loss). When tested in the gain domain (choose between a guaranteed $500 gain vs. 50% chance of $1,000), most people take the guaranteed gain — demonstrating the asymmetry between loss-domain risk-seeking and gain-domain risk-aversion.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "From a pure financial perspective, holding an unrealized $5,000 loss is economically identical to a realized $5,000 loss — your net worth has decreased by $5,000 in both cases.",
          correct: true,
          explanation:
            "This is the core economic truth that loss aversion obscures. Your brokerage account shows the same net worth whether the loss is realized or unrealized — both reduce your wealth by exactly $5,000. The pain of realizing the loss by selling is entirely psychological, not financial. In fact, holding a loser often has an additional economic cost: the opportunity cost of the capital tied up in the losing position. That same capital, redeployed to a new opportunity, could generate positive returns. The rational framework is: 'Would I buy this stock fresh today at this price?' If no, you should sell regardless of your cost basis. Your cost basis is a sunk cost — irrelevant to future decisions.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Portfolio manager Sarah runs a fund and holds two positions: Stock A, purchased at $100, now at $130 (+30%). Stock B, purchased at $100, now at $70 (-30%). Both companies have similar revised forward outlooks after a sector rotation. She needs to raise cash quickly and must sell one position.",
          question:
            "Which position should Sarah rationally sell, and which bias would cause her to make the opposite choice?",
          options: [
            "Rational choice: sell whichever position has weaker forward prospects, regardless of P&L. The disposition effect would push her to sell Stock A (the winner) to lock in the gain and hold Stock B (the loser) to avoid realizing the loss — the opposite of optimal behavior",
            "Rational choice: always sell the loser first to minimize tax liability",
            "Rational choice: sell Stock A because it has already moved up 30% and has less upside remaining",
            "Rational choice: sell Stock B to demonstrate discipline in cutting losses",
          ],
          correctIndex: 0,
          explanation:
            "The rational decision should be made entirely on forward-looking fundamentals and opportunity cost — not past P&L. If both stocks have similar forward outlooks, Sarah should sell the one where the tax impact is more favorable (Stock B, for a tax-deductible loss, if this is a taxable account) or where she has lower conviction going forward. The disposition effect would cause her to do the emotionally comfortable thing: sell Stock A to 'bank' the gain (avoiding the possibility of watching it reverse) while holding Stock B (avoiding the pain of realizing the loss). Odean's data shows this is the most common mistake — and it costs approximately 3.4% annually.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — Herd Mentality and Bubbles
       ================================================================ */
    {
      id: "behav-3",
      title: "Herd Mentality and Bubbles",
      description:
        "From tulip mania to crypto — how bubbles form, why smart people participate, and contrarian strategy",
      icon: "Users",
      xpReward: 70,
      steps: [
        {
          type: "teach",
          title: "The Anatomy of a Bubble",
          content:
            "Financial bubbles have occurred throughout recorded history, and they follow a strikingly consistent pattern first described by economist **Hyman Minsky**:\n\n**The Minsky Cycle:**\n1. **Displacement**: A new technology, policy change, or economic shock creates genuine opportunity (internet in the 1990s, real estate in the early 2000s, blockchain in 2017)\n2. **Boom**: Early investors profit. Media coverage begins. More people enter, driving prices higher. Rising prices appear to validate the thesis.\n3. **Euphoria**: Valuations disconnect from fundamentals. Everyone 'knows' prices will keep rising. New investors enter who have never invested before. Leverage increases dramatically.\n4. **Profit-taking**: Sophisticated early investors quietly exit. They are called 'bears' and dismissed.\n5. **Panic**: A trigger event reveals the disconnect. Prices fall. Leveraged investors face margin calls. Selling begets selling. The bubble collapses.\n\n**Historical bubbles:**\n- **Dutch Tulip Mania (1637)**: Rare tulip bulbs traded at 10× the annual salary of a skilled craftsman. Collapsed in days.\n- **South Sea Bubble (1720)**: Isaac Newton lost the equivalent of $4 million; reportedly said 'I can calculate the motions of celestial bodies, but not the madness of people.'\n- **Dot-Com Bubble (1995-2000)**: NASDAQ fell 78% peak to trough; companies with zero revenue were worth billions\n- **U.S. Housing (2002-2008)**: U.S. home prices fell 33% nationally; global financial system nearly collapsed\n- **Crypto (2017-2018, 2021-2022)**: Bitcoin fell 84% from its 2017 peak; Luna/UST collapsed to zero in 48 hours in 2022",
          highlight: [
            "Minsky cycle",
            "displacement",
            "euphoria",
            "leverage",
            "margin call",
            "bubble",
          ],
        },
        {
          type: "teach",
          title: "Why Smart People Join Bubbles",
          content:
            "Understanding bubbles is easy in retrospect. Participating rationally during a bubble is far harder. There are multiple mechanisms that pull even sophisticated investors in:\n\n**1. Information cascade:**\nWhen you see many others buying an asset, you rationally infer they have positive private information. If 1,000 people are buying tulips, maybe they know something you do not. The problem: if everyone is reasoning the same way, the cascade is self-referential — prices rise not because of information but because of beliefs about others' beliefs.\n\n**2. Relative performance pressure:**\nProfessional fund managers face career risk from underperformance. If tech stocks are surging 40% and a manager stays out to avoid overvalued stocks, they look incompetent next to peers who are up 40%. The rational short-term career decision is to join the bubble while it inflates — and many do.\n\n**3. 'Greater fool' logic:**\nYou may know the asset is overvalued, but you buy it anyway believing you can sell it to a 'greater fool' at a higher price. This is rational in the early stages of a bubble. The problem: identifying when you are the greatest fool is impossible in real time.\n\n**4. Narrative reinforcement:**\nBubbles require compelling stories. 'The internet will change everything' was true. 'Real estate always goes up' had 50 years of data behind it. 'Blockchain eliminates middlemen' describes real technology. The stories are not lies — they are true but get extrapolated into unrealistic valuations.\n\n**Shiller's research:**\nRobert Shiller (Nobel Prize 2013, shared with Fama and Hansen) found that investor expectations of future stock returns have almost no correlation with subsequent actual returns — and are much more correlated with recent past returns (the recency bias feeding bubble psychology).",
          highlight: [
            "information cascade",
            "career risk",
            "greater fool",
            "narrative",
            "Shiller",
            "irrational exuberance",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In 2021, a meme stock that generated $82 million in annual revenue was trading at a market cap of $25 billion (a 305× revenue multiple). Sophisticated hedge funds were shorting it. Retail investors on social media were urging each other to 'hold the line' and buy more. This scenario best illustrates:",
          options: [
            "Multiple behavioral phenomena simultaneously: herd mentality (coordinated buying driven by social pressure, not fundamentals), greater fool theory (buying at clearly irrational valuations expecting others to buy higher), and information cascade (social proof substituting for fundamental analysis)",
            "Efficient markets — if the stock is trading at $25B, the market must have information justifying that valuation",
            "Rational contrarianism — retail investors were correctly identifying that hedge fund short-sellers were wrong",
            "Anchoring bias exclusively — investors were anchored to a historical peak price",
          ],
          correctIndex: 0,
          explanation:
            "The 2021 meme stock events (GameStop, AMC) are studied as examples of multiple overlapping behavioral phenomena. Herd mentality: the decision to buy was driven by social media coordination and FOMO, not fundamental analysis. Greater fool theory: many participants acknowledged the overvaluation but bought anyway believing they could exit before the crash. Information cascade: Reddit threads showing thousands of fellow buyers made continued buying feel rational through social proof. The hedge funds shorting the stock were actually correct about fundamental value — GameStop's business remained structurally challenged. The eventual collapse validated the fundamental analysis, but the timing was unpredictable. GameStop stock fell from ~$480 to ~$40 within weeks.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Contrarian Strategy: The Science and the Limits",
          content:
            "**Contrarian investing** means deliberately going against prevailing market sentiment. The academic evidence is genuinely strong — but the practical implementation is psychologically brutal.\n\n**Evidence for contrarianism:**\n- David Dreman's research (1977-2000) found that the lowest P/E quintile of stocks outperformed the highest P/E quintile by 8-10% annually over 25 years\n- The **Dogs of the Dow** strategy (buying the 10 highest-yielding Dow stocks annually) outperformed the full Dow average by 1.5-3% in most decades\n- Shiller's CAPE ratio (Cyclically Adjusted P/E) has a 0.37 correlation with 10-year forward returns — high CAPE = low future returns. As of 2026, CAPE > 30 has historically preceded below-average 10-year returns\n- **Value investing** at its core is contrarian — buying what is unloved and out of favor\n\n**The limits of contrarianism:**\n- Contrarian positions can stay wrong for years, requiring extraordinary patience and capital\n- John Maynard Keynes: 'Markets can remain irrational longer than you can remain solvent'\n- Michael Burry correctly identified the 2007 housing bubble in 2005 — two full years before the collapse. He nearly lost his fund to investor redemptions during the waiting period\n- Being contrarian at the wrong time (fighting a trend early in a bubble) is just another form of being wrong\n\n**Practical contrarian signals:**\n- Investor sentiment surveys at extreme readings (Bull/Bear spread > 30% bullish or < 30% bullish)\n- Short interest as % of float > 30% (stock is deeply hated — potential squeeze)\n- Magazine covers proclaiming the end of an asset class (historically reliable contrary indicator)\n- VIX > 40 (extreme fear = historical buying opportunity; average 12-month return after VIX > 40: +26%)",
          highlight: [
            "contrarian",
            "CAPE ratio",
            "value investing",
            "VIX",
            "sentiment extremes",
            "Dreman",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Because bubbles always eventually collapse, a rational investor should immediately short every asset that appears to be in a bubble phase.",
          correct: false,
          explanation:
            "This is one of the most dangerous misconceptions in investing. While bubbles do eventually collapse, the timing is entirely unpredictable — and short positions have theoretically unlimited loss potential. John Maynard Keynes, who lost significant money shorting the 1920s stock boom too early, noted that markets can remain irrational far longer than short sellers can survive. Julian Robertson's Tiger Fund, one of the most successful hedge funds of the 1990s, was forced to close in March 2000 — just days before the dot-com peak — after years of underperformance from fighting the bubble. He was right about the fundamentals and wrong about the timing. Contrarian shorting requires not just identifying a bubble, but identifying the catalyst and approximate timing of collapse — a far harder task.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — System 1 vs System 2 Thinking
       ================================================================ */
    {
      id: "behav-4",
      title: "System 1 vs System 2 Thinking",
      description:
        "Kahneman's fast and slow thinking frameworks applied to trading — rules-based vs discretionary decision-making",
      icon: "Cpu",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "Two Systems, One Trader",
          content:
            "In his 2011 bestseller 'Thinking, Fast and Slow,' Daniel Kahneman describes two modes of cognition that operate in parallel:\n\n**System 1 — Fast, Automatic, Emotional:**\n- Operates below conscious awareness\n- Processes information instantly using pattern recognition\n- Governed by emotion, intuition, and past experience\n- Cannot be switched off; always running\n- Evolutionarily ancient — designed for survival, not investing\n\n**System 2 — Slow, Deliberate, Rational:**\n- Requires conscious effort and mental energy\n- Logical, rule-based, statistical\n- Capable of overriding System 1, but only when activated\n- Fatigues with use; degrades under time pressure and stress\n- Expensive to run — the brain prefers System 1 whenever possible\n\n**The trading problem:**\nMarkets are designed (accidentally) to maximize System 1 activation:\n- Prices fluctuate constantly — triggering emotional responses to every tick\n- P&L is shown in real money terms — creating visceral pain and pleasure\n- News is presented as urgent ('breaking: market falls 2%!')\n- Losses trigger fight-or-flight response — the worst possible state for rational analysis\n\n**Research finding:**\nA 2019 study by Corgnet, Hernán-González, and Kujal put subjects in a financial trading simulation and tracked skin conductance responses (a proxy for emotional arousal). Subjects with higher emotional arousal made worse trading decisions — held losers longer, exited winners earlier, and traded more frequently. This physiologically validated the System 1 / System 2 framework in financial markets.",
          highlight: [
            "System 1",
            "System 2",
            "Kahneman",
            "fight-or-flight",
            "emotional arousal",
            "deliberate thinking",
          ],
        },
        {
          type: "teach",
          title: "Rules-Based vs Discretionary Trading",
          content:
            "The System 1/System 2 framework directly maps to two fundamental trading philosophies:\n\n**Discretionary trading:**\nDecisions made in real time based on judgment, experience, and intuition. System 1 is heavily involved. Subject to all behavioral biases. Most retail traders operate this way.\n\nAdvantage: Can adapt to unusual situations not captured by rules.\nDisadvantage: Inconsistent; biases compound over time; post-hoc rationalization of emotional decisions.\n\n**Rules-based (systematic) trading:**\nDecisions made by pre-defined algorithms or decision trees, executed mechanically. System 2 is used to design the rules; System 1 is removed from execution.\n\nAdvantage: Consistent; immune to in-the-moment emotional errors; backtestable.\nDisadvantage: Rigid; may underperform in regimes not seen in historical data.\n\n**Evidence:**\n- Across hedge funds, systematic/quantitative funds have outperformed discretionary funds by an average of 1.4% annually over the past decade (HFR data)\n- Warren Buffett famously uses a hybrid approach: System 2 analysis to identify investments, then rigid rules ('never sell a great business at a fair price') to remove System 1 from execution\n- Studies of professional tennis players, chess players, and athletes show expertise shifts decision-making from slow System 2 back to fast intuition — but this requires 10,000+ hours of deliberate practice that most traders never accumulate\n\n**The pre-commitment device:**\nThe most effective behavioral intervention in trading is the **pre-commitment**: deciding the rules of a trade BEFORE you enter it (entry price, stop-loss, target, position size, maximum hold time). Pre-commitments bypass in-the-moment System 1 interference because the decision is made under calm, rational conditions.",
          highlight: [
            "rules-based",
            "systematic",
            "discretionary",
            "pre-commitment",
            "backtestable",
            "algorithm",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader using a rules-based system gets a sell signal on a position. At the same moment, she reads a bullish news headline about the stock and feels confident the system is wrong. She overrides the system and holds. Over the next three months, the stock falls 18%. This scenario illustrates:",
          options: [
            "System 1 overriding System 2 — the emotional response to the headline (System 1) overrode the pre-defined rule (System 2), removing the value of the systematic approach",
            "Rational updating — incorporating new information into a trading system is always correct",
            "Overconfidence bias only — she was too confident in her news interpretation",
            "The system was flawed; rules-based systems should always be overridden when new information arrives",
          ],
          correctIndex: 0,
          explanation:
            "This is one of the most common and costly mistakes systematic traders make — 'discretionary overrides' of rule-based signals. The value of a pre-defined system lies in its consistency; every override reintroduces System 1 biases that the system was designed to prevent. The trader felt confident the system was wrong, but subjective confidence has essentially no predictive value for a single trade. Research by Barber & Odean (2001) found that when investors override their initial plan based on new information, they underperform their original plan 60-70% of the time. The headline may have been accurate, but the trader's ability to correctly assess its market impact in real-time is no better than chance.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Experienced traders with many years of practice eventually develop reliable intuition that can safely replace rule-based decision frameworks.",
          correct: false,
          explanation:
            "This belief is dangerous and mostly unsupported by evidence for most trading environments. Genuine expertise-based intuition (System 1 pattern recognition equivalent to expert System 2 reasoning) requires two conditions identified by Kahneman: (1) a high-validity environment where outcomes provide clear, rapid, and accurate feedback — and (2) many thousands of repetitions of the feedback cycle. Financial markets partially fail condition 1 because feedback is noisy (a losing trade may have been correct given information at the time; a winning trade may have been lucky). Studies of financial analysts (CXO Advisory research, 2005-2012) found that expert forecasters were correct 47% of the time — slightly worse than chance. Market Wizards-caliber traders are statistically rare and may rely on exploiting specific structural edges, not intuition.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is 2:45 PM on a Friday. Your position is down 4% on the week. You have been watching it all week and are feeling frustrated. You see a bounce in the last 15 minutes and your instinct is to add to the position to 'average down' and potentially recover losses before the weekend close.",
          question:
            "What combination of System 1 effects is driving this impulse, and what would a System 2 response look like?",
          options: [
            "System 1 effects: loss aversion (need to avoid ending the week with this loss), recency bias (15-min bounce feels like a trend reversal), and sunk cost fallacy (the paper loss makes you want to 'fight back'). System 2 response: evaluate the position objectively — would you buy this at this price with no prior position? Check position size rules. If the original thesis is intact, hold; otherwise exit.",
            "This is rational averaging down — buying more of a good stock when it is cheaper always lowers your average cost and improves outcomes",
            "System 1 is always more accurate because it draws on pattern recognition from experience; follow the instinct",
            "The correct response is to sell immediately on any position that is down 4% — this is a rule that eliminates behavioral errors",
          ],
          correctIndex: 0,
          explanation:
            "This scenario stacks multiple behavioral traps simultaneously. Loss aversion: the pain of ending the week down creates urgency to 'do something.' Recency bias: a 15-minute bounce substitutes for actual analysis of the position. Sunk cost fallacy: the existing loss should be irrelevant to future decisions, but it feels deeply relevant. Time pressure and end-of-week deadline activate System 1. The System 2 response strips all of this away: (1) evaluate the position as if you had no prior position; (2) check against your pre-defined rules — does it fit your position sizing limits, is the thesis still valid?; (3) note that adding in the last 15 minutes on a Friday is maximum emotional-state trading. Most experienced traders explicitly ban averaging down without pre-planned criteria.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Building Better Habits
       ================================================================ */
    {
      id: "behav-5",
      title: "Building Better Habits",
      description:
        "Trading journal methodology, pre-trade checklists, rules systems, and structured performance review",
      icon: "BookOpen",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "The Trading Journal: Your Most Important Tool",
          content:
            "Every evidence-based improvement in trading behavior runs through one instrument: the **trading journal**. Not a log of trades — a structured record of your reasoning, emotions, and outcomes.\n\n**What to record in every entry:**\n1. **Date, ticker, direction, size**\n2. **Thesis**: Why are you entering? What is the catalyst? What is the setup?\n3. **Expected outcome**: Price target, probability estimate (0-100%), and time horizon\n4. **Risk parameters**: Stop-loss level, maximum acceptable loss in dollars\n5. **Emotional state** (1-5 scale): Are you anxious? Revenge-trading? Confident?\n6. **Exit conditions**: Pre-defined — both target and stop-loss\n7. **Post-trade review**: What happened vs. what you predicted? Was the outcome driven by the thesis or by noise? What would you do differently?\n\n**Why the emotional state rating matters:**\nA 2012 study by Lo & Repin measured traders' physiological arousal (skin conductance, heart rate) during trading. Traders with moderate arousal (engaged but not stressed) made the best decisions. Traders in high emotional states made significantly worse decisions — holding losers longer, using larger position sizes than planned. The 1-5 rating forces you to notice your state before acting.\n\n**The journal as bias detector:**\nAfter 50+ trades, patterns emerge:\n- 'I always hold losers over weekends — my loss is always worse on Monday open'\n- 'Trades I entered when my emotional state was 4-5 have a 30% win rate vs. 55% for state 1-2'\n- 'My morning trades outperform my afternoon trades by 4%'\n\nThese patterns are invisible without data. The journal creates the data.",
          highlight: [
            "trading journal",
            "thesis",
            "emotional state",
            "post-trade review",
            "pre-defined",
          ],
        },
        {
          type: "teach",
          title: "The Pre-Trade Checklist",
          content:
            "Aviation uses checklists because even experienced pilots make preventable errors under stress. Surgery adopted checklists after a landmark WHO study showed they reduced surgical complications by 36%. Trading has the same problem: emotional state + time pressure + financial stakes = preventable errors.\n\n**A professional pre-trade checklist (complete ALL items before entering):**\n\n**Market context:**\n[ ] Is the overall market trend aligned with my trade direction?\n[ ] Are there known catalysts today (Fed announcements, earnings, CPI) that could cause unrelated volatility?\n\n**Setup quality:**\n[ ] Does this trade match one of my defined setup types?\n[ ] Is the risk/reward ratio at least 2:1 (target is at least 2× the stop distance)?\n[ ] What is the quality rating of this setup (A, B, or C)? I will only take A and B setups.\n\n**Position sizing:**\n[ ] Have I calculated exact position size using my risk formula?\n[ ] Does this position size keep my total account risk under 2% per day?\n\n**Execution plan:**\n[ ] Have I set the stop-loss order immediately after entry?\n[ ] Have I set a target or alert at my profit objective?\n\n**Behavioral check:**\n[ ] What is my emotional state right now (1-5)? If 4-5, I will not trade.\n[ ] Am I revenge-trading after a recent loss? If yes, I will not trade.\n[ ] Is this trade in my established watchlist, or am I chasing news?\n\n**The 'could I explain this?' test:**\n[ ] Could I explain my entry thesis in two sentences to a skeptical colleague? If not, the thesis is not clear enough.",
          highlight: [
            "pre-trade checklist",
            "risk/reward",
            "position sizing",
            "revenge trading",
            "setup quality",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "After reviewing 6 months of journal data, a trader discovers that 80% of his losing trades were entered when his emotional state was rated 4 or 5 (high stress/emotion), while 70% of his winning trades were entered at state 1 or 2. The most directly actionable response to this finding is:",
          options: [
            "Create a firm rule: no trades allowed when emotional state is 4 or 5 — walk away from the screen and revisit in at least 30 minutes before reassessing",
            "Trade more frequently to increase the sample size before drawing conclusions",
            "Emotional state has no practical relevance because markets are efficient and return distributions are random",
            "Switch to a new strategy because the current strategy only works in low-stress conditions",
          ],
          correctIndex: 0,
          explanation:
            "This is exactly what the trading journal is designed to reveal — your personal behavioral edge leaks. The data clearly shows that emotional arousal predicts poor outcomes for this trader, which is consistent with the broader literature on System 1/System 2 interference in trading. The solution is a direct behavioral constraint: treat a high emotional state as a disqualifying condition, identical to 'market is in news blackout — no trades.' This is not weakness; it is rational self-management based on personal data. The rule should be non-negotiable — the whole point of a pre-commitment rule is that it cannot be overridden in the moment. Waiting 30 minutes allows System 1 arousal to subside and System 2 to re-engage.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Performance Review: Weekly and Monthly Frameworks",
          content:
            "Most retail traders review whether they made or lost money. Professional traders review **why** they made or lost money, and whether their process was sound independent of outcomes.\n\n**The process vs. outcome distinction:**\nA poker player who calls an all-in with pocket aces against a 7-2 offsuit has made the correct decision — even if the 7-2 wins by catching a flush on the river. Process-based review evaluates decisions against information available at the time, not outcomes.\n\n**Weekly review (30 minutes every Friday):**\n1. Trade-by-trade process review: Was the pre-trade checklist followed? Was position sizing correct?\n2. Bias identification: Any patterns of behavioral errors this week?\n3. Win rate and average R-multiple calculation\n4. Market context: Did my trades align with the weekly trend?\n\n**Monthly deep review (2 hours on the last trading day):**\n1. **Equity curve analysis**: Is the curve consistently rising, or volatile with large drawdowns?\n2. **Win rate by setup type**: Which setups are working? Which should be retired?\n3. **Win rate by emotional state**: Confirm the emotional state → outcome relationship\n4. **Average win vs. average loss**: Is your R/R maintaining at least 2:1?\n5. **Maximum drawdown**: What was the worst peak-to-trough decline? Is it within your pre-defined tolerance?\n6. **Forward plan**: What rules need adjustment? What setups will you focus on next month?\n\n**The 'red rules' concept:**\nCreate a list of non-negotiable rules with automatic consequences for violation. Example: 'If I violate the position sizing rule, I will cut my maximum trade size by 50% for the following week.' Rules without consequences are suggestions.",
          highlight: [
            "process vs. outcome",
            "equity curve",
            "R-multiple",
            "drawdown",
            "red rules",
            "win rate",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A trader who follows their system perfectly but has a losing month has performed worse than a trader who broke multiple rules but happened to make money that month.",
          correct: false,
          explanation:
            "This is the fundamental insight of process-based performance review, as articulated by trading psychologists like Mark Douglas (Trading in the Zone) and Van Tharp (Trade Your Way to Financial Freedom). A single month of outcomes is dominated by variance — especially in strategies with 50-60% win rates where 30-trade samples produce high outcome variability. The trader who followed their system correctly has demonstrated that their process is reliable and scalable over hundreds of trades. The trader who violated rules and got lucky has learned nothing — worse, they have been reinforced for bad behavior (random reinforcement is the most addictive schedule, as B.F. Skinner demonstrated). Professional trading desks evaluate traders on process adherence, not short-term P&L.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader implements the following system: keep a journal for every trade, use a pre-trade checklist, and conduct monthly reviews. After 3 months, she has 47 trades with a 52% win rate, average win of 1.8R, and average loss of 1.0R. Her equity curve shows gradual growth with a maximum drawdown of 8.5%. She is feeling impatient because her friend claims to be making 15% a month with a meme stock strategy.",
          question:
            "How should she interpret her performance, and what behavioral risk does her impatience represent?",
          options: [
            "Her system is genuinely positive expected value: expectancy = (0.52 × 1.8R) - (0.48 × 1.0R) = +0.936R - 0.48R = +0.456R per trade, which projects to sustainable long-term edge. The impatience is availability bias triggered by her friend's vivid but likely unsustainable returns",
            "A 52% win rate is too close to 50% to be meaningful; she should switch strategies immediately",
            "Her friend's 15% monthly returns prove meme stocks are a superior strategy she should adopt",
            "The 8.5% drawdown is excessive; any drawdown means the system is broken",
          ],
          correctIndex: 0,
          explanation:
            "Her expectancy calculation: (win rate × avg win) - (loss rate × avg loss) = (0.52 × 1.8) - (0.48 × 1.0) = 0.936 - 0.48 = +0.456R per trade. On 47 trades, this is a total of 21.4R of expected profit — a genuinely positive edge. An 8.5% maximum drawdown over 47 trades is reasonable and within professional standards (most hedge funds target drawdowns under 10-15%). The friend's 15% monthly claims are implausible long-term (15%/month compounds to 435% annually — the best hedge funds in history have not sustained this). The availability of the vivid, exciting story (friend making 15%/month) is triggering comparison and envy — classic System 1 interference. The correct System 2 response: stick with the proven positive-expectancy process.",
          difficulty: 3,
        },
      ],
    },
  ],
};
