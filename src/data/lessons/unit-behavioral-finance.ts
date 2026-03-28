import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_FINANCE: Unit = {
  id: "behavioral-finance",
  title: "Behavioral Finance",
  description:
    "Understand the psychology behind markets, biases, and how to build real trading discipline",
  icon: "Brain",
  color: "#8b5cf6",
  lessons: [
    // ─── Lesson 1: Cognitive Biases in Trading ────────────────────────────────
    {
      id: "bf-1",
      title: "🧠 Cognitive Biases in Trading",
      description:
        "Anchoring, availability heuristic, representativeness, and overconfidence",
      icon: "Zap",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🔗 Anchoring Bias",
          content:
            "**Anchoring** occurs when you over-rely on the first piece of information you encounter (the 'anchor') and adjust insufficiently away from it.\n\nTrading examples:\n- You bought a stock at $200. It drops to $120. You refuse to sell because your anchor is $200, not the current $120.\n- Analysts anchor to a $50 price target from months ago and update it too slowly when fundamentals change.\n- You see a '52-week high' of $180 and anchor to it, assuming $120 is 'cheap' — even if fundamentals support $80.\n\nFix: Evaluate each position based on **current fundamentals**, not your entry price.",
          highlight: ["anchoring", "anchor", "entry price", "price target"],
        },
        {
          type: "teach",
          title: "📰 Availability Heuristic & Representativeness",
          content:
            "**Availability heuristic**: You overweight vivid, memorable, or recent events when estimating probability.\n\n- After a market crash, you overestimate crash probability\n- After a hot IPO, you overestimate every IPO's chances of success\n- Media covers extreme events (crashes, meme stocks) — so they feel more likely than they are\n\n**Representativeness bias**: You assume a pattern or company that 'looks like' a past winner will also win.\n\n- 'This company reminds me of early Amazon' (overused rationalization)\n- Short track records look like skill when they may be luck\n- A stock that has risen 5 days in a row 'must' continue rising",
          highlight: ["availability heuristic", "representativeness", "recency bias"],
        },
        {
          type: "teach",
          title: "🏆 Overconfidence Bias",
          content:
            "**Overconfidence** is the most documented bias in finance. Studies consistently show:\n\n- Most investors believe they are 'above average' traders (mathematically impossible for the majority)\n- Overconfident traders trade **more frequently** — generating more commissions, taxes, and errors\n- After a winning streak, overconfidence spikes — exactly when humility is most needed\n\n**Calibration exercise**: Keep a record of your predictions (entry, target, stop). Track your actual accuracy. Most traders discover their confidence exceeds their accuracy by 20–30 percentage points.\n\nAntidote: Trade smaller, track everything, and review your record ruthlessly.",
          highlight: ["overconfidence", "calibration", "trading frequency"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader bought a stock at $100. It's now $60. She refuses to sell because 'it'll bounce back to $100.' Which bias is this?",
          options: [
            "Anchoring bias — over-relying on the $100 purchase price",
            "Availability heuristic — remembering past bounces",
            "Overconfidence — believing she can time the recovery",
            "Representativeness — it looks like stocks that recovered before",
          ],
          correctIndex: 0,
          explanation:
            "Classic anchoring. The $100 entry price is the anchor, making $60 feel wrong. But the current value and future prospects should drive the decision — not where you bought it. 'It was worth $100' doesn't mean it will be again.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "After three consecutive winning trades, a trader should increase position sizes significantly because their strategy is clearly working.",
          correct: false,
          explanation:
            "This is overconfidence triggered by a short winning streak. Three wins in a row is statistically unremarkable — even a coin flip produces runs. Increasing size prematurely is how overconfident traders blow up. Track larger sample sizes (50+ trades) before drawing conclusions.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "After a dramatic market crash last year, investor Ben now avoids stocks entirely and keeps all savings in cash, even though historical average annual returns favor equities over 10+ year horizons.",
          question: "Which bias primarily explains Ben's behavior?",
          options: [
            "Availability heuristic — the crash is vivid and feels representative of normal risk",
            "Anchoring — he's anchored to pre-crash prices",
            "Overconfidence — he's too confident in his cash strategy",
            "Representativeness — he thinks all assets behave like crash-era stocks",
          ],
          correctIndex: 0,
          explanation:
            "The dramatic, memorable crash is cognitively 'available' and distorts his probability estimate of future crashes. Recency bias compounds this — the recent event feels more representative of 'normal' than the historical record shows.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Emotional Trading Psychology ───────────────────────────────
    {
      id: "bf-2",
      title: "😰 Emotional Trading Psychology",
      description:
        "Fear and greed cycle, loss aversion, FOMO, and revenge trading",
      icon: "Heart",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "😨 The Fear & Greed Cycle",
          content:
            "Markets are driven by two emotions cycling endlessly:\n\n**Greed phase**: Prices rise, news is positive, everyone is confident. Investors buy near peaks, ignoring valuation.\n\n**Fear phase**: Prices fall, news turns negative, panic sets in. Investors sell near bottoms, locking in losses.\n\nThe cycle repeats: Optimism → Excitement → Thrill → Euphoria → Anxiety → Denial → Panic → Capitulation → Despondency → Depression → Hope → Relief → Optimism...\n\n**Contrarian insight**: The best buying opportunities occur at peak fear (capitulation). The best selling opportunities occur at peak greed (euphoria). Most retail investors do the opposite.",
          highlight: ["fear", "greed", "capitulation", "euphoria", "contrarian"],
        },
        {
          type: "teach",
          title: "📉 Loss Aversion",
          content:
            "**Loss aversion**: Psychologically, losses hurt roughly **twice as much** as equivalent gains feel good.\n\nA $1,000 loss creates about twice the emotional pain as a $1,000 gain creates pleasure. This asymmetry causes systematic errors:\n\n- **Holding losers too long**: Refusing to realize a loss (it would become 'real')\n- **Selling winners too early**: Taking profits quickly because the gain might 'disappear'\n- **Risk aversion in gains, risk-seeking in losses**: You play it safe when winning but gamble to 'get back to even' when losing\n\nThis behavior pattern guarantees cutting your winners short and letting your losers run — the exact opposite of what profitable trading requires.",
          highlight: ["loss aversion", "holding losers", "selling winners", "get back to even"],
        },
        {
          type: "teach",
          title: "🚀 FOMO & Revenge Trading",
          content:
            "**FOMO (Fear of Missing Out)**: Buying into a rapidly moving stock because you're afraid of being left behind. FOMO buyers typically enter near the top, after most of the move is done.\n\nSigns of FOMO entry:\n- Stock has already risen 30%+ quickly\n- You didn't plan the trade — you saw social media buzz\n- You feel urgency ('I need to get in NOW')\n\n**Revenge trading**: After a loss, placing an oversized, emotional trade to 'make back' losses quickly. This is one of the fastest ways to blow up an account — emotional state is the worst trading advisor.\n\nBoth are the same root cause: **reacting emotionally to price moves** rather than following a pre-planned strategy.",
          highlight: ["FOMO", "revenge trading", "emotional trading", "pre-planned"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader loses $800 on a trade. Feeling frustrated, he immediately bets $2,000 on a high-risk option to recover quickly. What is this called?",
          options: [
            "Revenge trading — emotional response to a loss",
            "Position scaling — a legitimate risk management technique",
            "Dollar-cost averaging — reducing average cost",
            "Hedging — protecting against further losses",
          ],
          correctIndex: 0,
          explanation:
            "Revenge trading is placing an oversized, emotional trade immediately after a loss to 'get even.' It compounds the problem — you're trading angry, sizing up, and taking excessive risk at exactly the wrong moment.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Loss aversion causes traders to sell their winning trades too early and hold losing trades too long.",
          correct: true,
          explanation:
            "Exactly. Fear of giving back gains makes us exit winners prematurely. Fear of realizing losses makes us hold losers hoping for recovery. This cuts winners short and lets losers run — mathematically destructive. The antidote is pre-defined exits (stops and targets) before entering.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "GameStop surges 180% in 3 days on Reddit buzz. Maya sees it on social media, hasn't researched it, but feels certain it will keep going. She buys at the top with no stop-loss.",
          question: "Which psychological forces are driving Maya's decision?",
          options: [
            "FOMO + availability heuristic + overconfidence",
            "Loss aversion + anchoring",
            "Value investing + fundamental analysis",
            "Contrarian thinking + risk management",
          ],
          correctIndex: 0,
          explanation:
            "FOMO drives urgency ('I'll miss it'). The vivid social media coverage (availability heuristic) makes it feel like a sure thing. Overconfidence removes the stop-loss. This combination — common in meme stock episodes — creates catastrophic losses for late buyers.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Prospect Theory & Decision Making ──────────────────────────
    {
      id: "bf-3",
      title: "🎲 Prospect Theory & Decision Making",
      description:
        "Kahneman and Tversky, value function, probability weighting, and mental accounting",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📚 Kahneman & Tversky's Breakthrough",
          content:
            "In 1979, psychologists **Daniel Kahneman and Amos Tversky** published Prospect Theory — one of the most cited papers in economics. They challenged the assumption that people make rational, utility-maximizing decisions.\n\nKey finding: People evaluate outcomes **relative to a reference point** (usually the status quo or purchase price), not in absolute terms.\n\nTwo key effects:\n1. **Loss aversion**: Losses feel ~2× more painful than equivalent gains feel pleasurable\n2. **Diminishing sensitivity**: The difference between $100 and $200 feels larger than between $1,100 and $1,200 (even though both are $100)\n\nKahneman won the Nobel Prize in Economics in 2002 for this work.",
          highlight: ["Prospect Theory", "Kahneman", "Tversky", "reference point", "loss aversion"],
        },
        {
          type: "teach",
          title: "📈 The Value Function & Probability Weighting",
          content:
            "**The Value Function** in Prospect Theory is S-shaped:\n- Steeper for losses than gains (loss aversion)\n- Curves flatten at extremes (diminishing sensitivity)\n- Evaluated relative to a reference point, not absolute wealth\n\n**Probability Weighting**: People don't treat probabilities linearly:\n- Overweight small probabilities (why people buy lottery tickets and insurance)\n- Underweight moderate-to-large probabilities\n- Certainty effect: 100% feels disproportionately better than 95%\n\nTrading implication: Traders prefer a 'sure' small gain over a risky larger gain (sells too early), and prefer a gamble to a sure loss (holds losers too long). Both are Prospect Theory predictions.",
          highlight: ["value function", "probability weighting", "certainty effect", "diminishing sensitivity"],
        },
        {
          type: "teach",
          title: "🧮 Mental Accounting",
          content:
            "**Mental accounting** (Richard Thaler, Nobel 2017): People treat money differently based on its origin or intended purpose, even though money is fungible.\n\nExamples in trading:\n- 'House money effect': After a big win, trading recklessly because 'it's profit, not real money'\n- Keeping a losing trade open in a separate mental 'account' rather than taking the loss and reallocating\n- Treating a tax refund as 'bonus money' and spending it frivolously (it was always your money)\n- Refusing to sell a losing stock while simultaneously buying a similar stock — same risk, but one 'feels' like a loss and the other doesn't\n\nFix: Evaluate all capital the same way, regardless of its source.",
          highlight: ["mental accounting", "house money effect", "Richard Thaler", "fungible"],
        },
        {
          type: "quiz-mc",
          question:
            "Prospect Theory predicts that most people, when given a choice between a guaranteed $500 and a 50% chance at $1,200, will choose:",
          options: [
            "The guaranteed $500 — certainty effect makes the sure gain more attractive",
            "The 50% chance at $1,200 — expected value is higher at $600",
            "They're indifferent — both have similar utility",
            "The gamble — people are naturally risk-seeking",
          ],
          correctIndex: 0,
          explanation:
            "Despite the 50% gamble having higher expected value ($600 vs $500), Prospect Theory predicts most people take the certain $500 in the gain domain. The certainty effect makes sure gains disproportionately attractive. Flip to losses and people become risk-seeking.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The 'house money effect' refers to trading more conservatively after a big winning trade.",
          correct: false,
          explanation:
            "The house money effect is the opposite — traders become MORE reckless with profits because they mentally separate 'winnings' from 'real capital.' They rationalize excess risk because they're 'playing with the house's money.' This leads to giving back gains through oversized bets.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Investor holds $10,000 in Stock A (down 15%) and $10,000 in Stock B (up 20%). Both have identical future prospects. He sells Stock B to 'lock in' the gain but keeps Stock A hoping for recovery.",
          question: "Which behavioral biases are at work?",
          options: [
            "Loss aversion + mental accounting — avoids realizing the loss, locks in the gain early",
            "Prospect Theory's certainty effect only",
            "Rational tax optimization — selling the winner minimizes tax",
            "Diversification — reducing concentration in both positions",
          ],
          correctIndex: 0,
          explanation:
            "Classic Prospect Theory pattern: loss aversion keeps the loser (can't bear to realize the loss), and the certainty effect motivates selling the winner early (locking in the 'sure' gain). Mental accounting treats each position in isolation. Rationally, with identical prospects, there's no reason to sell B and hold A.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Social Influences on Markets ───────────────────────────────
    {
      id: "bf-4",
      title: "👥 Social Influences on Markets",
      description:
        "Herding behavior, narrative economics, short squeezes, and meme stock dynamics",
      icon: "Users",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🐑 Herding Behavior",
          content:
            "**Herding** occurs when investors follow the crowd rather than their own analysis — believing that collective behavior conveys information.\n\nWhy herding is rational (but dangerous):\n- If others know something you don't, following them makes sense\n- Social proof — if everyone is buying, it must be good\n- Career risk — fund managers fear underperforming by acting differently from peers\n\nHerding causes:\n- **Momentum**: Prices overshoot fair value as herds pile in\n- **Bubbles**: Asset prices disconnect from fundamentals\n- **Synchronized crashes**: Herds exit simultaneously, amplifying downside\n\nCountermeasure: Independent analysis. Ask 'Would I buy/sell this if nobody else was?'",
          highlight: ["herding", "momentum", "bubble", "social proof", "independent analysis"],
        },
        {
          type: "teach",
          title: "📖 Narrative Economics",
          content:
            "Nobel economist Robert Shiller coined **narrative economics** — the idea that viral stories drive economic behavior as powerfully as data.\n\n'AI will replace every job' (2023–) drove trillion-dollar valuations.\n'Crypto is the future of money' drove Bitcoin to $69K then crashed to $16K.\n'Real estate always goes up' fueled the 2008 housing crisis.\n\nNarratives spread like viruses — contagious, emotionally resonant, and often only loosely tethered to facts. They create **self-fulfilling prophecies**: everyone believes the story, so everyone acts on it, which makes the story temporarily true.\n\nSkill: Separate the narrative from the valuation. What are you actually paying for?",
          highlight: ["narrative economics", "Shiller", "self-fulfilling prophecy", "valuation"],
        },
        {
          type: "teach",
          title: "🚀 Short Squeezes & Meme Stocks",
          content:
            "**Short squeeze**: When a heavily shorted stock rises sharply, forcing short sellers to buy shares to cover losses, which drives the price even higher.\n\nMechanism:\n1. Stock is heavily shorted (high short float >20%)\n2. Price rises (any catalyst)\n3. Short sellers face mounting losses\n4. They buy to cover → price spikes further\n5. More shorts forced out → cycle accelerates\n\n**Meme stocks** (GameStop 2021, AMC, etc.) combined short squeezes with coordinated retail buying from forums like Reddit's WallStreetBets.\n\nKey lesson: Short squeezes are momentum trades disconnected from fundamentals. They end violently. Late buyers absorb losses as early buyers exit.",
          highlight: ["short squeeze", "short float", "meme stocks", "cover", "momentum"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock has a 35% short float. It unexpectedly reports strong earnings, and the price surges 15%. What is likely to happen next?",
          options: [
            "Short squeeze — short sellers buy to cover, accelerating the price rise",
            "Price reverses immediately — earnings surprises are priced in quickly",
            "Short sellers add more positions betting on a reversal",
            "The stock trades sideways as supply and demand balance",
          ],
          correctIndex: 0,
          explanation:
            "A 35% short float is extremely high. A catalyst (strong earnings) forces short sellers to buy shares to cover losses. Their forced buying adds to demand, pushing price higher, triggering more covering — a classic short squeeze cascade.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Herding behavior in financial markets is always irrational and provides no useful information.",
          correct: false,
          explanation:
            "Herding can be partially rational — if informed investors are all moving in one direction, following might be correct. The problem is that herd behavior amplifies both correct and incorrect signals, causing overshooting. Markets often 'overherd,' taking prices well beyond what fundamentals justify.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A stock rises 400% in 2 weeks driven entirely by Reddit posts and social media hype, with no fundamental change in the business. Trading volume is 50× normal. You're considering buying.",
          question: "What does behavioral finance suggest about this situation?",
          options: [
            "Classic meme stock/herd dynamics — late buyers absorb losses when narrative fades",
            "Strong fundamental demand — volume confirms institutional buying",
            "Short squeeze opportunity — load up for continued momentum",
            "Efficient market reaction to positive news not yet widely reported",
          ],
          correctIndex: 0,
          explanation:
            "400% with no fundamental change is pure narrative/herding. Volume spike is retail FOMO, not institutional buying. Late buyers at peak hype face severe losses when the narrative fades (and it always does). The risk/reward of chasing parabolic meme moves is extremely poor.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Building Trading Discipline ────────────────────────────────
    {
      id: "bf-5",
      title: "⚔️ Building Trading Discipline",
      description:
        "Trading rules, journaling habits, pre-trade checklist, and review process",
      icon: "CheckSquare",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📜 Trading Rules That Save You",
          content:
            "Professional traders don't rely on willpower — they rely on **rules**. Rules remove emotion from in-the-moment decisions.\n\nEssential rules:\n1. **Never risk more than 1–2% of portfolio on one trade**\n2. **Always define stop-loss before entering** — not after\n3. **No trading in the first 30 minutes of market open** (highest volatility, spread manipulation)\n4. **No revenge trading** — mandatory 24-hour break after a large loss\n5. **No adding to losing positions** unless the thesis explicitly predicted it\n6. **Lock in partial profits** at first target; trail stop on remainder\n\nRules only work if they are **non-negotiable**. The moment you 'just this once' break a rule, the rule is gone.",
          highlight: ["trading rules", "stop-loss", "risk per trade", "non-negotiable"],
        },
        {
          type: "teach",
          title: "📓 The Trading Journal",
          content:
            "A **trading journal** is your most powerful improvement tool. Elite traders treat it like athletes watch game film.\n\nWhat to log for every trade:\n- Date, ticker, entry/exit price, size\n- Setup rationale: WHY did you enter?\n- Emotional state before the trade (1–10 confidence, calm/anxious?)\n- Was exit planned or emotional?\n- What you'd do differently\n\nReview weekly: Look for patterns. Are you best at certain setups? Worst at certain times of day? Losing more on days when you feel overconfident?\n\nStudies show traders who journal show 15–25% improvement in performance within 3 months compared to those who don't.",
          highlight: ["trading journal", "setup rationale", "emotional state", "patterns"],
        },
        {
          type: "teach",
          title: "✅ Pre-Trade Checklist & Review Process",
          content:
            "A **pre-trade checklist** (like a pilot's preflight check) prevents impulsive decisions:\n\n□ Does this setup match my strategy criteria?\n□ What is my entry price? Stop-loss? First target?\n□ What is the R:R ratio? (Minimum 1:2)\n□ How much am I risking? (Max 1–2% of portfolio)\n□ Why might I be wrong? What invalidates the trade?\n□ Am I entering due to FOMO or because the setup is genuinely there?\n\n**Weekly review process**:\n1. Review all trades — winners and losers\n2. Categorize: Followed plan / Deviated from plan\n3. Calculate metrics: Win rate, avg win, avg loss, EV\n4. Identify one improvement for next week\n\nMeasure process quality, not just P&L. Following your rules perfectly on a losing trade is success.",
          highlight: ["pre-trade checklist", "R:R ratio", "review process", "process quality"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader's pre-trade checklist shows an R:R of 1:1.5 and a setup that doesn't clearly match their strategy criteria. The stock is moving fast. What should the trader do?",
          options: [
            "Skip the trade — R:R minimum not met and setup criteria unclear",
            "Enter immediately — price is moving and the checklist can wait",
            "Enter with a larger size to compensate for lower R:R",
            "Remove the R:R criterion — it's too restrictive",
          ],
          correctIndex: 0,
          explanation:
            "The checklist exists to prevent exactly this mistake. R:R below 1:2 and ambiguous setup = skip. 'Price is moving' is FOMO talking, not analysis. The checklist has no meaning if it can be overridden whenever the market creates urgency.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A trading week with 60% win rate and positive P&L is more informative than a week where you followed your rules perfectly but lost money.",
          correct: false,
          explanation:
            "Over short periods, outcomes are heavily influenced by randomness. A week of following your rules perfectly on a slightly unfavorable series of trades tells you more about your process quality than a lucky week with poor discipline. Consistent process, tracked over 50+ trades, reveals true edge.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Trader James has been losing for 3 consecutive weeks. His journal shows: he's been trading for the first 15 minutes of open (his own rule says don't), adding to losers, and exiting winners at the first target without trailing. His account is down 12%.",
          question: "What is the PRIMARY fix James needs to make?",
          options: [
            "Return to following his own rules before changing his strategy",
            "Abandon the strategy and find a new one immediately",
            "Increase position sizes to recover losses faster",
            "Stop trading entirely — 12% loss means the strategy doesn't work",
          ],
          correctIndex: 0,
          explanation:
            "James has a discipline problem, not necessarily a strategy problem. His journal clearly shows he's violating his own rules. Fixing rule adherence should come before any strategy changes — otherwise he'll never know if the strategy works. Increasing size while undisciplined is dangerous.",
          difficulty: 3,
        },
      ],
    },
  ],
};
