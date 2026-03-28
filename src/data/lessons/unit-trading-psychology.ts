import type { Unit } from "./types";

export const UNIT_TRADING_PSYCHOLOGY: Unit = {
  id: "trading-psychology",
  title: "Trading Psychology",
  description:
    "Master the mental game of trading — emotions, discipline, consistency, and peak performance",
  icon: "Brain",
  color: "#0ea5e9",
  lessons: [
    // ─── Lesson 1: The Trader's Mindset ───────────────────────────────────────
    {
      id: "psych-1",
      title: "The Trader's Mindset",
      description:
        "Professional vs amateur mindset, process over outcomes, handling uncertainty, accountability",
      icon: "Lightbulb",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Professional vs Amateur Mindset",
          content:
            "The gap between profitable and losing traders is rarely about intelligence or stock picks — it is about **mindset**.\n\n**Amateur mindset**:\n- Focuses on how much money can be made this week\n- Treats trading like gambling — big wins, big thrills\n- Blames the market, the broker, or bad luck for losses\n- Chases hot tips and social media calls\n\n**Professional mindset**:\n- Focuses on executing the process correctly, every single time\n- Treats each trade as one of thousands — no single trade matters much\n- Takes full accountability for every outcome\n- Follows a written plan, not impulses\n\nThe professional knows that if the process is right, the profits follow over time. Amateurs skip the process and chase the profits directly — and lose.",
          highlight: ["professional mindset", "process", "accountability", "plan"],
        },
        {
          type: "teach",
          title: "Process Over Outcomes",
          content:
            "In trading, a good process can produce a losing trade. A reckless process can produce a winning trade. **Randomness is real** — individual outcomes tell you almost nothing.\n\nWhat separates elite traders:\n- They measure success by **did I follow my rules?** not by P&L on any single trade\n- They understand that expected value (EV) plays out over hundreds of trades, not one\n- They can take a loss calmly, knowing the process was correct\n\nPractical test: If you took 100 identical trades using your exact process, would you expect to make money on average? If yes, the process is sound. Trust it. Do not abandon it after a losing streak.\n\n**Outcome bias** — judging a decision by its result rather than its quality at the time — is what destroys process-driven thinking.",
          highlight: ["process over outcomes", "expected value", "outcome bias", "rules"],
        },
        {
          type: "teach",
          title: "Handling Uncertainty and Accountability",
          content:
            "Trading is a **probability game** played under radical uncertainty. You never know which trade will win. Accept this fully.\n\nHandling uncertainty:\n- Define your risk before every trade — the maximum loss is your certainty\n- Accept losses as the cost of doing business, like a retailer accepts inventory costs\n- Never confuse a losing trade with a bad trade — they are different things\n\nAccountability framework:\n1. After every trade, ask: 'Did I follow my plan?'\n2. If yes — outcome was beyond your control. Log it and move on.\n3. If no — identify the deviation and understand why it happened\n4. Never blame external forces for internal decisions\n\nAccountability is not self-punishment. It is honest data collection that makes you better.",
          highlight: ["uncertainty", "accountability", "probability", "risk before entry"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader followed her plan perfectly — entry, stop, size — but lost money on the trade. What does the professional mindset say about this?",
          options: [
            "The trade was a success — process was correct; individual outcomes involve randomness",
            "The plan needs to be changed immediately — losing trades mean a broken strategy",
            "She should have exited earlier to avoid the loss",
            "She needs to increase position size next time to recover",
          ],
          correctIndex: 0,
          explanation:
            "A loss on a well-executed trade is not a failure — it is the cost of operating under uncertainty. Strategy quality is assessed over many trades, not one. Changing a plan after a single loss based on outcome rather than process is called outcome bias, and it destroys edge.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Professionals focus on maximizing profit on every individual trade, while amateurs focus too much on process.",
          correct: false,
          explanation:
            "It is the opposite. Professionals obsess over process (following rules, correct sizing, clean entries) and let profits take care of themselves over time. Amateurs fixate on individual trade profits, which leads to rule-breaking, oversizing, and emotional decisions.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Marco has a clear trading plan. On Monday he follows it and loses $200. On Tuesday he deviates from the plan — takes a tip from a friend — and makes $400. He concludes his plan is flawed and his friend's tips are better.",
          question: "What error in thinking is Marco making?",
          options: [
            "Outcome bias — judging the plan by one random result instead of the process quality",
            "Anchoring — anchoring to the $200 loss",
            "Availability heuristic — Tuesday's win is more vivid",
            "Herding — following his friend's tip",
          ],
          correctIndex: 0,
          explanation:
            "Marco is committing outcome bias. One losing plan-trade vs one winning tip-trade is statistically meaningless. His friend's tip could easily lose next time. The plan's quality can only be judged over many trades. Abandoning a sound process after one loss is one of the most common and costly mistakes traders make.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Managing Emotions in Real Time ─────────────────────────────
    {
      id: "psych-2",
      title: "Managing Emotions in Real Time",
      description:
        "Pre-market routine, recognizing emotional states, circuit breakers, pause-and-breathe, journaling",
      icon: "Activity",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Pre-Market Routine",
          content:
            "Elite traders treat their morning routine with the same seriousness that athletes treat pre-game warmups. Your **emotional state before the open** directly impacts decision quality.\n\nA proven pre-market routine:\n1. **Review your plan** (watchlist, setups, risk parameters for the day)\n2. **Check your emotional baseline** — rate your calmness 1–10. If below 6, reduce position sizes or sit out.\n3. **Review yesterday's trades** — briefly, to carry lessons forward\n4. **Set daily maximum loss** — the hard stop where you close the platform\n5. **Physical preparation** — sleep, nutrition, brief exercise all measurably affect decision-making\n\nTraders who have consistent pre-market routines show higher discipline during the session because they have already mentally 'started' before prices move.",
          highlight: ["pre-market routine", "emotional baseline", "daily maximum loss", "physical preparation"],
        },
        {
          type: "teach",
          title: "Recognizing Your Emotional States",
          content:
            "You cannot manage emotions you cannot identify. Learn to recognize these states **in real time**:\n\n**Hot states** (dangerous):\n- Excitement after a big win — 'I'm on a roll'\n- Anger or frustration after a loss — 'I need to make this back'\n- Anxiety during a live position — 'Should I exit now?'\n\n**Cold states** (safe):\n- Calm and focused — analyzing setups clearly\n- Mildly curious — interested but not attached to outcome\n- Slightly bored — no compelling setup; willing to sit out\n\nPractical tool: Before any trade entry, pause and consciously ask 'Am I in a hot or cold state right now?' If hot — do not trade until you return to baseline. Even 10 minutes away from the screen can reset the emotional state.",
          highlight: ["hot state", "cold state", "emotional recognition", "pause", "baseline"],
        },
        {
          type: "teach",
          title: "Circuit Breakers and Journaling as Therapy",
          content:
            "**Circuit breakers** are pre-committed rules that stop trading when conditions become unfavorable:\n\n- **Daily loss limit**: If you lose X% today, you are done for the day. Non-negotiable.\n- **Trade limit**: No more than N trades per day (prevents overtrading)\n- **Time limit**: No trading after 2pm (or whenever your edge deteriorates)\n- **Cooldown rule**: After any stop-loss hit, minimum 15-minute break before next entry\n\n**Journaling as emotional therapy**: Writing about a trade immediately after — including how you felt — creates powerful distance between the event and your memory of it. This prevents emotional distortion in memory.\n\nPrompts to journal:\n- What was I feeling when I entered?\n- What was I feeling when I exited?\n- Would I take this trade again with the same information?\n- What would I tell a friend who described this trade to me?",
          highlight: ["circuit breakers", "daily loss limit", "journaling", "cooldown rule"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader sets a daily loss limit of 2% of his account. At 11am he hits that limit. His rule says stop trading. He sees what looks like a great setup at 11:15am. What should he do?",
          options: [
            "Respect the limit and skip the trade — the rule exists for days exactly like this",
            "Take the trade — it looks like a high-quality setup",
            "Take half his normal size as a compromise",
            "Wait 5 minutes, then enter if it still looks good",
          ],
          correctIndex: 0,
          explanation:
            "Circuit breakers have no meaning if they can be overridden when 'the setup looks good.' After a daily loss, emotional state is compromised — even if you feel calm. The rule protects against the second and third losses that often follow the first. Respect the limit unconditionally.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Feeling excited after a winning trade is a safe emotional state for making the next trading decision.",
          correct: false,
          explanation:
            "Excitement is a 'hot' emotional state. After a win, overconfidence rises and risk perception drops — exactly when traders take the next trade too soon, size up without proper analysis, or ignore their checklist. The correct response after a win is to pause, reset to baseline, and evaluate the next setup as if the win had never happened.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Sarah loses her first two trades of the day. She is frustrated. She sees a stock moving fast and feels an urge to enter quickly before missing the move. She has not checked her pre-trade checklist.",
          question: "What is the most important action Sarah should take?",
          options: [
            "Stop, check her emotional state, run the checklist before any entry",
            "Enter quickly — she needs to make back the losses before the move ends",
            "Enter with double her normal size to recover losses faster",
            "Switch to a different stock to avoid bad luck on this one",
          ],
          correctIndex: 0,
          explanation:
            "Sarah is in a 'hot' state after two losses. The urgency she feels is driven by emotion, not analysis. The correct move is to pause, identify the emotional state (frustration + urgency = danger), and only proceed after running her checklist. Moving fast and skipping the checklist under emotional pressure is how small losses become large ones.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Overcoming Fear and Greed ─────────────────────────────────
    {
      id: "psych-3",
      title: "Overcoming Fear and Greed",
      description:
        "FOMO anatomy, fear of losing cycle, greed manifestations, using rules to override emotions",
      icon: "AlertTriangle",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Anatomy of FOMO and the Fear of Missing Out",
          content:
            "**Fear of Missing Out (FOMO)** is one of the most expensive emotions in trading. It is the anxious feeling that others are profiting from a move you are not in.\n\nThe FOMO cycle:\n1. Stock makes a sharp move — you were not positioned\n2. Social media and news confirm the move is 'real'\n3. You feel anxiety: 'This could keep going'\n4. Urgency takes over: 'I have to get in NOW'\n5. You buy near the top, often without a plan\n6. Stock reverses — you hold hoping for a bounce\n7. You exit at a larger loss than your entry edge ever justified\n\nFOMO is structurally unavoidable — you will always miss moves. **Accepting that you cannot catch every move is a prerequisite for disciplined trading.** Your job is not to trade every move. Your job is to trade your setups profitably.",
          highlight: ["FOMO", "fear of missing out", "urgency", "setups"],
        },
        {
          type: "teach",
          title: "The Fear of Loss Cycle",
          content:
            "**Fear of loss** is the other side of the coin — and equally destructive.\n\nThe fear of loss cycle:\n1. You are in a trade that has a small profit\n2. Price pulls back slightly — fear activates: 'I might lose my gain'\n3. You exit too early to 'protect' the profit\n4. Stock resumes upward — you miss the main move\n\nOr, in a losing trade:\n1. Price moves against you — your stop is close\n2. Fear activates: 'If I move my stop, maybe it comes back'\n3. You move the stop lower — extending your potential loss\n4. Trade continues against you — loss is now twice the planned amount\n\nBoth patterns share the same root: **letting fear override a pre-set rule**. The fix is identical in both cases — execute the rule, not the feeling.",
          highlight: ["fear of loss", "stop-loss", "exit too early", "move the stop"],
        },
        {
          type: "teach",
          title: "Greed Manifestations and Rules as Override",
          content:
            "**Greed** in trading shows up subtly:\n- Holding a winner past your target because 'it might go higher'\n- Adding to a position that is already too large because it is working\n- Taking a trade with poor R:R because the potential gain sounds exciting\n- Skipping a stop-loss because the gain feels 'so close'\n\n**How rules override emotions**:\nEmotions are fast, automatic, and powerful. You cannot outthink them in the moment. What you CAN do is make decisions before the emotional event and commit to following them.\n\nRule-based safeguards:\n- Written take-profit levels set at entry — not adjusted upward during the trade\n- Hard stop-loss — never moved against you, only trailed in your favor\n- Maximum daily gain target — close the platform when you hit it\n- Maximum position size rule — never exceeded regardless of conviction\n\nWhen the rule and the feeling conflict, **always follow the rule**. The rule was made by your rational self. The feeling is made by your emotional self in a heated moment.",
          highlight: ["greed", "rules override emotions", "take-profit", "hard stop-loss", "rational self"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock reaches a trader's pre-set target of +8%. He feels it will go to +15% and holds. It reverses and he exits at +1%. Which psychological force was primarily responsible?",
          options: [
            "Greed — overriding the planned target hoping for more",
            "FOMO — afraid of missing the +15% move",
            "Loss aversion — afraid of giving back the gain",
            "Anchoring — anchored to the +15% possibility",
          ],
          correctIndex: 0,
          explanation:
            "Classic greed pattern: abandoning a pre-set rule (exit at +8%) because of desire for a bigger gain. The result — exiting at +1% — is what greed costs. Pre-set targets exist precisely for this moment. Taking the planned +8% and exiting clean is disciplined; holding for +15% on emotion is gambling.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Moving your stop-loss further from your entry to 'give the trade more room' is a sound risk management practice when the trade is going against you.",
          correct: false,
          explanation:
            "Moving a stop further from entry when losing is driven by fear of loss, not analysis. It increases your potential loss beyond what you originally accepted. The stop was set at entry based on technical analysis — moving it is almost always emotional. The rare exception is a well-reasoned thesis update, documented in your journal before the move.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A highly anticipated earnings report causes a stock to jump 20% at open. Alex did not hold the stock before earnings. He sees the jump, reads bullish commentary everywhere, and feels intense pressure to buy before 'it goes even higher.'",
          question: "What should Alex do to overcome FOMO in this moment?",
          options: [
            "Pause, check if a valid setup now exists within his strategy rules, only enter if checklist passes",
            "Buy immediately — the momentum is real and he can ride it",
            "Buy half size now and add more if it continues rising",
            "Wait 5 minutes then buy if it has not reversed",
          ],
          correctIndex: 0,
          explanation:
            "FOMO demands immediate action. The antidote is a structured pause: does a valid setup exist right now according to my written strategy? If the answer requires bypassing the checklist, it is FOMO. A 20% gap-up is not automatically a buying opportunity — it may also be an overextended entry with high reversal risk. Only rules can determine this, not urgency.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Building Consistency and Discipline ────────────────────────
    {
      id: "psych-4",
      title: "Building Consistency and Discipline",
      description:
        "Creating a trading plan, rule-based systems, measuring process adherence, recovery from drawdowns",
      icon: "CheckSquare",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Creating a Written Trading Plan",
          content:
            "A **trading plan** is a written document that defines every major decision before the market opens. It prevents in-the-moment improvisation — the source of most losses.\n\nA complete trading plan includes:\n1. **Universe**: What instruments do you trade? (e.g., top-50 US stocks only)\n2. **Setups**: Exactly what patterns/signals trigger a trade\n3. **Entry rules**: How do you enter? Market order? Limit? What price?\n4. **Stop-loss rules**: Where is the stop? How is it calculated? (e.g., below 20-day low)\n5. **Target rules**: Where do you take profit? Fixed % or technical level?\n6. **Position sizing**: How many shares based on risk amount?\n7. **Maximum daily/weekly loss**: When do you stop for the day/week?\n8. **What setups you will NOT take**: Negative rules are as important as positive ones\n\nA plan not written down is not a plan — it is a preference, easily overridden.",
          highlight: ["trading plan", "entry rules", "stop-loss rules", "position sizing", "negative rules"],
        },
        {
          type: "teach",
          title: "Rule-Based Systems and Process Metrics",
          content:
            "**Rule-based systems** replace discretion with defined criteria. This is not about being a robot — it is about ensuring your edge is applied consistently.\n\nBuilding your system:\n- Backtest your core setup on historical data (even informally — review 50 past examples)\n- Define minimum criteria that must ALL be met (confluence requirement)\n- Grade each trade against criteria: did I check all boxes?\n\n**Process metrics** — what you should actually track:\n- **Plan adherence rate**: % of trades where all rules were followed\n- **Deviation trades**: trades where you broke a rule — and their P&L vs plan trades\n- **Setup accuracy**: Which setups perform best? Which should be cut?\n- **Emotional state vs outcome**: Do hot-state trades underperform?\n\nMost traders track P&L obsessively and process not at all. Flip this. Process quality predicts long-term results; P&L in any given week is mostly noise.",
          highlight: ["rule-based system", "plan adherence rate", "process metrics", "confluence", "backtest"],
        },
        {
          type: "teach",
          title: "Recovering from Drawdowns",
          content:
            "Every trader — including the greatest in history — experiences drawdowns. The difference is how they respond.\n\n**Drawdown protocol**:\n1. When account drops 5%: Review journal for rule violations. Reduce size by 25%.\n2. When account drops 10%: Halt live trading. Review every trade from the drawdown period. Identify the pattern causing losses.\n3. When account drops 15%: Mandatory paper-trading period (minimum 2 weeks) before returning with live capital.\n\n**Psychological recovery**:\n- A drawdown is information, not a verdict\n- Separate self-worth from account equity — your value as a person is not your balance\n- Return to basics: smaller size, only the highest-conviction setups\n- Read your trading plan aloud each morning to reinforce rules\n\nThe traders who survive and eventually thrive are those who **respond to drawdowns with discipline, not desperation**.",
          highlight: ["drawdown", "drawdown protocol", "paper trading", "reduce size", "discipline"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader's journal shows that 80% of his losses came from trades that violated at least one rule in his plan. What is the most effective first step?",
          options: [
            "Focus on improving rule adherence — the strategy may be fine; the execution is the problem",
            "Replace the strategy entirely with a new one",
            "Increase position size on rule-following trades to compensate",
            "Reduce the number of rules to make them easier to follow",
          ],
          correctIndex: 0,
          explanation:
            "If 80% of losses come from rule violations, the strategy may actually be profitable when executed correctly. The problem is execution discipline. Fixing adherence first gives an accurate picture of the strategy's true performance. Changing the strategy without fixing discipline means the same violations will occur with the new strategy.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The best response to a 10% account drawdown is to increase position sizes to recover the losses more quickly.",
          correct: false,
          explanation:
            "Increasing size during a drawdown is one of the fastest ways to turn a 10% loss into a 30% loss. During a drawdown, something is wrong — either strategy, execution, or market conditions. The correct response is to reduce size, review trades, identify the problem, and only increase size again once the issue is resolved and confidence is rebuilt on smaller positions.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Priya has a detailed written trading plan. After 3 losing weeks, she feels her plan is 'broken' and wants to completely overhaul it. Her journal shows she followed the plan only 40% of the time during those weeks.",
          question: "What does the data suggest Priya should do?",
          options: [
            "Fix her adherence first — she cannot evaluate the plan when she only follows it 40% of the time",
            "Overhaul the plan immediately — 3 losing weeks prove it does not work",
            "Take a complete break from trading for a month",
            "Follow the plan 60% of the time and use her judgment for the rest",
          ],
          correctIndex: 0,
          explanation:
            "With only 40% adherence, Priya is not actually trading her plan — she is trading something undefined half the time. She cannot evaluate the plan's performance under these conditions. Improving adherence to 90%+ and tracking results for 4–6 more weeks gives real data about the plan's quality. Overhauling a plan that was barely tested is premature.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: The Peak Performance Trading State ─────────────────────────
    {
      id: "psych-5",
      title: "The Peak Performance Trading State",
      description:
        "Flow state in trading, pre-trade rituals of top traders, post-session review, continuous improvement",
      icon: "Zap",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Flow State in Trading",
          content:
            "Psychologist Mihaly Csikszentmihalyi described **flow** as a state of complete absorption where performance peaks and time distorts. Elite traders describe their best sessions this way.\n\nFlow state characteristics in trading:\n- Decisions feel clear and effortless, not forced\n- No internal debate about entries or exits — rules feel natural\n- Losses are processed quickly with no emotional residue\n- You are fully present on the chart, not distracted by P&L\n\nConditions that enable trading flow:\n- **Challenge–skill balance**: Setups should stretch your skill but not overwhelm it\n- **Clear goals**: The plan is written and internalized\n- **Immediate feedback**: You know instantly if a rule was followed\n- **Reduced distraction**: Phone away, notifications off, environment controlled\n\nFlow cannot be forced, but it can be cultivated through routine, preparation, and practice.",
          highlight: ["flow state", "peak performance", "challenge-skill balance", "immediate feedback", "Csikszentmihalyi"],
        },
        {
          type: "teach",
          title: "Pre-Trade Rituals of Top Traders",
          content:
            "Top performers in every field use rituals to shift into optimal performance states. Traders are no different.\n\n**Pre-session ritual structure** (customize to your own):\n\n**Morning (before market open)**:\n- 10 minutes: Physical activation (walk, stretch, brief exercise)\n- 10 minutes: Market context review (overnight gaps, key levels, macro events)\n- 10 minutes: Read your trading plan and rules aloud\n- 5 minutes: Mental priming — visualize executing your setups perfectly\n\n**Intra-session ritual** (before each trade entry):\n- 30-second pause\n- Run pre-trade checklist\n- State entry, stop, target aloud or in writing\n- Check emotional state (1–10 scale)\n\nThe purpose is not superstition — it is **state management**. Rituals create neural anchors that signal 'it is time to perform at my best.'",
          highlight: ["pre-trade ritual", "state management", "mental priming", "pre-trade checklist", "neural anchor"],
        },
        {
          type: "teach",
          title: "Post-Session Review and Continuous Improvement",
          content:
            "The trading session is not finished when the market closes. **Post-session review** is where improvement happens.\n\n**Daily post-session review (20 minutes)**:\n1. Log all trades with full details in your journal\n2. Review each entry: Was the setup valid per your plan?\n3. Review each exit: Was it planned or emotional?\n4. Rate your emotional state during the session (1–10)\n5. Identify the single best trade and single worst trade — what was different?\n6. Write one specific improvement for tomorrow\n\n**Weekly review (60 minutes)**:\n- Calculate key metrics: plan adherence, win rate, avg win:loss, expectancy\n- Categorize trades by setup type — which setups are profitable?\n- Identify your edge — what works — and your leaks — what costs money\n\n**Continuous improvement mindset**: Every session is data. Every loss is tuition paid. The trader who reviews honestly and adjusts systematically will improve. The trader who ignores the data will repeat the same mistakes indefinitely.",
          highlight: ["post-session review", "continuous improvement", "expectancy", "setup categories", "data"],
        },
        {
          type: "quiz-mc",
          question:
            "A trader reports that on her best trading days she feels 'completely absorbed, not watching P&L, just reacting to the chart.' This describes which state?",
          options: [
            "Flow state — optimal performance with clear, effortless decisions",
            "Dissociation — a dangerous lack of awareness",
            "Overconfidence — she is not monitoring risk",
            "Emotional numbness — a sign of burnout",
          ],
          correctIndex: 0,
          explanation:
            "She is describing the flow state — the peak performance zone where skills and challenge align, decisions feel natural, and P&L attachment dissolves. This is associated with best trading outcomes. It is healthy, not dangerous. The danger would be if she were also ignoring her stop-losses, which is not implied here.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Post-session reviews are only worth doing after losing days, to identify what went wrong.",
          correct: false,
          explanation:
            "Winning days are equally important to review. Understanding WHY a session was profitable — which setups worked, what emotional state you were in, what the market conditions were — helps you replicate success. Reviewing only losses creates a biased, negative picture and misses learning opportunities from your best performances.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Trader Ben reviews his last 3 months of data. His 'A-setup' trades (highest confluence, all checklist boxes checked) show a 68% win rate and 2:1 average win:loss. His 'impulse' trades (entered without checklist) show a 31% win rate and 0.8:1 average win:loss.",
          question: "What is the most important insight from this data and what should Ben do?",
          options: [
            "His edge lives entirely in A-setups; he should eliminate impulse trades and only take A-setups",
            "His A-setup win rate is too low; he needs a new strategy",
            "He should balance between both types to diversify his approach",
            "The impulse trades have potential; he needs to refine them with more practice",
          ],
          correctIndex: 0,
          explanation:
            "The data is unambiguous: A-setups are profitable (68% win rate, 2:1 R:R = strong positive expectancy). Impulse trades are unprofitable (31% win rate, 0.8:1 R:R = strongly negative expectancy). Eliminating impulse trades and only taking A-setups would dramatically improve Ben's results without changing his strategy at all — just his filter.",
          difficulty: 3,
        },
      ],
    },
  ],
};
