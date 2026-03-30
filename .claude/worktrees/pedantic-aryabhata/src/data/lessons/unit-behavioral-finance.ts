import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_FINANCE: Unit = {
 id: "behavioral-finance-deep-dive",
 title: "Behavioral Finance Deep Dive",
 description:
 "Explore the psychology of investing — from cognitive biases and loss aversion to herd mentality and mental accounting — and learn evidence-based strategies to make more rational, disciplined financial decisions",
 icon: "",
 color: "#7c3aed",
 lessons: [
 // Lesson 1: Cognitive Biases in Investing 
 {
 id: "behavioral-finance-deep-dive-1",
 title: "Cognitive Biases in Investing",
 description:
 "Discover how anchoring, availability, and representativeness biases systematically distort investor judgment — and how to recognize them in your own thinking",
 icon: "BookOpen",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Why Smart Investors Make Irrational Decisions",
 content:
 "Behavioral finance is the study of how psychology influences financial decisions. It emerged when academics noticed that real investors consistently deviate from the 'rational agent' model assumed by classical economics.\n\n**The core insight:**\nThe human brain was not designed to evaluate probabilities, discount future cash flows, or remain emotionally neutral in the face of financial gains and losses. We use mental shortcuts — called **heuristics** — that served our ancestors well on the savanna but can lead us badly astray in markets.\n\n**Why this matters:**\n- Market prices are set by human beings, not robots — biases are embedded in prices\n- Understanding your own biases is the first step to guarding against them\n- Recognizing biases in others can reveal market mispricings\n\n**The two cognitive systems:**\n- **System 1 (fast)**: Automatic, intuitive, emotional — fires first, fires fast\n- **System 2 (slow)**: Deliberate, analytical, logical — requires effort to engage\n\nMost investing errors occur when System 1 hijacks decisions that should belong to System 2. The remedy is not to eliminate intuition, but to know when to override it with structured analysis.",
 highlight: ["behavioral finance", "heuristics", "System 1", "System 2", "cognitive biases"],
 },
 {
 type: "teach",
 title: "Anchoring Bias — The Tyranny of the First Number",
 content:
 "**Anchoring** occurs when the mind over-weights the first piece of information it receives — the 'anchor' — and adjusts insufficiently away from it, even when the anchor is irrelevant.\n\n**Classic experiments:**\n- Amos Tversky and Daniel Kahneman spun a roulette wheel rigged to land on 10 or 65, then asked participants to estimate the percentage of African countries in the United Nations. Those who saw 65 guessed much higher than those who saw 10 — a completely arbitrary number influenced a factual estimate.\n- In salary negotiations, whichever side makes the first offer strongly influences the final outcome.\n\n**Anchoring in investing:**\n- **Purchase price anchor**: Investors obsess over what they paid for a stock. If you bought at $100 and it falls to $60, the $100 becomes an anchor — making the stock feel 'cheap' at $75 even if its fair value is $50.\n- **52-week high/low anchor**: Stocks near their 52-week low feel like bargains; stocks near their 52-week high feel expensive — regardless of underlying fundamentals.\n- **Round-number anchors**: Investors place disproportionate sell orders at round numbers ($100, $500, $1,000), creating resistance levels that are purely psychological.\n- **Analyst price targets**: Once a $200 price target is published, investors anchor to it. A stock at $180 feels undervalued; at $220, overvalued — even if the company's prospects have dramatically changed.\n\n**The antidote:**\nAlways ask: 'What is this stock worth based on future cash flows, independent of what I paid or what the chart shows?' Force yourself to consider a fresh valuation from scratch.",
 highlight: ["anchoring", "purchase price anchor", "52-week high", "round-number", "analyst price targets"],
 },
 {
 type: "teach",
 title: "Availability & Representativeness Biases",
 content:
 "**Availability Bias** causes people to judge the probability of an event based on how easily examples come to mind — not based on actual statistical frequency.\n\n**Investment examples:**\n- After a high-profile market crash dominates news headlines, investors overestimate the probability of another crash.\n- Tech stocks that appeared frequently in glowing magazine profiles in 1999 felt like sure winners — availability of vivid success stories inflated perceived probability.\n- Stocks you hear about from friends and family feel like safer investments than unknown companies — but familiarity is not the same as quality.\n\n**Key insight:** Dramatic, recent, emotionally charged events are mentally 'available' — they feel more probable than quiet, common occurrences. This creates systematic over-reaction to news.\n\n---\n\n**Representativeness Bias** is the tendency to judge a situation by how much it resembles a prototype or stereotype, ignoring base rates.\n\n**Investment examples:**\n- A company with an exciting product, charismatic CEO, and strong revenue growth 'looks like' a great investment — investors ignore the base rate that most fast-growing startups eventually disappoint.\n- A stock that has risen 50% in a year looks like a 'winner' — investors extrapolate past performance as representative of future performance, ignoring mean reversion.\n- A company with low earnings that looks like a 'cheap value stock' may simply be cheap because it is declining — representativeness causes investors to apply value investing templates to unsuitable situations.\n\n**The antidote for both:** Slow down, seek base rates, and ask 'What do companies in this category typically do over the next 5 years?' Don't let vivid stories or surface similarities substitute for data.",
 highlight: ["availability bias", "representativeness bias", "base rates", "mean reversion", "vivid stories"],
 },
 {
 type: "quiz-mc",
 question:
 "An investor bought shares of a retailer at $90. The stock is now trading at $55. She refuses to sell, saying she'll 'wait until it gets back to $90.' Which bias is most clearly driving her decision?",
 options: [
 "Anchoring bias — the $90 purchase price has become an arbitrary reference point",
 "Availability bias — recent losses are mentally vivid so she overweights them",
 "Representativeness bias — the stock looks similar to past recoveries",
 "Overconfidence bias — she believes her original analysis was correct",
 ],
 correctIndex: 0,
 explanation:
 "This is a textbook anchoring bias example. The original purchase price of $90 has become a mental anchor that distorts her evaluation. The stock's value should be assessed based on future prospects, not the price she paid. The market does not know or care what she paid — her reference point is economically irrelevant. An objective analysis might conclude that selling at $55 and redeploying capital elsewhere is the rational choice, but the anchor prevents her from seeing this clearly.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Availability bias means that investors tend to overestimate the probability of events that are statistically common but not widely reported in the media.",
 correct: false,
 explanation:
 "Availability bias works in the opposite direction. It causes people to overestimate the probability of events that are easy to recall — typically dramatic, recent, or emotionally vivid events that receive heavy media coverage. Quiet, mundane events (like the steady compounding of a boring index fund) receive little attention and feel less 'real' or likely, even though statistically they may be more probable. Availability bias inflates the perceived probability of dramatic but rare events and deflates the perceived probability of common but unremarkable ones.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 2: Loss Aversion & Prospect Theory 
 {
 id: "behavioral-finance-deep-dive-2",
 title: "Loss Aversion & Prospect Theory",
 description:
 "Understand Kahneman and Tversky's Nobel Prize-winning research showing that losses feel roughly twice as painful as equivalent gains — and how this distorts investor behavior",
 icon: "TrendingDown",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Prospect Theory — How We Actually Evaluate Outcomes",
 content:
 "In 1979, Daniel Kahneman and Amos Tversky published **Prospect Theory**, one of the most cited papers in economics. It overturned the classical assumption that people evaluate outcomes based on final wealth levels — instead, people evaluate outcomes as **gains and losses relative to a reference point**.\n\n**The three pillars of Prospect Theory:**\n\n1. **Reference-dependence**: Outcomes are evaluated as gains or losses from a reference point (usually the status quo or purchase price), not as absolute values.\n\n2. **Loss aversion**: Losses feel roughly **2.0–2.5× more painful** than equivalent gains feel pleasurable. Losing $1,000 causes roughly twice the psychological pain as gaining $1,000 causes pleasure. This is not rationality — it is wiring.\n\n3. **Diminishing sensitivity**: Each additional unit of gain or loss has less psychological impact. Going from $0 to $1,000 feels better than going from $10,000 to $11,000. Going from $0 to $1,000 feels worse than going from $10,000 to $11,000.\n\n**The value function:**\nThe resulting 'value function' is S-shaped: steep for small losses (steep negative slope), less steep for larger losses, and flatter throughout for gains. The kink at zero (the reference point) is sharp — this is the asymmetry of loss aversion.\n\n**Why this is revolutionary:** Classical utility theory predicted a smooth, consistent curve. Kahneman and Tversky showed the actual shape is kinked, asymmetric, and reference-dependent — explaining dozens of behavioral anomalies that rational models could not.",
 highlight: ["Prospect Theory", "Kahneman", "Tversky", "loss aversion", "reference point", "value function"],
 },
 {
 type: "teach",
 title: "Loss Aversion in Practice — How It Warps Your Portfolio",
 content:
 "Loss aversion is arguably the single most destructive bias for long-term investors. Its effects cascade through every major investment decision.\n\n**The disposition effect:**\nInvestors tend to sell winners too early (locking in gains to feel the pleasure) and hold losers too long (avoiding the pain of realizing losses). This is the exact opposite of rational portfolio management.\n- **Research finding**: Terrance Odean studied 10,000 brokerage accounts and found investors were 50% more likely to sell a winning stock than a losing one — dramatically underperforming a simple buy-and-hold strategy.\n- Taxes make this even worse: short-term capital gains are taxed at higher rates, and holding losers prevents tax-loss harvesting.\n\n**Break-even obsession:**\nLoss aversion creates an irrational desire to 'get back to even.' Investors hold losing positions indefinitely waiting to recover their purchase price — turning a controlled loss into a potentially catastrophic one. The question should always be: 'Given current information, is this the best use of this capital?' Not: 'How can I avoid crystallizing this loss?'\n\n**Risk-seeking in losses:**\nProspect Theory predicts something counterintuitive: people become **risk-seeking** when already facing a loss. If you are down $5,000, a gamble that could recover everything or lose an additional $5,000 feels attractive — even if the expected value is negative. This explains why investors double-down on failing positions and take outsized risks to recover losses.\n\n**Fear of regret:**\nLoss aversion is amplified by anticipated regret — the pain not just of losing money but of having made the 'wrong' decision. This causes investors to hold a losing stock because selling 'confirms' the mistake.",
 highlight: ["disposition effect", "break-even obsession", "risk-seeking in losses", "regret", "Odean"],
 },
 {
 type: "teach",
 title: "The Asymmetry in Real Numbers",
 content:
 "Loss aversion has concrete, measurable consequences for portfolio returns. Understanding the mathematics illuminates why the bias is so dangerous.\n\n**The recovery math problem:**\n- A stock falls 20% needs to rise 25% to recover\n- A stock falls 33% needs to rise 50% to recover\n- A stock falls 50% needs to rise 100% to recover\n- A stock falls 75% needs to rise 300% to recover\n\nLoss aversion causes investors to hold through the early declines (when recovery is still easy), only to find themselves trapped in catastrophic drawdowns where recovery becomes mathematically improbable.\n\n**Myopic loss aversion:**\nRichard Thaler and Shlomo Benartzi showed that the more frequently investors evaluate their portfolios, the more they feel the pain of losses and the more risk-averse they become. Investors who check portfolios daily experience 250 trading days of potential losses per year; annual reviewers experience just one. This 'myopic loss aversion' causes investors to dramatically under-allocate to equities — costing them enormous long-term wealth.\n\n**The equity risk premium:**\nBecause losses hurt more than gains help, investors demand a disproportionate premium to accept risk. This helps explain why equities have historically delivered ~6–7% real returns over bonds — a premium many economists consider too large to explain without loss aversion.\n\n**The practical implication:** Check your portfolio less frequently. Set rules-based decision processes that prevent emotional responses to short-term fluctuations. Define your exit criteria before you enter a position, not after losses have already triggered your loss-aversion circuitry.",
 highlight: ["recovery math", "myopic loss aversion", "Thaler", "Benartzi", "equity premium"],
 },
 {
 type: "quiz-mc",
 question:
 "According to Prospect Theory, which of the following best describes how most people feel about these two scenarios: A) winning $500, and B) losing $500?",
 options: [
 "The pain of losing $500 feels approximately twice as intense as the pleasure of winning $500",
 "The pleasure of winning $500 and the pain of losing $500 feel roughly equal in intensity",
 "The pleasure of winning $500 feels approximately twice as intense as the pain of losing $500",
 "People feel more pleasure from winning than pain from losing because gains are motivating",
 ],
 correctIndex: 0,
 explanation:
 "Kahneman and Tversky's research consistently found that losses feel approximately 2 to 2.5 times more painful than equivalent gains feel pleasurable. This asymmetry — loss aversion — is one of the most robust findings in behavioral economics. It means that to compensate for the pain of a potential $500 loss, most people need the prospect of winning roughly $1,000 to $1,250. This is not rational by classical economic standards, but it is deeply embedded in human psychology.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "The disposition effect — caused by loss aversion — leads investors to hold winning stocks too long and sell losing stocks too quickly.",
 correct: false,
 explanation:
 "The disposition effect works in the opposite direction. Loss aversion causes investors to sell winners too early (to lock in the pleasure of realized gains) and hold losers too long (to avoid the pain of realizing a loss). Research by Odean and Shefrin found investors are significantly more likely to sell stocks at a gain than at a loss, even when the losing stocks subsequently underperform the sold winners. The rational approach is the reverse: let winners run and cut losses quickly when the investment thesis has broken down.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Herd Behavior & Market Bubbles 
 {
 id: "behavioral-finance-deep-dive-3",
 title: "Herd Behavior & Market Bubbles",
 description:
 "Examine how social proof and momentum create self-reinforcing market bubbles — from tulip mania and the dot-com collapse to the 2008 housing crisis",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Psychology of Herding",
 content:
 "**Herd behavior** occurs when individuals abandon their own assessments and follow the crowd. In social settings, this is often rational — other people's behavior contains information. In financial markets, it creates dangerous feedback loops.\n\n**Why herding happens:**\n\n1. **Informational cascades**: If 100 people before you all bought a stock, you rationally infer they collectively know something. This is 'social proof' — treating others' actions as evidence about quality. The problem: if the first few people also just followed the crowd, the whole chain rests on circular reasoning.\n\n2. **Regret minimization**: If everyone else is buying tech stocks and you are not, and tech stocks go up, you will feel terrible. If you buy along with the crowd and stocks fall, at least you made the 'normal' mistake. Conformity protects against regret.\n\n3. **Career risk**: Professional fund managers know that underperforming the benchmark while doing something different is career-ending. Underperforming while doing the same thing as everyone else is survivable. This creates powerful incentives to herd with the index.\n\n4. **Momentum and trend-following**: Rising prices attract buyers, whose buying raises prices further, attracting more buyers. This positive feedback loop is self-reinforcing — right up until it reverses.\n\n**The result:** Prices deviate wildly from fundamental value. Bubbles inflate, then burst catastrophically when the cascade reverses and everyone rushes for the exit simultaneously.",
 highlight: ["herd behavior", "informational cascades", "social proof", "regret minimization", "momentum"],
 },
 {
 type: "teach",
 title: "Three Great Bubbles — Anatomy of Mania",
 content:
 "History's great speculative manias share a common anatomy: a compelling narrative, rising prices attracting new buyers, leverage, and eventually a catastrophic collapse.\n\n**Tulip Mania (1636–1637):**\nDutch tulip bulbs became a status symbol and speculative instrument. At the peak, a single Semper Augustus bulb sold for the price of a canal house in Amsterdam. Contracts for future delivery changed hands multiple times. When the market collapsed in February 1637, prices fell 99% within weeks. Traders who had borrowed to speculate were ruined.\n\n**Lesson**: Any asset can become a speculative vehicle when social narrative and rising prices create self-reinforcing demand.\n\n**The Dot-Com Bubble (1995–2000):**\nThe internet was real and transformative — but the valuations were not. Companies with no revenue, no profits, and no clear business model raised billions in IPOs. The Nasdaq rose 400% from 1995 to its peak in March 2000, then fell 78% over the next two years.\n\n**Lesson**: A correct technological prediction does not guarantee investment returns. Valuation still matters — paying any price for a good story destroys wealth.\n\n**The 2008 Housing Crisis:**\nRising home prices created a narrative that housing 'always goes up.' Banks packaged subprime mortgages into complex securities rated AAA. Rating agencies herded with the consensus, and investors worldwide bought. When prices stopped rising, defaults cascaded. U.S. home prices fell 33% nationally; the S&P 500 lost 57% peak-to-trough.\n\n**Lesson**: Leverage transforms a speculative bubble into a systemic crisis. Herding by sophisticated institutional investors is as dangerous as retail mania.",
 highlight: ["tulip mania", "dot-com bubble", "2008 housing crisis", "leverage", "narrative"],
 },
 {
 type: "teach",
 title: "Identifying Bubbles — Warning Signs",
 content:
 "Bubbles are notoriously difficult to identify in real time — John Maynard Keynes warned that 'markets can remain irrational longer than you can remain solvent.' But certain conditions reliably precede collapses.\n\n**Classic bubble warning signs:**\n\n1. **'This time is different' narratives**: Every bubble produces a fundamental story for why traditional valuation no longer applies. In 1999 it was 'the internet changes everything.' In 2006 it was 'housing always appreciates.' These narratives have a kernel of truth — which is exactly what makes them dangerous.\n\n2. **Widespread retail participation**: When taxi drivers and neighbors give stock tips, when 'everyone knows' that something is a sure thing, informed early-stage speculation has given way to uninformed momentum chasing.\n\n3. **Leverage explosion**: Credit expands to fund speculative purchases. Margin loans rise sharply. Novel financial instruments appear to allow more leverage with seemingly less risk.\n\n4. **Valuation extremes**: P/E ratios, price-to-book, or other metrics reach levels far outside historical norms — often dismissed with 'new economy' arguments.\n\n5. **Suppression of negative analysis**: Short sellers, skeptical analysts, and bearish commentators are ridiculed. 'You just don't understand the new paradigm.'\n\n**The behavioral loop:**\nBubbles are self-fulfilling until they are not. Early buyers make money, confirming the narrative. New buyers enter on social proof. Rising prices attract media coverage. Media coverage attracts more buyers. Eventually, the supply of new buyers exhausts itself — and the whole structure collapses under the weight of its own leverage.",
 highlight: ["this time is different", "retail participation", "leverage explosion", "valuation extremes", "short sellers"],
 },
 {
 type: "quiz-mc",
 question:
 "Professional fund managers often hold stocks similar to their benchmark index even when they believe other stocks are better investments. Which behavioral factor best explains this?",
 options: [
 "Career risk — underperforming while doing something different is more career-damaging than underperforming with the crowd",
 "Anchoring bias — the benchmark weights become reference anchors for portfolio construction",
 "Availability bias — index stocks receive more media coverage so they feel safer",
 "Representativeness bias — index inclusion signals that a stock is high quality",
 ],
 correctIndex: 0,
 explanation:
 "This is a career-risk-driven form of herding. Fund managers face asymmetric career consequences: if they deviate from the benchmark and underperform, they may lose their job. If they track the benchmark and underperform, they are 'doing what everyone else does' and may survive. This creates a rational (at the individual level) incentive to herd with the index even when the manager believes they could do better by deviating. This dynamic is why most active funds closely track their benchmarks — the famous 'closet indexing' phenomenon.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The dot-com bubble demonstrated that investors who correctly identified the internet as a transformative technology and invested in internet companies at the bubble's peak in 2000 would have generated strong long-term returns.",
 correct: false,
 explanation:
 "Being correct about a technology's transformative impact does not guarantee investment returns — valuation matters enormously. Many dot-com companies went bankrupt (Pets.com, Webvan, Boo.com). Even survivors like Amazon fell 93% from peak to trough during the bust. Cisco, the networking infrastructure giant that really did power the internet revolution, fell 86% and did not return to its 2000 peak price for over two decades. The insight that the internet would change the world was correct; the valuations assigned to internet companies in 1999–2000 were not. A correct macro prediction at the wrong price destroys capital.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Overconfidence & Illusion of Control 
 {
 id: "behavioral-finance-deep-dive-4",
 title: "Overconfidence & Illusion of Control",
 description:
 "Discover why investors systematically overestimate their abilities, trade too much, and underperform benchmarks — and the research that quantifies the cost",
 icon: "BookOpen",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Overconfidence Epidemic",
 content:
 "Overconfidence is the most well-documented bias in the psychology literature — and arguably the most expensive for investors. It manifests in three distinct forms.\n\n**Three types of overconfidence:**\n\n1. **Overprecision**: Excessive confidence in the accuracy of your predictions. Ask investors to give a 90% confidence interval for the S&P 500's level in one year — most give ranges that are far too narrow. The actual outcome falls outside their 'confident' range roughly 40% of the time.\n\n2. **Overplacement**: Believing you are above average. In surveys, 80–90% of drivers claim to be above-average drivers. 70% of investors believe they will outperform the market. Only 50% can be above average by definition — and after costs, fewer still.\n\n3. **Overestimation**: Overestimating your own abilities, the quality of your information, and the precision of your analysis. Investors consistently rate their information as 'better than average' even when it comes from the same public sources as everyone else.\n\n**The biological basis:**\nOverconfidence appears to have evolutionary advantages — confident individuals take risks, lead groups, and pursue mates more successfully. The gene pool favored mild overconfidence. Unfortunately, this worked better for hunting mastodons than for managing equity portfolios.\n\n**The most dangerous manifestation:**\nOverconfidence in stock-picking ability leads investors to concentrate portfolios, overtrade, and ignore risk — all of which reliably destroy wealth relative to a simple diversified index strategy.",
 highlight: ["overconfidence", "overprecision", "overplacement", "overestimation", "confidence interval"],
 },
 {
 type: "teach",
 title: "Trading Too Much — The Odean & Barber Evidence",
 content:
 "The landmark research by Brad Barber and Terrance Odean quantified exactly how much overconfidence costs individual investors.\n\n**The study:**\nBarber and Odean analyzed 66,465 households with brokerage accounts from 1991 to 1996. They found a clear, linear relationship: the more investors traded, the worse they performed.\n\n**The headline numbers:**\n- The average household earned 16.4% annual returns from the market during this period\n- The average trading household earned 15.3% after trading costs — already below the market\n- The most active quintile of traders earned just 11.4% — 5 percentage points below the market\n- Over five years: $10,000 at 16.4% grows to $21,400; at 11.4%, only $17,100\n\n**The mechanism:**\nOverconfident investors believe they have identified mispriced stocks. They buy 'undervalued' stocks and sell 'overvalued' ones. But the stocks they buy subsequently underperform the stocks they sell — suggesting their information edge is illusory. They pay transaction costs and taxes for the privilege of underperforming.\n\n**The gender finding:**\nBarber and Odean also found men traded 45% more than women — and underperformed women by 1.4% annually. Overconfidence is more pronounced in men, particularly in domains (like investing) perceived as masculine and skill-based. Single men traded the most and performed the worst.\n\n**The uncomfortable truth:**\nFor most investors, the optimal trading frequency is close to zero. Every trade is a bet that you know something the other side of the trade does not. In liquid public markets, this is extremely difficult to sustain.",
 highlight: ["Barber", "Odean", "trading frequency", "transaction costs", "overtrading"],
 },
 {
 type: "teach",
 title: "Illusion of Control — Skill vs. Luck",
 content:
 "The **illusion of control** is the belief that you can influence outcomes that are actually determined by chance. In investing, it manifests as the belief that skill explains results that are largely driven by luck.\n\n**The research:**\nEllen Langer showed that people behave as if they can control random outcomes when certain skill-related cues are present: competition, familiar stimuli, choice, or involvement in the process. Investors who choose their own stocks, monitor them closely, and follow business news develop strong feelings of control — even though short-term market returns are highly random.\n\n**Where control is genuinely limited:**\n- Individual company earnings surprises are largely unpredictable quarter-to-quarter\n- Short-term stock price movements are essentially random walks\n- Macroeconomic forecasting — even by professional economists — is barely better than chance\n- Timing market tops and bottoms requires being right twice (exit and re-entry), compounding the difficulty\n\n**The 'skill vs. luck' diagnostic:**\nMichael Mauboussin provides a useful test: can you lose on purpose? In chess (high skill), a grandmaster can deliberately lose. In roulette (pure luck), no strategy allows you to reliably lose. Investing falls somewhere between — but much closer to the luck end than most investors believe for short time horizons.\n\n**The performance attribution trap:**\nWhen a portfolio does well, investors attribute it to skill. When it does poorly, they attribute it to bad luck. This asymmetric attribution reinforces overconfidence and prevents accurate self-assessment.\n\n**The practical remedy:**\nCompare your results to a relevant benchmark after all costs over multiple years (5+ years). A single good year proves nothing; consistent outperformance over a decade with a reasonable explanation is meaningful evidence of skill.",
 highlight: ["illusion of control", "Langer", "skill vs. luck", "Mauboussin", "benchmark comparison"],
 },
 {
 type: "quiz-mc",
 question:
 "A study of 66,465 brokerage accounts found that the most active trading quintile earned approximately 5 percentage points less per year than the least active quintile. What is the primary cause of this underperformance?",
 options: [
 "Overconfident investors trade on the illusion of an information edge, paying transaction costs and taxes to buy stocks that underperform those they sold",
 "Active traders focus on high-volatility stocks that have lower expected returns than stable, low-volatility holdings",
 "Frequent trading causes emotional exhaustion that leads to worse decision-making over time",
 "Active traders use margin more often, and leverage mechanically reduces long-term compound returns",
 ],
 correctIndex: 0,
 explanation:
 "Barber and Odean's research showed that overconfident investors trade because they believe they have identified mispricings — but the stocks they buy subsequently underperform the stocks they sell, suggesting the information edge is illusory. They pay real transaction costs (commissions, bid-ask spreads) and taxes for the privilege of making these confidence-driven but ultimately value-destroying trades. The more they trade, the more costs accumulate and the more opportunities there are for the 'edge' to be wrong. The solution is lower turnover and honest assessment of whether you genuinely possess an information advantage.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The illusion of control in investing is primarily caused by investors being involved in choosing and monitoring their investments, which makes them feel their skill is determining outcomes even when returns are largely random.",
 correct: true,
 explanation:
 "Ellen Langer's research demonstrated exactly this: when skill-related cues are present — choice, involvement, competition, familiar stimuli — people develop the sense that they control outcomes even when the outcomes are random or near-random. Investors who personally select stocks, research companies, monitor earnings calls, and track positions daily develop a powerful sense of engagement and control. This feeling is partly real (a skilled analyst does add value) but is systematically overestimated. The involvement and effort feel like they must translate to superior outcomes — but the data shows most active investors underperform passive benchmarks after costs.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 5: Mental Accounting 
 {
 id: "behavioral-finance-deep-dive-5",
 title: "Mental Accounting",
 description:
 "Understand how people assign different psychological values to money based on its source or purpose — and why treating money as fungible leads to better financial outcomes",
 icon: "BookOpen",
 xpReward: 85,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Mental Accounting — Money Is Not Fungible in Our Minds",
 content:
 "**Mental accounting** is the tendency to treat money differently based on its source, purpose, or the mental 'account' it is assigned to — even though money is perfectly fungible in economic reality.\n\n**Richard Thaler**, who won the 2017 Nobel Prize in Economics partly for this work, documented how people maintain separate psychological 'buckets' for money:\n- **Current income**: Monthly salary — treated with moderate care\n- **Current assets**: Savings — treated conservatively, rarely spent\n- **Future income**: Expected bonuses or inheritance — spent freely in advance\n- **Windfall**: Lottery winnings, tax refunds, unexpected bonuses — treated as 'free money,' spent far more liberally\n\n**The economic reality:**\nOne dollar in your savings account and one dollar from a lottery win are identical — they buy the same things and compound at the same rate. But psychologically they feel completely different, and people make dramatically different decisions with them.\n\n**Common examples:**\n- Spending a $500 tax refund on a vacation while carrying $5,000 in credit card debt at 20% APY — the 'refund' feels like bonus money, while the debt feels like a separate problem\n- Gambling with winnings at a casino ('it's the house's money anyway') but being conservative with original stake\n- Spending a work bonus freely while carefully budgeting regular salary\n- Refusing to sell a stock at a loss even when the cash is needed for a better investment — the sale would 'close' the mental account at a loss\n\n**The key insight:** All money should be evaluated identically — by its highest-value use, discounted for time and risk. Mental accounting creates arbitrary distinctions that lead to irrational decisions.",
 highlight: ["mental accounting", "Thaler", "fungible", "windfall", "psychological buckets"],
 },
 {
 type: "teach",
 title: "The House Money Effect",
 content:
 "The **house money effect** is one of mental accounting's most dangerous manifestations in investing: after a series of gains, investors become more risk-tolerant because they feel they are 'playing with the house's money.'\n\n**The casino origin:**\nThe term comes from gambling. After winning $200 at the blackjack table, gamblers often think of their original $200 as 'their money' and the winnings as 'the house's money.' They bet the winnings more aggressively because losing them doesn't feel like losing real money.\n\n**The economic reality:** It is all your money. $400 is $400, regardless of how it was accumulated.\n\n**The house money effect in markets:**\n- After a portfolio rises 30%, investors take on far more risk than they would rationally justify — 'I can afford to lose some of these gains'\n- Day traders who have a winning morning trade much larger in the afternoon — they're 'in the zone' and using 'house money'\n- Bull markets cause systematic underestimation of risk because rising prices make portfolios feel larger and gains feel less real\n- Investors in a winning sector increase concentration dramatically because 'it's profit anyway'\n\n**The reverse — snake-bit effect:**\nAfter losses, some investors become irrationally risk-averse — refusing even good opportunities because they are 'down on the year.' The prior loss has no bearing on whether a new investment is attractive, but mental accounting creates this linkage.\n\n**The compound danger:**\nHouse money effect (more risk after gains) combined with loss aversion (less risk after losses) creates a pattern of buying high with leverage and selling low in panic — the worst possible return profile.",
 highlight: ["house money effect", "Thaler", "risk tolerance", "snake-bit effect", "bull market risk"],
 },
 {
 type: "teach",
 title: "Mental Accounting and Portfolio Construction",
 content:
 "Mental accounting pervades portfolio construction in ways that harm long-term returns.\n\n**The pyramid portfolio fallacy:**\nMany investors construct a 'safety pyramid': a large conservative base (bonds, savings), a middle layer of balanced investments, and a top tier of speculative bets. Each layer is managed independently. The problem: risk and return should be optimized across the entire portfolio simultaneously. An investor might hold 2% in penny stocks 'for excitement' while their bond allocation drags down overall returns — the total portfolio is suboptimal because each mental account is managed separately.\n\n**Dividend income vs. capital gains:**\nMany investors spend dividend income freely but refuse to sell shares to fund the same spending. 'I only live off dividends, never touch principal' seems disciplined — but a $5 dividend from a $100 stock is economically identical to selling $5 worth of shares. The preference for dividends over capital gains is pure mental accounting; it often leads to holding lower-quality high-dividend stocks.\n\n**Sunk cost fallacy:**\nMental accounting treats past investment as a 'debit' that must be closed at break-even. Having spent $10,000 on a stock, the investor maintains a separate mental account for that position. Sunk costs are irrelevant to future decisions — but mental accounting makes them feel binding. Rational analysis should only ask: 'Given current information, what is the best use of this money going forward?'\n\n**Bucketing retirement savings:**\nSome investors hold separate accounts for 'vacation fund,' 'emergency fund,' 'retirement,' and 'college savings' at different institutions. While organizational discipline has value, holding $10,000 in a 0.5% savings account while carrying $10,000 in 6% student loan debt is a pure mental accounting error — the net position is effectively borrowing at 6%, regardless of how the accounts are labeled.",
 highlight: ["pyramid portfolio", "dividend income", "sunk cost fallacy", "bucketing", "break-even"],
 },
 {
 type: "quiz-mc",
 question:
 "An investor receives a $3,000 tax refund and immediately books a vacation with it, while simultaneously carrying $3,000 in credit card debt at 22% annual interest. Which concept best explains this behavior?",
 options: [
 "Mental accounting — the tax refund is placed in a 'windfall' mental bucket where spending feels justified, while the debt occupies a separate mental account",
 "Loss aversion — spending the refund prevents the painful experience of watching savings decline",
 "Overconfidence — the investor believes their income growth will easily cover the credit card debt",
 "Availability bias — vacations are vivid and memorable while debt repayment is not",
 ],
 correctIndex: 0,
 explanation:
 "This is a classic mental accounting error. The tax refund and the credit card debt are in separate psychological 'buckets.' Rationally, receiving $3,000 when you owe $3,000 at 22% interest should lead you to pay off the debt — earning a guaranteed 22% return. But mental accounting labels the refund as 'bonus/windfall money' appropriate to spend on something pleasurable, and the debt as a separate, unrelated financial obligation. Paying 22% interest on $3,000 while spending that same $3,000 on a vacation costs $660 per year — an expensive psychological framing.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "According to the house money effect, investors who have accumulated significant portfolio gains tend to become more risk-averse because they want to protect their profits.",
 correct: false,
 explanation:
 "The house money effect predicts the opposite: investors become more risk-tolerant after gains, not less, because they mentally categorize their gains as 'the house's money' — less real, less painful to lose than their original stake. This is economically irrational (all money in the portfolio is equally real) but psychologically common. It can lead investors to take excessive risks during bull markets, concentrate in winning positions, or speculate with 'profits' they would never risk with their original capital. The reverse phenomenon — becoming overly risk-averse after losses — is called the 'snake-bit effect.'",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: Debiasing Strategies 
 {
 id: "behavioral-finance-deep-dive-6",
 title: "Debiasing Strategies",
 description:
 "Learn evidence-based techniques to counteract your cognitive biases — checklists, pre-mortems, rules-based investing, and investment journaling that systematically improve decision quality",
 icon: "BookOpen",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Why Knowing About Biases Is Not Enough",
 content:
 "A common misconception: once you understand cognitive biases, you become immune to them. Research shows this is largely false.\n\n**The limits of awareness:**\n- Knowing about the gambler's fallacy does not stop people from committing it\n- Finance professors who teach loss aversion still exhibit loss aversion in their own portfolios\n- Cognitive biases often operate below conscious awareness — System 1 fires before System 2 can intervene\n- Daniel Kahneman himself admitted that despite decades of studying his own biases, he remains vulnerable to them\n\n**What does work:**\nBias reduction requires **procedural interventions** — changing the process by which decisions are made, not just the knowledge state of the decision-maker. The goal is to design systems that constrain bad behavior before it occurs, not to rely on willpower and awareness in the moment of decision.\n\n**The key principles of effective debiasing:**\n1. **Pre-commitment**: Decide the rules before you are in an emotional state\n2. **Slowing down**: Insert structured delays and checklists between impulse and action\n3. **External accountability**: Write down your reasoning — you cannot fool a written record\n4. **Feedback loops**: Systematically review decisions to learn what actually worked\n5. **Structural separation**: Remove the ability to make certain bad decisions in the moment\n\n**The analogy:** Pilots use checklists not because they forget how to fly, but because systematic procedures prevent the costly errors that even skilled, experienced professionals make under stress. Investors need the same discipline.",
 highlight: ["debiasing", "procedural interventions", "pre-commitment", "checklists", "System 1"],
 },
 {
 type: "teach",
 title: "Checklists & Pre-Mortems",
 content:
 "**Investment Checklists:**\nA pre-investment checklist forces you to address specific risk factors before completing a trade — pulling System 2 (deliberate analysis) into decisions that System 1 would otherwise make impulsively.\n\n**A model investment checklist:**\n- What is my estimate of intrinsic value, and what are my key assumptions?\n- What would have to be true for this investment to be wrong? (Steelman the bear case)\n- Am I buying because of recent price momentum, or because of fundamental value?\n- Have I anchored to the 52-week high/low or my purchase price in my analysis?\n- What is my exit plan if the thesis is wrong? At what price do I sell?\n- Am I concentrating because I'm overconfident in this specific idea?\n- Has a smart bear made a compelling case against this investment? Have I read it?\n\n---\n\n**The Pre-Mortem:**\nDeveloped by Gary Klein and popularized by Daniel Kahneman, the pre-mortem is a structured exercise that dramatically improves the identification of failure modes before they occur.\n\n**How to conduct a pre-mortem:**\n1. Imagine it is one year in the future\n2. The investment has failed catastrophically\n3. Work backwards: what went wrong? List every plausible explanation\n4. Prioritize the identified risks and develop mitigation plans\n\n**Why it works:**\nThe pre-mortem defeats overconfidence by making failure feel real before it happens. It activates a different mode of thinking — instead of defending a decision already made, you are analyzing failure imaginatively. Research shows pre-mortems identify 30% more potential failure modes than standard risk analysis.",
 highlight: ["investment checklist", "pre-mortem", "Gary Klein", "bear case", "exit plan"],
 },
 {
 type: "teach",
 title: "Rules-Based Investing & Investment Journals",
 content:
 "**Rules-Based (Systematic) Investing:**\nThe most powerful debiasing strategy is removing discretion from the decision entirely — establishing rules in advance that govern behavior regardless of emotions in the moment.\n\n**Effective rules-based approaches:**\n- **Automatic rebalancing**: Rebalance to target allocations quarterly, regardless of market conditions. This mechanically forces buying low and selling high.\n- **Position sizing rules**: Never allocate more than 5% (or your chosen limit) to a single position, regardless of conviction level.\n- **Stop-loss rules**: Exit any position that falls more than X% below your purchase price — decided before entry, not after.\n- **Dollar-cost averaging**: Invest a fixed dollar amount at fixed intervals, eliminating the temptation to time the market.\n- **Cooling-off periods**: Any trade idea must wait 48 hours before execution — eliminates impulsive trades.\n\n**The Investment Journal:**\nThe journal is the most underused tool in individual investors' arsenals. It creates accountability to your past self.\n\n**What to record:**\n- Date and price of every trade\n- The specific thesis: what must be true for this investment to succeed?\n- The key risks you identified at the time of purchase\n- Your emotional state when making the decision\n- The planned exit conditions (both profit and loss)\n\n**What to review:**\n- Quarterly: Compare thesis to current reality. Has the thesis changed?\n- Annually: Attribution analysis — which decisions added value and why?\n- On every sale: Was the original thesis correct? Did I exit for the right reasons?\n\n**The power of the journal:**\nIt prevents the 'I knew it all along' hindsight bias, forces you to own your reasoning, and creates a data set for genuine self-improvement over time.",
 highlight: ["rules-based investing", "systematic", "rebalancing", "investment journal", "dollar-cost averaging"],
 },
 {
 type: "quiz-mc",
 question:
 "An investor implements a rule: 'I will not execute any trade until 48 hours after I first decide I want to make it.' Which biases does this rule most directly counteract?",
 options: [
 "Overconfidence and availability bias — the delay allows System 2 thinking to override impulsive System 1 reactions to recent news or price movements",
 "Loss aversion and anchoring — the delay allows the investor to forget the purchase price and recalibrate emotionally",
 "Representativeness bias and herd behavior — the delay allows the investor to check whether others are also making similar trades",
 "Mental accounting — the delay ensures that windfall money is treated the same as regular savings",
 ],
 correctIndex: 0,
 explanation:
 "A 48-hour cooling-off period directly targets the impulsive, emotionally-driven trades that System 1 generates in response to recent news (availability bias), excitement about momentum, or overconfident conviction. By inserting a mandatory delay, the investor allows System 2 (slow, deliberate reasoning) time to evaluate the thesis critically before capital is committed. Most impulsive trades that felt compelling in the moment look much less attractive 48 hours later when the emotional charge has dissipated. This is a classic pre-commitment device — using structural rules to protect future decision-making from present-moment biases.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following best describes why keeping an investment journal — recording thesis, risks, and exit conditions at the time of purchase — improves long-term investment performance?",
 options: [
 "It creates accountability to past reasoning, prevents hindsight bias, and generates data for accurate self-assessment of what actually drives returns",
 "It forces investors to consider more information before buying, which reduces the number of trades and therefore transaction costs",
 "The act of writing clarifies thinking and eliminates emotional decision-making at the point of trade execution",
 "Journals create legal documentation of investment decisions, which motivates more careful analysis to avoid liability",
 ],
 correctIndex: 0,
 explanation:
 "The investment journal's primary value operates over time, not just at the point of entry. By recording the specific thesis, key risks, and exit conditions, the investor creates a written record that cannot be revised retroactively. This defeats hindsight bias, prevents gradual thesis drift (continuing to hold a position after the original thesis has failed), and builds a genuine performance database for attribution analysis. Over years, a disciplined investor can determine whether their thesis quality is improving, which analytical frameworks actually predict returns, and which emotional patterns consistently hurt performance — information that is simply unavailable without systematic records.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Research shows that simply educating investors about cognitive biases — explaining what anchoring, loss aversion, and overconfidence are — is sufficient to substantially reduce those biases in their subsequent investment decisions.",
 correct: false,
 explanation:
 "Research consistently shows that cognitive awareness of biases does not reliably reduce them. Daniel Kahneman, who discovered many of these biases, acknowledges that he still falls prey to them despite decades of study. Biases often operate below conscious awareness through System 1 processes that fire before deliberate analysis. Effective debiasing requires procedural interventions that change the decision-making process — checklists, pre-mortems, rules-based investing, cooling-off periods, and investment journals — rather than simply improving knowledge. The goal is to design a system that constrains biased behavior structurally, rather than relying on in-the-moment willpower to override deeply embedded psychological tendencies.",
 difficulty: 1,
 },
 ],
 },
 ],
};
