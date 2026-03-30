import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_FINANCE_ADVANCED: Unit = {
 id: "behavioral-finance-advanced",
 title: "Advanced Behavioral Finance",
 description:
 "Apply behavioral economics to understand market anomalies and improve investment decisions",
 icon: "Brain",
 color: "#8B5CF6",
 lessons: [
 // Lesson 1: Prospect Theory & Biases 
 {
 id: "bfa-1",
 title: "Prospect Theory & Biases",
 description:
 "Kahneman & Tversky's prospect theory, loss aversion, value function shape, probability weighting, framing, disposition effect, and mental accounting",
 icon: "Brain",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Prospect Theory: How People Really Evaluate Outcomes",
 content:
 "In 1979, **Daniel Kahneman** and **Amos Tversky** published *Prospect Theory: An Analysis of Decision Under Risk*, one of the most cited papers in economics. It replaced the classical **Expected Utility Theory** with a more psychologically accurate model of how people actually make decisions involving risk.\n\n**The core departure from classical theory:**\nExpected utility theory assumes people evaluate outcomes relative to their *total wealth* and weight probabilities linearly. Prospect theory shows that people evaluate outcomes relative to a **reference point** (usually the status quo) and distort probabilities.\n\n**Three fundamental components of Prospect Theory:**\n\n**1. Reference dependence:** Outcomes are coded as *gains* or *losses* relative to a reference point, not as absolute levels of wealth. A salary of $75,000 feels like a $5,000 loss to someone who expected $80,000 — even if it would feel like a $5,000 gain to someone who expected $70,000.\n\n**2. Loss aversion:** The psychological pain of a loss is approximately **2.25 times** the pleasure of an equivalent gain. Losing $100 feels roughly as bad as gaining $225 feels good. This asymmetry explains a vast range of financial behavior from holding losing stocks to purchasing over-insurance.\n\n**3. Diminishing sensitivity:** The marginal impact of gains and losses decreases as they move away from the reference point. The difference between losing $100 and $200 feels larger than between losing $1,000 and $1,100 — even though both are $100 differences. This creates the S-shaped **value function**.",
 highlight: [
 "Kahneman",
 "Tversky",
 "Prospect Theory",
 "reference point",
 "loss aversion",
 "2.25 times",
 "value function",
 ],
 },
 {
 type: "teach",
 title: "The Value Function & Probability Weighting",
 content:
 "The **value function** in prospect theory is S-shaped: concave in the domain of gains (diminishing marginal happiness) and convex in the domain of losses (diminishing marginal pain). The curve is steeper for losses than gains — visually capturing loss aversion.\n\n**Investment implications of the value function shape:**\n- *Concave for gains:* Investors become **risk-averse** when ahead — they lock in gains too early rather than letting winners run\n- *Convex for losses:* Investors become **risk-seeking** when behind — they hold losing positions hoping to break even, taking on more risk to avoid realizing a loss\n\nThis directly predicts the **disposition effect**: the well-documented tendency of investors to sell winners too early and hold losers too long.\n\n**Probability Weighting Function:**\nPeople do not treat probabilities linearly. The weighting function w(p) overweights small probabilities and underweights large ones:\n- A 1% chance of a large loss is weighted as if it were ~5–7% (explains why people buy lottery tickets and over-insure against rare catastrophes)\n- A 90% chance of a gain is weighted as if it were ~70–80% (explains why people take the certain outcome in the famous Allais paradox)\n- Certainty (100%) is dramatically overweighted relative to even very high probabilities — the **certainty effect**\n\n**The Allais Paradox (1953):** Most people prefer $3,000 certain over an 80% chance of $4,000 ($3,200 EV) — but also prefer a 20% chance of $4,000 over a 25% chance of $3,000. These preferences violate Expected Utility Theory but are consistent with prospect theory's probability weighting.",
 highlight: [
 "value function",
 "concave",
 "convex",
 "disposition effect",
 "probability weighting",
 "overweights small probabilities",
 "certainty effect",
 "Allais Paradox",
 ],
 },
 {
 type: "teach",
 title: "Framing, Disposition Effect & Mental Accounting",
 content:
 "**Framing Effect:**\nThe same objectively identical outcome, presented in different frames, produces different decisions. Kahneman and Tversky's famous Asian Disease Problem: when a policy is framed as saving 200 of 600 lives, most choose it; when framed as letting 400 of 600 die, most reject it — despite identical outcomes. In finance, framing shapes:\n- *Gain frame:* \"95% survival rate\" vs. *Loss frame:* \"5% mortality rate\" — same fund, very different investor reactions\n- Presenting returns as monthly vs. annualized changes perceived attractiveness\n- Fund manager reporting \"up 15%\" vs \"down 2% from peak\" for identical performance\n\n**Disposition Effect (Shefrin & Statman, 1985):**\nInvestors are ~1.5–2× more likely to sell a stock that has risen since purchase than one that has fallen. Terrance Odean's 1998 study of 10,000 brokerage accounts confirmed: *winning* stocks were sold 68% more frequently than losing ones — yet the sold winners subsequently outperformed the held losers by ~3.4% per year.\n\nCauses: (1) Selling a winner locks in a gain — pleasant; (2) selling a loser makes the loss real — painful; (3) holding a loser preserves the *hope* of breaking even.\n\n**Mental Accounting (Thaler, 1980):**\nPeople segregate money into different *mental accounts* with different spending rules based on the money's source or intended purpose:\n- A casino gambler spends more freely with winnings (\"house money\") than personal funds\n- A tax refund is treated as a windfall and spent; an equivalent salary increase is saved — same money, different mental label\n- A person refuses to sell a stock at a loss while simultaneously carrying high-interest credit card debt — the accounts are not integrated\n\nMental accounting violates the economic principle of fungibility: a dollar is a dollar regardless of where it came from or what it was labeled for.",
 highlight: [
 "framing effect",
 "disposition effect",
 "Shefrin",
 "Statman",
 "Odean",
 "mental accounting",
 "Thaler",
 "house money",
 "fungibility",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "According to Kahneman and Tversky's prospect theory, the loss aversion coefficient is approximately 2.25. What does this mean in practical terms for an investor?",
 options: [
 "Losing $1,000 causes roughly the same psychological pain as gaining $2,250 produces pleasure — losses feel disproportionately worse than equivalent gains feel good",
 "Investors require a 2.25× higher expected return to take on any risk",
 "People overestimate the probability of losses by a factor of 2.25",
 "The value function is 2.25 times steeper in the gain domain than the loss domain",
 ],
 correctIndex: 0,
 explanation:
 "The loss aversion coefficient (~2.25) means the psychological impact of a loss is about 2.25 times the psychological impact of an equal-sized gain. Losing $1,000 feels roughly as painful as gaining $2,250 feels pleasurable. This asymmetry explains many financial behaviors: holding losing stocks too long (realizing the loss is too painful), buying over-insurance, accepting negative expected value gambles to avoid a sure loss, and the equity premium puzzle. It does NOT mean a 2.25× return premium is required — that confuses loss aversion with risk aversion.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The disposition effect — selling winners too early and holding losers too long — is consistent with rational portfolio management because investors are simply harvesting tax losses on their declining positions.",
 correct: false,
 explanation:
 "The disposition effect is not rational tax-loss harvesting — it is the opposite. Rational tax management would suggest selling losers (to realize tax-deductible losses) and holding winners (to defer capital gains taxes). But investors systematically do the reverse: they sell winners and hold losers. Odean's research confirmed that the sold winners subsequently outperformed the held losers by ~3.4% per year, demonstrating a net performance cost. The behavior is driven by the asymmetric value function and loss aversion: realizing a gain feels good; realizing a loss feels bad.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Market Anomalies 
 {
 id: "bfa-2",
 title: "Market Anomalies & Limits to Arbitrage",
 description:
 "January effect, momentum, value premium, PEAD, IPO underperformance — behavioral explanations and why smart money cannot easily eliminate them",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Classic Market Anomalies & Their Behavioral Roots",
 content:
 "A **market anomaly** is a persistent pattern of returns that cannot be explained by standard risk factors in efficient market frameworks. Each has a behavioral interpretation:\n\n**1. Momentum (Jegadeesh & Titman, 1993):**\nStocks that performed well over the past 6–12 months continue to outperform for the next 3–12 months (and vice versa). Behavioral explanation: *underreaction* — investors are too slow to update beliefs on new information, causing prices to drift toward fundamentals gradually rather than instantly.\n\n**2. Value Premium (Fama & French):**\nHigh book-to-market (value) stocks outperform low book-to-market (growth) stocks historically. Behavioral explanation: investors *extrapolate* past earnings growth too aggressively into future prices, overvaluing glamour stocks and undervaluing boring companies. Mean reversion corrects the mispricing over time.\n\n**3. Post-Earnings Announcement Drift (PEAD, Ball & Brown 1968):**\nAfter a positive earnings surprise, stocks continue to drift upward for 60+ days. After negative surprises, downward drift persists. Behavioral explanation: underreaction to earnings news — investors anchor to prior expectations and adjust prices too slowly.\n\n**4. January Effect:**\nSmall-cap stocks show abnormally high returns in January, especially the first week. Behavioral / institutional explanation: tax-loss selling in December depresses small-cap prices, which then rebound in January as the selling pressure lifts.\n\n**5. IPO Long-Run Underperformance (Ritter 1991):**\nIPOs significantly underperform comparable firms over 3–5 years after listing. Behavioral explanation: investor overoptimism at issuance — companies go public when investor sentiment is high and valuations are inflated. Sentiment eventually mean-reverts.",
 highlight: [
 "momentum",
 "underreaction",
 "value premium",
 "extrapolate",
 "PEAD",
 "post-earnings announcement drift",
 "January effect",
 "IPO underperformance",
 "overoptimism",
 ],
 },
 {
 type: "teach",
 title: "Limits to Arbitrage: Why Anomalies Persist",
 content:
 "If market anomalies represent exploitable mispricings, why don't rational arbitrageurs eliminate them? **Limits to arbitrage** explain why even well-documented anomalies survive:\n\n**1. Short-Selling Costs & Constraints:**\nExploiting overvaluation requires short selling, which involves borrowing costs (often 1–8%+ annually for hard-to-borrow stocks), margin requirements, and the risk of a short squeeze if the overvalued stock rises further before correcting. Many institutional managers are prohibited from shorting.\n\n**2. Synchronization Risk (Abreu & Brunnermeier, 2002):**\nEven if all sophisticated investors *know* a stock is mispriced, each needs the others to also trade against it to move prices. If no single arbitrageur can force convergence, they may each prefer to wait. This coordination failure allows mispricings to persist and even grow before eventually correcting — rational arbitrageurs can be \"too early\" and lose money before being proven right.\n\n**3. Noise Trader Risk (Shleifer & Vishny, 1997):**\nIrrational noise traders can push prices further from fair value before the arbitrage trade profits. An arbitrageur short-selling an overvalued stock faces the risk that sentiment-driven traders push the price even higher, triggering margin calls and forcing the position to be unwound at a loss. The famous phrase: *\"markets can remain irrational longer than you can remain solvent\"* (often attributed to Keynes).\n\n**4. Horizon Mismatch:**\nInstitutional managers face redemption pressure and quarterly performance benchmarks. A value trade that takes 3 years to converge may force early exit due to short-term underperformance — the arbitrageur is \"corrected\" before the market is.\n\n**Shiller CAPE & Mean Reversion:**\nRobert Shiller's Cyclically Adjusted P/E (CAPE ratio) averages 10 years of earnings to smooth cycles. Historically, high CAPE predicts lower 10-year forward returns and vice versa — consistent with behavioral overvaluation during sentiment peaks and undervaluation during panic.",
 highlight: [
 "limits to arbitrage",
 "short-selling costs",
 "synchronization risk",
 "noise trader risk",
 "Shleifer",
 "Vishny",
 "Shiller CAPE",
 "mean reversion",
 "horizon mismatch",
 ],
 },
 {
 type: "teach",
 title: "Equity Premium Puzzle & Closed-End Fund Discount",
 content:
 "Two famous puzzles challenge standard rational models:\n\n**The Equity Premium Puzzle (Mehra & Prescott, 1985):**\nUS equities have historically returned ~6–7% more per year than Treasury bills (the equity risk premium). To justify this gap using standard consumption-based asset pricing models, investors would need a degree of risk aversion so extreme (~30–50 on a scale where 1 is typical) that it implies people would refuse insurance bets that virtually everyone actually takes. Standard models cannot reconcile observed equity returns with plausible risk preferences.\n\nBehavioral explanations:\n- **Myopic loss aversion (Benartzi & Thaler, 1995):** If investors evaluate portfolios frequently (e.g., annually) rather than over long horizons, and weight losses 2.25× more than gains (loss aversion), they require large premiums to hold stocks that fluctuate. The observed equity premium can be explained if investors evaluate performance roughly annually.\n- **Ambiguity aversion:** Investors dislike not knowing the probability distribution itself (Knightian uncertainty), demanding extra compensation.\n\n**Closed-End Fund Discount Puzzle:**\nClosed-end funds trade at prices often 10–20% below their Net Asset Value (NAV). If the fund holds $100 of easily tradable securities, why would rational investors pay only $85 for shares in it?\n\nBehavioral explanation (Lee, Shleifer & Thaler, 1991): Closed-end fund discounts widen when individual investor sentiment is pessimistic and narrow when sentiment is bullish. Funds IPO at a premium (during high sentiment), then trade at a persistent discount as sentiment cools. The discount reflects **noise trader sentiment** — retail investors' irrationality is priced into the fund shares but not the underlying assets they hold.",
 highlight: [
 "equity premium puzzle",
 "Mehra",
 "Prescott",
 "myopic loss aversion",
 "Benartzi",
 "Thaler",
 "closed-end fund discount",
 "noise trader sentiment",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Post-Earnings Announcement Drift (PEAD) shows that stocks continue drifting in the direction of an earnings surprise for 60+ days after the announcement. Which behavioral bias best explains this persistence?",
 options: [
 "Underreaction — investors anchor to prior expectations and update their beliefs about the company's prospects too slowly, causing prices to converge to fair value gradually",
 "Overreaction — investors overweight the earnings surprise and push prices too far, which then reverses",
 "Loss aversion — investors hold losing positions after bad earnings, preventing price discovery",
 "Herding — professional analysts herd together and simultaneously update price targets weeks later",
 ],
 correctIndex: 0,
 explanation:
 "PEAD is the canonical example of market underreaction. When a company reports earnings significantly above or below consensus, investors fail to fully revise their expectations about future earnings in one step. They anchor to prior beliefs and update gradually — a process that takes weeks or months. As subsequent evidence confirms the new earnings trajectory, prices continue drifting. This anomaly has been enormously robust across markets and decades. Overreaction would predict reversal, which is the opposite of the documented pattern.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Limits to arbitrage theory implies that even rational, well-funded arbitrageurs with the correct analysis can be forced out of a profitable trade at a loss if noise traders push prices further from fair value before the mispricing corrects.",
 correct: true,
 explanation:
 "This is the essence of Shleifer and Vishny's 'Limits to Arbitrage' (1997). An arbitrageur who shorts an overvalued stock faces noise trader risk: irrational investors can continue bidding the price up, creating paper losses that trigger margin calls or investor redemptions. The arbitrageur may be forced to close the position before it is profitable — getting the analysis right but the timing wrong. This mechanism explains why even well-documented mispricings (like the dotcom bubble or closed-end fund discounts) can persist for long periods: the risk of exploitation keeps rational capital away.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Noise Traders & Sentiment 
 {
 id: "bfa-3",
 title: "Noise Traders, Sentiment & Herding",
 description:
 "DeLong et al. noise trader model, sentiment indicators, herding, information cascades, social media impact, crowded trades, and contrarian investing evidence",
 icon: "Users",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The Noise Trader Risk Model",
 content:
 "**DeLong, Shleifer, Summers & Waldmann (1990)** formalized the role of noise traders in a two-investor model:\n\n- **Rational arbitrageurs** know the fundamental value of assets\n- **Noise traders** have stochastic misperceptions of expected returns — sometimes bullish, sometimes bearish, independent of fundamentals\n\n**Key results of the model:**\n\n**1. Prices can deviate persistently from fundamental value.** When noise trader sentiment is systematically biased (e.g., during a bull market), rational arbitrageurs cannot fully offset it because they face noise trader *risk* — the risk that sentiment becomes even more extreme before reverting.\n\n**2. Noise traders can earn higher expected returns than rational traders.** By bearing the risk they themselves create, noise traders are compensated with a return premium. This is a striking result: being irrational can pay off in equilibrium.\n\n**3. Asset price volatility exceeds fundamental volatility.** Noise trader sentiment adds a systematic component to price fluctuations that has nothing to do with changes in intrinsic value — explaining why equity volatility (~15–20% annualized) far exceeds volatility in dividends or earnings (2–5%).\n\n**Noise vs. Information Traders:**\nThe model predicts that in assets heavily traded by retail investors (small-cap stocks, meme stocks, closed-end funds), noise trader risk is highest — these assets will show excess volatility and larger deviations from NAV or fundamental value. Assets dominated by institutional investors show less excess volatility.",
 highlight: [
 "DeLong",
 "Shleifer",
 "Summers",
 "Waldmann",
 "noise traders",
 "noise trader risk",
 "stochastic misperceptions",
 "excess volatility",
 ],
 },
 {
 type: "teach",
 title: "Sentiment Indicators & Contrarian Signals",
 content:
 "Market participants have developed numerous tools to gauge investor sentiment — the aggregate mood that drives noise trader activity:\n\n**Survey-Based Indicators:**\n- **AAII Investor Sentiment Survey** (weekly): tracks % of retail investors who are bullish/neutral/bearish. Extremes are contrarian signals — when >55% are bullish, the market tends to underperform over the next 6–12 months. When <20% are bullish, forward returns are above average.\n- **Investor Intelligence Advisors Sentiment:** professional newsletter writers' consensus. Similar contrarian properties.\n\n**Market-Based Indicators:**\n- **Put/Call Ratio:** high put buying (ratio >1.2) signals bearish sentiment and is historically contrarian bullish. Very low ratio (<0.7) signals complacency.\n- **Margin Debt / NYSE:** peaks in margin debt coincide with market tops (investors leveraging up at peak optimism); troughs coincide with bottoms.\n- **Fund Flows:** sustained inflows to equity funds near market tops, outflows near bottoms (retail investors buy high / sell low on aggregate).\n\n**The Magazine Cover Indicator (anecdotal but robust):**\nWhen a market trend makes the cover of Time, Newsweek, or Business Week, it is near exhaustion. The cover story marks peak public awareness of the trend — by the time a trend is mainstream enough to merit a magazine cover, the smart money has already positioned.\n\n**Buffett's Sentiment Rule:**\n*\"Be fearful when others are greedy, and greedy when others are fearful.\"* Consistent with contrarian use of sentiment indicators.",
 highlight: [
 "AAII survey",
 "put/call ratio",
 "margin debt",
 "fund flows",
 "Magazine Cover Indicator",
 "contrarian",
 "Buffett",
 ],
 },
 {
 type: "teach",
 title: "Herding, Information Cascades & Social Media",
 content:
 "**Herding in Professional Investors:**\nEven sophisticated institutional investors exhibit herding — trading in the same direction simultaneously. Causes:\n- **Career risk / reputational herding:** Fund managers who underperform the consensus face job loss; deviating from the consensus exposes them to idiosyncratic underperformance risk even if they are right on fundamentals. \"No one got fired for buying IBM.\"\n- **Information-based herding:** Managers rationally infer information from observing others' trades, amplifying initial signals.\n- **Cascades in analyst recommendations:** Analysts systematically follow the first upgrade/downgrade by a prestigious firm, creating correlated recommendation patterns.\n\n**Information Cascades (Bikhchandani, Hirshleifer & Welch, 1992):**\nEven when each individual is acting rationally on the information available, aggregate behavior can be informationally inefficient. If early movers adopt a position, late movers may rationally ignore their own private signals and follow the crowd — producing a cascade where prices reflect only early movers' information, not the full information in the market.\n\nResult: A rational individual can produce an irrational aggregate outcome. Information cascades are fragile — a single high-credibility signal can reverse the whole cascade.\n\n**Social Media & Short-Term Sentiment (GameStop 2021):**\nResearch (Bollen et al., 2011; multiple post-2015 papers) confirms that Twitter/Reddit sentiment leads short-term price moves by 1–3 days. During the GameStop episode, coordinated retail sentiment on r/WallStreetBets briefly overwhelmed institutional short positions, demonstrating that noise trader risk can be deliberately engineered via social media coordination.\n\n**Crowded Trade Unwinding:**\nWhen many funds hold the same position (e.g., short volatility, long momentum factor), an unexpected shock triggers simultaneous exit — creating violent price dislocations disconnected from fundamentals. The August 2007 quant meltdown and March 2020 factor crash are examples.",
 highlight: [
 "herding",
 "career risk",
 "information cascade",
 "Bikhchandani",
 "social media sentiment",
 "GameStop",
 "crowded trades",
 "quant meltdown",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "The AAII investor sentiment survey shows 62% of retail investors are bullish — near an all-time extreme. A contrarian investor would interpret this as:",
 options: [
 "A bearish signal, suggesting the market may underperform going forward as most potential buyers are already invested and sentiment is stretched",
 "A bullish signal, since broad investor participation confirms the sustainability of the trend",
 "Neutral — survey data is too noisy to be useful as a market timing tool",
 "A buying opportunity in defensive stocks only, since bulls are concentrated in cyclicals",
 ],
 correctIndex: 0,
 explanation:
 "Extreme bullish sentiment is a contrarian bearish signal. When 62%+ of survey respondents are already bullish, the pool of investors who have yet to buy is small — limiting further buying pressure. These investors have already allocated capital, meaning the market has fewer marginal buyers available to drive prices higher. Additionally, extreme optimism is associated with elevated valuations and increased vulnerability to negative surprises. Academic research on AAII sentiment confirms that readings above ~55% bullish are followed by below-average 6-month and 12-month returns.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "In early 2021, GameStop (GME) stock rose from ~$20 to a peak of ~$483 within weeks, driven by coordinated buying on Reddit's r/WallStreetBets. Institutional short sellers who had borrowed and sold millions of shares at $50 faced losses of up to 900% on their short positions at peak prices.",
 question:
 "Which concept from behavioral finance / limits to arbitrage theory does this episode most directly illustrate?",
 options: [
 "Noise trader risk — irrational sentiment-driven buyers pushed prices far above any reasonable fundamental value, forcing rational short sellers (arbitrageurs) out of their positions at massive losses before the mispricing corrected",
 "The efficient market hypothesis — the price rise reflects information about GameStop's true value that short sellers missed",
 "Information cascades — retail investors rationally inferred positive information from other buyers' actions",
 "The disposition effect — retail investors held GameStop shares too long instead of selling at the peak",
 ],
 correctIndex: 0,
 explanation:
 "The GameStop episode is a textbook demonstration of noise trader risk in action. Institutional short sellers had a fundamental thesis (GME was overvalued) that ultimately proved correct — the stock eventually fell back below $20. But in the intervening weeks, coordinated retail noise trader sentiment drove prices to $483, creating enormous mark-to-market losses. Hedge funds like Melvin Capital faced margin calls and were forced to cover their shorts at a loss. This is precisely what Shleifer and Vishny described: rational arbitrageurs being wiped out before the mispricing corrects, because noise traders can remain irrational longer than arbitrageurs can remain solvent.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Applying Behavioral Insights 
 {
 id: "bfa-4",
 title: "Applying Behavioral Insights to Investing",
 description:
 "Pre-mortem analysis, reference point management, decision journals, checklist investing, nudge-based savings, structured decision frameworks, and debiasing strategies",
 icon: "CheckSquare",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Pre-Mortem Analysis & Reference Point Management",
 content:
 "The most effective behavioral interventions work with human psychology rather than demanding superhuman rationality. Two powerful techniques:\n\n**Pre-Mortem Analysis (Gary Klein):**\nBefore making an investment, imagine that it is 18 months in the future and the investment has *catastrophically failed*. Write a detailed narrative explaining why it failed. This technique:\n- Neutralizes overconfidence by switching from confirmation mode to disconfirmation mode\n- Surfaces risks that were dismissed or overlooked in the original analysis\n- Exploits the fact that people are better at generating causal explanations for known outcomes (hindsight reasoning) — by *pretending* the bad outcome happened, you access the same reasoning that would have generated the concerns\n- Research (Mitchell et al., 1989) found pre-mortem increases identification of reasons for potential failure by ~30%\n\n**Reference Point Management:**\nThe **reference point** determines whether an outcome feels like a gain or a loss. Investors anchor to purchase price, creating the disposition effect. Strategies:\n- *Re-frame the reference point:* Ask \"if I did not own this stock and had this cash, would I buy it today at the current price?\"This eliminates the purchase price anchor and evaluates the position on its current merits.\n- *Use market value, not cost basis:* Portfolio software that shows only market value (not % gain/loss vs. cost) reduces disposition effect behavior\n- *Separate accounting from decision-making:* Cost basis matters for tax purposes, but should not influence the hold/sell decision\n- *Set prospective targets:* Define exit criteria (price targets, stop-losses, thesis changes) before entering a position, when loss aversion is not yet activated",
 highlight: [
 "pre-mortem analysis",
 "Gary Klein",
 "overconfidence",
 "reference point",
 "disposition effect",
 "cost basis anchor",
 "prospective targets",
 ],
 },
 {
 type: "teach",
 title: "Decision Journals, Checklists & Mental Models",
 content:
 "**Decision Journal Practice:**\nKeeping a decision journal forces explicit documentation of:\n- The reasoning *at the time of decision* (not reconstructed in hindsight)\n- The information that was available and what was deliberately excluded\n- Expected outcomes and probability assessments\n- Emotional state and time pressure during decision\n\nWhen revisiting decisions, investors discover systematic patterns in their errors — not just *what* went wrong, but *which cognitive biases* drove the mistake. This creates a personalized debiasing loop. Without a journal, outcome bias dominates: a lucky bad decision is mentally recorded as a good decision.\n\n**Checklist Investing (Inspired by Munger & Atul Gawande):**\nCharlie Munger's mental models approach advocates building a multi-disciplinary checklist for investment decisions. A behavioral checklist might ask:\n- Am I attracted to this investment because of recent performance (recency bias)?\n- Have I sought disconfirming evidence as actively as confirming evidence?\n- Is my position sizing driven by conviction or by how much I am \"up\" (house money effect)?\n- Am I holding this because I still believe the thesis, or because I cannot bear to realize the loss?\n- Would a respected, rational investor with no prior involvement in this stock make the same decision?\n\n**Munger's Inversion Principle:**\n*\"Invert, always invert.\"* Rather than asking \"how do I make this investment work?\", ask \"what would make this investment fail?\"Inversion systematically surfaces risks that forward-looking analysis misses.",
 highlight: [
 "decision journal",
 "outcome bias",
 "checklist investing",
 "Munger",
 "mental models",
 "recency bias",
 "inversion",
 ],
 },
 {
 type: "teach",
 title: "Nudge Theory in Practice & Structured Decision Frameworks",
 content:
 "**Thaler's Nudge Theory in Personal Finance:**\nRichard Thaler's work shows that well-designed defaults dramatically improve financial outcomes without restricting choice:\n- **Automatic 401(k) enrollment** at a meaningful default contribution rate (6–10%) with annual auto-escalation — eliminates the need for willpower; savings increase through passive inertia rather than active commitment\n- **Default fund selection:** Target-date funds as the default investment ensure age-appropriate diversification for the majority who would otherwise default to money market funds or not choose at all\n- **Automatic rebalancing:** Set once, operates without behavioral intervention — prevents panic selling and chasing performance\n\n**Inside View vs. Outside View (Kahneman & Lovallo):**\n- *Inside view:* Focusing on the specific details of the current plan, generating reasons why this particular venture will succeed, ignoring reference class data\n- *Outside view (Reference Class Forecasting):* How often do projects of this type succeed? What is the base rate? What is the median outcome for companies in this situation?\n\nInvestors should routinely supplement inside-view analysis with base rate data: What percentage of biotech phase III trials succeed? What fraction of IPOs outperform over 5 years? What is the historical bankruptcy rate in this industry?\n\n**Structured Debiasing for Buy and Sell Decisions:**\n*Before buying:* Document the thesis in writing; identify the 3 biggest risks; determine pre-specified exit criteria (price target, stop-loss, thesis invalidation conditions).\n*Before selling:* Distinguish between \"I should sell because my thesis changed\" vs. \"I should sell because the price moved against me and it hurts.\"The former is rational; the latter is loss aversion.",
 highlight: [
 "Thaler",
 "nudge",
 "automatic enrollment",
 "auto-escalation",
 "inside view",
 "outside view",
 "reference class forecasting",
 "base rate",
 "debiasing",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "An investor bought shares of a technology company at $80. The stock is now at $55 after the company reported weaker-than-expected revenue growth. The investor is holding, thinking 'I'll sell once it gets back to $80.' Which debiasing technique most directly addresses this behavioral error?",
 options: [
 "Reference point re-framing: ask 'If I had $55 in cash today and no prior position, would I buy this stock at $55 given what I now know about the company's growth?' — this removes the purchase price anchor",
 "Pre-mortem analysis: imagine the stock fell to $20 and work backward to identify why",
 "Outside view: check the base rate for technology stocks recovering from 31% drawdowns",
 "Decision journal: review past decisions to see if you have made this error before",
 ],
 correctIndex: 0,
 explanation:
 "The investor is anchored to the $80 purchase price as a reference point, creating the classic disposition effect: holding a loser to avoid realizing the loss. The most direct debiasing intervention is reference point re-framing — by asking what you would do with fresh cash at today's price, you eliminate the cost basis anchor and evaluate the stock on its current merits. If the honest answer is 'no, I would not buy it at $55,' that is strong evidence the position should be sold. Pre-mortem, outside view, and decision journals are all valuable tools but they address different aspects of decision-making and are less directly targeted at the loss-aversion/anchoring combination driving this specific error.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The 'outside view' approach to investment analysis means ignoring company-specific research and relying entirely on industry base rates, making fundamental analysis irrelevant.",
 correct: false,
 explanation:
 "The outside view does not replace fundamental analysis — it supplements and calibrates it. Kahneman and Lovallo's research shows that inside-view analysis (company-specific reasoning) is susceptible to planning fallacy, overconfidence, and competitor neglect. The outside view provides a base rate anchor: 'Projects of this type typically take twice as long and cost 40% more than planned.' Investors should start with base rates (what fraction of companies in this situation generated positive returns?) and then adjust for specific factors that genuinely differentiate this case. Using both — the outside view as a sanity check on the inside view — produces better-calibrated probability estimates than either approach alone.",
 difficulty: 2,
 },
 ],
 },
 ],
};
