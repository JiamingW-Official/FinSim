import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_FINANCE: Unit = {
  id: "behavioral-finance",
  title: "Behavioral Finance & Investor Psychology",
  description:
    "Understand the psychology behind markets, cognitive biases, loss aversion, herd behavior, and how to build real trading discipline",
  icon: "🧠",
  color: "#8b5cf6",
  lessons: [
    // ─── Lesson 1: Cognitive Biases in Trading ────────────────────────────────
    {
      id: "bf-1",
      title: "🧠 Cognitive Biases in Trading",
      description:
        "Overconfidence, anchoring, availability heuristic, representativeness, and mental accounting",
      icon: "Zap",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏆 Overconfidence Bias",
          content:
            "**Overconfidence** is the most documented bias in finance. Traders overestimate their own skill and the precision of their information.\n\nKey findings:\n- Studies show men trade **67% more** than women and earn 1% less per year — overconfidence drives overtrading\n- Most investors rate themselves 'above average' — statistically impossible for the majority\n- After a winning streak, overconfidence spikes exactly when humility is most needed\n\nConsequences of overtrading:\n- More commissions and taxes erode returns\n- Higher transaction frequency means more chances to make emotional mistakes\n- Underdiversification — overconfident traders concentrate into 'sure things'\n\nAntidote: Track your predictions vs. actual outcomes over at least 50 trades. Most traders discover their confidence exceeds their accuracy by 20–30 percentage points.",
          highlight: ["overconfidence", "overtrading", "calibration"],
        },
        {
          type: "teach",
          title: "🔗 Anchoring Bias",
          content:
            "**Anchoring** occurs when you over-rely on the first piece of information encountered — the 'anchor' — and adjust insufficiently away from it.\n\nTrading examples:\n- You bought a stock at $200. It drops to $120. You refuse to sell because your anchor is $200, not the current fundamentally relevant value.\n- Analysts anchor to old price targets and update them too slowly when conditions change.\n- Seeing a '52-week high' of $180 makes $120 feel 'cheap' — even if intrinsic value is $80.\n\n**Why it causes holding losers too long:**\nThe purchase price becomes a psychological reference point. Selling below it 'confirms' a mistake. But the entry price is irrelevant to future performance — what matters is current fundamentals and the opportunity cost of staying vs. reallocating.\n\nFix: When evaluating a position, deliberately ignore your cost basis. Ask: 'If I had cash instead of this stock today, would I buy it at this price?'",
          highlight: ["anchoring", "purchase price", "reference point", "cost basis"],
        },
        {
          type: "teach",
          title: "📰 Availability Heuristic, Representativeness & Mental Accounting",
          content:
            "**Availability heuristic (recency bias)**: You overweight vivid, recent, or memorable events when estimating probability.\n- After a crash, you overestimate future crash probability\n- After a hot IPO, every IPO feels like a surefire win\n- Media amplifies extreme events — so they feel more likely than base rates suggest\n\n**Representativeness**: Assuming patterns persist — the 'gambler's fallacy in reverse.'\n- A stock rising 5 days straight 'must' continue (ignoring regression to the mean)\n- 'This company reminds me of early Amazon' — short records misread as reliable patterns\n\n**Mental accounting**: Treating 'house money' (profits) differently from initial capital.\n- After a big win, trading recklessly because 'it's just profit, not real money'\n- Money is fungible — a dollar of profit buys exactly the same thing as any other dollar\n- Fix: Evaluate all capital with identical rigor regardless of its source",
          highlight: ["availability heuristic", "recency bias", "representativeness", "mental accounting", "house money"],
        },
        {
          type: "quiz-mc",
          question:
            "What cognitive bias causes investors to hold losing stocks too long due to their original purchase price?",
          options: [
            "Anchoring — fixation on the initial price paid as a reference point",
            "Availability heuristic — overweighting recent price memories",
            "Overconfidence — believing the stock will recover",
            "Representativeness — pattern-matching to past recoveries",
          ],
          correctIndex: 0,
          explanation:
            "Anchoring to the purchase price is the primary driver. The entry price becomes a psychological anchor — selling below it 'feels' like admitting failure, even though the entry price is irrelevant to future returns. Rational analysis requires ignoring sunk costs and evaluating only current value and future prospects.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Mental accounting means treating profits from a trade as 'real money' and being equally careful with them as with initial capital.",
          correct: false,
          explanation:
            "Mental accounting is the bias of treating money differently based on its source — often treating 'house money' (profits) as less real. This leads to excessive risk-taking with gains. Since money is fungible, a dollar of profit has identical value to a dollar of original capital and deserves the same discipline.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader bought a stock at $80. It's now $45 after poor earnings. Fundamentally similar alternative positions exist. She refuses to sell because she 'needs to get back to $80 first.' A colleague who bought the same stock at $50 sold at $45 and reallocated.",
          question: "Which bias is uniquely distorting the first trader's decision?",
          options: [
            "Anchoring — her $80 cost basis is distorting rational evaluation",
            "Loss aversion only — fear of realizing the loss",
            "Availability heuristic — vivid memory of the $80 price",
            "Representativeness — assuming the stock will behave like past recoveries",
          ],
          correctIndex: 0,
          explanation:
            "The $80 anchor is uniquely distorting her decision. Her colleague, with a different anchor at $50, made the rational decision to reallocate. Both own the same stock at $45 — only the anchor differs. This illustrates how anchoring, not the stock's actual prospects, drives the hold decision.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Loss Aversion & Prospect Theory ────────────────────────────
    {
      id: "bf-2",
      title: "📉 Loss Aversion & Prospect Theory",
      description:
        "Kahneman & Tversky, the disposition effect, fear of regret, endowment effect, and pre-committing to exit rules",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📚 Kahneman & Tversky's Prospect Theory",
          content:
            "In 1979, psychologists **Daniel Kahneman and Amos Tversky** published Prospect Theory — challenging the assumption that people make rational, utility-maximizing decisions.\n\nCore finding: **Losses hurt approximately 2.5× more than equivalent gains feel good.**\n\nA $1,000 loss creates about 2.5× the emotional pain as a $1,000 gain creates pleasure. This asymmetry is hardwired — it likely evolved because losses (food, shelter) were more threatening than equivalent gains were beneficial.\n\nThe **S-shaped value function**:\n- Steeper slope in the loss domain than the gain domain\n- Diminishing sensitivity in both directions (the difference between $100 and $200 feels larger than $1,100 and $1,200)\n- Evaluated relative to a reference point, not absolute wealth\n\nKahneman won the **Nobel Prize in Economics in 2002** for this work.",
          highlight: ["Prospect Theory", "Kahneman", "Tversky", "loss aversion", "2.5×"],
        },
        {
          type: "teach",
          title: "📊 The Disposition Effect & Fear of Regret",
          content:
            "The **disposition effect** (Shefrin & Statman, 1985): Investors systematically sell winners too early and hold losers too long — the exact opposite of what momentum-based trading requires.\n\nData: In studies of 10,000+ brokerage accounts, investors were **1.5× more likely** to sell a winning stock than a losing one on any given day.\n\nWhy? Two forces:\n1. **Loss aversion**: Realizing a loss makes it 'real' and painful. Holding an unrealized loss avoids that pain.\n2. **Regret avoidance**: Selling a winner that then rises further causes intense regret. Better to lock in the sure gain.\n\n**Fear of regret** is a distinct but related bias:\n- Investors avoid decisions where they could be demonstrably wrong and feel regret\n- This leads to inaction, following the crowd (if everyone is wrong, regret is diluted), and over-diversification\n- Commission of omission feels less regretful than commission of action\n\nResult: Portfolios accumulate losers and shed winners — a tax-inefficient, return-destroying pattern.",
          highlight: ["disposition effect", "sell winners", "hold losers", "regret avoidance"],
        },
        {
          type: "teach",
          title: "💍 Endowment Effect & Pre-Committing to Exit Rules",
          content:
            "**Endowment effect** (Richard Thaler): Once you own an asset, you value it more than you would if you didn't own it.\n\nClassic experiment: Students given a coffee mug demand ~$7 to sell it. Students without the mug offer ~$3 to buy it. Same object, dramatically different valuations based solely on ownership.\n\nIn trading: You value stocks you hold more than identical stocks you don't hold — making selling irrationally difficult.\n\n**The solution: Pre-commit to exit rules BEFORE entering positions**\n\nWhen you have no position, your thinking is clearest:\n- Set your stop-loss and target BEFORE entry\n- Write them down — this is a contract with yourself\n- Use hard stops in your broker platform, not mental stops\n- Define the thesis invalidation condition: 'I exit if the stock breaks below $X OR if Q2 earnings miss by >10%'\n\nPre-commitment removes the in-the-moment emotional negotiation that loss aversion and the endowment effect create.",
          highlight: ["endowment effect", "pre-commit", "exit rules", "stop-loss", "thesis invalidation"],
        },
        {
          type: "quiz-mc",
          question:
            "According to Prospect Theory, how much more painful is a $1,000 loss compared to how good a $1,000 gain feels?",
          options: [
            "~2.5× more painful — losses feel disproportionately worse than equivalent gains",
            "Exactly equal — gains and losses of the same amount feel the same",
            "~1.1× — losses are slightly worse but roughly equivalent",
            "~5× more painful — losses are catastrophically more impactful than gains",
          ],
          correctIndex: 0,
          explanation:
            "Kahneman and Tversky found through repeated experiments that losses feel approximately 2–2.5× more painful than equivalent gains feel good. This asymmetry is the foundation of Prospect Theory and explains the disposition effect, excessive risk aversion in gains, and risk-seeking behavior in the loss domain.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The disposition effect means investors tend to hold winning positions too long and sell losing positions too quickly.",
          correct: false,
          explanation:
            "The disposition effect is the opposite: investors sell winners too early (locking in sure gains) and hold losers too long (avoiding realizing painful losses). This is driven by Prospect Theory's loss aversion and the certainty effect. The pattern is academically well-documented in millions of real brokerage accounts.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Investor Maria owns 100 shares of a biotech at $60 (cost basis $70). A friend recommends selling and buying a different biotech with identical risk/return profile at $40. Maria refuses, saying 'I can't sell at a loss — I'll wait until it gets back to $70.'",
          question: "Which combination of biases is primarily driving Maria's decision?",
          options: [
            "Loss aversion + endowment effect + anchoring to $70 cost basis",
            "Overconfidence in the recovery potential",
            "Availability heuristic — recent memories of the stock at $70",
            "Representativeness — biotech stocks always recover",
          ],
          correctIndex: 0,
          explanation:
            "Three biases compound here: Loss aversion (realizing the $10 loss is painful), the endowment effect (she values her current stock more than the alternative), and anchoring to the $70 cost basis as a target. Rationally, both biotechs have identical prospects, so the switch should be neutral — but biases make it feel impossible.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Herd Behavior & Market Bubbles ────────────────────────────
    {
      id: "bf-3",
      title: "🐑 Herd Behavior & Market Bubbles",
      description:
        "Herd mentality, informational cascades, historical bubbles, bubble anatomy, and short selling constraints",
      icon: "Users",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🐑 Herd Mentality & Informational Cascades",
          content:
            "**Herd mentality**: Following the crowd rather than independent analysis — especially pronounced in bull markets when social proof reinforces the trend.\n\nWhy herding can feel rational:\n- If sophisticated investors are all buying, they might know something you don't\n- Social proof: collective wisdom of crowds sometimes is correct\n- Career risk: fund managers fear underperforming by acting differently from peers\n\n**Informational cascades** (Bikhchandani et al., 1992): A cascade occurs when people ignore their own private information and instead copy the actions of those who came before — even when their private signal contradicts the herd.\n\nExample sequence:\n1. Person A buys (positive private signal)\n2. Person B buys (positive signal; also saw A buy)\n3. Person C has a NEGATIVE signal but sees A and B buying → follows the herd anyway\n4. From C onward, all investors copy the herd regardless of their private signals\n\nResult: Markets can lock into incorrect equilibria. The cascade is fragile — a single public signal can reverse it instantly, causing a crash.",
          highlight: ["herd mentality", "informational cascade", "social proof", "private information"],
        },
        {
          type: "teach",
          title: "💡 Historical Bubbles: Patterns Through History",
          content:
            "Financial bubbles recur throughout history with striking regularity:\n\n**Tulip Mania (1637)**: Single tulip bulbs traded for 10× a craftsman's annual salary. Prices collapsed 99% in weeks.\n\n**South Sea Bubble (1720)**: British company with monopoly on South American trade. Isaac Newton lost £20,000 ('I can calculate the motion of heavenly bodies, but not the madness of people').\n\n**Dot-com Bubble (2000)**: Companies with no revenue valued in billions. Nasdaq fell 78% peak to trough. $5 trillion in market cap destroyed.\n\n**Housing Bubble (2008)**: 'Real estate always goes up' narrative + subprime lending + CDO complexity. Triggered global financial crisis.\n\n**Crypto Bubble (2021)**: Bitcoin reached $69,000, NFTs sold for millions. Bitcoin fell 75%. Many altcoins fell 95%+.\n\nCommon thread: A genuine innovation or narrative, amplified by leverage and herding, disconnects prices from fundamental value until a trigger causes cascading reversal.",
          highlight: ["Tulip Mania", "Dot-com", "Housing Bubble", "Crypto", "bubble", "narrative"],
        },
        {
          type: "teach",
          title: "📈 Bubble Anatomy & Short Selling Constraints",
          content:
            "**The 5 stages of a bubble** (Kindleberger/Minsky model):\n\n1. **Displacement**: A new technology, policy, or asset class captures imagination (internet, cheap credit, crypto)\n2. **Boom**: Prices rise, media coverage grows, credit expands, new investors enter\n3. **Euphoria**: Valuation metrics abandoned ('this time is different'). Everyone is making money.\n4. **Distress**: Insiders sell. Prices plateau. First cracks appear. Some investors start questioning.\n5. **Revulsion**: Panic selling, forced liquidations, prices overshoot to the downside.\n\n**Why don't rational investors prevent bubbles?**\nShort selling constraints:\n- Short selling costs money (borrow fees) and has unlimited theoretical loss\n- Timing is impossible — 'the market can stay irrational longer than you can stay solvent' (Keynes)\n- Career risk: managers who short bubbles are fired before being proven right (as happened to many dot-com skeptics in 1998–1999)\n- This prevents rational arbitrage from correcting mispricing until the bubble becomes unsustainable",
          highlight: ["displacement", "boom", "euphoria", "distress", "revulsion", "short selling constraints"],
        },
        {
          type: "quiz-mc",
          question:
            "What is an 'informational cascade' in financial markets?",
          options: [
            "When investors ignore their own private signals and copy others' actions, locking markets into potentially incorrect equilibria",
            "When price information cascades through different asset classes simultaneously",
            "When company earnings information leaks before official announcements",
            "When high-frequency trading algorithms react to order flow information",
          ],
          correctIndex: 0,
          explanation:
            "An informational cascade occurs when observing others' actions leads rational individuals to disregard their own private information. Once established, the cascade propagates regardless of the underlying truth — everyone follows the herd. This makes markets fragile: a single piece of contradicting public information can instantly reverse the cascade.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Short sellers help prevent bubbles because they can always profit by betting against overvalued assets with no risk.",
          correct: false,
          explanation:
            "Short selling carries substantial risks: borrow costs, theoretically unlimited losses if prices rise further, and severe career/reputational risk for professional managers. As Keynes noted, markets can 'stay irrational longer than you can stay solvent.' These constraints allow bubbles to persist and expand even when smart investors recognize the overvaluation.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "In 1999, a fund manager recognizes that tech stocks are wildly overvalued by all traditional metrics. He refuses to buy them. His fund underperforms peers by 30%. Clients withdraw assets. He is fired in early 2000 — just before the Nasdaq crashes 78%.",
          question: "Which concept best explains why bubbles persist despite rational investors recognizing them?",
          options: [
            "Short selling constraints — career risk and timing uncertainty prevent rational arbitrage from correcting mispricing",
            "Informational asymmetry — rational investors had less information than bulls",
            "Efficient markets — the tech valuations were actually correct",
            "Overconfidence — the fund manager was wrong about overvaluation",
          ],
          correctIndex: 0,
          explanation:
            "This scenario illustrates the classic 'limits of arbitrage' problem. The manager was analytically correct but fired before being proven right. Career risk, client redemptions, and the difficulty of timing bubble peaks prevent rational investors from correcting bubbles. This is why bubbles persist — and why 'the market can stay irrational longer than you can stay solvent.'",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Emotional Discipline Techniques ────────────────────────────
    {
      id: "bf-4",
      title: "⚔️ Emotional Discipline Techniques",
      description:
        "Trading journal, pre-mortems, the 10/10/10 rule, systematic checklists, and emotional regulation",
      icon: "CheckSquare",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📓 Trading Journal: Record Emotions, Not Just Prices",
          content:
            "A **trading journal** is your most powerful self-improvement tool. Elite traders treat it the way athletes watch game film — ruthlessly honest review.\n\nCritical distinction: **Record emotions at entry and exit, not just prices and P&L.**\n\nFor every trade, log:\n- Date, ticker, entry/exit price, size\n- Setup rationale: WHY did you enter?\n- Emotional state at entry (confident/anxious/FOMO? Scale 1–10)\n- Was exit planned or reactive?\n- Emotional state at exit — did you feel relieved, regretful, greedy?\n- What you'd do differently\n\nWeekly review patterns:\n- Are you worst when trading angry or after a loss? (Revenge trading signal)\n- Do you exit early on winners when excited? (Greed cutting winners)\n- Are you better on certain setups or times of day?\n\nStudies of active traders show those who journal improve performance by **15–25%** over 3 months vs. those who don't.",
          highlight: ["trading journal", "emotional state", "patterns", "setup rationale"],
        },
        {
          type: "teach",
          title: "🔍 Pre-Mortems & The 10/10/10 Rule",
          content:
            "**Pre-mortem** (Gary Klein): Before entering a trade, assume it has already failed. Work backward to identify why.\n\nAsk:\n- What is the most likely reason this trade loses money?\n- What would have to be true for the thesis to be wrong?\n- What specific price level or data point would prove me wrong?\n\nThis technique is used by hedge funds, special forces, and surgeons before high-stakes operations. It counteracts overconfidence by forcing you to steelman the bearish case BEFORE emotional attachment forms.\n\n**The 10/10/10 Rule** (Suzy Welch):\nWhen facing an emotional trading decision, ask:\n- How will I feel about this in **10 minutes**? (Immediate emotional state — often unreliable)\n- How will I feel about this in **10 months**? (Medium-term consequence)\n- How will I feel about this in **10 years**? (Long-term impact on wealth and habits)\n\nThis creates temporal perspective. A trade that feels urgent right now rarely matters in 10 months — but a pattern of breaking your rules does matter in 10 years.",
          highlight: ["pre-mortem", "10/10/10 rule", "overconfidence", "temporal perspective"],
        },
        {
          type: "teach",
          title: "✅ Systematic Rules, Checklists & Emotional Regulation",
          content:
            "**Systematic rules vs. discretion**: Checklists, position sizing rules, and automated stops remove emotion from in-the-moment decisions.\n\nPre-trade checklist:\n□ Does this match my strategy criteria?\n□ Entry, stop-loss, and target defined BEFORE entry?\n□ R:R ≥ 1:2?\n□ Risk ≤ 1–2% of portfolio?\n□ Am I entering due to FOMO or genuine setup?\n□ What would invalidate my thesis?\n\n**Emotional regulation for traders** (documented in hedge fund research):\n- **Mindfulness meditation**: Studies of proprietary traders show 23% reduction in impulsive trades after 8-week mindfulness programs (Fenton-O'Creevy et al., 2012)\n- **Physical exercise**: Exercise reduces cortisol (stress hormone) and improves executive function — directly relevant to trading decisions\n- **Mandatory break rule**: After any loss exceeding X% of daily risk budget, stop trading for the day\n- **Breathing protocols**: Box breathing (4-4-4-4) before trade execution activates parasympathetic nervous system, reducing impulsivity\n\nThe goal is not to eliminate emotion — it's to prevent emotion from overriding pre-committed rules.",
          highlight: ["checklist", "position sizing", "stop-loss automation", "mindfulness", "emotional regulation"],
        },
        {
          type: "quiz-mc",
          question:
            "What is a 'pre-mortem' in trading context?",
          options: [
            "Imagining a trade has already failed and working backward to identify why it failed",
            "Reviewing a trade after it closes to learn from the outcome",
            "Calculating the maximum possible loss before entering",
            "Checking historical performance of a pattern before trading it",
          ],
          correctIndex: 0,
          explanation:
            "A pre-mortem (from Gary Klein's research) involves prospective hindsight — assuming the bad outcome has already occurred before it can happen. By asking 'this trade failed, why?' BEFORE entry, you counteract overconfidence and identify risks that forward-looking analysis misses. It forces engagement with the bearish case before emotional attachment forms.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A skilled trader relies primarily on willpower and real-time emotional control to avoid bias, rather than pre-committed rules and automated stops.",
          correct: false,
          explanation:
            "Research consistently shows willpower is unreliable under stress — exactly the conditions of active trading. Behavioral finance pioneers like Thaler recommend 'libertarian paternalism': design systems (hard stops, checklists, automated rules) that make the correct behavior the path of least resistance. Professional traders rely on rules, not in-the-moment willpower.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader is about to enter a momentum trade that's already moved 8%. He feels intense urgency. His checklist shows R:R is 1:1.3 (below his 1:2 minimum) and the setup only partially meets his criteria. He's about to override the checklist 'just this once.'",
          question: "Applying the 10/10/10 rule, which perspective is most relevant here?",
          options: [
            "10 years: overriding rules 'just this once' establishes a habit of breaking rules — destroying discipline long-term",
            "10 minutes: he'll feel good about acting on the urgency",
            "10 months: one trade rarely matters over 10 months",
            "10 years: missing this trade will cause long-term regret",
          ],
          correctIndex: 0,
          explanation:
            "The 10-year perspective reveals the true stakes: not whether this specific trade wins or loses, but whether 'just this once' rule-breaking becomes a pattern. Every systematic deviation erodes the discipline structure. The 10/10/10 rule helps see past immediate urgency (FOMO) to the long-term consequence of the habit being formed.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Market Anomalies & Behavioral Alpha ────────────────────────
    {
      id: "bf-5",
      title: "📈 Market Anomalies & Behavioral Alpha",
      description:
        "Momentum, value premium, January effect, post-earnings drift, and exploiting behavioral biases",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🚀 Momentum Anomaly: Underreaction Explains Persistence",
          content:
            "The **momentum anomaly**: Stocks that have performed well over the past 3–12 months tend to continue outperforming, and past losers continue underperforming — for another 3–12 months.\n\nThis violates the Efficient Market Hypothesis (past prices shouldn't predict future prices).\n\n**Behavioral explanation — investor underreaction:**\n- Investors update their beliefs too slowly when companies report good news\n- Initial market reaction is insufficient — prices drift up gradually as more investors slowly recognize the positive development\n- Anchoring to prior prices prevents immediate full repricing\n- Herding amplifies the effect as more investors pile in after the trend is visible\n\nEvidence:\n- Jegadeesh and Titman (1993): 12-month momentum strategy earns ~1% per month\n- Momentum is one of the most robust anomalies across 40+ countries and asset classes\n- Crashes violently during sharp market reversals (momentum crash risk)",
          highlight: ["momentum", "underreaction", "anchoring", "price drift", "Jegadeesh Titman"],
        },
        {
          type: "teach",
          title: "💎 Value Premium & Post-Earnings Drift",
          content:
            "**Value premium**: 'Cheap' stocks (low P/E, P/B, EV/EBITDA) historically outperform 'expensive' growth stocks over long horizons.\n\n**Behavioral explanation — overreaction and extrapolation:**\n- Investors extrapolate past growth too far into the future, overpaying for glamour stocks\n- They overreact to bad news for value stocks, driving prices too low\n- When reality (mean reversion) disappoints glamour stocks and surprises value stocks, prices correct\n- This is the opposite of the momentum effect — here the bias is OVERreaction\n\n**Post-Earnings Announcement Drift (PEAD):**\n- After a positive earnings surprise, stocks drift upward for 3–6 months (not immediately priced in)\n- After a negative surprise, stocks drift downward for months\n- Classic underreaction: investors are slow to fully update beliefs after surprises\n- PEAD is one of the most replicated anomalies in finance — documented since Ball & Brown (1968)\n\n**January effect**: Small-cap stocks outperform in January, explained by tax-loss selling in December followed by reinvestment — a predictable behavioral pattern from tax optimization.",
          highlight: ["value premium", "overreaction", "PEAD", "earnings drift", "January effect"],
        },
        {
          type: "teach",
          title: "🎯 Exploiting Biases: Contrarian & Trend-Following Alpha",
          content:
            "Understanding behavioral biases creates **behavioral alpha** — returns earned by systematically exploiting others' mistakes.\n\n**Contrarian investing** (exploits overreaction):\n- Buy stocks beaten down by overreaction to bad news; sell glamour stocks priced for perfection\n- Deep value investors (Graham, Buffett) have earned excess returns for decades\n- Requires emotional fortitude — you are buying what everyone hates\n\n**Trend following / momentum** (exploits underreaction):\n- Buy recent winners; sell recent losers\n- Systematic CTAs (commodity trading advisors) have profited from momentum across futures markets for 50+ years\n- Works because investors are slow to fully update beliefs\n\n**Behavioral factor ETFs:**\n- MTUM (momentum factor ETF), VLUE (value factor ETF), QMJ (quality minus junk)\n- Academic factors package behavioral anomalies into systematic rules\n\n**Key insight**: Biases create predictable patterns — but exploiting them requires rules-based systems. Human traders often abandon the strategy at the exact wrong moment (when it's most uncomfortable), eliminating the behavioral edge.",
          highlight: ["behavioral alpha", "contrarian", "trend following", "momentum factor", "value factor"],
        },
        {
          type: "quiz-mc",
          question:
            "What explains the momentum anomaly from a behavioral finance perspective?",
          options: [
            "Investors underreact to good news, causing gradual price adjustment as beliefs update slowly over months",
            "Investors overreact to good news, creating a temporary spike that reverses",
            "Institutional algorithms create artificial momentum through high-frequency trading",
            "Markets are perfectly efficient and momentum returns are explained by risk premiums only",
          ],
          correctIndex: 0,
          explanation:
            "Momentum persists because investors anchor to prior prices, update beliefs too slowly, and underreact to earnings surprises and positive news. Prices drift gradually upward as more investors slowly recognize the positive development. This is the behavioral explanation — distinct from risk-based explanations. The anomaly is documented across 40+ countries and multiple asset classes.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Post-Earnings Announcement Drift (PEAD) is explained by investors overreacting to earnings surprises, which causes prices to reverse after the initial move.",
          correct: false,
          explanation:
            "PEAD is actually caused by investor UNDERREACTION, not overreaction. After an earnings surprise, prices drift in the direction of the surprise for 3–6 months — not reversing. Investors are slow to fully update beliefs and reprice the stock. The drift continues as the broader market gradually incorporates the information. Overreaction would cause a reversal; PEAD is the opposite.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A quantitative fund systematically buys stocks with strong 6-month price momentum and sells stocks with poor 6-month momentum, rebalancing monthly. In March 2009 (sharp market reversal), the momentum portfolio crashes 40% in 4 weeks — more than the market itself.",
          question: "What does this illustrate about behavioral alpha strategies?",
          options: [
            "Momentum crashes during sharp reversals — behavioral strategies have specific risk characteristics that require understanding and risk management",
            "The strategy is fundamentally flawed and behavioral anomalies don't exist",
            "The January effect explains the March reversal",
            "Overreaction by value investors caused momentum stocks to crash",
          ],
          correctIndex: 0,
          explanation:
            "The 'momentum crash' phenomenon (Daniel and Moskowitz, 2016) shows that momentum strategies have positive average returns but sharp, severe drawdowns during market reversals. Understanding WHEN a strategy fails is as important as knowing its average edge. Behavioral alpha is real but requires robust risk management — momentum works because of underreaction, but in crashes, forced deleveraging creates violent mean reversion.",
          difficulty: 3,
        },
      ],
    },
  ],
};
