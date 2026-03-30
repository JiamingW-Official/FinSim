import type { Unit } from "./types";

export const UNIT_TRADING_PSYCHOLOGY: Unit = {
 id: "trading-psychology",
 title: "Trading Psychology",
 description:
 "Develop mental edge with emotional discipline, bias recognition, process thinking, and elite trader mindset",
 icon: "Brain",
 color: "#ec4899",
 lessons: [
 // Lesson 1: The Trading Mind 
 {
 id: "tp-1",
 title: "The Trading Mind",
 description:
 "System 1 vs System 2 thinking, the emotional P&L cycle, and building self-awareness as your edge",
 icon: "Brain",
 xpReward: 70,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "The Two-System Brain",
 content:
 "Psychologist Daniel Kahneman identified two modes of thinking that shape every decision you make in the market:\n\n**System 1 — Fast, Emotional, Pattern-Seeking:**\n- Operates automatically and instantly, with no conscious effort\n- Excellent at pattern recognition — evolved to spot predators in milliseconds\n- Triggered by flashing prices, red/green candles, breaking news\n- Prone to emotional reactions: panic sells, FOMO buys, revenge trades\n- Cannot distinguish genuine patterns from random noise\n\n**System 2 — Slow, Analytical, Deliberate:**\n- Requires conscious effort and focused attention\n- Performs complex calculations, weighs probabilities, evaluates trade-offs\n- Easily fatigued — decision fatigue degrades System 2 by the afternoon session\n- Markets are specifically designed to overwhelm System 2 with information overload\n\n**How to activate System 2:**\n- Pause before any trade entry — even 60 seconds helps\n- Use a written checklist (forces deliberate processing)\n- Trade only pre-identified setups (reduces in-the-moment cognitive load)\n- Limit screen time to reduce System 1 triggers\n\nMastering trading is largely about building systems that constrain System 1 and protect the conditions for System 2 to operate.",
 highlight: ["System 1", "System 2", "pattern recognition", "emotional reactions", "checklist"],
 },
 {
 type: "teach",
 title: "The Emotional P&L Cycle",
 content:
 "Most retail traders unknowingly cycle through the same destructive emotional loop:\n\n**1. Hope** — Enter a position with optimism. 'This is the one.'\n**2. Greed** — Position moves in your favor. Add size beyond your plan. 'I should ride this harder.'\n**3. Fear** — Position reverses. Paralysis sets in. 'It'll come back. I'll wait.'\n**4. Panic** — Loss deepens. Sell at the worst possible moment — the exact bottom.\n**5. Regret** — Watch the stock recover without you. 'I knew I should have held.'\n**6. Repeat** — Revenge trade to get even. Cycle restarts.\n\n**Breaking the cycle with rules:**\n- Define position size BEFORE entry — greed cannot enlarge what is pre-committed\n- Set a stop-loss BEFORE entry — fear cannot freeze a pre-set exit\n- Define your thesis invalidation — 'I exit if X happens,' not 'if it feels right'\n- Take mandatory breaks after two consecutive losses — prevents panic escalation\n- Keep a trade log rating your emotions 1–10 at entry and exit — patterns emerge within weeks\n\nThe cycle is not eliminated by experience. It is interrupted by rules.",
 highlight: ["hope", "greed", "fear", "panic", "regret", "stop-loss", "rules"],
 },
 {
 type: "teach",
 title: "Self-Awareness as Your Edge",
 content:
 "Elite traders treat self-knowledge as a competitive advantage — perhaps the most durable one, since it cannot be copied by algorithms.\n\n**Journaling to identify emotional patterns:**\n- Log your emotional state at entry: calm, confident, anxious, FOMO-driven? (scale 1–10)\n- Record your emotional state at exit: relieved, regretful, frustrated?\n- After 30 trades, patterns emerge: 'I consistently over-trade on Fridays' or 'My worst trades are FOMO entries after missing the first move'\n\n**Recognizing your 'tells':**\n- Checking your phone every minute = anxiety (you don't trust the position)\n- Refreshing news obsessively = confirmation bias seeking (you doubt your thesis)\n- Increasing position size after a loss = revenge trading impulse\n- Feeling invincible after a win streak = overconfidence signal\n\n**Peak performance states:**\n- Best trading happens when: well-rested, no major life stress, clear setup, small risk\n- Worst trading happens when: tired, after a loss, bored, distracted, rushed\n- Track your P&L by day-of-week and time-of-day — you will find performance clusters\n- 'Not ready to trade today' is the most profitable decision many days\n\nSelf-awareness transforms reactive trading into deliberate practice.",
 highlight: ["journaling", "emotional patterns", "tells", "peak performance", "self-awareness"],
 },
 {
 type: "quiz-mc",
 question:
 "A trader suffers a $500 loss and immediately opens three new, unplanned positions to 'win it back.' Which system is driving this behavior?",
 options: [
 "System 1 — emotional, reactive, bypassing deliberate analysis",
 "System 2 — slow analytical thinking identifying recovery opportunities",
 "Both systems in balance, which is ideal for decision-making",
 "Neither — this is a rational response to a temporary setback",
 ],
 correctIndex: 0,
 explanation:
 "Revenge trading is a textbook System 1 response. The emotional pain of the loss triggers an automatic, reactive impulse to immediately recover — bypassing the deliberate setup analysis that System 2 would require. System 2 is fatigued by the stress of the loss, leaving System 1 in control. Pre-committed rules (e.g., 'stop trading after 2 losses') are the only reliable countermeasure.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Experienced, professional traders eliminate their emotions entirely and feel nothing when positions move against them.",
 correct: false,
 explanation:
 "No trader — however experienced — eliminates emotion. Neuroscience shows that even expert traders experience the same emotional brain activations as novices. The difference is that experienced traders have built robust rules and systems that prevent emotion from overriding their process. Mark Douglas, Paul Tudor Jones, and other trading legends all discuss managing emotions, not eliminating them. The goal is emotional awareness and structural constraints, not emotional suppression.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Sarah enters a long position in NVDA. It rallies 4%, and she's up $800 — double her usual target. She decides not to take profit because 'it feels like it wants to go higher.' An hour later, the stock reverses and she exits for a $200 loss, feeling devastated.",
 question: "Which emotional trading mistake best describes what happened?",
 options: [
 "Greed overriding a pre-set profit target — System 1 expanded the goal, causing a winning trade to turn into a loss",
 "Loss aversion — fear of missing further gains",
 "Confirmation bias — seeking data confirming the bullish thesis",
 "Anchoring — fixating on the $800 high-water mark",
 ],
 correctIndex: 0,
 explanation:
 "Sarah's mistake is classic greed — a System 1 impulse to capture more than was originally planned. When a position 'feels like it wants to go higher,' that feeling is System 1 pattern-seeking, not analysis. The fix is a pre-committed profit target, set before entry, executed mechanically. Once the target is moved in real-time, emotion has replaced process.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Cognitive Biases in Trading 
 {
 id: "tp-2",
 title: "Cognitive Biases in Trading",
 description:
 "Loss aversion, disposition effect, confirmation bias, recency bias, overconfidence, and how to measure your own biases",
 icon: "Search",
 xpReward: 75,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Loss Aversion & The Disposition Effect",
 content:
 "In 1979, Daniel Kahneman and Amos Tversky published Prospect Theory — one of the most important findings in behavioral economics:\n\n**Losses feel approximately 2× worse than equivalent gains feel good.**\n\nA $1,000 loss creates roughly twice the emotional pain as a $1,000 gain creates pleasure. This asymmetry has profound consequences for trading:\n\n**The Disposition Effect** (Shefrin & Statman, 1985): Investors systematically:\n- Sell winners too early (lock in the 'sure' pleasure of a gain)\n- Hold losers too long (avoid the pain of realizing a loss)\n\nThis is the exact opposite of the classic advice: 'cut your losers and let your winners run.'\n\nData from 10,000+ brokerage accounts: investors were **1.5× more likely** to sell a winning stock than a losing one on any given day.\n\n**Measuring your personal disposition ratio:**\n- Count trades where you exited a winner before your target vs. held a loser past your stop\n- A ratio > 1.0 means you exhibit the disposition effect\n- Tracking this metric over 50+ trades creates accountability\n\nAwareness alone reduces the disposition effect by 15–20% in studies — simply knowing the bias helps.",
 highlight: ["loss aversion", "Prospect Theory", "disposition effect", "sell winners", "hold losers"],
 },
 {
 type: "teach",
 title: "Confirmation Bias & Recency Bias",
 content:
 "**Confirmation Bias:**\nOnce you have a thesis on a stock or market, your brain filters incoming information — unconsciously amplifying evidence that confirms your view and dismissing evidence that contradicts it.\n\nTrading consequences:\n- You research a long idea, then only find bullish articles\n- You skip reading bear cases or short reports\n- You interpret ambiguous news as supportive of your position\n- You hold a losing position because you only see evidence for recovery\n\n**Building a 'bear case' habit:**\n- Before entering any trade, write down three reasons the thesis could be WRONG\n- Seek out the strongest bearish argument (read short-seller reports)\n- Ask: 'What would I have to see to exit this position?'\n- Devil's advocate review: assume the position loses 20%, then explain why\n\n**Recency Bias:**\nOverweighting recent events when estimating future probabilities.\n\n- After a 12-month bull market: 'Stocks always go up' (overweight recent positive data)\n- After a crash: 'The market will never recover' (overweight recent negative data)\n- Extrapolating recent trends indefinitely — mean reversion is ignored\n\nFix: Review 5-year and 10-year historical data. Zoom out when recent events feel overwhelming.",
 highlight: ["confirmation bias", "recency bias", "bear case", "mean reversion", "thesis"],
 },
 {
 type: "teach",
 title: "Overconfidence & The Illusion of Control",
 content:
 "**Overconfidence Bias:**\nStudies consistently show that 80% of traders believe they are above-average performers — a statistical impossibility.\n\nForms of overconfidence in trading:\n- **Overprecision**: Excessive certainty about your predictions ('This will definitely hit $150')\n- **Overplacement**: Believing you're better than other market participants\n- **Overestimation**: Overestimating the quality of your information and analysis\n\n**Tracking accuracy vs. outcome:**\n- Keep a prediction log: 'I think AAPL will be up in 2 weeks' then record the outcome\n- Most traders discover their stated confidence is 20–30 percentage points higher than their actual accuracy\n- 60% accuracy on 2:1 R:R trades is profitable; 80% stated confidence with 60% actual accuracy is the gap\n\n**Hot Hand Fallacy in Streaks:**\n- After 3 winning trades, traders often increase size dramatically — believing they are 'on a roll'\n- Win streaks are largely random in markets (unlike sports where skill genuinely streaks)\n- The correct response to a win streak: maintain process, maintain sizing\n\n**Illusion of control:**\n- Constantly watching positions does not improve outcomes\n- Trading more frequently does not generate more skill\n- Checking P&L every 5 minutes increases emotional volatility without adding information",
 highlight: ["overconfidence", "hot hand fallacy", "illusion of control", "prediction log", "accuracy"],
 },
 {
 type: "quiz-mc",
 question:
 "The disposition effect refers to which specific behavioral pattern in traders and investors?",
 options: [
 "Selling winning positions too early and holding losing positions too long",
 "Holding winning positions too long and selling losing positions too quickly",
 "Overtrading during volatile periods to maximize opportunities",
 "Refusing to open new positions after a losing streak",
 ],
 correctIndex: 0,
 explanation:
 "The disposition effect — documented by Shefrin and Statman in 10,000+ brokerage accounts — is the systematic tendency to sell winners too early (lock in gain pleasure) and hold losers too long (avoid loss pain). It is driven by loss aversion: the pain of realizing a loss feels worse than the pleasure of realizing an equivalent gain. This pattern is the direct opposite of what profitable trend-following requires.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Confirmation bias means you actively seek out information that disagrees with your trading thesis to stress-test your position.",
 correct: false,
 explanation:
 "Confirmation bias is the opposite — it causes you to unconsciously seek, favor, and amplify information that CONFIRMS your existing thesis while dismissing contradicting evidence. It is an involuntary filtering process. The deliberate habit of seeking bear cases and devil's advocate arguments is the prescribed antidote to confirmation bias, not a description of what the bias itself produces.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A trader holds a position in a retail stock down 18%. He has read three bullish analyst upgrades this week and feels confident in the thesis. When a friend mentions a bearish research report showing deteriorating fundamentals, he dismisses it: 'Those analysts don't understand the turnaround story.' He adds to the position.",
 question: "Which cognitive bias is most prominently driving his decision to add to the position?",
 options: [
 "Confirmation bias — selectively absorbing bullish data and dismissing contradicting evidence",
 "Loss aversion — refusing to sell because realizing the loss is too painful",
 "Recency bias — overweighting the three recent upgrades",
 "Overconfidence — believing his thesis is superior to other analysts",
 ],
 correctIndex: 0,
 explanation:
 "Confirmation bias is the primary driver here — he has actively dismissed a credible bearish argument without engagement, simply because it contradicts his thesis. While loss aversion is also present (he won't sell), the specific behavior of seeking only bullish information and dismissing bearish information is the defining signature of confirmation bias. The antidote: read the bearish report and write down the strongest point against your position.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Process Over Outcomes 
 {
 id: "tp-3",
 title: "Process Over Outcomes",
 description:
 "Good process vs. good outcomes, expected value thinking, Kelly criterion, and structuring deliberate practice",
 icon: "Settings",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Outcome vs. Process Thinking",
 content:
 "One of the most important — and counterintuitive — insights in professional trading:\n\n**A losing trade following a good process is still a GOOD trade.**\n**A winning trade from gambling is still a BAD trade.**\n\nWhy? Because over hundreds of trades, process determines results. Any individual trade is dominated by randomness — even a terrible entry can be profitable by luck. Evaluating individual trades by outcome creates the wrong incentives.\n\n**Process metrics** (what you control):\n- Did you follow your entry criteria?\n- Was the stop pre-set and honored?\n- Was position size within your risk rules?\n- Did you enter due to a genuine setup or FOMO?\n- Was the R:R ratio at least your minimum threshold?\n\n**Outcome metrics** (what randomness influences):\n- Was the trade profitable?\n- Did the stock hit your target?\n- How much did you make/lose?\n\nProfessional approach: Grade every trade A/B/C on process BEFORE looking at the P&L result. Over time, A-grade process trades should outperform B/C grade trades. If they don't, the process needs revision — not abandonment.\n\nThe best process produces the best results over time — but any individual result is noise.",
 highlight: ["process metrics", "outcome metrics", "good process", "randomness", "grade trades"],
 },
 {
 type: "teach",
 title: "Expected Value Thinking",
 content:
 "Professional traders and poker players do not think in terms of 'will this trade win?' — they think in terms of **Expected Value (EV)**.\n\n**Expected Value formula:**\n`EV = (Win Probability × Average Win) - (Loss Probability × Average Loss)`\n\n**Example:**\n- Win rate: 40%\n- Average win: $300\n- Average loss: $100\n- EV = (0.40 × $300) - (0.60 × $100) = $120 - $60 = **+$60 per trade**\n\nThis system is highly profitable despite losing 60% of the time. A trader who abandons it after 5 consecutive losses is making a catastrophic error — they are abandoning a positive-EV process because of short-term variance.\n\n**Kelly Criterion for position sizing:**\n`Kelly % = W - (1-W)/R`\nWhere W = win rate, R = win/loss ratio\n\nFor 40% win rate, 3:1 R:R: Kelly = 0.40 - (0.60/3) = 0.40 - 0.20 = **20% of bankroll**\n\nMost professionals use half-Kelly (10%) to reduce volatility. The key insight: Kelly maximizes long-run geometric growth — it mathematically proves that position sizing according to edge is optimal.",
 highlight: ["expected value", "EV", "win rate", "Kelly criterion", "positive EV", "position sizing"],
 },
 {
 type: "teach",
 title: "Deliberate Practice",
 content:
 "Anders Ericsson's research on expert performance shows that elite skill comes from **deliberate practice** — not just experience. Deliberate practice is structured, specific, and focused on identified weaknesses.\n\n**Structuring a trading review session:**\n\n**Preparation phase (before market open):**\n- Review yesterday's trades: what worked, what didn't\n- Identify one specific skill to focus on today (e.g., 'honor stops without hesitation')\n- Set intention: only trade A-grade setups\n\n**Execution phase (during session):**\n- Follow the process — no improvisations\n- After each trade, write one sentence about how it felt and whether the process was followed\n\n**Review phase (after close):**\n- Grade each trade on process (A/B/C), independent of outcome\n- Identify the single best trade and single worst trade\n- Ask: 'What is the one skill that, if improved, would most benefit my performance?'\n- Update your statistics (win rate, avg R:R, process grade distribution)\n\nTraders who review deliberately for 20 minutes per day improve faster than those who trade for 10 extra hours without structured review.",
 highlight: ["deliberate practice", "preparation", "execution", "review", "process grade", "skill"],
 },
 {
 type: "quiz-mc",
 question:
 "A strategy has a 40% win rate with an average win of $300 and an average loss of $100. What is the Expected Value per trade?",
 options: [
 "+$60 — the strategy is profitable despite losing 60% of the time",
 "-$60 — a 40% win rate means the strategy loses money on average",
 "$0 — the wins and losses cancel out",
 "+$120 — only the winning trades contribute to expected value",
 ],
 correctIndex: 0,
 explanation:
 "EV = (0.40 × $300) - (0.60 × $100) = $120 - $60 = +$60 per trade. This illustrates why win rate alone is meaningless — what matters is the combination of win rate AND win/loss ratio. A 40% win rate with a 3:1 reward-to-risk ratio generates $60 of expected profit per trade. Abandoning this strategy after a losing streak is a process error, not a rational response.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A trader with a consistently high win rate (above 70%) is guaranteed to be profitable over the long run.",
 correct: false,
 explanation:
 "Win rate alone does not determine profitability — the size of wins relative to losses is equally critical. A 70% win rate with an average win of $50 and average loss of $200 produces EV = (0.70 × $50) - (0.30 × $200) = $35 - $60 = -$25 per trade. Many 'high win rate' strategies generated by averaging down or never cutting losses are deeply unprofitable despite appearing to win most of the time. Expected value is what matters.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A trader has a clearly defined strategy with 45% win rate and 2.5:1 R:R (EV = +$87.50 per trade). After following the strategy perfectly for 20 trades and hitting an 8-trade losing streak (within normal statistical variance), he abandons the strategy: 'It clearly doesn't work.' He switches to a new strategy based on recent tips.",
 question: "How should this situation be evaluated using process thinking?",
 options: [
 "The process was sound — an 8-trade losing streak is statistically normal for a 45% win rate strategy and abandoning a positive-EV process is a mistake",
 "The abandonment was correct — 8 consecutive losses proves the strategy is broken",
 "The new tip-based strategy is better because recent information is more relevant",
 "Win rate should be above 50% before any strategy is considered reliable",
 ],
 correctIndex: 0,
 explanation:
 "For a 45% win rate strategy, an 8-trade losing streak has roughly a 1.7% probability — unusual but not extraordinary over many trades. The process was followed correctly, which is all a trader controls. Abandoning a positive-EV process due to normal variance is one of the most common and costly mistakes in trading. Professional traders pre-calculate the maximum expected losing streak for their strategy and mentally prepare for it before it occurs.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Building a Trading Routine 
 {
 id: "tp-4",
 title: "Building a Trading Routine",
 description:
 "Pre-market prep, session rules, max daily loss, the B-trade trap, and post-session review",
 icon: "ClipboardList",
 xpReward: 75,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Pre-Market Routine",
 content:
 "Elite traders treat pre-market preparation like pilots treat pre-flight checklists — non-negotiable and systematic.\n\n**Economic calendar review:**\n- Check for high-impact releases: Fed announcements, CPI, NFP, earnings\n- Wider spreads and erratic moves occur around these events\n- Decide before open: 'Will I trade through this announcement or step aside?'\n\n**Market structure analysis:**\n- Overnight gap: Did futures gap significantly? Above/below key levels?\n- Sector strength: Which sectors are leading/lagging pre-market?\n- Relative strength: Is your watchlist holding up vs. the broader index?\n\n**Mental readiness checklist (as important as market data):**\n Am I well-rested? (Sleep deprivation degrades executive function by 20–30%)\n Are there major personal stressors today? (Emotional bandwidth is finite)\n Am I distracted or in a hurry?\n Did I follow my process correctly yesterday, or am I carrying frustration?\n Do I feel calm and clear, or anxious to 'make money'?\n\nIf the mental checklist has more than one 'no' — consider paper trading or not trading at all. **'Not ready to trade today' is the most underused profitable decision in retail trading.**",
 highlight: ["economic calendar", "pre-market", "mental readiness", "checklist", "not ready to trade"],
 },
 {
 type: "teach",
 title: "During-Session Rules",
 content:
 "Structure during the session is the difference between trading and gambling. Rules must be defined before the day begins — not improvised in real-time.\n\n**Max daily loss rule (hard stop):**\n- Define a maximum daily loss (typical range: 1.5–3% of account)\n- When hit: close all positions, close the platform, stop trading for the day\n- This rule exists to prevent the emotional spiral that follows a large loss\n- After a large loss, System 1 takes over — every subsequent trade is revenge-driven\n- Even the best process produces losing days; the max loss rule keeps them survivable\n\n**Max trades per day:**\n- Define a maximum number of trades (e.g., 4–6 per day)\n- Forces selectivity — only the best setups make the cut\n- Eliminates boredom trading and overtrading\n\n**Only A+ setups:**\n- Define specific, pre-written criteria for what constitutes your highest-conviction setup\n- Rate each potential trade before entry: A (meets all criteria), B (partially), C (gut feel)\n- Execute only A-grade setups\n\n**The 'B' trade trap (FOMO forcing mediocre setups):**\n- B trades happen when there are no A setups and you feel compelled to trade anyway\n- 'There's some action in TSLA, maybe I'll take a small position' = B trade\n- B trades have lower EV by definition, and they consume capital and mental energy needed for A trades\n- The correct response to no A setups: do nothing and wait",
 highlight: ["max daily loss", "hard stop", "A+ setups", "B trade trap", "FOMO", "overtrading"],
 },
 {
 type: "teach",
 title: "Post-Session Review",
 content:
 "The post-session review is where improvement actually happens — during the session you are executing; after the session you are learning.\n\n**Structured review process:**\n\n**Grade each trade on setup quality (independent of outcome):**\n- A: Met all entry criteria, correct sizing, stop pre-set, thesis clear\n- B: Partially met criteria, minor process deviation\n- C: Did not meet criteria, emotional entry, undefined stop\n\n**Identify one lesson learned:**\n- Not 'I lost money' — that's an outcome, not a lesson\n- 'I entered before the setup confirmed because I was impatient' — that's a lesson\n- Write one concrete improvement to implement tomorrow\n\n**Update your statistics:**\n- Win/loss ratio for A vs. B vs. C grade trades (A trades should outperform)\n- Emotional self-assessment: average emotional state 1–10 for winning vs. losing days\n- Average holding time: are you exiting too early on winners?\n\n**Weekly patterns to track:**\n- Best and worst time of day\n- Best and worst day of week\n- Performance in trending vs. choppy market conditions\n- P&L by setup type\n\nThis data compounds — after 3 months, you have a quantitative profile of your own trading edge and weaknesses.",
 highlight: ["post-session review", "setup quality", "A grade", "lesson learned", "statistics"],
 },
 {
 type: "quiz-mc",
 question:
 "What is the primary purpose of a daily maximum loss rule (hard stop at -2% of account)?",
 options: [
 "To prevent an emotional spiral after a large loss that causes increasingly poor decisions",
 "To limit overall annual losses to an acceptable level",
 "To force the trader to find better setups the following day",
 "To comply with broker margin requirements",
 ],
 correctIndex: 0,
 explanation:
 "The daily max loss rule's primary function is to cut off the feedback loop of emotional deterioration. After a large loss, System 1 takes control — subsequent trades are driven by loss aversion, revenge-trading impulses, and reduced executive function. Each additional loss in this state compounds the emotional damage. Stopping when the max loss is hit preserves both capital and psychological state for the following day. Annual loss limits are a secondary benefit.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Taking more trades per day gives a trader more opportunities to be profitable, so increasing daily trade count generally improves returns.",
 correct: false,
 explanation:
 "More trades mean lower average quality per trade — the best setup of the day has higher EV than the fifth-best setup. Overtrading also increases transaction costs, decision fatigue (degrading System 2), and emotional wear. Research on retail traders shows a strong negative correlation between trade frequency and profitability after costs. The most profitable traders are typically selective, not prolific. Quality of trades, not quantity, drives returns.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A trader starts the day with a plan: trade only confirmed breakouts with 2:1 R:R minimum. By 11am, there are no qualifying setups. He's bored. He notices AAPL has moved slightly and there's some 'buzz' in a chatroom. It doesn't meet his criteria, but he enters anyway — a B trade. The trade loses. Now down on the day, he takes two more B trades to recover. He ends the day down 3× his normal loss.",
 question: "What routine violation is the root cause of this sequence?",
 options: [
 "Breaking the 'A-setups only' rule — the B trade triggered the spiral by violating pre-committed criteria",
 "Having a daily max loss rule that was set too tight",
 "Using chatroom tips instead of technical analysis",
 "Not having enough trades in the session to find a good setup",
 ],
 correctIndex: 0,
 explanation:
 "The entire spiral began with the first B trade — FOMO driving an entry that violated the pre-committed criteria. This is the B-trade trap: once a below-criteria trade is taken, the psychological pressure of recovering from it generates more B trades. The daily max loss rule would have stopped the spiral, but only if it hadn't been ignored alongside the setup criteria. The root fix is maintaining the 'A-setups only' rule absolutely — including on boring days.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Peak Performance Psychology 
 {
 id: "tp-5",
 title: "Peak Performance Psychology",
 description:
 "Flow state trading, resilience after drawdowns, and the universal principles of elite trader mindset",
 icon: "Award",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Flow State Trading",
 content:
 "Psychologist Mihaly Csikszentmihalyi defined **flow** — the state of optimal experience where a person is fully immersed in an activity with effortless concentration and intrinsic motivation.\n\n**Conditions for flow in trading (all must be present):**\n- **Clear goals**: Specific setup criteria, defined entry/exit rules\n- **Immediate feedback**: P&L, price action, pattern confirmation\n- **Challenge-skill balance**: The market provides enough challenge to engage System 2 without overwhelming it\n- **Perceived control**: Not certainty of outcome, but confidence in the process\n\n**Signs you are in a flow trading state:**\n- Time passes quickly; hours feel like minutes\n- Decisions feel clear and unhurried\n- You are observing setups without forcing them\n- Losses do not generate emotional reaction — they are information\n- You feel no need to check P&L repeatedly\n\n**Signs you are NOT in flow (stop trading):**\n- Every tick feels urgent\n- You are refreshing news or chatrooms constantly\n- Small moves trigger strong emotional reactions\n- You are 'trying harder' rather than observing clearly\n- You feel compelled to be in a position\n\nFlow cannot be forced — it emerges from proper preparation, appropriate challenge level, and emotional neutrality. Most traders experience it occasionally; elite traders learn to recognize and cultivate its conditions.",
 highlight: ["flow state", "clear goals", "immediate feedback", "challenge-skill balance", "emotional neutrality"],
 },
 {
 type: "teach",
 title: "Resilience After Drawdowns",
 content:
 "Every trader — without exception — experiences drawdowns. The difference between traders who survive long-term and those who don't is not whether they have drawdowns, but how they respond to them.\n\n**Normalizing drawdowns:**\n- Paul Tudor Jones, one of history's greatest traders, has had losing months\n- Renaissance Technologies Medallion Fund — the most successful quant fund ever — has experienced drawdowns of 10–20%\n- A 10-trade losing streak on a 50% win rate strategy has a 0.1% probability — it will happen to you over a career\n\n**The 3-step recovery protocol:**\n\n**Step 1: Reduce size**\n- Immediately cut position size to 50% of normal (or less)\n- Lower risk reduces emotional volatility, which allows clearer thinking\n- 'You can't think clearly when you're fighting for survival'\n\n**Step 2: Review process (not outcomes)**\n- Were trades taken within your criteria, or was there process breakdown?\n- Process breakdown: identify and fix the specific deviation\n- Normal variance: remind yourself this is mathematically expected\n\n**Step 3: Rebuild confidence with small wins**\n- Trade smaller size with high-conviction setups only\n- Small wins restore the feedback loop between good process and positive outcomes\n- Gradually restore normal size as confidence and process stability return\n\nDrawdowns are not signals to abandon strategies — they are tests of process discipline.",
 highlight: ["drawdowns", "normalizing", "reduce size", "review process", "small wins", "resilience"],
 },
 {
 type: "teach",
 title: "Mental Models of Elite Traders",
 content:
 "The greatest traders in history converged on remarkably similar psychological principles, despite different instruments and eras:\n\n**Jesse Livermore** (1877–1940): 'The market is never wrong — opinions often are.'\n- Accept that the market's current price is reality; your opinion of value is just an opinion\n- The tape (price action) overrides analysis\n\n**Paul Tudor Jones**: 'The most important rule of trading is to play great defense, not great offense.'\n- Capital preservation is the primary objective\n- Asymmetric bets: risk small, win big, never the reverse\n\n**Mark Douglas — The Disciplined Trader (1990):**\nThe most influential book on trading psychology. Douglas's core framework:\n\n1. **Think in probabilities, not certainties**: No trade is a 'sure thing' — every trade is one instance of a probability distribution\n2. **Accept uncertainty**: The market can do anything at any moment; accepting this removes the emotional reaction to unexpected moves\n3. **You don't need to know what happens next**: A positive-EV system produces results over many trades, not individual trades\n4. **Each trade is unique**: Past trades — wins or losses — are statistically independent of the next trade\n\n**Universal principles across all elite traders:**\n- Risk management comes before return optimization\n- Process consistency matters more than any individual insight\n- The market does not owe you a living — discipline is the price of admission",
 highlight: ["Jesse Livermore", "Paul Tudor Jones", "Mark Douglas", "think in probabilities", "accept uncertainty", "capital preservation"],
 },
 {
 type: "quiz-mc",
 question:
 "Mark Douglas's most cited concept in 'The Disciplined Trader' involves which fundamental shift in how traders think about outcomes?",
 options: [
 "Thinking in probabilities across many trades rather than seeking certainty in individual trades",
 "Eliminating all emotion to trade purely mechanically without any human judgment",
 "Focusing only on fundamentals and ignoring price action entirely",
 "Using position sizing to guarantee profitability regardless of market conditions",
 ],
 correctIndex: 0,
 explanation:
 "Mark Douglas's central insight is that trading requires a probabilistic mindset: no single trade can be predicted with certainty, and trying to 'know' what will happen generates the emotional reactions that destroy discipline. By accepting that each trade is one instance of a probability distribution — and that positive results emerge over many trades, not individual ones — traders can follow their process without emotional attachment to any single outcome. This shift from certainty-seeking to probability-thinking is the foundation of trading psychology.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "If a trader experiences a significant drawdown, it is usually a signal that their strategy is fundamentally broken and they should switch to a different approach immediately.",
 correct: false,
 explanation:
 "Drawdowns are mathematically inevitable for any strategy with less than 100% win rate. Even the most successful strategies — including those of legendary traders and top quant funds — experience periodic drawdowns. The correct response is to first examine whether the drawdown resulted from process breakdown (fixable) or normal statistical variance (expected). Abandoning a sound, positive-EV strategy during a normal drawdown destroys its long-run benefits. The 3-step protocol — reduce size, review process, rebuild with small wins — is the evidence-based response.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "After a 12% portfolio drawdown over 6 weeks, a trader completes a process review and finds all trades were taken within her defined criteria, risk per trade was maintained at 1%, and no emotional deviations occurred. Her win rate temporarily fell to 38% vs. the historical 47%, consistent with a normal variance period. She is considering cutting her position size in half and switching to paper trading for 2 weeks.",
 question: "Which element of the 3-step recovery protocol is she applying correctly, and what should she also remember?",
 options: [
 "Reducing size (Step 1) is correct; she should remember the process was sound — this is normal variance, not strategy failure, so she can gradually return to full size as confidence stabilizes",
 "She should switch strategies since a 12% drawdown proves this strategy doesn't work",
 "Paper trading for 2 weeks will restore performance because it removes emotional pressure",
 "Her process review is unnecessary since outcomes are the only reliable measure of strategy quality",
 ],
 correctIndex: 0,
 explanation:
 "Reducing position size after a drawdown (Step 1) is correct and appropriate regardless of cause. Her process review (Step 2) revealed no process breakdown — this is normal variance. The key insight: because the process was sound, she should not abandon the strategy. Paper trading is not recommended here — small real-money wins on reduced size (Step 3) rebuild the confidence feedback loop more effectively than simulated trading. She can gradually restore full size as her win rate normalizes.",
 difficulty: 3,
 },
 ],
 },
 ],
};
